export type SubscriptionTier = 'BASIC' | 'PRO' | 'ENTERPRISE'

export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  price: number
  yearlyPrice: number
  description: string
  studentLimit: number
  features: string[]
  popular?: boolean
  stripePriceId?: string
  stripeYearlyPriceId?: string
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    price: 50,
    yearlyPrice: 500, // ~2 months free
    description: 'Perfect for small institutions getting started',
    studentLimit: 100,
    features: [
      'Up to 100 students',
      'Basic class management',
      'Attendance tracking',
      'Homework assignments',
      'Basic reports',
      'Email support',
      'Mobile app access'
    ],
    stripePriceId: 'price_basic_monthly',
    stripeYearlyPriceId: 'price_basic_yearly'
  },
  PRO: {
    id: 'PRO',
    name: 'Professional',
    price: 150,
    yearlyPrice: 1500, // ~2 months free
    description: 'Advanced features for growing institutions',
    studentLimit: 500,
    popular: true,
    features: [
      'Up to 500 students',
      'All Basic features',
      'Advanced analytics & insights',
      'AI-powered grade predictions',
      'Automated report generation',
      'Parent-teacher messaging',
      'Custom branding',
      'Priority support',
      'API access',
      'Bulk student import',
      'Advanced notifications'
    ],
    stripePriceId: 'price_pro_monthly',
    stripeYearlyPriceId: 'price_pro_yearly'
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 500,
    yearlyPrice: 5000, // ~2 months free
    description: 'Complete solution for large institutions',
    studentLimit: -1, // Unlimited
    features: [
      'Unlimited students',
      'All Pro features',
      'Multi-campus management',
      'Advanced AI features',
      'Custom integrations',
      'White-label solution',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom training',
      'Data migration assistance',
      'SLA guarantee',
      'Advanced security features',
      'Custom reporting'
    ],
    stripePriceId: 'price_enterprise_monthly',
    stripeYearlyPriceId: 'price_enterprise_yearly'
  }
}

export interface SubscriptionUsage {
  studentsUsed: number
  classesCreated: number
  reportsGenerated: number
  storageUsed: number // in MB
}

export interface SubscriptionStatus {
  tier: SubscriptionTier
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  currentPeriodStart: string
  currentPeriodEnd: string
  usage: SubscriptionUsage
  billingCycle: 'monthly' | 'yearly'
}

export const getSubscriptionFeatures = (tier: SubscriptionTier): string[] => {
  return SUBSCRIPTION_PLANS[tier].features
}

export const getStudentLimit = (tier: SubscriptionTier): number => {
  const limit = SUBSCRIPTION_PLANS[tier].studentLimit
  return limit === -1 ? Infinity : limit
}

export const canAccessFeature = (
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean => {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    BASIC: 1,
    PRO: 2,
    ENTERPRISE: 3
  }

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier]
}

export const getUpgradeOptions = (currentTier: SubscriptionTier): SubscriptionPlan[] => {
  const tierOrder: SubscriptionTier[] = ['BASIC', 'PRO', 'ENTERPRISE']
  const currentIndex = tierOrder.indexOf(currentTier)

  return tierOrder
    .slice(currentIndex + 1)
    .map(tier => SUBSCRIPTION_PLANS[tier])
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(price)
}

export const calculateSavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const monthlyTotal = monthlyPrice * 12
  return ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100
}