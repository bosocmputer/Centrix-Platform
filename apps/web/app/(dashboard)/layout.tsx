'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, BarChart2, Megaphone, Settings, Users, LogOut, Zap, SlidersHorizontal } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const nav = [
  { href: '/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/broadcast', label: 'Broadcast', icon: Megaphone },
  { href: '/settings/channels', label: 'Channels', icon: Settings },
  { href: '/settings/users', label: 'Users', icon: Users },
  { href: '/settings/config', label: 'Config', icon: SlidersHorizontal },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen bg-[#0f0f1a] overflow-hidden">
      {/* Icon-only nav bar */}
      <div className="w-14 bg-[#0a0a14] border-r border-white/5 flex flex-col items-center py-4 gap-1 shrink-0">
        {/* Logo */}
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
          <Zap size={14} className="text-white" fill="white" />
        </div>

        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <Icon size={16} />
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {label}
              </span>
            </Link>
          )
        })}

        <div className="flex-1" />

        {/* User avatar + logout */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-xs font-semibold text-indigo-300">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white/5 hover:text-red-400 transition-all"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
