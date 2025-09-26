'use client'

import { useEffect, useState } from 'react'
import { useInstituteBranding } from '@/components/providers/InstituteProvider'

interface QRSession {
  id: string
  sessionCode: string
  expiresAt: string
  duration: number
  classData: {
    name: string
    subject: string
  }
}

interface QRGeneratorProps {
  classId: string
  className: string
  duration: number
  onBack: () => void
}

export function QRGenerator({ classId, className, duration, onBack }: QRGeneratorProps) {
  const { primaryColor } = useInstituteBranding()
  const [session, setSession] = useState<QRSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // Check for existing active session
    checkActiveSession()
  }, [classId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (session && isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1
          if (newTime <= 0) {
            setIsActive(false)
            return 0
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [session, isActive, timeRemaining])

  const checkActiveSession = async () => {
    try {
      const response = await fetch(`/api/attendance/qr/generate?classId=${classId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        const expires = new Date(data.session.expiresAt).getTime()
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((expires - now) / 1000))
        setTimeRemaining(remaining)
        setIsActive(remaining > 0)
      }
    } catch (error) {
      console.error('Error checking active session:', error)
    }
  }

  const generateQRSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/attendance/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          duration
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        const expires = new Date(data.session.expiresAt).getTime()
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((expires - now) / 1000))
        setTimeRemaining(remaining)
        setIsActive(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate QR session')
      }
    } catch (error) {
      console.error('Error generating QR session:', error)
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressColor = () => {
    if (timeRemaining > 300) return 'bg-green-500' // > 5 minutes
    if (timeRemaining > 60) return 'bg-yellow-500'  // > 1 minute
    return 'bg-red-500' // < 1 minute
  }

  const getProgressWidth = () => {
    if (!session) return 0
    const totalDuration = session.duration * 60
    return Math.max(0, (timeRemaining / totalDuration) * 100)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">QR Code Generator</h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate QR code for students to scan and mark attendance
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="p-6">
        {!session || !isActive ? (
          // Generate New Session
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate QR Code</h3>
            <p className="text-gray-600 mb-6">
              Click the button below to generate a new QR code session for {className}
            </p>
            <button
              onClick={generateQRSession}
              disabled={loading}
              className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Generate QR Code</span>
                </>
              )}
            </button>
          </div>
        ) : (
          // Active Session Display
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium">Session Active</span>
              </div>
              <div className="text-green-700 font-mono text-lg">
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Time Remaining</span>
                <span>{Math.floor(timeRemaining / 60)} minutes left</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
                  style={{ width: `${getProgressWidth()}%` }}
                ></div>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="text-center">
              <div className="inline-block p-8 bg-white border-4 border-gray-800 rounded-lg">
                {/* QR Code Placeholder - In a real app, you'd use a QR code library */}
                <div className="w-64 h-64 bg-black relative">
                  {/* Simple QR-like pattern */}
                  <div className="absolute inset-4 bg-white">
                    <div className="grid grid-cols-8 gap-1 h-full">
                      {Array.from({ length: 64 }, (_, i) => (
                        <div
                          key={i}
                          className={`${
                            (i + Math.floor(i / 8)) % 2 === 0 ? 'bg-black' : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="text-2xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
                  {session.sessionCode}
                </div>
                <p className="text-sm text-gray-600">
                  Students should scan this QR code or enter the code above
                </p>
              </div>
            </div>

            {/* Session Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600">Class</div>
                <div className="font-medium text-gray-900">{session.classData.name}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Subject</div>
                <div className="font-medium text-gray-900">{session.classData.subject}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-medium text-gray-900">{session.duration} minutes</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={generateQRSession}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Generate New Session
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print QR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}