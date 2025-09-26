'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Institute } from '@/lib/institute'

interface InstituteContextType {
  institute: Institute | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const InstituteContext = createContext<InstituteContextType | undefined>(undefined)

export function useInstitute() {
  const context = useContext(InstituteContext)
  if (context === undefined) {
    throw new Error('useInstitute must be used within an InstituteProvider')
  }
  return context
}

interface InstituteProviderProps {
  children: ReactNode
}

export function InstituteProvider({ children }: InstituteProviderProps) {
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstitute = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/institutes')

      if (!response.ok) {
        if (response.status === 404) {
          setError('Institute not found')
        } else {
          setError('Failed to fetch institute data')
        }
        setInstitute(null)
        return
      }

      const data = await response.json()
      setInstitute(data.institute)
    } catch (err) {
      console.error('Error fetching institute:', err)
      setError('Failed to fetch institute data')
      setInstitute(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitute()
  }, [])

  const value: InstituteContextType = {
    institute,
    loading,
    error,
    refetch: fetchInstitute
  }

  return (
    <InstituteContext.Provider value={value}>
      {children}
    </InstituteContext.Provider>
  )
}

// Hook to get institute branding colors
export function useInstituteBranding() {
  const { institute } = useInstitute()

  const primaryColor = institute?.primaryColor || '#3B82F6'
  const logo = institute?.logo
  const name = institute?.name || 'ETution'

  return {
    primaryColor,
    logo,
    name,
    cssVariables: {
      '--institute-primary': primaryColor,
      '--institute-primary-50': primaryColor + '0d',
      '--institute-primary-100': primaryColor + '1a',
      '--institute-primary-500': primaryColor,
      '--institute-primary-600': adjustBrightness(primaryColor, -20),
      '--institute-primary-700': adjustBrightness(primaryColor, -40),
    } as React.CSSProperties
  }
}

// Helper function to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  // Remove the hash if it exists
  hex = hex.replace('#', '')

  // Parse the hex color
  const num = parseInt(hex, 16)
  const r = (num >> 16) + percent
  const g = (num >> 8 & 0x00FF) + percent
  const b = (num & 0x0000FF) + percent

  // Clamp values between 0 and 255
  const newR = Math.max(0, Math.min(255, r))
  const newG = Math.max(0, Math.min(255, g))
  const newB = Math.max(0, Math.min(255, b))

  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`
}