import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        instituteCode: { label: 'Institute Code', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.instituteCode || !credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // First, find the institute by code
          const institute = await prisma.institute.findUnique({
            where: {
              instituteCode: credentials.instituteCode
            }
          })

          if (!institute) {
            throw new Error('Invalid institute code')
          }

          // Then find the user within that institute
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
              instituteId: institute.id
            },
            include: {
              institute: true
            }
          })

          if (!user) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const passwordValid = await bcrypt.compare(credentials.password, user.password)

          if (!passwordValid) {
            throw new Error('Invalid credentials')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            instituteId: user.instituteId,
            instituteName: user.institute.name,
            instituteCode: user.institute.instituteCode
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.instituteId = user.instituteId
        token.instituteName = user.instituteName
        token.instituteCode = user.instituteCode
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.instituteId = token.instituteId as string
        session.user.instituteName = token.instituteName as string
        session.user.instituteCode = token.instituteCode as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
})

export { handler as GET, handler as POST }