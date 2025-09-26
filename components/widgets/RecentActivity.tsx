interface Activity {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description: string
  time: string
  user?: string
}

interface RecentActivityProps {
  title: string
  activities: Activity[]
  showAll?: boolean
}

export function RecentActivity({ title, activities, showAll = false }: RecentActivityProps) {
  const typeClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  }

  const displayActivities = showAll ? activities : activities.slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${typeClasses[activity.type].replace('text-', 'bg-').replace('-800', '-400')}`} />
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              {activity.user && (
                <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
              )}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
        {activities.length > 5 && !showAll && (
          <div className="pt-4 border-t">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all activities
            </button>
          </div>
        )}
      </div>
    </div>
  )
}