'use client'

interface Student {
  id: string
  name: string
  email: string
}

interface Class {
  id: string
  name: string
  subject: string
  teacher: {
    id: string
    name: string
  }
  _count: {
    students: number
  }
}

interface AttendanceRecord {
  id: string
  studentId: string
  status: string
  markedAt: string
}

interface AttendanceStatsProps {
  classData: Class
  attendanceData: AttendanceRecord[]
  students: Student[]
  selectedDate: string
}

export function AttendanceStats({
  classData,
  attendanceData,
  students,
  selectedDate
}: AttendanceStatsProps) {
  const totalStudents = students.length
  const presentCount = attendanceData.filter(record => record.status === 'PRESENT').length
  const absentCount = attendanceData.filter(record => record.status === 'ABSENT').length
  const lateCount = attendanceData.filter(record => record.status === 'LATE').length
  const notMarkedCount = totalStudents - attendanceData.length

  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAttendanceRateBg = (rate: number) => {
    if (rate >= 90) return 'bg-green-50 border-green-200'
    if (rate >= 75) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Students */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>
      </div>

      {/* Present */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </div>
        </div>
      </div>

      {/* Absent */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </div>
        </div>
      </div>

      {/* Late */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Late</p>
            <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
          </div>
        </div>
      </div>

      {/* Attendance Rate Card - Spans full width */}
      <div className="md:col-span-2 lg:col-span-4">
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${getAttendanceRateBg(attendanceRate)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Summary</h3>
              <p className="text-sm text-gray-600 mt-1">
                {classData.name} - {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getAttendanceRateColor(attendanceRate)}`}>
                {attendanceRate}%
              </div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Attendance Breakdown</span>
              <span>{attendanceData.length} of {totalStudents} marked</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="flex h-4 rounded-full overflow-hidden">
                {presentCount > 0 && (
                  <div
                    className="bg-green-500"
                    style={{ width: `${(presentCount / totalStudents) * 100}%` }}
                    title={`Present: ${presentCount}`}
                  />
                )}
                {lateCount > 0 && (
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${(lateCount / totalStudents) * 100}%` }}
                    title={`Late: ${lateCount}`}
                  />
                )}
                {absentCount > 0 && (
                  <div
                    className="bg-red-500"
                    style={{ width: `${(absentCount / totalStudents) * 100}%` }}
                    title={`Absent: ${absentCount}`}
                  />
                )}
                {notMarkedCount > 0 && (
                  <div
                    className="bg-gray-400"
                    style={{ width: `${(notMarkedCount / totalStudents) * 100}%` }}
                    title={`Not Marked: ${notMarkedCount}`}
                  />
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 text-xs text-gray-600">
              {presentCount > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Present ({presentCount})</span>
                </div>
              )}
              {lateCount > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Late ({lateCount})</span>
                </div>
              )}
              {absentCount > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Absent ({absentCount})</span>
                </div>
              )}
              {notMarkedCount > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Not Marked ({notMarkedCount})</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {notMarkedCount > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  {notMarkedCount} student{notMarkedCount !== 1 ? 's' : ''} still need{notMarkedCount === 1 ? 's' : ''} attendance marked
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}