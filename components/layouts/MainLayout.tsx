'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { createClient } from '@/lib/shared/supabase-browser'
import {
  FaRegChartBar,
  FaRegCommentDots,
  FaRegCirclePlay,
  FaRegPenToSquare,
  FaRegNewspaper,
  FaRegLightbulb,
  FaRegSun,
  FaArrowRightFromBracket,
  FaMagnifyingGlass,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa6'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <FaRegChartBar className="text-[16px]" /> },
  { href: '/engagement', label: 'Engagement', icon: <FaRegCommentDots className="text-[16px]" /> },
  { href: '/captions', label: 'Captions', icon: <FaRegCirclePlay className="text-[16px]" /> },
  { href: '/scripting', label: 'Scripting', icon: <FaRegPenToSquare className="text-[16px]" /> },
  { href: '/newsletter', label: 'Newsletter', icon: <FaRegNewspaper className="text-[16px]" /> },
  { href: '/comments', label: 'Initial Comments', icon: <FaRegLightbulb className="text-[16px]" /> },
  { href: '/settings', label: 'Settings', icon: <FaRegSun className="text-[16px]" /> },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchFilter, setActiveSearchFilter] = useState<'all' | 'engagement' | 'captions' | 'scripting' | 'newsletter'>('all')
  const contentRef = useRef<HTMLDivElement>(null)
  const prevPathname = useRef(pathname)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email)
      }
    })
  }, [supabase.auth])

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
      )
    }
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
    }
  }, [pathname])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    if (activeSearchFilter === 'engagement' || searchQuery.toLowerCase().includes('engage') || searchQuery.toLowerCase().includes('comment')) {
      router.push('/engagement')
    } else if (activeSearchFilter === 'captions' || searchQuery.toLowerCase().includes('caption') || searchQuery.toLowerCase().includes('video')) {
      router.push('/captions')
    } else if (activeSearchFilter === 'scripting' || searchQuery.toLowerCase().includes('script')) {
      router.push('/scripting')
    } else if (activeSearchFilter === 'newsletter' || searchQuery.toLowerCase().includes('newsletter')) {
      router.push('/newsletter')
    }
  }

  // Bypasses layout framing on login page
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Find the currently active nav item for the mobile center circle
  const activeNavItem = navItems.find((item) => item.href === pathname) || navItems[0]
  const otherNavItems = navItems.filter((item) => item.href !== activeNavItem.href)
  const leftNavItems = otherNavItems.slice(0, 3)
  const rightNavItems = otherNavItems.slice(3)

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#18181B] px-4 py-4 sm:px-5 sm:py-5 lg:p-7 flex flex-col lg:flex-row gap-5 lg:gap-7">
      {/* Mobile Top Header */}
      <div className="lg:hidden h-14 bg-[#151518] text-white rounded-[20px] px-4 flex items-center justify-between shadow-sm">
        {/* Left: Clean Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-bold tracking-tight text-[18px]">
          <span>theanors</span>
          <span className="w-2 h-2 rounded-full bg-[#FF88C2]" />
        </Link>

        {/* Right: Countdown, User badge, and Log Out */}
        <div className="flex items-center gap-2">
          <CountdownTimer />
          {userEmail && (
            <div
              title={userEmail}
              className="w-7 h-7 rounded-full bg-[#FF88C2] text-[#4C0028] font-bold text-xs flex items-center justify-center shadow-xs"
            >
              {userEmail.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title="Log out"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-[#FF88C2] flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            <FaArrowRightFromBracket />
          </button>
        </div>
      </div>

      {/* Desktop Floating Dark Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex sticky top-6 bottom-6 h-[calc(100vh-48px)] bg-[#151518] text-white rounded-[28px] p-5 flex-col justify-between z-40 shadow-md transition-all duration-300 relative flex-shrink-0
          ${sidebarCollapsed ? 'w-[78px]' : 'w-[220px]'}`}
      >
        {/* Pink Sidebar Collapse / Expand Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-[#FF88C2] hover:bg-[#FFA5D6] text-[#4C0028] flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-transform active:scale-90 z-50"
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-8 px-1">
            <Link href="/" className="flex items-center gap-1.5">
              {sidebarCollapsed ? (
                <div className="flex items-center mx-auto">
                  <span className="text-[18px] font-bold font-display">th</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF88C2] ml-0.5 mt-1" />
                </div>
              ) : (
                <>
                  <span className="text-[20px] font-bold tracking-tight font-display">theanors</span>
                  <span className="w-2 h-2 rounded-full bg-[#FF88C2]" />
                </>
              )}
            </Link>
          </div>

          {/* Unified 7 Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={sidebarCollapsed ? link.label : undefined}
                  className={`relative flex items-center rounded-full text-[13px] font-medium transition-all group
                    ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'}
                    ${
                      isActive
                        ? 'bg-[#222226] text-[#FF88C2] font-bold shadow-xs'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-1 w-1 h-4 bg-[#FF88C2] rounded-full" />
                  )}
                  <span className="flex items-center justify-center flex-shrink-0">{link.icon}</span>
                  {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User profile initial & Log out */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {userEmail && (
            <div className={`flex items-center gap-2.5 ${sidebarCollapsed ? 'justify-center' : 'px-1 py-1'}`}>
              <div
                title={userEmail}
                className="w-8 h-8 rounded-full bg-[#FF88C2] text-[#4C0028] font-bold text-xs flex items-center justify-center flex-shrink-0"
              >
                {userEmail.charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="truncate flex-1">
                  <span className="text-[11px] font-bold text-white block truncate">{userEmail}</span>
                  <span className="text-[10px] text-neutral-400 block">Admin</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title={sidebarCollapsed ? 'Log out' : undefined}
            className={`w-full flex items-center rounded-full text-[12px] font-semibold text-neutral-300 hover:text-[#FF88C2] hover:bg-white/5 transition-all cursor-pointer
              ${sidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2 text-left'}`}
          >
            <FaArrowRightFromBracket className="text-sm flex-shrink-0" />
            {!sidebarCollapsed && <span>{signingOut ? 'Logging out...' : 'Log out'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Canvas Workspace */}
      <div className="flex-1 flex flex-col min-w-0 pb-32 lg:pb-0">
        {/* Top Navigation Bar with exact Reference Search Bar UI */}
        <header className="hidden lg:flex items-center justify-between gap-6 mb-6">
          {/* Spacious Search Bar with Pink Icon & Dashed Filter Pills matching Image 4 */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3 px-3 py-1.5 bg-white border border-[#ECE7DD] rounded-full shadow-2xs flex-1 max-w-[700px]"
          >
            {/* Circular Pink Search Icon */}
            <div className="w-8 h-8 rounded-full bg-[#FFBBE2] text-[#4C0028] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <FaMagnifyingGlass className="text-xs" />
            </div>

            {/* Input field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows, operations, scripts..."
              className="bg-transparent text-[13px] text-[#18181B] placeholder-[#9E9B92] outline-hidden flex-1 px-1"
            />

            {/* In: Category filter chips */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#7A776E] pl-2">
              <span className="font-bold text-[#18181B] mr-0.5">In:</span>

              <button
                type="button"
                onClick={() => {
                  setActiveSearchFilter('engagement')
                  router.push('/engagement')
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer
                  ${
                    activeSearchFilter === 'engagement'
                      ? 'bg-[#151518] text-white font-bold shadow-xs'
                      : 'border border-dashed border-[#D5D0C6] text-[#555] hover:border-[#151518] hover:text-[#151518] hover:bg-[#F7F5EE]'
                  }`}
              >
                Engagement
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSearchFilter('captions')
                  router.push('/captions')
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer
                  ${
                    activeSearchFilter === 'captions'
                      ? 'bg-[#151518] text-white font-bold shadow-xs'
                      : 'border border-dashed border-[#D5D0C6] text-[#555] hover:border-[#151518] hover:text-[#151518] hover:bg-[#F7F5EE]'
                  }`}
              >
                Captions
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSearchFilter('scripting')
                  router.push('/scripting')
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer
                  ${
                    activeSearchFilter === 'scripting'
                      ? 'bg-[#151518] text-white font-bold shadow-xs'
                      : 'border border-dashed border-[#D5D0C6] text-[#555] hover:border-[#151518] hover:text-[#151518] hover:bg-[#F7F5EE]'
                  }`}
              >
                Scripting
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSearchFilter('newsletter')
                  router.push('/newsletter')
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer
                  ${
                    activeSearchFilter === 'newsletter'
                      ? 'bg-[#151518] text-white font-bold shadow-xs'
                      : 'border border-dashed border-[#D5D0C6] text-[#555] hover:border-[#151518] hover:text-[#151518] hover:bg-[#F7F5EE]'
                  }`}
              >
                Newsletter
              </button>
            </div>
          </form>

          {/* Top Right Action & Info Cluster */}
          <div className="flex items-center gap-3">
            <CountdownTimer />

            {/* Profile & Settings Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#ECE7DD] rounded-full shadow-2xs">
              <button
                onClick={() => router.push('/settings')}
                title="Settings"
                className="w-8 h-8 rounded-full bg-[#F7F5EE] hover:bg-[#151518] hover:text-white text-[#18181B] flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <FaRegSun className="text-xs" />
              </button>
              {userEmail && (
                <div
                  title={`Logged in as ${userEmail}`}
                  className="w-8 h-8 rounded-full bg-[#151518] text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                >
                  {userEmail.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container with Smooth GSAP transition */}
        <main ref={contentRef} className="flex-1 px-0.5 sm:px-0">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock with Raised Center Active Pink Circle */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="relative bg-[#151518] text-white rounded-[28px] px-4 py-2.5 shadow-xl flex items-center justify-around border border-white/10 max-w-[420px] mx-auto">
          {/* Left 3 items */}
          {leftNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="p-2 text-neutral-400 hover:text-white transition-colors flex flex-col items-center"
            >
              {item.icon}
            </Link>
          ))}

          {/* Center Elevated Active Pink Circle (Hosts the current page icon with pink circle) */}
          <div className="relative -top-5 flex flex-col items-center">
            <Link
              href={activeNavItem.href}
              title={`Current Page: ${activeNavItem.label}`}
              className="w-13 h-13 rounded-full bg-[#FFBBE2] text-[#4C0028] border-4 border-[#F7F5EE] shadow-md flex items-center justify-center text-lg active:scale-95 transition-all cursor-pointer font-bold"
            >
              {activeNavItem.icon}
            </Link>
          </div>

          {/* Right 3 items */}
          {rightNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="p-2 text-neutral-400 hover:text-white transition-colors flex flex-col items-center"
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
