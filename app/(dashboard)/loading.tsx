export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Main Loading Spinner */}
        <div className="mx-auto mb-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Dashboard</h2>
        <p className="text-sm text-gray-600">Please wait while we load your content...</p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}