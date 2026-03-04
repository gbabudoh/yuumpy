'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant } from 'livekit-client';
import { X, MessageCircle, Phone, Video, Send, PhoneOff, Mic, MicOff, Camera, CameraOff, Bell } from 'lucide-react';

type ActiveMode = 'chat' | 'voice' | 'video' | null;

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

interface IncomingRequest {
  roomName: string;
  mode: ActiveMode;
  buyerName: string;
  timestamp: Date;
}

interface SellerIncomingCommsProps {
  sellerId: number;
  storeSlug: string;
}

export default function SellerIncomingComms({ sellerId, storeSlug }: SellerIncomingCommsProps) {
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const listenerRoomsRef = useRef<Room[]>([]);
  const ringtoneRef = useRef<{ stop: () => void } | null>(null);
  const participant = `seller-${storeSlug}`;

  // --- Ringtone using Web Audio API ---
  const startRingtone = useCallback(() => {
    if (ringtoneRef.current) return; // Already playing
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      let playing = true;
      const playTone = (freq1: number, freq2: number, startTime: number, duration: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.value = freq1;
        osc2.frequency.value = freq2;
        osc1.type = 'sine';
        osc2.type = 'sine';
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };
      const scheduleRing = () => {
        if (!playing) return;
        const now = ctx.currentTime;
        // Two-tone ring pattern: ring-ring ... pause ... repeat
        playTone(440, 480, now, 0.4);
        playTone(440, 480, now + 0.5, 0.4);
        setTimeout(() => scheduleRing(), 2500);
      };
      scheduleRing();
      ringtoneRef.current = {
        stop: () => { playing = false; ctx.close(); ringtoneRef.current = null; },
      };
    } catch { /* Web Audio not available */ }
  }, []);

  const stopRingtone = useCallback(() => {
    ringtoneRef.current?.stop();
  }, []);

  // Play/stop ringtone based on incoming requests
  useEffect(() => {
    const hasVoiceOrVideo = incomingRequests.some(r => r.mode === 'voice' || r.mode === 'video');
    if (hasVoiceOrVideo) {
      startRingtone();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [incomingRequests, startRingtone, stopRingtone]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      const container = chatEndRef.current.parentElement;
      if (container) container.scrollTop = container.scrollHeight;
    }
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Attach local camera to preview once connected and video element is rendered
  useEffect(() => {
    if (!isConnected || activeMode !== 'video' || !roomRef.current) return;

    const attachLocal = () => {
      const camTrack = roomRef.current?.localParticipant.getTrackPublication(Track.Source.Camera);
      if (camTrack?.track && localVideoRef.current) {
        camTrack.track.attach(localVideoRef.current);
        return true;
      }
      return false;
    };

    if (!attachLocal()) {
      let attempts = 0;
      const iv = setInterval(() => {
        if (attachLocal() || ++attempts > 20) clearInterval(iv);
      }, 200);
      return () => clearInterval(iv);
    }
  }, [isConnected, activeMode]);

  // Listen for incoming connections on all 3 room types
  useEffect(() => {
    if (!storeSlug || !sellerId) return;

    const modes: ('chat' | 'voice' | 'video')[] = ['chat', 'voice', 'video'];

    const startListening = async () => {
      for (const mode of modes) {
        try {
          const roomName = `seller-${storeSlug}-${mode}`;
          const res = await fetch('/api/livekit/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomName,
              participantName: `listener-${storeSlug}-${mode}`,
              metadata: { role: 'seller-listener', mode },
            }),
          });

          if (!res.ok) continue;
          const { token } = await res.json();
          const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
          if (!livekitUrl) continue;

          const room = new Room();

          room.on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
            // A buyer joined — show incoming request
            const meta = p.metadata ? JSON.parse(p.metadata) : {};
            if (meta.role === 'buyer') {
              setIncomingRequests(prev => {
                // Avoid duplicates
                if (prev.some(r => r.roomName === roomName)) return prev;
                return [...prev, {
                  roomName,
                  mode,
                  buyerName: p.name || p.identity,
                  timestamp: new Date(),
                }];
              });
              setExpanded(true);
            }
          });

          room.on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => {
            const meta = p.metadata ? JSON.parse(p.metadata) : {};
            if (meta.role === 'buyer') {
              setIncomingRequests(prev => prev.filter(r => r.roomName !== roomName));
            }
          });

          await room.connect(livekitUrl, token);
          listenerRoomsRef.current.push(room);
        } catch {
          // Silently fail
        }
      }
      setIsListening(true);
    };

    startListening();

    return () => {
      listenerRoomsRef.current.forEach(r => r.disconnect());
      listenerRoomsRef.current = [];
      setIsListening(false);
    };
  }, [storeSlug, sellerId]);

  const acceptRequest = useCallback(async (request: IncomingRequest) => {
    setIsConnecting(true);
    setActiveMode(request.mode);

    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: request.roomName,
          participantName: participant,
          metadata: { role: 'seller', mode: request.mode },
        }),
      });

      if (!res.ok) throw new Error('Failed to get token');
      const { token } = await res.json();
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) throw new Error('LiveKit URL not configured');

      // Disconnect listener for this mode to avoid duplicate
      const listenerIdx = listenerRoomsRef.current.findIndex(r =>
        r.name === request.roomName
      );
      if (listenerIdx >= 0) {
        listenerRoomsRef.current[listenerIdx].disconnect();
        listenerRoomsRef.current.splice(listenerIdx, 1);
      }

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

      room.on(RoomEvent.ParticipantDisconnected, () => {
        // Buyer left
        setMessages(prev => [...prev, { sender: 'system', text: 'Buyer has disconnected.', timestamp: new Date() }]);
      });

      await room.connect(livekitUrl, token);

      if (request.mode === 'voice' || request.mode === 'video') {
        await room.localParticipant.setMicrophoneEnabled(true);
      }
      if (request.mode === 'video') {
        await room.localParticipant.setCameraEnabled(true);
      }

      setIsConnected(true);
      setIncomingRequests(prev => prev.filter(r => r.roomName !== request.roomName));

      if (request.mode === 'chat') {
        setMessages([{ sender: 'system', text: `Connected with ${request.buyerName}. You can start chatting.`, timestamp: new Date() }]);
      }
    } catch (err) {
      console.error('Failed to accept:', err);
      setActiveMode(null);
    } finally {
      setIsConnecting(false);
    }
  }, [participant]);

  const disconnect = useCallback(() => {
    if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
    setIsConnected(false);
    setActiveMode(null);
    setMessages([]);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  const dismissRequest = (roomName: string) => {
    setIncomingRequests(prev => prev.filter(r => r.roomName !== roomName));
  };

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

  const totalIncoming = incomingRequests.length;

  // Active session UI
  if (activeMode && (isConnecting || isConnected)) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-96 rounded-2xl overflow-hidden shadow-2xl" style={{
        background: 'rgba(15,12,41,0.98)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 ${
          activeMode === 'chat' ? 'bg-blue-600' : activeMode === 'voice' ? 'bg-green-600' : 'bg-purple-600'
        }`}>
          <div className="flex items-center gap-2">
            {activeMode === 'chat' && <MessageCircle className="w-4 h-4 text-white" />}
            {activeMode === 'voice' && <Phone className="w-4 h-4 text-white" />}
            {activeMode === 'video' && <Video className="w-4 h-4 text-white" />}
            <span className="text-sm font-bold text-white">
              {activeMode === 'chat' ? 'Chat' : activeMode === 'voice' ? 'Voice Call' : 'Video Call'}
            </span>
          </div>
          <button onClick={disconnect} className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {isConnecting && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Connecting...</p>
          </div>
        )}

        {/* Chat UI */}
        {isConnected && activeMode === 'chat' && (
          <div>
            <div className="h-56 overflow-y-auto p-3 space-y-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === participant ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                    msg.sender === 'system'
                      ? 'bg-gray-700 text-gray-400 italic mx-auto text-center'
                      : msg.sender === participant
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-700 text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-center gap-2 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/10 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
              <button onClick={sendMessage}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Voice UI */}
        {isConnected && activeMode === 'voice' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Phone className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">Voice Call Active</p>
            <p className="text-xs text-gray-500 mb-4">Connected</p>
            <audio ref={remoteAudioRef} autoPlay />
            <div className="flex items-center justify-center gap-3">
              <button onClick={toggleMute}
                className={`p-3 rounded-full transition-colors cursor-pointer ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={disconnect}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer">
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Video UI */}
        {isConnected && activeMode === 'video' && (
          <div>
            <div className="relative bg-black aspect-video">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <video ref={localVideoRef} autoPlay playsInline muted
                className="absolute bottom-2 right-2 w-24 h-18 rounded-lg object-cover border-2 border-white/30" />
              <audio ref={remoteAudioRef} autoPlay />
            </div>
            <div className="flex items-center justify-center gap-3 p-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <button onClick={toggleMute}
                className={`p-2.5 rounded-full transition-colors cursor-pointer ${isMuted ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={toggleCamera}
                className={`p-2.5 rounded-full transition-colors cursor-pointer ${isCameraOff ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
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

  // Floating notification panel
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Expanded panel with incoming requests */}
      {expanded && totalIncoming > 0 && (
        <div className="mb-3 w-80 rounded-2xl overflow-hidden shadow-2xl" style={{
          background: 'rgba(15,12,41,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-sm font-bold text-white">Incoming ({totalIncoming})</span>
            <button onClick={() => setExpanded(false)} className="p-1 hover:bg-white/10 rounded cursor-pointer">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {incomingRequests.map((req) => (
              <div key={req.roomName} className="p-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  req.mode === 'chat' ? 'bg-blue-500/20' : req.mode === 'voice' ? 'bg-green-500/20' : 'bg-purple-500/20'
                }`}>
                  {req.mode === 'chat' && <MessageCircle className="w-5 h-5 text-blue-400" />}
                  {req.mode === 'voice' && <Phone className="w-5 h-5 text-green-400 animate-pulse" />}
                  {req.mode === 'video' && <Video className="w-5 h-5 text-purple-400 animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{req.buyerName}</p>
                  <p className="text-xs text-gray-500 capitalize">{req.mode} request</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => acceptRequest(req)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                    Accept
                  </button>
                  <button onClick={() => dismissRequest(req.roomName)}
                    className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-gray-400 text-xs rounded-lg transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105"
        style={{
          background: totalIncoming > 0
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <Bell className={`w-6 h-6 ${totalIncoming > 0 ? 'text-white animate-bounce' : 'text-gray-400'}`} />
        {totalIncoming > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalIncoming}
          </span>
        )}
        {isListening && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
        )}
      </button>
    </div>
  );
}
