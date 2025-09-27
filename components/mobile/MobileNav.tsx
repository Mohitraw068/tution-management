'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useInstituteBranding } from '@/components/providers/InstituteProvider';

interface MobileNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const mobileNavItems: MobileNavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
    roles: ['OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
  },
  {
    name: 'Classes',
    href: '/classes',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    roles: ['OWNER', 'ADMIN', 'TEACHER', 'STUDENT']
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    roles: ['OWNER', 'ADMIN', 'TEACHER', 'STUDENT']
  },
  {
    name: 'Homework',
    href: '/homework',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    roles: ['OWNER', 'ADMIN', 'TEACHER', 'STUDENT']
  },
  {
    name: 'More',
    href: '/menu',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    roles: ['OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
  }
];

export function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { primaryColor } = useInstituteBranding();

  if (!session) return null;

  const userRole = session.user.role;
  const filteredItems = mobileNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-16">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={isActive ? { backgroundColor: primaryColor } : {}}
            >
              <div className="mb-1">
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}