'use client';

import { useState, useCallback } from 'react';

export type ViewMode = 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen';

interface Episode {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnail?: string;
}

interface VideoPlayerState {
  isOpen: boolean;
  episode: Episode | null;
  viewMode: ViewMode;
  isMinimized: boolean;
}

export function useVideoPlayer() {
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isOpen: false,
    episode: null,
    viewMode: 'popup',
    isMinimized: false
  });

  const openPlayer = useCallback((episode: Episode, viewMode: ViewMode = 'popup') => {
    setPlayerState({
      isOpen: true,
      episode,
      viewMode,
      isMinimized: false
    });
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      isOpen: false,
      episode: null,
      isMinimized: false
    }));
  }, []);

  const changeViewMode = useCallback((viewMode: ViewMode) => {
    setPlayerState(prev => ({
      ...prev,
      viewMode
    }));
  }, []);

  const minimizePlayer = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      isMinimized: true,
      viewMode: 'slideIn'
    }));
  }, []);

  const maximizePlayer = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      isMinimized: false,
      viewMode: 'popup'
    }));
  }, []);

  return {
    playerState,
    openPlayer,
    closePlayer,
    changeViewMode,
    minimizePlayer,
    maximizePlayer
  };
}