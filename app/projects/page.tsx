import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'v2u Projects - AI-Powered Innovation Portfolio',
  description: 'Explore 9+ real AI-powered projects from v2u: blockchain platforms, automation tools, career solutions, and entertainment apps solving real-world problems.',
  keywords: 'AI projects, blockchain, smart contracts, automation, SafeShipping, TrafficJamz, ChronosAI, NexoAI, TrajectoryAI, CortexAI, HireWire, BreakupAI, PodcastPro',
  openGraph: {
    title: 'v2u Projects - AI-Powered Innovation Portfolio',
    description: 'Explore 9+ real AI-powered projects solving real-world problems across blockchain, automation, career, and entertainment.',
    type: 'website',
  },
}

interface Project {
  title: string
  subtitle: string
  description: string
  href: string
  status: 'Active' | 'Beta' | 'Coming Soon'
  icon?: string
}

interface Category {
  name: string
  description: string
  projects: Project[]
  gradient: { from: string; to: string }
}

export default function ProjectsPage() {
  const categories: Category[] = [
    {
      name: 'Blockchain & Smart Contracts',
      description: 'Decentralized solutions for global commerce and asset management',
      gradient: { from: '#1e3a8a', to: '#3b82f6' },
      projects: [
        {
          title: 'SafeShipping',
          subtitle: 'Global Blockchain Smart Contract Platform',
          description: 'Secure, transparent shipping and logistics powered by blockchain technology. Track shipments, automate payments, and ensure delivery verification.',
          href: '/safeshipping',
          status: 'Active',
          icon: '🚢',
        },
        {
          title: '3D Marketplace',
          subtitle: 'Smart Contract Engineering & Designer Platform',
          description: 'Marketplace connecting smart contract engineers with businesses. Browse verified developers, review portfolios, and deploy secure blockchain solutions.',
          href: '/3d-marketplace',
          status: 'Coming Soon',
          icon: '🎨',
        },
      ],
    },
    {
      name: 'AI-Powered Business Automation',
      description: 'Intelligent systems that streamline operations and boost productivity',
      gradient: { from: '#059669', to: '#10b981' },
      projects: [
        {
          title: 'Chronos-AI',
          subtitle: 'AI Design & Engineering Platform',
          description: 'Automate your design and engineering workflows with AI. Generate concepts, iterate faster, and bring products to market 10x quicker.',
          href: '/chronosai',
          status: 'Active',
          icon: '⚡',
        },
        {
          title: 'NexoAI',
          subtitle: 'Service Automation & Management',
          description: 'End-to-end service automation for modern businesses. AI-powered scheduling, customer management, billing, and analytics in one platform.',
          href: '/nexoai',
          status: 'Active',
          icon: '🤖',
        },
        {
          title: 'CortexAI',
          subtitle: 'Property & Asset Management',
          description: 'AI-driven property and asset management. Track portfolios, predict maintenance, optimize occupancy, and automate tenant communications.',
          href: '/cortexai',
          status: 'Beta',
          icon: '🏢',
        },
      ],
    },
    {
      name: 'Career & Personal Development',
      description: 'Tools to accelerate professional growth and achieve your goals',
      gradient: { from: '#7c3aed', to: '#a78bfa' },
      projects: [
        {
          title: 'HireWire',
          subtitle: 'AI-Powered Career Management Platform',
          description: 'Navigate your career with AI guidance. Resume optimization, interview prep, salary insights, and personalized job matching powered by AI.',
          href: '/hirewire',
          status: 'Active',
          icon: '💼',
        },
        {
          title: 'TrajectoryAI',
          subtitle: 'Personal Goals, Achievement & Forecast Management',
          description: 'Set ambitious goals, track progress, and forecast outcomes with AI. Get personalized recommendations and stay on track to achieve more.',
          href: '/trajectoryai',
          status: 'Active',
          icon: '🎯',
        },
      ],
    },
    {
      name: 'Entertainment & Lifestyle',
      description: 'Innovative solutions for entertainment, events, and daily living',
      gradient: { from: '#dc2626', to: '#f87171' },
      projects: [
        {
          title: 'TrafficJamz',
          subtitle: 'Group Management & Entertainment Platform',
          description: 'The ultimate platform for managing groups, events, and entertainment. Coordinate schedules, share content, and keep your crew connected.',
          href: '/trafficjamz',
          status: 'Active',
          icon: '🎵',
        },
        {
          title: 'MealsOnDemand',
          subtitle: 'Cuisine Vending Management',
          description: 'Smart vending solutions for fresh, quality meals. Automated inventory, dynamic pricing, and customer preferences powered by AI.',
          href: '/mealsondemand',
          status: 'Beta',
          icon: '🍽️',
        },
      ],
    },
  ]

  const StatusBadge = ({ status }: { status: Project['status'] }) => {
    const colors = {
      Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      Beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'Coming Soon': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <main className="w-full h-auto pt-[60px] bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="page-content">
        {/* Hero Section */}
        <PanelWrapper variant="dark">
          <Section
            id="projects-hero"
            title="v2u Active Projects"
            variant="dark"
          >
            <div className="space-y-4">
              <p className="text-xl leading-relaxed opacity-90">
                Building the future, one innovation at a time.
              </p>
              <p className="text-lg leading-relaxed opacity-80">
                From blockchain platforms to AI-powered automation, our portfolio spans cutting-edge technologies 
                designed to solve real-world problems. Each project represents our commitment to innovation, 
                quality, and transformative technology.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">{categories.reduce((acc, cat) => acc + cat.projects.length, 0)}</div>
                  <div className="text-sm opacity-75">Active Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">{categories.length}</div>
                  <div className="text-sm opacity-75">Industry Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {categories.reduce((acc, cat) => acc + cat.projects.filter(p => p.status === 'Active').length, 0)}
                  </div>
                  <div className="text-sm opacity-75">Production Ready</div>
                </div>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Category Sections */}
        {categories.map((category, catIndex) => (
          <PanelWrapper key={category.name} variant={catIndex % 2 === 0 ? 'light' : 'dark'}>
            <Section
              id={category.name.toLowerCase().replace(/\s+/g, '-')}
              title={category.name}
              body={category.description}
              variant={catIndex % 2 === 0 ? 'light' : 'dark'}
              background={category.gradient}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {category.projects.map((project) => (
                  <Link
                    key={project.title}
                    href={project.href}
                    className="group relative bg-white/5 dark:bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <StatusBadge status={project.status} />
                    </div>

                    {/* Icon */}
                    {project.icon && (
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {project.icon}
                      </div>
                    )}

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-2 text-inherit group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm font-semibold opacity-75 mb-3 text-inherit">
                      {project.subtitle}
                    </p>
                    <p className="text-sm opacity-80 leading-relaxed text-inherit">
                      {project.description}
                    </p>

                    {/* Learn More Arrow */}
                    <div className="mt-4 flex items-center text-sm font-semibold text-emerald-400 group-hover:translate-x-2 transition-transform">
                      Learn More 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          </PanelWrapper>
        ))}

        {/* Call to Action */}
        <PanelWrapper variant="dark">
          <Section
            id="cta"
            title="Ready to Transform Your Business?"
            variant="dark"
          >
            <div className="space-y-6 text-center">
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Whether you're looking to automate your operations, launch on blockchain, or accelerate your career, 
                v2u has a solution tailored for you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Link
                  href="/subscribe"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Subscribe to AI Deep Dive
                </Link>
                <Link
                  href="/company"
                  className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200"
                >
                  Learn About v2u
                </Link>
              </div>
            </div>
          </Section>
        </PanelWrapper>
      </div>

      <Footer />
    </main>
  )
}
