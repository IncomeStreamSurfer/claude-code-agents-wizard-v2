'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Search,
  Palette,
  Megaphone,
  BarChart3,
  Settings,
  Briefcase,
  Package,
  Users,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useUIStore } from '@/stores/ui-store'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'MAIN' },
  { name: 'Brands', href: '/brands', icon: Briefcase, section: 'BRAND' },
  { name: 'Products', href: '/products', icon: Package, section: 'BRAND' },
  { name: 'Talents', href: '/talents', icon: Users, section: 'BRAND' },
  { name: 'Research', href: '/research', icon: Search, section: 'MARKETING' },
  { name: 'Creative Studio', href: '/creative', icon: Palette, section: 'MARKETING' },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone, section: 'MARKETING' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, section: 'ANALYTICS' },
  { name: 'Settings', href: '/settings', icon: Settings, section: 'SETTINGS' },
]

function SidebarContent() {
  const pathname = usePathname()
  const sections = Array.from(new Set(navigation.map((item) => item.section)))

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Megaphone className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">AdForge</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {sections.map((section) => (
          <div key={section}>
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
              {section}
            </h3>
            <div className="space-y-1">
              {navigation
                .filter((item) => item.section === section)
                .map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Main navigation menu for AdForge</SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
