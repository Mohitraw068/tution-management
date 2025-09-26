'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'

interface ScanResult {
  success: boolean
  message: string
  classData?: {
    name: string
    subject: string
  }
  timestamp?: string
}

export default function QRScanPage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables, primaryColor } = useInstituteBranding()
  const router = useRouter()

  const [qrCode, setQrCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setScanResult({
        success: false,
        message: 'Please enter a valid QR code'
      })
      return
    }

    setScanning(true)
    setScanResult(null)

    try {
      const response = await fetch('/api/attendance/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionCode: qrCode.trim(),
          studentId: session.user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        setScanResult({
          success: true,
          message: result.message,
          classData: result.classData,
          timestamp: new Date().toLocaleString()
        })
        setQrCode('')
      } else {
        setScanResult({
          success: false,
          message: result.error || 'Failed to mark attendance'
        })
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      setScanResult({
        success: false,
        message: 'Network error. Please try again.'
      })
    } finally {
      setScanning(false)
    }
  }

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault()
    handleScan()
  }

  if (status === 'loading' || instituteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={cssVariables}>
      {/* Sidebar */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => router.push('/attendance')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Attendance
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
              <p className="text-gray-600 mt-1">Scan the QR code displayed by your teacher to mark attendance</p>
            </div>
          </div>

          {/* Scanner Interface */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Mark Your Attendance</h2>
                <p className="text-gray-600 text-sm">Enter the QR code shown on the screen</p>
              </div>

              {/* QR Code Input */}
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code / Session Code
                  </label>
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Enter session code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 text-center font-mono text-lg"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    disabled={scanning}
                  />
                </div>

                <button
                  type="submit"
                  disabled={scanning || !qrCode.trim()}
                  className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  {scanning ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Marking Attendance...</span>
                    </div>
                  ) : (
                    'Mark Attendance'
                  )}
                </button>
              </form>

              {/* Result Display */}
              {scanResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  scanResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {scanResult.success ? (
                      <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        scanResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {scanResult.success ? 'Attendance Marked!' : 'Error'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        scanResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {scanResult.message}
                      </p>
                      {scanResult.classData && (
                        <div className="mt-2 text-sm text-green-700">
                          <p><strong>Class:</strong> {scanResult.classData.name}</p>
                          <p><strong>Subject:</strong> {scanResult.classData.subject}</p>
                          {scanResult.timestamp && (
                            <p><strong>Time:</strong> {scanResult.timestamp}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ask your teacher to display the QR code</li>
                  <li>• Enter the code shown in the QR code</li>
                  <li>• Click "Mark Attendance" to confirm</li>
                  <li>• Make sure to scan within the time limit</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}