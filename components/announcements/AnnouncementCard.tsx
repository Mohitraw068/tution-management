'use client'

import { useState } from 'react'

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  isPinned: boolean
  targetRole?: string
  createdAt: string
  creator: {
    name: string
    role: string
  }
  readBy: Array<{
    userId: string
    readAt: string
  }>
}

interface AnnouncementCardProps {
  announcement: Announcement
  currentUserId: string
  canManage: boolean
  onMarkAsRead: (id: string) => void
  onTogglePin?: (id: string, currentPinStatus: boolean) => void
  onEdit?: (announcement: Announcement) => void
  onDelete?: (id: string) => void
}

export function AnnouncementCard({
  announcement,
  currentUserId,
  canManage,
  onMarkAsRead,
  onTogglePin,
  onEdit,
  onDelete
}: AnnouncementCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)

  const isUnread = !announcement.readBy.some(read => read.userId === currentUserId)

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

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div
      className={`bg-white rounded-lg shadow border-l-4 ${
        isUnread ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <h3 className={`text-lg font-semibold ${
              isUnread ? 'text-blue-900' : 'text-gray-900'
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
            {canManage && onTogglePin && (
              <button
                onClick={() => onTogglePin(announcement.id, announcement.isPinned)}
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
            {canManage && onEdit && (
              <button
                onClick={() => onEdit(announcement)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {canManage && onDelete && (
              <button
                onClick={() => onDelete(announcement.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {isUnread && (
              <button
                onClick={() => onMarkAsRead(announcement.id)}
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

        <div className={`mb-4 ${
          isUnread ? 'text-blue-800' : 'text-gray-700'
        }`}>
          {showFullContent ? (
            <div>
              <p className="whitespace-pre-wrap">{announcement.content}</p>
              {announcement.content.length > 200 && (
                <button
                  onClick={() => setShowFullContent(false)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                >
                  Show less
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-wrap">
                {truncateContent(announcement.content)}
              </p>
              {announcement.content.length > 200 && (
                <button
                  onClick={() => setShowFullContent(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </div>

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
    </div>
  )
}