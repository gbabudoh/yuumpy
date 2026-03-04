'use client';

import { useEffect, useRef } from 'react';

interface SellerPresenceHeartbeatProps {
  sellerId: number;
}

export default function SellerPresenceHeartbeat({ sellerId }: SellerPresenceHeartbeatProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const sendHeartbeat = async (online: boolean) => {
      try {
        await fetch('/api/seller/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seller_id: sellerId, online }),
        });
      } catch {
        // Silently fail — columns may not exist yet
      }
    };

    // Go online immediately
    sendHeartbeat(true);

    // Heartbeat every 2 minutes
    intervalRef.current = setInterval(() => sendHeartbeat(true), 120000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sellerId]);

  // Invisible component — no UI
  return null;
}
