'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { VideoPlayerProvider } from '@/components/VideoPlayer/VideoPlayerProvider'
import EpisodeCard from '@/components/EpisodeCard'
import { colorThemes } from '@/lib/ui/panelThemes'
import { useUser } from '@/hooks/useUser'

interface Episode {
  id: string
  title: string
  description: string
  duration: string
  publishDate: string
  thumbnail: string
  thumbnailFallbacks?: string[]
  category: 'ai-deep-dive' | 'ai-deep-dive-educate' | 'ai-deep-dive-commercial' | 'ai-deep-dive-conceptual' | 'ai-deep-dive-reviews'
  subcategory?: 'weekly' | 'monthly' | 'yearly' | 'beginner' | 'intermediate' | 'advanced'
  isPremium: boolean
  audioUrl?: string
  videoUrl?: string
  isNew?: boolean
  r2Key?: string
  fileSize?: number
  lastModified?: string
}

type PanelId = 'all' | 'premium' | 'new' | 'educate' | 'reviews'

interface CategoryPanel {
  id: PanelId
  label: string
  description: string
  icon: string
  color: keyof typeof colorThemes
  count: number
}

interface ApiResponse {
  success?: boolean
  episodes?: Episode[]
  message?: string
  usingMockData?: boolean
}

export default function PodcastDashboardPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [activeFilter, setActiveFilter] = useState<PanelId>('all')
  const { user } = useUser()
  
  // Determine user subscription status - show all content if premium, only public if not logged in
  const userSubscription: 'free' | 'premium' = user.loggedIn && user.subscription === 'premium' ? 'premium' : 'free'

  // DEBUG: Log authentication state
  useEffect(() => {
    console.log('🔐 AUTH DEBUG:', {
      user,
      userSubscription,
      loggedIn: user.loggedIn,
      subscription: user.subscription
    })
  }, [user, userSubscription])

  useEffect(() => {
    let mounted = true

    async function loadEpisodes() {
      try {
        const response = await fetch('/api/episodes')
        const data: ApiResponse = await response.json()

        if (!mounted) return

        if (data.success && data.episodes) {
          setEpisodes(data.episodes)
        } else {
          setEpisodes([
            {
              id: 'fallback-1',
              title: 'AI Deep Dive Daily: November 2nd - Latest AI Developments',
              description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
              duration: '45:32',
              publishDate: '2025-11-02',
              thumbnail: '/Ai-Now-Educate-YouTube.jpg',
              category: 'ai-deep-dive',
              audioUrl: '/api/r2/public/daily/landscape/2025/11/02/november-2-2025-ai-now.mp4',
              videoUrl: '/api/r2/public/daily/landscape/2025/11/02/november-2-2025-ai-now.mp4',
              isPremium: false,
              isNew: true,
              lastModified: new Date().toISOString(),
            },
          ])
        }
      } catch {
        if (!mounted) return
        setEpisodes([
          {
            id: 'fallback-1',
            title: 'AI Deep Dive Daily: November 2nd - Latest AI Developments',
            description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
            duration: '45:32',
            publishDate: '2025-11-02',
            thumbnail: '/Ai-Now-Educate-YouTube.jpg',
            category: 'ai-deep-dive',
            audioUrl: '/api/r2/public/daily/landscape/2025/11/02/november-2-2025-ai-now.mp4',
            isPremium: false,
            isNew: true,
            lastModified: new Date().toISOString(),
          },
        ])
      }
    }

    loadEpisodes()
    return () => {
      mounted = false
    }
  }, [])

  // Filter episodes based on user subscription and ensure newest episodes first by content date
  const availableEpisodes = (userSubscription === 'premium' 
    ? episodes  // Premium users see all episodes (public + private)
    : episodes.filter(ep => !ep.isPremium)) // Free users see only public episodes
    .sort((a, b) => {
      // Primary sort: by episode content date (publishDate) for chronological content order
      const dateA = new Date(a.publishDate).getTime()
      const dateB = new Date(b.publishDate).getTime()
      
      if (dateA !== dateB) {
        return dateB - dateA // Newest episodes first
      }
      
      // Tiebreaker: use upload date (lastModified) if episode dates are the same
      if (a.lastModified && b.lastModified) {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      }
      
      // Final fallback: alphabetical
      return a.title.localeCompare(b.title)
    })

  const totalEpisodes = availableEpisodes.length
  const premiumEpisodes = availableEpisodes.filter((ep) => ep.isPremium).length
  const newEpisodes = availableEpisodes.filter((ep) => ep.isNew).length
  const educateEpisodes = availableEpisodes.filter((ep) => ep.category === 'ai-deep-dive-educate').length
  
  // Count review episodes by subcategory
  const weeklyReviews = availableEpisodes.filter((ep) => ep.category === 'ai-deep-dive-reviews' && ep.subcategory === 'weekly').length
  const monthlyReviews = availableEpisodes.filter((ep) => ep.category === 'ai-deep-dive-reviews' && ep.subcategory === 'monthly').length
  const yearlyReviews = availableEpisodes.filter((ep) => ep.category === 'ai-deep-dive-reviews' && ep.subcategory === 'yearly').length
  const reviewEpisodes = availableEpisodes.filter((ep) => ep.category === 'ai-deep-dive-reviews').length

  const filteredEpisodes = availableEpisodes.filter((episode) => {
    switch (activeFilter) {
      case 'premium':
        return episode.isPremium
      case 'new':
        return episode.isNew
      case 'educate':
        return episode.category === 'ai-deep-dive-educate'
      case 'reviews':
        return episode.category === 'ai-deep-dive-reviews'
      default:
        return true
    }
  })

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
      description: `${weeklyReviews} / ${monthlyReviews} / ${yearlyReviews}`,
    },
  ]

  return (
    <VideoPlayerProvider>
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-24 space-y-8">
        {/* Panels */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryPanels.map((panel) => {
            const isActive = activeFilter === panel.id
            const theme = colorThemes[panel.color]

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
            )
          })}
        </div>

        {/* Episodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEpisodes.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              userSubscription={userSubscription}
              viewMode="popup"
            />
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
  )
}
