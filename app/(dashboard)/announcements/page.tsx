'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  isPinned: boolean
  targetRole?: string
  classIds?: string
  createdAt: string
  updatedAt: string
  creator: {
    name: string
    role: string
  }
  readBy: Array<{
    userId: string
    readAt: string
  }>
}

export default function AnnouncementsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    priority: 'MEDIUM',
    isPinned: false,
    targetRole: 'all',
    classIds: []
  })

  const userRole = session?.user?.role

  const canCreate = ['OWNER', 'ADMIN', 'TEACHER'].includes(userRole || '')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...createForm,
          targetRole: createForm.targetRole === 'all' ? null : createForm.targetRole,
          classIds: createForm.classIds.length > 0 ? JSON.stringify(createForm.classIds) : null
        })
      })

      if (response.ok) {
        const newAnnouncement = await response.json()
        setAnnouncements([newAnnouncement, ...announcements])
        setCreateForm({
          title: '',
          content: '',
          priority: 'MEDIUM',
          isPinned: false,
          targetRole: 'all',
          classIds: []
        })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  const markAsRead = async (announcementId: string) => {
    try {
      await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST'
      })

      // Update local state to reflect read status
      setAnnouncements(prev => prev.map(ann =>
        ann.id === announcementId
          ? { ...ann, readBy: [...ann.readBy, { userId: session?.user?.id || '', readAt: new Date().toISOString() }] }
          : ann
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const togglePin = async (announcementId: string, currentPinStatus: boolean) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPinned: !currentPinStatus })
      })

      if (response.ok) {
        setAnnouncements(prev => prev.map(ann =>
          ann.id === announcementId
            ? { ...ann, isPinned: !currentPinStatus }
            : ann
        ))
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'unread') {
      return !announcement.readBy.some(read => read.userId === session?.user?.id)
    }
    if (filter === 'high') {
      return announcement.priority === 'HIGH'
    }
    if (filter === 'pinned') {
      return announcement.isPinned
    }
    return true
  }).sort((a, b) => {
    // Sort by pinned first, then by creation date
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'LOW': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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

  const isUnread = (announcement: Announcement) => {
    return !announcement.readBy.some(read => read.userId === session?.user?.id)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Stay updated with important information</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Announcement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-4 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('pinned')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pinned'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pinned
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'high'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          High Priority
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Announcement</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={createForm.targetRole}
                    onChange={(e) => setCreateForm({ ...createForm, targetRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="TEACHER">Teachers Only</option>
                    <option value="PARENT">Parents Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={createForm.isPinned}
                  onChange={(e) => setCreateForm({ ...createForm, isPinned: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPinned" className="ml-2 text-sm font-medium text-gray-700">
                  Pin this announcement
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'There are no announcements to display.'
                : `No announcements match your current filter: ${filter}.`
              }
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                isUnread(announcement)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className={`text-lg font-semibold ${
                    isUnread(announcement) ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {announcement.title}
                  </h3>
                  {announcement.isPinned && (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {canCreate && (
                    <button
                      onClick={() => togglePin(announcement.id, announcement.isPinned)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.isPinned
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={announcement.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  )}
                  {isUnread(announcement) && (
                    <button
                      onClick={() => markAsRead(announcement.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <p className={`mb-4 ${
                isUnread(announcement) ? 'text-blue-800' : 'text-gray-700'
              }`}>
                {announcement.content}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>By {announcement.creator.name} ({announcement.creator.role})</span>
                  {announcement.targetRole && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      For {announcement.targetRole}s
                    </span>
                  )}
                </div>
                <span>{formatDate(announcement.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}