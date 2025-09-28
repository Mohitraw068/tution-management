# ETution - Educational Management Platform

A comprehensive, multi-tenant educational management platform built with Next.js 15, TypeScript, and Prisma. Designed for institutes, teachers, students, and parents to manage educational activities efficiently.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture**: Separate institutes with custom branding
- **Role-based Access Control**: Owner, Admin, Teacher, Student, Parent roles
- **Class Management**: Create and manage classes with enrollment
- **Attendance Tracking**: QR code scanning, manual marking, real-time updates
- **Homework Management**: AI-powered homework generation, assignment tracking
- **Dashboard Analytics**: Comprehensive insights and reporting
- **Mobile Responsive**: Optimized for all devices with PWA support

### Technical Features
- **Modern Stack**: Next.js 15 with Turbopack, TypeScript, Tailwind CSS
- **Database**: PostgreSQL/SQLite with Prisma ORM
- **Authentication**: NextAuth.js with secure session management
- **Form Validation**: React Hook Form with Zod schemas
- **Error Handling**: Comprehensive error boundaries and API error handling
- **Rate Limiting**: Built-in protection against abuse
- **SEO Optimized**: Meta tags, Open Graph, sitemap generation
- **Performance**: Image optimization, lazy loading, Suspense boundaries

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with PostgreSQL/SQLite
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod
- **UI Components**: Custom responsive components
- **State Management**: React Context + local state
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/educational-platform.git
   cd educational-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/etution"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Optional: OpenAI for homework generation
   OPENAI_API_KEY="your-openai-key"

   # Optional: Google Site Verification
   GOOGLE_SITE_VERIFICATION="your-verification-code"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed with demo data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Accounts

After running the seed script, you can log in with these demo accounts:

### Greenwood Academy (GWA)
- **Admin**: `admin@greenwood.edu` / `password123`
- **Teacher**: `sarah.johnson@greenwood.edu` / `password123`
- **Student**: `alex.thompson@greenwood.edu` / `password123`
- **Parent**: `robert.thompson@gmail.com` / `password123`

### Tech Valley Institute (TVI)
- **Admin**: `admin@techvalley.edu` / `password123`
- **Teacher**: `sarah.johnson@techvalley.edu` / `password123`
- **Student**: `alex.thompson@techvalley.edu` / `password123`

### Sunrise Learning Center (SLC)
- **Admin**: `admin@sunrise.edu` / `password123`
- **Teacher**: `sarah.johnson@sunrise.edu` / `password123`
- **Student**: `alex.thompson@sunrise.edu` / `password123`

## 📱 Mobile Features

The platform is fully optimized for mobile devices:

- **Responsive Design**: Adapts to all screen sizes (iPhone, iPad, Desktop)
- **Touch-Friendly**: 44px minimum touch targets for accessibility
- **Bottom Navigation**: Easy thumb navigation on mobile
- **PWA Support**: Install as a native app
- **Camera Integration**: QR code scanning for attendance
- **Offline Capabilities**: Service worker for offline functionality

## 🔐 Security Features

- **Rate Limiting**: API protection against abuse
- **Input Validation**: Server-side validation with Zod
- **SQL Injection Prevention**: Prisma ORM protection
- **CSRF Protection**: Built-in NextAuth protection
- **Secure Sessions**: Encrypted session cookies
- **Role-based Access**: Proper authorization checks

## 📚 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database and reseed

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

Built with ❤️ using [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/)
