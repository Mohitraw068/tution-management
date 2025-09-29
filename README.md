# 🎓 ETution Platform

A comprehensive, modern education management system built with Next.js 15, designed for tutoring institutes, coaching centers, and educational organizations.

## ✨ Features

### 🏛️ Multi-Institute Support
- Subdomain-based multi-tenancy
- Institute-specific branding and customization
- Flexible subscription models (Basic, Pro, Enterprise)

### 👥 Role-Based Access Control
- **Owner/Admin**: Full institute management
- **Teachers**: Class management, homework assignment, attendance tracking
- **Students**: View assignments, submit homework, track progress
- **Parents**: Monitor child's progress and attendance

### 📚 Academic Management
- Class creation and student enrollment
- Interactive homework assignment system
- AI-powered homework generation using OpenAI
- Real-time attendance tracking with QR codes
- Comprehensive reporting and analytics

### 💳 Payment Integration
- Stripe payment processing
- Subscription management
- Fee collection and invoicing

### 📱 Mobile-Responsive Design
- Optimized for all devices
- Progressive Web App (PWA) capabilities
- Touch-friendly interface

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Payments**: Stripe integration
- **AI**: OpenAI API for homework generation
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel + Docker support

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

## 🔑 Demo Credentials

### Primary Demo Institute (Code: DEMO-2024)
- **Owner**: owner@demo.com / password123
- **Teacher**: teacher@demo.com / password123
- **Student**: student@demo.com / password123
- **Parent**: parent@demo.com / password123

### Additional Sample Institutes
- **Tech Valley Institute (TVI-2024)**: admin@techvalley.edu / password123
- **Sunrise Learning Center (SLC-2024)**: admin@sunrise.edu / password123

💡 All users have the same password: `password123`
🌐 Use Institute Code "DEMO-2024" for primary demo credentials

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

### Docker Deployment

1. **Build and run with Docker**
   ```bash
   docker build -t etution-platform .
   docker run -p 3000:3000 etution-platform
   ```

2. **Use Docker Compose**
   ```bash
   cp .env.example .env.production
   docker-compose --env-file .env.production up -d
   ```

## 📁 Project Structure

```
etution-platform/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔧 Environment Configuration

See `.env.example` for all available environment variables including:
- Database configuration
- Authentication secrets
- Payment integration (Stripe)
- AI services (OpenAI)
- Email configuration
- Analytics and monitoring

## 🆘 Support

- 📧 Email: support@etution.com
- 💬 Community: [Discord Server](https://discord.gg/etution)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/etution/issues)

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/)
