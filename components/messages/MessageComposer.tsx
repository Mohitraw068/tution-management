'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface MessageComposerProps {
  recipientId?: string
  replyToId?: string
  initialSubject?: string
  onSend: (message: { recipientId: string; subject: string; content: string; replyToId?: string }) => void
  onCancel: () => void
  loading?: boolean
}

export function MessageComposer({
  recipientId,
  replyToId,
  initialSubject,
  onSend,
  onCancel,
  loading = false
}: MessageComposerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    recipientId: recipientId || '',
    subject: initialSubject || '',
    content: ''
  })
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/users?messaging=true')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.recipientId || !formData.content.trim()) {
      return
    }

    onSend({
      recipientId: formData.recipientId,
      subject: formData.subject.trim() || 'No Subject',
      content: formData.content.trim(),
      replyToId
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {replyToId ? 'Reply to Message' : 'Compose New Message'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient *
          </label>
          {loadingUsers ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <span className="text-gray-500">Loading users...</span>
            </div>
          ) : (
            <select
              required
              value={formData.recipientId}
              onChange={(e) => handleInputChange('recipientId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              disabled={!!recipientId || loading}
            >
              <option value="">Select recipient...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role}) - {user.email}
                </option>
              ))}
            </select>
          )}
          {recipientId && (
            <p className="text-sm text-gray-600 mt-1">
              This is a reply - recipient cannot be changed
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            placeholder="Enter subject (optional)"
            disabled={loading}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            required
            rows={8}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical disabled:opacity-50"
            placeholder="Type your message here..."
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {formData.content.length}/5000 characters
            </span>
            {formData.content.length > 4500 && (
              <span className="text-xs text-orange-600">
                Approaching character limit
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            disabled={!formData.recipientId || !formData.content.trim() || loading}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
            )}
            <span>{loading ? 'Sending...' : 'Send Message'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}