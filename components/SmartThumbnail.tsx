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

  // Debug logging
  useEffect(() => {
    console.log('SmartThumbnail initialized:', {
      src,
      fallbacksCount: fallbacks.length,
      fallbacks: fallbacks.slice(0, 3), // Show first 3 fallbacks
      currentSrc,
      fallbackIndex
    });
  }, [src, fallbacks, currentSrc, fallbackIndex]);

  // Reset when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setFallbackIndex(-1);
    setIsLoading(true);
  }, [src]);

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

  const commonProps = {
    src: currentSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    priority: true, // Add priority to fix LCP warning
    className: `${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`
  };

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        fill
        sizes={sizes || "100vw"}
        priority={true}
        className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      onError={handleError}
      onLoad={handleLoad}
      width={width || 400}
      height={height || 225}
      sizes={sizes || "400px"}
      priority={true}
      className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}
    />
  );
}