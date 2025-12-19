'use client'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function TrajectoryAIPage() {
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    setHasAccess(cookies['v2u-access'] === 'granted')
  }, [])

  return (
    <main className="w-full h-auto pt-12 bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="px-4 md:px-4 space-y-4 mb-6">

        {/* Main Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="trajectoryai-main"
            title="TrajectoryAI"
            body="AI-powered goal setting and achievement platform that helps you create, track, adjust, and achieve your goals across personal, professional, and financial dimensions of your life."
            variant="dark"
          >
            {/* TODO: Add TrajectoryAI demo video or screenshots here */}
            
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed mt-6">
              <p>
                <strong>TrajectoryAI</strong> transforms the way you set and achieve goals by combining proven goal-setting methodologies with AI-powered insights and adaptive tracking. Whether you&apos;re planning your career, managing personal growth, or building financial wealth, TrajectoryAI keeps you on track.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Personal Goals</h3>
              
              <p className="mt-2">
                <strong>Health & Wellness:</strong> Track fitness routines, nutrition plans, meditation practices, and wellness habits. Set measurable health goals and receive personalized recommendations based on your progress patterns.
              </p>
              <p className="mt-2">
                <strong>Relationships & Family:</strong> Define and track goals for strengthening relationships, family time, social connections, and personal development activities that matter most to you.
              </p>
              <p className="mt-2">
                <strong>Learning & Growth:</strong> Manage educational pursuits, skill development, reading lists, and personal projects. Track certifications, courses, and self-improvement milestones.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Professional Goals</h3>
              
              <p className="mt-2">
                <strong>Career Advancement:</strong> Chart your career trajectory with goals for promotions, skill acquisition, networking, and professional achievements. Align daily actions with long-term career vision.
              </p>
              <p className="mt-2">
                <strong>Business Objectives:</strong> For entrepreneurs and business owners, track revenue targets, customer acquisition, product launches, and operational milestones. Monitor KPIs and adjust strategies based on real-time progress.
              </p>
              <p className="mt-2">
                <strong>Performance Metrics:</strong> Set and track professional performance indicators, productivity goals, project completion rates, and collaboration effectiveness.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Financial Goals</h3>
              
              <p className="mt-2">
                <strong>Wealth Building:</strong> Create comprehensive financial plans including savings targets, investment goals, debt reduction strategies, and net worth milestones. Visualize your path to financial independence.
              </p>
              <p className="mt-2">
                <strong>Budget Management:</strong> Set spending limits, track expenses against budgets, and identify opportunities to optimize your financial decisions. Receive AI-powered insights on spending patterns.
              </p>
              <p className="mt-2">
                <strong>Major Purchases:</strong> Plan and save for significant purchases like homes, vehicles, education, or dream experiences. Track progress with automated contribution tracking and timeline adjustments.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">AI-Powered Features</h3>
              
              <p className="mt-2">
                <strong>Smart Goal Setting:</strong> AI assists in creating SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals by analyzing your inputs and suggesting refinements for better success rates.
              </p>
              <p className="mt-2">
                <strong>Adaptive Tracking:</strong> The platform learns from your behavior patterns and automatically adjusts tracking frequencies, reminder timing, and milestone checkpoints to match your working style.
              </p>
              <p className="mt-2">
                <strong>Progress Insights:</strong> Get AI-generated insights about your progress trends, potential obstacles, and recommended adjustments. Celebrate wins and course-correct before small issues become major setbacks.
              </p>
              <p className="mt-2">
                <strong>Goal Interconnections:</strong> TrajectoryAI identifies how your goals influence each other and suggests synergies. Understand how career advancement might support financial goals, or how personal wellness impacts professional performance.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <CTAButton
                label="Start Free Trial"
                href="mailto:admin@v2u.us?subject=TrajectoryAI%20Trial&body=Hi%20Team%2C%0A%0AI%27d%20like%20to%20start%20a%20free%20trial%20of%20TrajectoryAI..."
                variant="dark"
              />
              <CTAButton
                label="Learn More"
                href="mailto:admin@v2u.us?subject=TrajectoryAI%20Inquiry&body=Hi%20Team%2C%0A%0AI%27m%20interested%20in%20learning%20more%20about%20TrajectoryAI..."
                variant="dark"
              />
            </div>
          </Section>
        </PanelWrapper>

        {/* Key Features - Light */}
        <PanelWrapper variant="light">
          <Section
            id="trajectoryai-features"
            title="Key Features"
            variant="light"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🎯 Goal Hierarchies</h4>
                <p className="opacity-80">Create nested goals with sub-goals, milestones, and tasks. See the big picture and daily actions in one view.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">📊 Visual Progress</h4>
                <p className="opacity-80">Beautiful dashboards and charts that show your progress across all life areas at a glance.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🔔 Smart Reminders</h4>
                <p className="opacity-80">AI-optimized notifications that adapt to your schedule and behavior patterns for maximum effectiveness.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🤝 Accountability</h4>
                <p className="opacity-80">Share goals with accountability partners, coaches, or friends for mutual support and motivation.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">📱 Cross-Platform</h4>
                <p className="opacity-80">Access your goals on web, iOS, Android, and desktop. Your progress syncs automatically.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🧠 AI Coaching</h4>
                <p className="opacity-80">Conversational AI provides personalized coaching, identifies blockers, and suggests action plans.</p>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* How It Works - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="trajectoryai-process"
            title="How It Works"
            variant="dark"
          >
            <div className="space-y-6 text-white">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Create Your Goals</h4>
                  <p className="opacity-80">Define what you want to achieve in personal, professional, and financial areas. Our AI helps you structure goals for maximum clarity and achievability.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Track Your Progress</h4>
                  <p className="opacity-80">Log updates through quick check-ins, automated integrations, or natural language conversations with the AI assistant.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Get AI Insights</h4>
                  <p className="opacity-80">Receive personalized recommendations, progress analysis, and course corrections based on your unique patterns and external factors.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Achieve & Celebrate</h4>
                  <p className="opacity-80">Reach your milestones, celebrate wins, and set new horizons. TrajectoryAI helps you maintain momentum and continuous growth.</p>
                </div>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Premium Content Gate */}
        {hasAccess ? (
          <PanelWrapper variant="dark">
            <Section
              id="premium-content"
              title="AI-Now Premium"
              body="Welcome to the exclusive feed."
              variant="dark"
            >
              <CTAButton
                label="View Premium Feed"
                href="/premium"
                variant="dark"
                className="mt-4"
              />
            </Section>
          </PanelWrapper>
        ) : (
          <div className="rounded-xl p-12 bg-[#015451FF] text-white text-center">
            <CTAButton
              label="Learn More About Premium Content"
              href="/subscribe"
              variant="dark"
            />
          </div>
        )}

      </div>

      <Footer />
    </main>
  )
}
