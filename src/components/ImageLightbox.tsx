'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  productName: string;
  onClose: () => void;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ImageLightbox({ images, initialIndex, productName, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastDistance = useRef<number | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback((next: number) => {
    resetZoom();
    setIndex((next + images.length) % images.length);
  }, [images.length, resetZoom]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goTo(index + 1);
      if (e.key === 'ArrowLeft') goTo(index - 1);
    };
    window.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, goTo, onClose]);

  const toggleZoom = () => {
    if (scale > 1) resetZoom();
    else setScale(2.5);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setIsInteracting(true);

    if (pointers.current.size === 1) {
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragOrigin.current = translate;

      const now = Date.now();
      if (now - lastTapTime.current < 300) toggleZoom();
      lastTapTime.current = now;
    }

    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      lastDistance.current = distance(pts[0], pts[1]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const dist = distance(pts[0], pts[1]);
      if (lastDistance.current) {
        const delta = dist / lastDistance.current;
        setScale((s) => clamp(s * delta, 1, 4));
      }
      lastDistance.current = dist;
    } else if (pointers.current.size === 1 && scale > 1 && dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const maxOffset = (scale - 1) * 250;
      setTranslate({
        x: clamp(dragOrigin.current.x + dx, -maxOffset, maxOffset),
        y: clamp(dragOrigin.current.y + dy, -maxOffset, maxOffset),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) lastDistance.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      setIsInteracting(false);
      if (scale <= 1.05) resetZoom();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    setScale((s) => clamp(s * delta, 1, 4));
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            className="absolute left-2 sm:left-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            className="absolute right-2 sm:right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div
          className="relative w-[90vw] h-[80vh] max-w-3xl"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isInteracting ? 'none' : 'transform 0.2s ease-out',
            cursor: scale > 1 ? 'grab' : 'zoom-in',
          }}
        >
          <Image
            src={images[index]}
            alt={`${productName} - Image ${index + 1}`}
            fill
            className="object-contain pointer-events-none"
            sizes="90vw"
            priority
          />
        </div>
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium whitespace-nowrap">
        {images.length > 1 ? `${index + 1} / ${images.length} · ` : ''}Pinch or scroll to zoom · Double-tap to reset
      </p>
    </div>
  );
}
