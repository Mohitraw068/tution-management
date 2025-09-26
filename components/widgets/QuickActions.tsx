import { ReactNode } from 'react'

interface Action {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
  color?: 'blue' | 'green' | 'purple' | 'yellow'
}

interface QuickActionsProps {
  title: string
  actions: Action[]
}

export function QuickActions({ title, actions }: QuickActionsProps) {
  const colorClasses = {
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    green: 'bg-green-100 hover:bg-green-200 text-green-800',
    purple: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
    yellow: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              colorClasses[action.color || 'blue']
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8">
                {action.icon}
              </div>
              <div className="ml-3">
                <p className="font-medium">{action.title}</p>
                <p className="text-sm opacity-75">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}