import PodcastCard from '@/components/PodcastCard'
import Section from '@/components/Section'

const podcastData = [
  {
    title: 'YouTube',
    imageSrc: '/YouTube Channel Promo.jpg',
    href: 'https://www.youtube.com/playlist?list=PLQDaXrlGzy40uuAqfgi5t1ZbiaDhoW-By',
  },
  {
    title: 'YouTube Music',
    imageSrc: '/YouTube Music Promo.jpg',
    href: 'https://music.youtube.com/playlist?list=PLQDaXrlGzy40fnqO2wWGZC1nxQLZf-lMZ',
  },
  {
    title: 'Spotify',
    imageSrc: '/Spotify Podcast Promo.jpg',
    href: 'https://open.spotify.com/show/4VaL5n7OyHqWCGGFcYnxmi',
  },
  {
    title: 'X (formerly Twitter)',
    imageSrc: '/X Profile Promo.jpg',
    href: 'https://x.com/ai_now_v2u',
  },
  {
    title: 'LinkedIn',
    imageSrc: '/LinkedIn Profile Promo.jpg',
    href: 'https://www.linkedin.com/company/v2u',
  },
  {
    title: 'Rumble',
    imageSrc: '/Rumble Channel Promo.jpg',
    href: 'https://rumble.com/c/c-7769250',
  },
  {
    title: 'Facebook Page',
    imageSrc: '/Facebook Page Promo.jpg',
    href: 'https://www.facebook.com/profile.php?id=61579036979691&sk=reels_tab',
  },
  {
    title: 'Instagram',
    imageSrc: '/Instagram Channel Promo.jpg',
    href: 'https://www.instagram.com/v2u.us/',
  },
  {
    title: 'Learn About Our Premium Content',
    imageSrc: '/background-login.gif',
    href: '/subscribe',
  },
]

export default function PodcastDirectory() {
  return (
    <Section
      id="ai-now"
      title="Discover AI-Now"
      variant="dark"
    >
      <div className="gap-6 mb-12 max-w-3xl">
        <h4 className="mb-3 mt-8 text-lg font-semibold">
          Your knowledge, your way...
        </h4>
        <p>Join Alex and Jessica as they Deep Dive the latest news and trends in 
          the Digital AI landscape. New episodes are curated each day on all major 
          podcast platforms. Go to your plaform of choice and search for AI-Now or
          click one of the panels below to get started! Easy peasy!
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcastData.map((podcast) => (
          <PodcastCard key={podcast.title} {...podcast} />
        ))}
      </div>
    </Section>
  )
}