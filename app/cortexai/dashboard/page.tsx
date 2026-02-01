'use client'
export const dynamic = 'force-dynamic'


import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { TrendingUp, Calendar, Bell, Home, Search, BarChart3, DollarSign, Clock, AlertTriangle } from 'lucide-react'

interface Property {
  id: string
  title: string
  type: string
  value: number
  renewalDate: string
  status: 'active' | 'expiring' | 'critical'
}

interface Event {
  id: string
  title: string
  date: string
  type: 'renewal' | 'deadline' | 'alert'
  property: string
}

export default function CortexAIDashboard() {
  const { isLoaded, user } = useUser()
  const [properties, setProperties] = useState<Property[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    // Mock data - replace with API calls later
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'AI Training Patent US-2024-789',
        type: 'Intellectual Property',
        value: 450000,
        renewalDate: '2026-03-15',
        status: 'active'
      },
      {
        id: '2',
        title: 'Downtown Office Building',
        type: 'Real Estate',
        value: 1200000,
        renewalDate: '2026-12-01',
        status: 'active'
      },
      {
        id: '3',
        title: 'Trademark "NexoBrand"',
        type: 'Intellectual Property',
        value: 75000,
        renewalDate: '2026-02-10',
        status: 'expiring'
      },
      {
        id: '4',
        title: 'Bitcoin Holdings',
        type: 'Digital Assets',
        value: 320000,
        renewalDate: 'N/A',
        status: 'active'
      }
    ]

    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Trademark Renewal Due',
        date: '2026-02-10',
        type: 'renewal',
        property: 'Trademark "NexoBrand"'
      },
      {
        id: '2',
        title: 'Patent Filing Deadline',
        date: '2026-03-15',
        type: 'deadline',
        property: 'AI Training Patent US-2024-789'
      },
      {
        id: '3',
        title: 'Property Tax Due',
        date: '2026-04-01',
        type: 'alert',
        property: 'Downtown Office Building'
      }
    ]

    setProperties(mockProperties)
    setEvents(mockEvents)
    setTotalValue(mockProperties.reduce((sum, p) => sum + p.value, 0))
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5B4DB5] to-[#1E3A8A]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      
      <SignedIn>
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          
          <div className="pt-20 pb-12">
            {/* Welcome Header */}
            <div className="bg-gradient-to-br from-[#5B4DB5] to-[#1E3A8A] text-white py-12 px-4">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
                <p className="text-white/80 text-lg">Your intelligent property command center</p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-[#F59E0B]" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">+14.3%</span>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Value</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${(totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Home className="w-8 h-8 text-[#5B4DB5]" />
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Properties</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-orange-500" />
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-semibold">Soon</span>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Renewals Due</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {properties.filter(p => p.status === 'expiring').length}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Bell className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Alerts</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{events.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Valuation Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-[#F59E0B]" />
                      Portfolio Valuation
                    </h2>
                    <select className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  
                  {/* Simple chart placeholder */}
                  <div className="h-64 bg-gradient-to-br from-[#5B4DB5]/10 to-[#F59E0B]/10 rounded-lg flex items-end justify-around p-4 gap-2">
                    {[65, 70, 68, 75, 82, 88, 92, 95, 98, 100].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#5B4DB5] to-[#F59E0B] rounded-t"
                           style={{ height: `${height}%` }} />
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {properties.map(prop => (
                      <div key={prop.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{prop.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{prop.type}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            prop.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            prop.status === 'expiring' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ${(prop.value / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Renewal: {prop.renewalDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events & Schedule Panel */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                      <Calendar className="w-6 h-6 text-[#5B4DB5]" />
                      Upcoming Events
                    </h2>
                    
                    <div className="space-y-4">
                      {events.map(event => (
                        <div key={event.id} className="border-l-4 border-[#F59E0B] pl-4 py-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{event.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.property}</p>
                            </div>
                            {event.type === 'renewal' && <Bell className="w-4 h-4 text-orange-500" />}
                            {event.type === 'deadline' && <Clock className="w-4 h-4 text-red-500" />}
                            {event.type === 'alert' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{event.date}</p>
                        </div>
                      ))}
                    </div>

                    <button className="w-full mt-6 px-4 py-2 bg-[#5B4DB5] hover:bg-[#3730A3] text-white rounded-lg font-semibold transition">
                      View All Events
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <Link href="/cortexai/dashboard/properties" 
                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition">
                        <Home className="w-5 h-5 text-[#5B4DB5]" />
                        <span className="font-medium text-gray-900 dark:text-white">Add Property</span>
                      </Link>
                      <Link href="/cortexai/dashboard/search"
                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition">
                        <Search className="w-5 h-5 text-[#5B4DB5]" />
                        <span className="font-medium text-gray-900 dark:text-white">Search Documents</span>
                      </Link>
                      <Link href="/cortexai/dashboard/analytics"
                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition">
                        <BarChart3 className="w-5 h-5 text-[#5B4DB5]" />
                        <span className="font-medium text-gray-900 dark:text-white">View Analytics</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </main>
      </SignedIn>
    </>
  )
}
