export default function AttendanceLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Mobile Header Skeleton */}
      <div className="lg:hidden mb-4">
        <div className="h-14 bg-white rounded-lg animate-pulse"></div>
      </div>

      {/* Desktop Header Skeleton */}
      <div className="hidden lg:block mb-6">
        <div className="h-20 bg-white rounded-lg animate-pulse"></div>
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-6">
        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Attendance Grid Skeleton */}
        <div className="bg-white rounded-lg p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {[...Array(5)].map((_, i) => (
                      <th key={i} className="px-6 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white p-3 rounded-full shadow-lg">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}