'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface HeroVideoProps {
  mp4Src: string;
  webmSrc?: string;
  posterSrc?: string;
  className?: string;
  priority?: boolean;
}

export function HeroVideo({
  mp4Src,
  webmSrc,
  posterSrc,
  className,
  priority = true,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Check device type - don't load video on mobile to save bandwidth
  useEffect(() => {
    const checkDevice = () => {
      // Consider mobile/tablet if < 768px or touch device with small screen
      const isMobile = window.innerWidth < 768;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobileOrTablet(isMobile || (isTouch && window.innerWidth < 1024));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Conditional video loading
  useEffect(() => {
    if (!prefersReducedMotion && !isMobileOrTablet) {
      // Small delay to prioritize LCP
      const timer = setTimeout(() => setShouldLoadVideo(true), priority ? 50 : 500);
      return () => clearTimeout(timer);
    }
  }, [prefersReducedMotion, isMobileOrTablet, priority]);

  // Handle video load and autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      video.play().catch(() => {
        // Autoplay blocked - poster will show
        console.log('Video autoplay was blocked');
      });
    };

    video.addEventListener('canplay', handleCanPlay);

    // Try to play if already loaded
    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [shouldLoadVideo]);

  // Show static poster for reduced motion, mobile, or while loading
  const showPoster = prefersReducedMotion || isMobileOrTablet || !videoLoaded;

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Poster/fallback - always rendered as base layer */}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 bg-primary',
          videoLoaded && !prefersReducedMotion && !isMobileOrTablet
            ? 'opacity-0'
            : 'opacity-100'
        )}
        style={posterSrc ? { backgroundImage: `url(${posterSrc})` } : undefined}
        role="img"
        aria-label="Hero background"
      />

      {/* Video element - only loaded when appropriate */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            videoLoaded ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay
          muted
          loop
          playsInline // Critical for iOS Safari
          poster={posterSrc || undefined}
          preload="auto"
        >
          {/* WebM first for smaller file size (if provided) */}
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
