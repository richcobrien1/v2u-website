import PostCard from './PostCard'
import Section from '@/components/Section'

const postCard = [
  {
    title: 'Meals On Demand Vending Concept #1',
    imageSrc: '/Meal Prep Vending 1.png',
    href: '#',
  },
  {
    title: 'Meals On Demand Vending Concept #2',
    imageSrc: '/Meal Prep Vending 2.png',
    href: '#',
  },
  {
    title: 'Meals On Demand Vending Concept #3',
    imageSrc: '/Meal Prep Vending 3.png',
    href: '#',
  },
]

export default function PostCardDirectory() {
  return (
    <Section
      id="Meals-on-demand-vending"
      title="Meals On Demand Vending"
      variant="dark"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postCard.map((postCard) => (
          <PostCard key={postCard.title} {...postCard} />
        ))}
      </div>
    </Section>
  )
}