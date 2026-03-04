'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Room, RoomEvent, Track, RemoteTrack } from 'livekit-client';
import { X, MessageCircle, Phone, Video, Send, PhoneOff, Mic, MicOff, Camera, CameraOff } from 'lucide-react';

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

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const ringbackRef = useRef<{ stop: () => void } | null>(null);
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

    checkPresence();
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
    return () => { if (roomRef.current) roomRef.current.disconnect(); };
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

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const decoded = new TextDecoder().decode(payload);
          const msg = JSON.parse(decoded);
          setMessages(prev => [...prev, { sender: msg.sender, text: msg.text, timestamp: new Date() }]);
        } catch { /* ignore */ }
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Video && remoteVideoRef.current) track.attach(remoteVideoRef.current);
        if (track.kind === Track.Kind.Audio && remoteAudioRef.current) track.attach(remoteAudioRef.current);
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => { track.detach(); });

      await room.connect(livekitUrl, token);

      if (contactMode === 'voice' || contactMode === 'video') {
        await room.localParticipant.setMicrophoneEnabled(true);
      }
      if (contactMode === 'video') {
        await room.localParticipant.setCameraEnabled(true);
      }

      setIsConnected(true);
      stopRingback(); // Stop ringing once connected
      if (contactMode === 'chat') {
        setMessages(prev => [...prev, {
          sender: 'system',
          text: `Connected to ${sellerName}'s chat. Send a message to start the conversation.`,
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('Could not connect. Please try again later.');
    } finally {
      setIsConnecting(false);
    }
  }, [sellerSlug, sellerName, participant, stopRingback]);

  const disconnect = useCallback(() => {
    if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
    stopRingback();
    setIsConnected(false);
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
    setMode(contactMode);
    if (contactMode === 'voice' || contactMode === 'video') {
      startRingback();
    }
    connectToRoom(contactMode);
  };

  // No active mode — show status + buttons
  if (!mode) {
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
            className="flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors cursor-pointer bg-blue-50 hover:bg-blue-100"
          >
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-medium text-blue-700">Chat</span>
          </button>
          <button
            onClick={() => sellerOnline && startContact('voice')}
            disabled={!sellerOnline}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors ${
              sellerOnline
                ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                : 'bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <Phone className={`w-4 h-4 ${sellerOnline ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${sellerOnline ? 'text-green-700' : 'text-gray-400'}`}>Call</span>
          </button>
          <button
            onClick={() => sellerOnline && startContact('video')}
            disabled={!sellerOnline}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors ${
              sellerOnline
                ? 'bg-purple-50 hover:bg-purple-100 cursor-pointer'
                : 'bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <Video className={`w-4 h-4 ${sellerOnline ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${sellerOnline ? 'text-purple-700' : 'text-gray-400'}`}>Video</span>
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
            <video ref={localVideoRef} autoPlay playsInline muted
              className="absolute bottom-2 right-2 w-24 h-18 rounded-lg object-cover border-2 border-white/30" />
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
