import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      instituteId: string
      instituteName: string
      instituteCode: string
    }
  }

  interface User {
    role: string
    instituteId: string
    instituteName: string
    instituteCode: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    instituteId: string
    instituteName: string
    instituteCode: string
  }
}