'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/mobile/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}