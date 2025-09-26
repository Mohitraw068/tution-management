'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  subject?: string
  content: string
  senderId: string
  recipientId: string
  conversationId?: string
  replyToId?: string
  isRead: boolean
  createdAt: string
  updatedAt: string
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
  replies?: Message[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipientId: '',
    subject: '',
    content: '',
    replyToId: null as string | null
  })

  const userRole = session?.user?.role
  const userId = session?.user?.id

  useEffect(() => {
    if (session) {
      fetchMessages()
      fetchUsers()
    }
  }, [session, activeTab])

  const fetchMessages = async () => {
    try {
      const endpoint = activeTab === 'sent' ? '/api/messages?type=sent' : '/api/messages'
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        organizeConversations(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?messaging=true')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const organizeConversations = (messageList: Message[]) => {
    const convos: { [key: string]: Message[] } = {}

    messageList.forEach(message => {
      const conversationId = message.conversationId || message.id
      if (!convos[conversationId]) {
        convos[conversationId] = []
      }
      convos[conversationId].push(message)
    })

    // Sort messages within each conversation by date
    Object.keys(convos).forEach(convId => {
      convos[convId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })

    setConversations(convos)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(composeForm)
      })

      if (response.ok) {
        const newMessage = await response.json()

        // Reset form
        setComposeForm({
          recipientId: '',
          subject: '',
          content: '',
          replyToId: null
        })

        // Switch to inbox and refresh
        setActiveTab('inbox')
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST'
      })

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleReply = (message: Message) => {
    setComposeForm({
      recipientId: message.senderId,
      subject: message.subject?.startsWith('Re:') ? message.subject : `Re: ${message.subject || 'Message'}`,
      content: '',
      replyToId: message.id
    })
    setActiveTab('compose')
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

  const getLatestMessageFromConversation = (messages: Message[]) => {
    return messages[messages.length - 1]
  }

  const getUnreadCount = () => {
    return messages.filter(msg => !msg.isRead && msg.recipientId === userId).length
  }

  const getSentCount = () => {
    return messages.filter(msg => msg.senderId === userId).length
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
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with teachers, students, and parents</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inbox'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inbox
            {getUnreadCount() > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                {getUnreadCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sent ({getSentCount()})
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compose
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'compose' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">
            {composeForm.replyToId ? 'Reply to Message' : 'Compose New Message'}
          </h2>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient
              </label>
              <select
                required
                value={composeForm.recipientId}
                onChange={(e) => setComposeForm({ ...composeForm, recipientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!composeForm.replyToId}
              >
                <option value="">Select recipient...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role}) - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                required
                rows={6}
                value={composeForm.content}
                onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setComposeForm({ recipientId: '', subject: '', content: '', replyToId: null })
                  setActiveTab('inbox')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      {(activeTab === 'inbox' || activeTab === 'sent') && (
        <div className="space-y-4">
          {Object.keys(conversations).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">
                {activeTab === 'inbox'
                  ? "You don't have any messages yet."
                  : "You haven't sent any messages yet."
                }
              </p>
            </div>
          ) : (
            Object.entries(conversations).map(([conversationId, conversationMessages]) => {
              const latestMessage = getLatestMessageFromConversation(conversationMessages)
              const isUnread = !latestMessage.isRead && latestMessage.recipientId === userId

              return (
                <div
                  key={conversationId}
                  className={`bg-white rounded-lg shadow border-l-4 ${
                    isUnread ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${selectedConversation === conversationId ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => {
                      if (selectedConversation === conversationId) {
                        setSelectedConversation(null)
                      } else {
                        setSelectedConversation(conversationId)
                        if (isUnread) {
                          markAsRead(latestMessage.id)
                        }
                      }
                    }}
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
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(latestMessage.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          isUnread ? 'text-blue-800' : 'text-gray-700'
                        }`}>
                          {activeTab === 'inbox'
                            ? `From: ${latestMessage.sender.name} (${latestMessage.sender.role})`
                            : `To: ${latestMessage.recipient.name} (${latestMessage.recipient.role})`
                          }
                        </span>
                        {conversationMessages.length > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {conversationMessages.length} messages
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {activeTab === 'inbox' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReply(latestMessage)
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Reply
                          </button>
                        )}
                        <svg
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${
                            selectedConversation === conversationId ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <p className={`text-sm mt-2 line-clamp-2 ${
                      isUnread ? 'text-blue-800' : 'text-gray-600'
                    }`}>
                      {latestMessage.content}
                    </p>
                  </div>

                  {/* Expanded conversation view */}
                  {selectedConversation === conversationId && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6 space-y-4">
                        {conversationMessages.map((message, index) => (
                          <div
                            key={message.id}
                            className={`p-4 rounded-lg ${
                              message.senderId === userId
                                ? 'bg-blue-100 ml-8'
                                : 'bg-white mr-8 shadow-sm'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">
                                  {message.senderId === userId ? 'You' : message.sender.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({message.senderId === userId ? session?.user?.role : message.sender.role})
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>

                            {message.subject && index > 0 && (
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {message.subject}
                              </p>
                            )}

                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ))}

                        {activeTab === 'inbox' && (
                          <div className="flex justify-end pt-4">
                            <button
                              onClick={() => handleReply(latestMessage)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                              Reply to Conversation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}