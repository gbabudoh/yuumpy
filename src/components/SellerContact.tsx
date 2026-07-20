'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Room, RoomEvent, Track, RemoteTrack } from 'livekit-client';
import { X, MessageCircle, Phone, Video, Send, PhoneOff, Mic, MicOff, Camera, CameraOff, Lock, User } from 'lucide-react';
import Link from 'next/link';

type ContactMode = 'chat' | 'voice' | 'video' | null;

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

interface SellerContactProps {
  sellerName: string;
  sellerSlug: string;
  buyerName?: string;
}

export default function SellerContact({ sellerName, sellerSlug, buyerName }: SellerContactProps) {
  const [mode, setMode] = useState<ContactMode>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellerOnline, setSellerOnline] = useState<boolean | null>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  const [isRinging, setIsRinging] = useState(false); // buyer joined room, waiting for seller to answer

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoTrackRef = useRef<RemoteTrack | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const ringbackRef = useRef<{ stop: () => void } | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const participant = buyerName || `buyer-${Date.now()}`;

  // --- Ringback tone (buyer waiting for seller to answer) ---
  const startRingback = useCallback(() => {
    if (ringbackRef.current) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      let playing = true;
      const playTone = (freq: number, startTime: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur);
      };
      const schedule = () => {
        if (!playing) return;
        const now = ctx.currentTime;
        // Softer ringback: single tone, pause, repeat
        playTone(425, now, 1.0);
        setTimeout(() => schedule(), 3000);
      };
      schedule();
      ringbackRef.current = {
        stop: () => { playing = false; ctx.close(); ringbackRef.current = null; },
      };
    } catch { /* Web Audio not available */ }
  }, []);

  const stopRingback = useCallback(() => {
    ringbackRef.current?.stop();
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  // Check seller online status
  useEffect(() => {
    const checkPresence = async () => {
      try {
        const res = await fetch(`/api/seller/presence?store_slug=${encodeURIComponent(sellerSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setSellerOnline(data.online);
          setLastSeen(data.last_seen);
        }
      } catch {
        setSellerOnline(false);
      }
    };

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/customer/auth/me');
        if (response.ok) {
          setIsLoggedIn(true);
        }
      } catch {
        // Not logged in
      }
    };

    checkPresence();
    checkAuth();
    // Poll every 30 seconds
    const interval = setInterval(checkPresence, 30000);
    return () => clearInterval(interval);
  }, [sellerSlug]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      const container = chatEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.disconnect();
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      ringbackRef.current?.stop();
    };
  }, []);

  // Attach local camera to preview once connected and video element is rendered
  useEffect(() => {
    if (!isConnected || mode !== 'video' || !roomRef.current) return;

    const attachLocal = () => {
      const camTrack = roomRef.current?.localParticipant.getTrackPublication(Track.Source.Camera);
      if (camTrack?.track && localVideoRef.current) {
        camTrack.track.attach(localVideoRef.current);
        return true;
      }
      return false;
    };

    // Try immediately, then retry a few times (track may still be publishing)
    if (!attachLocal()) {
      let attempts = 0;
      const iv = setInterval(() => {
        if (attachLocal() || ++attempts > 20) clearInterval(iv);
      }, 200);
      return () => clearInterval(iv);
    }
  }, [isConnected, mode]);

  // Attach remote video once connected and the element is rendered — the
  // track can arrive (TrackSubscribed) before this element even exists in
  // the DOM (it's gated behind isConnected), so the initial attach attempt
  // in the event handler silently no-ops with nothing to retry it. Storing
  // the track and retrying here the same way the local preview already does
  // fixes that.
  useEffect(() => {
    if (!isConnected || mode !== 'video') return;

    const attachRemote = () => {
      if (remoteVideoTrackRef.current && remoteVideoRef.current) {
        remoteVideoTrackRef.current.attach(remoteVideoRef.current);
        return true;
      }
      return false;
    };

    if (!attachRemote()) {
      let attempts = 0;
      const iv = setInterval(() => {
        if (attachRemote() || ++attempts > 20) clearInterval(iv);
      }, 200);
      return () => clearInterval(iv);
    }
  }, [isConnected, mode]);

  const formatLastSeen = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const connectToRoom = useCallback(async (contactMode: ContactMode) => {
    if (!contactMode) return;
    setIsConnecting(true);
    setError(null);

    try {
      const roomName = `seller-${sellerSlug}-${contactMode}`;
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          participantName: participant,
          metadata: { role: 'buyer', mode: contactMode },
        }),
      });

      if (!res.ok) throw new Error('Failed to get token');
      const { token } = await res.json();

      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) throw new Error('LiveKit URL not configured');

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const decoded = new TextDecoder().decode(payload);
          const msg = JSON.parse(decoded);
          setMessages(prev => [...prev, { sender: msg.sender, text: msg.text, timestamp: new Date() }]);
        } catch { /* ignore */ }
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Video) {
          remoteVideoTrackRef.current = track;
          if (remoteVideoRef.current) track.attach(remoteVideoRef.current);
        }
        if (track.kind === Track.Kind.Audio && remoteAudioRef.current) track.attach(remoteAudioRef.current);
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach();
        if (track === remoteVideoTrackRef.current) remoteVideoTrackRef.current = null;
      });

      // Server-initiated disconnect (duplicate identity, room policy, network
      // drop, etc.) — previously unhandled, so the call would just go dead
      // with no explanation. disconnect() clears roomRef.current synchronously
      // before triggering its own 'disconnected' event, so checking the ref
      // here distinguishes an intentional hangup from an unexpected drop.
      room.on(RoomEvent.Disconnected, (reason) => {
        console.warn('LiveKit room disconnected:', reason);
        if (roomRef.current === room) {
          roomRef.current = null;
          stopRingback();
          if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
          setIsConnected(false);
          setIsRinging(false);
          setMode(null);
          setError('The call ended unexpectedly. Please try again.');
        }
      });

      // Detect when seller actually joins the room (answers the call)
      room.on(RoomEvent.ParticipantConnected, (p) => {
        try {
          const meta = p.metadata ? JSON.parse(p.metadata) : {};
          if (meta.role === 'seller') {
            stopRingback(); // seller answered — stop ringback
            setIsRinging(false);
            setIsConnected(true);
            if (contactMode === 'chat') {
              setMessages(prev => [...prev, {
                sender: 'system',
                text: `Connected to ${sellerName}'s chat. Send a message to start the conversation.`,
                timestamp: new Date(),
              }]);
            }
          }
        } catch { /* ignore */ }
      });

      await room.connect(livekitUrl, token);

      // Give the engine a moment to fully stabilize before publishing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const enableTracks = async () => {
        try {
          if (contactMode === 'voice' || contactMode === 'video') {
            await room.localParticipant.setMicrophoneEnabled(true);
          }
          if (contactMode === 'video') {
            await room.localParticipant.setCameraEnabled(true);
          }
        } catch (publishErr) {
          console.warn('Initial track publish failed, retrying...', publishErr);
          try {
            // One retry after another short delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (contactMode === 'voice' || contactMode === 'video') {
              await room.localParticipant.setMicrophoneEnabled(true);
            }
            if (contactMode === 'video') {
              await room.localParticipant.setCameraEnabled(true);
            }
          } catch (retryErr) {
            // The room connection itself is already established at this
            // point — don't tear down a working call just because enabling
            // mic/camera failed twice. Surface it as a non-fatal warning
            // instead of disconnecting (that was the regression: an outer
            // catch previously killed the whole call for this exact case).
            console.error('Failed to publish audio/video after retry:', retryErr);
            const isPermissionDenied = retryErr instanceof Error && retryErr.name === 'NotAllowedError';
            setError(
              isPermissionDenied
                ? `${contactMode === 'video' ? 'Camera and microphone' : 'Microphone'} access was blocked. The call is connected, but the seller may not hear/see you until you allow access.`
                : "Couldn't enable your microphone/camera, but the call is still connected."
            );
          }
        }
      };

      await enableTracks();

      if (contactMode === 'chat') {
        // Chat connects immediately without needing seller to answer
        setIsConnected(true);
        stopRingback();
        setMessages(prev => [...prev, {
          sender: 'system',
          text: `Connected to ${sellerName}'s chat. Send a message to start the conversation.`,
          timestamp: new Date(),
        }]);
      } else {
        // Voice/video: buyer is now in the room, ringing seller
        setIsRinging(true);

        // Auto-disconnect after 45 seconds if seller doesn't answer
        ringTimeoutRef.current = setTimeout(() => {
          if (roomRef.current) {
            roomRef.current.disconnect();
            roomRef.current = null;
          }
          stopRingback();
          setIsRinging(false);
          setIsConnected(false);
          setMode(null);
          setError('No answer. The seller did not pick up.');
        }, 45000);
      }
    } catch (err) {
      console.error('Connection error:', err);

      // getUserMedia rejects with NotAllowedError when the browser/site has
      // blocked mic or camera access — no amount of retrying fixes that, so
      // give the buyer something actionable instead of a generic message.
      const isPermissionDenied = err instanceof Error && err.name === 'NotAllowedError';
      setError(
        isPermissionDenied
          ? `${mode === 'video' ? 'Camera and microphone' : 'Microphone'} access was blocked. Please allow access in your browser's site settings and try again.`
          : 'Could not connect. Please try again later.'
      );
      stopRingback();

      // A room connection may have succeeded even though publishing tracks
      // failed — disconnect it so it doesn't linger in the background.
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    } finally {
      setIsConnecting(false);
    }
  }, [sellerSlug, sellerName, participant, stopRingback]);

  const disconnect = useCallback(() => {
    if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
    stopRingback();
    setIsConnected(false);
    setIsRinging(false);
    setMode(null);
    setMessages([]);
    setIsMuted(false);
    setIsCameraOff(false);
    setError(null);
  }, [stopRingback]);

  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || !roomRef.current) return;
    const msg = { sender: participant, text: inputMessage.trim() };
    const encoded = new TextEncoder().encode(JSON.stringify(msg));
    roomRef.current.localParticipant.publishData(encoded, { reliable: true });
    setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
    setInputMessage('');
  }, [inputMessage, participant]);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setCameraEnabled(isCameraOff);
    setIsCameraOff(!isCameraOff);
  }, [isCameraOff]);

  const startContact = (contactMode: ContactMode) => {
    if (!isLoggedIn) {
      setShowLoginHint(true);
      return;
    }
    setMode(contactMode);
    if (contactMode === 'voice' || contactMode === 'video') {
      startRingback();
    }
    connectToRoom(contactMode);
  };

  // No active mode — show status + buttons
  if (!mode) {
    if (showLoginHint) {
      return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100/50 shadow-sm text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Registration Required</h4>
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
              To ensure a secure experience, please login or create an account to start a {showLoginHint && 'session'} with {sellerName}.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link 
              href="/account/login"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <User className="w-3 h-3" />
              Login to Contact
            </Link>
            <button 
              onClick={() => setShowLoginHint(false)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Online Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${sellerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className={`text-xs font-semibold ${sellerOnline ? 'text-green-600' : 'text-gray-400'}`}>
              {sellerOnline === null ? 'Checking...' : sellerOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {!sellerOnline && lastSeen && (
            <span className="text-[10px] text-gray-400">Last seen {formatLastSeen(lastSeen)}</span>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => startContact('chat')}
            className="group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors cursor-pointer bg-blue-50 hover:bg-blue-100"
          >
            {!isLoggedIn && <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-blue-300 group-hover:text-blue-500 transition-colors" />}
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-medium text-blue-700">Chat</span>
          </button>
          <button
            onClick={() => (sellerOnline || !isLoggedIn) && startContact('voice')}
            disabled={sellerOnline === false && isLoggedIn}
            className={`group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors ${
              (sellerOnline || !isLoggedIn)
                ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                : 'bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            {!isLoggedIn && <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-green-300 group-hover:text-green-500 transition-colors" />}
            <Phone className={`w-4 h-4 ${(sellerOnline || !isLoggedIn) ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${(sellerOnline || !isLoggedIn) ? 'text-green-700' : 'text-gray-400'}`}>Call</span>
          </button>
          <button
            onClick={() => (sellerOnline || !isLoggedIn) && startContact('video')}
            disabled={sellerOnline === false && isLoggedIn}
            className={`group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors ${
              (sellerOnline || !isLoggedIn)
                ? 'bg-purple-50 hover:bg-purple-100 cursor-pointer'
                : 'bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            {!isLoggedIn && <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-purple-300 group-hover:text-purple-500 transition-colors" />}
            <Video className={`w-4 h-4 ${(sellerOnline || !isLoggedIn) ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${(sellerOnline || !isLoggedIn) ? 'text-purple-700' : 'text-gray-400'}`}>Video</span>
          </button>
        </div>

        {/* Offline message */}
        {sellerOnline === false && (
          <p className="text-[10px] text-gray-400 text-center">
            Chat is available offline. Call &amp; Video require seller to be online.
          </p>
        )}
      </div>
    );
  }

  // Active session UI
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 ${
        mode === 'chat' ? 'bg-blue-600' : mode === 'voice' ? 'bg-green-600' : 'bg-purple-600'
      }`}>
        <div className="flex items-center gap-2">
          {mode === 'chat' && <MessageCircle className="w-4 h-4 text-white" />}
          {mode === 'voice' && <Phone className="w-4 h-4 text-white" />}
          {mode === 'video' && <Video className="w-4 h-4 text-white" />}
          <span className="text-xs font-bold text-white">
            {mode === 'chat' ? 'Chat' : mode === 'voice' ? 'Voice Call' : 'Video Call'} — {sellerName}
          </span>
          <span className={`w-2 h-2 rounded-full ${sellerOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
        <button onClick={disconnect} className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Connecting */}
      {isConnecting && (
        <div className="p-6 text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Connecting to {sellerName}...</p>
        </div>
      )}

      {/* Ringing — buyer in room, waiting for seller to answer */}
      {!isConnecting && isRinging && !isConnected && (
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse ${
            mode === 'voice' ? 'bg-green-100' : 'bg-purple-100'
          }`}>
            {mode === 'voice'
              ? <Phone className="w-8 h-8 text-green-600 animate-bounce" />
              : <Video className="w-8 h-8 text-purple-600 animate-bounce" />}
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Calling {sellerName}...</p>
          <p className="text-xs text-gray-400 mb-4">Ringing • waiting for seller to answer</p>
          <button onClick={disconnect}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-full transition-colors cursor-pointer">
            <PhoneOff className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={disconnect} className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer">Close</button>
        </div>
      )}

      {/* Chat UI */}
      {isConnected && mode === 'chat' && (
        <div>
          <div className="h-48 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === participant ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                  msg.sender === 'system'
                    ? 'bg-gray-200 text-gray-500 italic mx-auto text-center'
                    : msg.sender === participant
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center gap-2 p-2 border-t border-gray-100">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <button onClick={sendMessage}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Voice Call UI */}
      {isConnected && mode === 'voice' && (
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Phone className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Voice call with {sellerName}</p>
          <p className="text-xs text-gray-400 mb-4">Connected</p>
          <audio ref={remoteAudioRef} autoPlay />
          <div className="flex items-center justify-center gap-3">
            <button onClick={toggleMute}
              className={`p-3 rounded-full transition-colors cursor-pointer ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={disconnect}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer">
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Video Call UI */}
      {isConnected && mode === 'video' && (
        <div>
          <div className="relative bg-black aspect-video">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[11px] font-semibold">
              {sellerName}
            </span>
            <div className="absolute bottom-2 right-2 w-24 h-18">
              <video ref={localVideoRef} autoPlay playsInline muted
                className="w-full h-full rounded-lg object-cover border-2 border-white/30" />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] font-semibold">
                You
              </span>
            </div>
            <audio ref={remoteAudioRef} autoPlay />
          </div>
          <div className="flex items-center justify-center gap-3 p-3 bg-gray-900">
            <button onClick={toggleMute}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button onClick={toggleCamera}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${isCameraOff ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
              {isCameraOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </button>
            <button onClick={disconnect}
              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer">
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
