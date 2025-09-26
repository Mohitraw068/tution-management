'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface ReportType {
  id: string
  name: string
  description: string
}

interface TimeRange {
  id: string
  name: string
}

interface ReportRequest {
  reportType: string
  timeRange: string
  studentId?: string
  classId?: string
  format: string
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [availableReports, setAvailableReports] = useState<ReportType[]>([])
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reportHistory, setReportHistory] = useState<any[]>([])

  const [reportForm, setReportForm] = useState<ReportRequest>({
    reportType: '',
    timeRange: 'month',
    format: 'pdf'
  })

  const userRole = session?.user?.role

  useEffect(() => {
    if (session) {
      fetchReportTypes()
      fetchReportHistory()
    }
  }, [session])

  const fetchReportTypes = async () => {
    try {
      const response = await fetch('/api/reports/generate')
      if (response.ok) {
        const data = await response.json()
        setAvailableReports(data.availableReports || [])
        setTimeRanges(data.timeRanges || [])
        if (data.availableReports?.length > 0) {
          setReportForm(prev => ({ ...prev, reportType: data.availableReports[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching report types:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReportHistory = async () => {
    // Mock report history - in real app, this would come from a database
    const mockHistory = [
      {
        id: 'RPT-001',
        name: 'Monthly Progress Report',
        type: 'progress_report',
        generatedAt: '2024-01-15T10:30:00Z',
        format: 'pdf',
        status: 'completed',
        downloadUrl: '#'
      },
      {
        id: 'RPT-002',
        name: 'Attendance Certificate',
        type: 'attendance_certificate',
        generatedAt: '2024-01-10T14:20:00Z',
        format: 'pdf',
        status: 'completed',
        downloadUrl: '#'
      },
      {
        id: 'RPT-003',
        name: 'Class Performance Report',
        type: 'class_performance',
        generatedAt: '2024-01-08T09:15:00Z',
        format: 'pdf',
        status: 'completed',
        downloadUrl: '#'
      }
    ]
    setReportHistory(mockHistory)
  }

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setGenerating(true)
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportForm)
      })

      if (response.ok) {
        const result = await response.json()

        // Add to history
        const newReport = {
          id: result.reportData.reportId,
          name: result.reportData.type,
          type: reportForm.reportType,
          generatedAt: new Date().toISOString(),
          format: reportForm.format,
          status: 'completed',
          downloadUrl: result.downloadUrl
        }

        setReportHistory([newReport, ...reportHistory])

        // Show preview modal with report data
        setPreviewData(result.reportData)
        setShowPreview(true)

      } else {
        console.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  const handleFormChange = (field: keyof ReportRequest, value: string) => {
    setReportForm(prev => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderPreviewModal = () => {
    if (!showPreview || !previewData) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{previewData.type}</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Report Header */}
            <div className="text-center border-b pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{previewData.institute}</h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">{previewData.type}</h2>
              <div className="text-sm text-gray-600">
                <p>Report ID: {previewData.reportId}</p>
                <p>Period: {previewData.period?.startDate} to {previewData.period?.endDate}</p>
                <p>Generated: {formatDate(previewData.generatedAt)}</p>
                <p>Generated by: {previewData.generatedBy}</p>
              </div>
            </div>

            {/* Report Content */}
            {previewData.type === 'Student Progress Report' && previewData.student && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{previewData.student.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      <p className="font-medium">{previewData.student.grade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Roll Number</p>
                      <p className="font-medium">{previewData.student.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Overall Grade</p>
                      <p className="font-medium text-green-600">{previewData.academicPerformance?.overallGrade}%</p>
                    </div>
                  </div>
                </div>

                {/* Academic Performance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.academicPerformance?.subjects?.map((subject: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.grade}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{subject.rank}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.teacher}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.attendance}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Teacher Remarks */}
                {previewData.teacherRemarks && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Teacher's Remarks</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{previewData.teacherRemarks}</p>
                  </div>
                )}
              </div>
            )}

            {previewData.type === 'Attendance Certificate' && previewData.student && (
              <div className="text-center space-y-6">
                <div className="border-2 border-gray-300 rounded-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Certificate of Attendance</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    This is to certify that
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mb-6">{previewData.student.name}</p>
                  <p className="text-lg text-gray-700 mb-6">
                    has maintained an attendance rate of
                  </p>
                  <p className="text-3xl font-bold text-green-600 mb-6">{previewData.attendance?.rate}%</p>
                  <p className="text-lg text-gray-700 mb-6">
                    during the period from {previewData.period?.startDate} to {previewData.period?.endDate}
                  </p>
                  <p className="text-lg text-gray-700">
                    Certificate Type: <span className="font-semibold text-green-600">{previewData.attendance?.certificationType}</span>
                  </p>
                </div>
              </div>
            )}

            {previewData.type === 'Class Performance Report' && previewData.class && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Class Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="font-medium">{previewData.class.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teacher</p>
                      <p className="font-medium">{previewData.class.teacher}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="font-medium">{previewData.class.students}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Class Average</p>
                      <p className="font-medium text-green-600">{previewData.performance?.classAverage}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Grade Distribution</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {previewData.performance?.gradeDistribution?.map((grade: any, index: number) => (
                      <div key={index} className="text-center bg-gray-50 rounded-lg p-3">
                        <p className="text-lg font-bold text-gray-900">{grade.grade}</p>
                        <p className="text-sm text-gray-600">{grade.count} students</p>
                        <p className="text-sm text-gray-600">{grade.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Performers</h3>
                  <div className="space-y-2">
                    {previewData.performance?.topPerformers?.map((student: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">Rank #{student.rank}</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">{student.score}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {previewData.type === 'Institute Summary Report' && previewData.overview && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{previewData.overview.totalStudents}</p>
                    <p className="text-sm text-gray-600">Total Students</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{previewData.overview.totalTeachers}</p>
                    <p className="text-sm text-gray-600">Total Teachers</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{previewData.overview.totalClasses}</p>
                    <p className="text-sm text-gray-600">Total Classes</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{previewData.overview.averagePerformance}%</p>
                    <p className="text-sm text-gray-600">Avg Performance</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Grade-wise Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.gradeWisePerformance?.map((grade: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.grade}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.students}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.average}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.attendance}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.passRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="flex justify-center pt-6 border-t">
              <button
                onClick={() => {
                  // In real app, this would trigger PDF download
                  alert('PDF download would be triggered here')
                  setShowPreview(false)
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and download comprehensive reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generation Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Report</h2>

            <form onSubmit={handleGenerateReport} className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportForm.reportType}
                  onChange={(e) => handleFormChange('reportType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select report type...</option>
                  {availableReports.map(report => (
                    <option key={report.id} value={report.id}>
                      {report.name}
                    </option>
                  ))}
                </select>
                {reportForm.reportType && (
                  <p className="text-sm text-gray-600 mt-1">
                    {availableReports.find(r => r.id === reportForm.reportType)?.description}
                  </p>
                )}
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={reportForm.timeRange}
                  onChange={(e) => handleFormChange('timeRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timeRanges.map(range => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={reportForm.format === 'pdf'}
                      onChange={(e) => handleFormChange('format', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">PDF Document</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      checked={reportForm.format === 'excel'}
                      onChange={(e) => handleFormChange('format', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Excel Spreadsheet</span>
                  </label>
                </div>
              </div>

              {/* Additional Fields based on report type */}
              {(['class_performance', 'progress_report'].includes(reportForm.reportType)) && ['ADMIN', 'OWNER'].includes(userRole || '') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={reportForm.studentId || ''}
                    onChange={(e) => handleFormChange('studentId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for all students"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!reportForm.reportType || generating}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    Generating Report...
                  </>
                ) : (
                  'Generate Report'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Report History */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Reports</h2>

            <div className="space-y-4">
              {reportHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">No reports generated yet</p>
                </div>
              ) : (
                reportHistory.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDate(report.generatedAt)}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 uppercase">
                            {report.format}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => alert('Download would be triggered here')}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {renderPreviewModal()}
    </div>
  )
}