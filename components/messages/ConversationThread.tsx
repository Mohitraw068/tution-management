'use client'

import { useState } from 'react'

interface Message {
  id: string
  subject?: string
  content: string
  senderId: string
  recipientId: string
  isRead: boolean
  createdAt: string
  sender: {
    name: string
    role: string
    email: string
  }
  recipient: {
    name: string
    role: string
    email: string
  }
}

interface ConversationThreadProps {
  messages: Message[]
  currentUserId: string
  currentUserRole: string
  onReply: (message: Message) => void
  onMarkAsRead: (messageId: string) => void
  isExpanded: boolean
  onToggleExpand: () => void
}

export function ConversationThread({
  messages,
  currentUserId,
  currentUserRole,
  onReply,
  onMarkAsRead,
  isExpanded,
  onToggleExpand
}: ConversationThreadProps) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)

  if (messages.length === 0) {
    return null
  }

  const latestMessage = messages[messages.length - 1]
  const isUnread = !latestMessage.isRead && latestMessage.recipientId === currentUserId
  const isIncoming = latestMessage.recipientId === currentUserId

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  const handleMessageClick = (message: Message) => {
    if (isUnread && message.recipientId === currentUserId) {
      onMarkAsRead(message.id)
    }
    onToggleExpand()
  }

  return (
    <div
      className={`bg-white rounded-lg shadow border-l-4 transition-all duration-200 ${
        isUnread ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Conversation Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50"
        onClick={() => handleMessageClick(latestMessage)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-3">
            <h3 className={`text-lg font-semibold ${
              isUnread ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {latestMessage.subject || 'No Subject'}
            </h3>
            {isUnread && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
            {messages.length > 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {messages.length} messages
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{formatRelativeTime(latestMessage.createdAt)}</span>
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {isIncoming
                  ? latestMessage.sender.name.charAt(0)
                  : latestMessage.recipient.name.charAt(0)
                }
              </span>
            </div>
            <div>
              <span className={`text-sm font-medium ${
                isUnread ? 'text-blue-800' : 'text-gray-700'
              }`}>
                {isIncoming
                  ? `From: ${latestMessage.sender.name} (${latestMessage.sender.role})`
                  : `To: ${latestMessage.recipient.name} (${latestMessage.recipient.role})`
                }
              </span>
            </div>
          </div>

          {isIncoming && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReply(latestMessage)
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Reply
            </button>
          )}
        </div>

        <p className={`text-sm line-clamp-2 ${
          isUnread ? 'text-blue-800' : 'text-gray-600'
        }`}>
          {latestMessage.content}
        </p>
      </div>

      {/* Expanded Thread */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => {
              const isSentByCurrentUser = message.senderId === currentUserId
              const isSelected = selectedMessageId === message.id

              return (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg transition-all duration-200 ${
                    isSentByCurrentUser
                      ? 'bg-blue-100 ml-8 border-r-4 border-blue-500'
                      : 'bg-white mr-8 shadow-sm border-l-4 border-gray-200'
                  } ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
                  onClick={() => setSelectedMessageId(isSelected ? null : message.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {isSentByCurrentUser
                            ? currentUserRole?.charAt(0) || 'U'
                            : message.sender.name.charAt(0)
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">
                          {isSentByCurrentUser ? 'You' : message.sender.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({isSentByCurrentUser ? currentUserRole : message.sender.role})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {formatDate(message.createdAt)}
                      </div>
                      {!message.isRead && message.recipientId === currentUserId && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                      )}
                    </div>
                  </div>

                  {message.subject && index > 0 && (
                    <p className="text-sm font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">
                      {message.subject}
                    </p>
                  )}

                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {/* Message Actions */}
                  {isSelected && !isSentByCurrentUser && (
                    <div className="flex justify-end pt-3 mt-3 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onReply(message)
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Reply to This Message
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Thread Actions */}
          <div className="flex justify-end px-6 py-4 bg-gray-100 border-t border-gray-200">
            <button
              onClick={() => onReply(latestMessage)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Reply to Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}