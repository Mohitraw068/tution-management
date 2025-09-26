import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}

export function StatsCard({ title, value, change, icon, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-900'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-900'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900'
    }
  }

  const changeColorClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        {icon && (
          <div className={`flex-shrink-0 ${colorClasses[color].bg} p-3 rounded-lg`}>
            <div className={`w-6 h-6 ${colorClasses[color].icon}`}>
              {icon}
            </div>
          </div>
        )}
        <div className={icon ? 'ml-4' : ''}>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColorClasses[change.type]}`}>
              {change.type === 'increase' && '↗'}
              {change.type === 'decrease' && '↘'}
              {change.value}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}