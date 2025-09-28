import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Authentication',
    template: '%s | ETution'
  },
  description: 'Sign in or register for your ETution account to access your educational dashboard, manage classes, track attendance, and collaborate with your institute.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}