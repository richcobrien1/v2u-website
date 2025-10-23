'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { VideoPlayerProvider } from '@/components/VideoPlayer/VideoPlayerProvider';
import { colorThemes } from '@/lib/ui/panelThemes';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  thumbnail: string;
  category:
    | 'ai-now'
    | 'ai-now-educate'
    | 'ai-now-commercial'
    | 'ai-now-conceptual'
    | 'ai-now-reviews';
  isPremium: boolean;
  audioUrl?: string;
  videoUrl?: string;
  isNew?: boolean;
  r2Key?: string;
  fileSize?: number;
}

type PanelId = 'all' | 'premium' | 'new' | 'educate' | 'reviews';

interface CategoryPanel {
  id: PanelId;
  label: string;
  description: string;
  icon: string;
  color: keyof typeof colorThemes;
  count: number;
}

interface ApiResponse {
  success?: boolean;
  episodes?: Episode[];
  message?: string;
  usingMockData?: boolean;
}

export default function PodcastDashboardPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeFilter, setActiveFilter] = useState<PanelId>('all');

  useEffect(() => {
    let mounted = true;

    async function loadEpisodes() {
      try {
        const response = await fetch('/api/episodes');
        const data: ApiResponse = await response.json();

        if (!mounted) return;

        if (data.success && data.episodes) {
          setEpisodes(data.episodes);
        } else {
          setEpisodes([
            {
              id: 'fallback-1',
              title:
                'AI-Now Daily: October 2nd - Practical AI & Advanced Robotics',
              description:
                'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
              duration: '45:32',
              publishDate: '2025-10-02',
              thumbnail: '/Ai-Now-Educate-YouTube.jpg',
              category: 'ai-now',
              audioUrl:
                '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now.mp4',
              videoUrl:
                '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now.mp4',
              isPremium: false,
              isNew: true,
            },
          ]);
        }
      } catch {
        if (!mounted) return;
        setEpisodes([
          {
            id: 'fallback-1',
            title:
              'AI-Now Daily: October 2nd - Practical AI & Advanced Robotics',
            description:
              'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
            duration: '45:32',
            publishDate: '2025-10-02',
            thumbnail: '/Ai-Now-Educate-YouTube.jpg',
            category: 'ai-now',
            audioUrl:
              '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now.mp4',
            isPremium: false,
            isNew: true,
          },
        ]);
      }
    }

    loadEpisodes();
    return () => {
      mounted = false;
    };
  }, []);

  // Stats (all are used by panels)
  const totalEpisodes = episodes.length;
  const premiumEpisodes = episodes.filter((ep) => ep.isPremium).length;
  const newEpisodes = episodes.filter((ep) => ep.isNew).length;
  const educateEpisodes = episodes.filter(
    (ep) => ep.category === 'ai-now-educate'
  ).length;
  const reviewEpisodes = episodes.filter(
    (ep) => ep.category === 'ai-now-reviews'
  ).length;

  // Filter episodes for the grid
  const filteredEpisodes = episodes.filter((episode) => {
    switch (activeFilter) {
      case 'premium':
        return episode.isPremium;
      case 'new':
        return episode.isNew;
      case 'educate':
        return episode.category === 'ai-now-educate';
      case 'reviews':
        return episode.category === 'ai-now-reviews';
      default:
        return true;
    }
  });

  const categoryPanels: CategoryPanel[] = [
    {
      id: 'all',
      label: 'Your Stats',
      icon: '📊',
      color: 'stats',
      count: totalEpisodes,
      description: 'Episodes Available',
    },
    {
      id: 'premium',
      label: 'Premium Content',
      icon: '🔒',
      color: 'premium',
      count: premiumEpisodes,
      description: 'Exclusive Episodes',
    },
    {
      id: 'new',
      label: 'New This Week',
      icon: '🆕',
      color: 'new',
      count: newEpisodes,
      description: 'Fresh Content',
    },
    {
      id: 'educate',
      label: 'Educate',
      icon: '🎓',
      color: 'educate',
      count: educateEpisodes,
      description: '101 / 201 / 401',
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: '⭐',
      color: 'reviews',
      count: reviewEpisodes,
      description: 'Weekly / Monthly / Yearly',
    },
  ];

  return (
    <VideoPlayerProvider>
      {/* Header matches your provided props signature */}
      <Header
        loggedIn={false}
        firstName={undefined}
        avatar="🎧"
        isAdmin={false}
      />

      <main className="max-w-6xl mx-auto px-4 py-24 space-y-8">
        {/* Panels */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryPanels.map((panel) => {
            const isActive = activeFilter === panel.id;
            const theme = colorThemes[panel.color];

            return (
              <button
                key={panel.id}
                onClick={() => setActiveFilter(panel.id)}
                className={`
                  flex flex-col items-center justify-center rounded-xl p-4 transition
                  ${isActive ? `${theme.active} scale-105` : `${theme.inactive}`}
                  ${!isActive ? 'hover:scale-105' : ''}
                `}
              >
                <span className="text-2xl">{panel.icon}</span>
                <span className="font-semibold">{panel.label}</span>
                <span className="text-sm opacity-80">{panel.description}</span>
                <span className="text-lg font-bold">{panel.count}</span>
              </button>
            );
          })}
        </div>

        {/* Episodes placeholder grid (kept minimal to avoid type/prop mismatches) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEpisodes.map((ep) => (
            <article
              key={ep.id}
              className="rounded-lg bg-white/5 p-4 shadow transition hover:shadow-lg"
            >
              <img
                src={ep.thumbnail}
                alt={ep.title}
                className="rounded-md mb-3 w-full h-auto object-cover"
              />
              <h3 className="font-semibold">{ep.title}</h3>
              <p className="text-sm opacity-80">{ep.description}</p>
              <div className="text-xs mt-2 opacity-60">
                {ep.duration} • {ep.publishDate}
              </div>
            </article>
          ))}

          {filteredEpisodes.length === 0 && (
            <div className="col-span-full text-center opacity-70 text-sm">
              No episodes match this filter.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </VideoPlayerProvider>
  );
}
