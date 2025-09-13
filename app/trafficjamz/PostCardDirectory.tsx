import PostCard from '@/components/PostCard'
import Section from '@/components/Section'

const postCard = [
  {
    title: 'Holiday Jamz',
    imageSrc: '/Jamz-holiday.png',
    href: '#',
  },
  {
    title: 'City Jamz',
    imageSrc: '/Jamz-city.png',
    href: '#',
  },
  {
    title: 'Sport Jamz',
    imageSrc: '/Jamz-sport.png',
    href: '#',
  },
]

export default function PostCardDirectory() {
  return (
    <Section
      id="seasonal-jamz"
      title="Seasonal Jamz"
      variant="light"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postCard.map((podcast) => (
          <PostCard key={podcast.title} {...podcast} />
        ))}
      </div>
    </Section>
  )
}