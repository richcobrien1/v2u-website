 'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SmartThumbnailProps {
  src: string;
  fallbacks?: string[];
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export default function SmartThumbnail({
  src,
  fallbacks = [],
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes
}: SmartThumbnailProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  // Keep minimal logging for initialization and errors
  useEffect(() => {
    console.debug('SmartThumbnail initialized', { src, fallbackCount: fallbacks.length });
  }, [src, fallbacks.length]);

  // Reset when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setFallbackIndex(-1);
    setIsLoading(true);
  }, [src]);

  // Preload currentSrc using a plain Image to reliably detect load/error across environments
  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.src = currentSrc;
    img.onload = () => {
      if (!cancelled) setIsLoading(false);
    };
    img.onerror = () => {
      if (cancelled) return;
      const nextIndex = fallbackIndex + 1;
      if (nextIndex < fallbacks.length) {
        setFallbackIndex(nextIndex);
        setCurrentSrc(fallbacks[nextIndex]);
        // keep isLoading true while trying fallback
      } else {
        // final fallback
        setCurrentSrc('/Ai-Now-Educate-YouTube.jpg');
        setIsLoading(false);
      }
    };

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [currentSrc, fallbackIndex, fallbacks]);

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    
    console.error(`SmartThumbnail error for src: ${currentSrc}`);
    
    if (nextIndex < fallbacks.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbacks[nextIndex]);
      console.log(`Thumbnail fallback ${nextIndex + 1}/${fallbacks.length}:`, fallbacks[nextIndex]);
    } else {
      // All fallbacks failed, use final default
      console.log('All thumbnail fallbacks failed, using final default');
      setCurrentSrc('/Ai-Now-Educate-YouTube.jpg');
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (fill) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={currentSrc}
          alt={alt}
          fill
          sizes={sizes}
          onError={handleError}
          onLoadingComplete={handleLoad}
          className={`object-cover ${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}
        />
        {/* Fallback plain img in case Next/Image fails to render in some environments */}
        {!isLoading && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentSrc} alt={alt} className={`absolute inset-0 w-full h-full object-cover ${isLoading ? 'hidden' : 'block'}`} />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-auto">
      <Image
        src={currentSrc}
        alt={alt}
        width={width || 400}
        height={height || 225}
        onError={handleError}
        onLoadingComplete={handleLoad}
        className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}
      />
      {!isLoading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentSrc} alt={alt} width={width || 400} height={height || 225} className={`${className} ${isLoading ? 'hidden' : 'block'}`} />
      )}
    </div>
  );
}