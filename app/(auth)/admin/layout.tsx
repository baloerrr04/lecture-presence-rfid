'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({ children }: {children: React.ReactNode}) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/admin/dashboard',
    },
    {
      name: 'Dosen',
      href: '/admin/lectures',
      icon: Users,
      current: pathname === '/admin/lectures',
    },
    {
      name: 'Hari',
      href: '/admin/days',
      icon: CalendarDays,
      current: pathname === '/admin/days',
    },
    {
      name: 'Presensi',
      href: '/admin/presences',
      icon: ClipboardList,
      current: pathname === '/admin/presences',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="fixed inset-y-0 z-50 flex w-64 flex-col bg-slate-800">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-center border-b border-slate-700 px-4">
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
          </div>
          
          {/* Sidebar content */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1 px-3 py-4">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium
                      ${item.current ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                    `}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="px-3 py-4 border-t border-slate-700">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="pl-64 w-full">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </div>
  );
}