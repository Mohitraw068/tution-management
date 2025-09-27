'use client';

import Link from 'next/link';
import { SubscriptionTier } from '@/lib/subscription';

interface UpgradePromptProps {
  currentTier: SubscriptionTier;
  featureName: string;
  requiredTier: SubscriptionTier;
  className?: string;
}

export function UpgradePrompt({ currentTier, featureName, requiredTier, className = '' }: UpgradePromptProps) {
  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'PRO':
        return 'from-purple-500 to-pink-500';
      case 'ENTERPRISE':
        return 'from-blue-600 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTierName = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'PRO':
        return 'Professional';
      case 'ENTERPRISE':
        return 'Enterprise';
      default:
        return tier;
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getTierColor(requiredTier)} rounded-lg p-6 text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-bold">{featureName}</h3>
            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-white bg-opacity-20 rounded-full">
              {getTierName(requiredTier)} Feature
            </span>
          </div>

          <p className="text-white text-opacity-90 mb-4">
            Unlock {featureName.toLowerCase()} and other advanced features with a {getTierName(requiredTier)} subscription.
          </p>

          <ul className="text-sm text-white text-opacity-80 space-y-1 mb-4">
            {requiredTier === 'PRO' && (
              <>
                <li>• AI-powered homework generation</li>
                <li>• Advanced analytics & insights</li>
                <li>• Automated report generation</li>
                <li>• Priority support</li>
              </>
            )}
            {requiredTier === 'ENTERPRISE' && (
              <>
                <li>• Unlimited students</li>
                <li>• Multi-campus management</li>
                <li>• Custom integrations</li>
                <li>• 24/7 phone support</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex flex-col space-y-2 ml-6">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            Upgrade Now
          </Link>

          <Link
            href="/subscription"
            className="px-6 py-3 border border-white border-opacity-50 text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-center"
          >
            View Plans
          </Link>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-xs text-white text-opacity-70">
        Current plan: <span className="font-medium">{getTierName(currentTier)}</span>
      </div>
    </div>
  );
}