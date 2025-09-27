'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useInstituteBranding } from '@/components/providers/InstituteProvider';
import { MobileDrawer } from './MobileDrawer';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function MobileHeader({ title, showBack, onBack, actions }: MobileHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: session } = useSession();
  const { primaryColor, logo, name: instituteName } = useInstituteBranding();

  if (!session) return null;

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack ? (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <div className="flex items-center space-x-2">
              {logo && (
                <img src={logo} alt={instituteName} className="h-8 w-auto" />
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-48">{title}</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {actions}

            {/* User Avatar */}
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {session.user.name?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}