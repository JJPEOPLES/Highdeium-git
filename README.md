# Highdeium - AI-Powered Multimedia Book Platform

A next-generation book writing and publishing platform that allows users to create, share, and monetize multimedia-rich books with text, images, videos, and music.

## Features

- **Authentication**: Secure login with Replit Auth
- **Book Creation**: Rich text editor with multimedia support
- **Social Features**: Like, comment, bookmark, and follow
- **Payment Processing**: Stripe integration with Cash App Pay support
- **Content Moderation**: AI-powered NSFW detection
- **Dual Publishing**: SFW and mature content channels
- **Discovery Feed**: Algorithm-driven content recommendations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + Shadcn/ui components
- **Authentication**: Replit Auth with OpenID Connect
- **Payments**: Stripe with Cash App Pay support

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Environment Variables
Create these secrets in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key (optional)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key (optional)
- `SESSION_SECRET` - Session encryption secret

### Database Setup
```bash
npm run db:push
```

## Deployment Options

### Free Hosting
- **Railway**: $5 monthly credit (recommended)
- **Render**: Free tier with sleep mode
- **Koyeb**: No credit card required

See `FREE_DEPLOY_GUIDE.md` for detailed deployment instructions.

### Stripe Setup
See `STRIPE_SETUP.md` for payment configuration instructions.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility libraries
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── replitAuth.ts      # Authentication setup
│   └── db.ts              # Database connection
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema
└── docs/                  # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details