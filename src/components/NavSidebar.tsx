'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Rss, FolderKanban, Eye, Radio, Settings, BookOpen,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/baskets', label: 'Baskets', icon: FolderKanban },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
  { href: '/sources', label: 'Sources', icon: Radio },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-background flex flex-col shrink-0">
      <div className="p-4 border-b">
        <Link href="/feed" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">IdeaFeed</span>
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t">
        <p className="text-[10px] text-muted-foreground text-center">
          Institutional Idea Feed
        </p>
      </div>
    </aside>
  )
}
