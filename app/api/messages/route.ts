import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' or default to inbox

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    let messages

    if (type === 'sent') {
      // Get sent messages
      messages = await prisma.message.findMany({
        where: {
          senderId: user.id,
          instituteId: instituteId
        },
        include: {
          sender: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          recipient: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Get inbox messages (received)
      messages = await prisma.message.findMany({
        where: {
          recipientId: user.id,
          instituteId: instituteId
        },
        include: {
          sender: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          recipient: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    const body = await request.json()
    const { recipientId, subject, content, replyToId } = body

    // Validate required fields
    if (!recipientId || !content) {
      return NextResponse.json({ error: 'Recipient and content are required' }, { status: 400 })
    }

    // Verify recipient exists and belongs to same institute
    const recipient = await prisma.user.findFirst({
      where: {
        id: recipientId,
        instituteId: instituteId
      }
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Generate conversation ID for threading
    let conversationId = null
    if (replyToId) {
      // Find the original message to get its conversation ID
      const originalMessage = await prisma.message.findFirst({
        where: {
          id: replyToId,
          instituteId: instituteId
        }
      })
      if (originalMessage) {
        conversationId = originalMessage.conversationId || originalMessage.id
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        subject,
        content,
        senderId: user.id,
        recipientId,
        conversationId,
        replyToId,
        instituteId
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        recipient: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // If this is the first message in a conversation, update conversationId to match message ID
    if (!conversationId) {
      await prisma.message.update({
        where: { id: message.id },
        data: { conversationId: message.id }
      })
      message.conversationId = message.id
    }

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        title: 'New Message',
        message: `You have a new message from ${user.name}${subject ? `: ${subject}` : ''}`,
        type: 'MESSAGE',
        relatedId: message.id,
        userId: recipientId,
        instituteId
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}