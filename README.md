# ⚽ Futwitter - Brazilian Football Social Platform

A social platform for Brazilian football (Brasileirão) fans to interact with their favorite teams, rate players, read exclusive journalism, and connect with other supporters.

## 🚀 Quick Start

### Run the project locally:

```bash
npm run dev
```

> **Note:** On Windows (CMD), use `npm run dev:win`

The server will be available at **http://localhost:5001**

---

## 📋 Prerequisites

Before starting, make sure you have installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** - You can use:
  - [Neon](https://neon.tech) (recommended - free serverless PostgreSQL database)
  - Local PostgreSQL
  - Any PostgreSQL service

## 🔧 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/vitorlatorraca/Futwitter.git
cd Futwitter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=5001
SESSION_SECRET=your-secret-key-here-change-in-production
```

**Examples:**

**Neon (recommended):**
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
PORT=5001
SESSION_SECRET=your-secret-key-here
```

**Local PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/futwitter
PORT=5001
SESSION_SECRET=your-secret-key-here
```

### 4. Setup the database

Run database migrations:

```bash
npm run db:push
```

### 5. Start the development server

**Windows (PowerShell):**
```bash
npm run dev
```

**Windows (CMD):**
```bash
npm run dev:win
```

**Linux/Mac:**
```bash
npm run dev
```

Access: **http://localhost:5001**

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server (with hot-reload) |
| `npm run dev:win` | Version for Windows (CMD) |
| `npm run build` | Creates production build |
| `npm run start` | Starts the server in production mode |
| `npm run check` | Checks TypeScript errors |
| `npm run db:push` | Applies database migrations |

---

## 🗄️ Project Structure

```
Futwitter/
├── client/              # React Frontend
│   ├── src/
│   │   ├── pages/       # Application pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities and contexts
│   └── index.html
├── server/              # Express Backend
│   ├── index.ts         # Main server entry
│   ├── app.ts           # Express app setup
│   ├── routes.ts        # API routes
│   ├── swagger.ts       # API documentation
│   ├── db.ts            # Database configuration
│   └── storage.ts       # Data access layer
├── shared/              # Shared code
│   └── schema.ts        # Database schema (Drizzle ORM)
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - UI components based on Radix UI
- **Wouter** - Client-side routing
- **TanStack Query** - Server state management

### Backend
- **Express.js** - Web framework for Node.js
- **TypeScript** - Static typing
- **Swagger** - API documentation
- **Bcrypt** - Password hashing
- **Express Session** - Session management

### Database
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe ORM
- **Neon** - Serverless PostgreSQL (optional)

---

## 📚 API Documentation

When the server is running, access the Swagger documentation at:

**http://localhost:5001/api-docs**

---

## 🔧 Troubleshooting

### Error: "DATABASE_URL must be set"
- Make sure you created the `.env` file in the project root
- Verify that the database URL is correct

### Error running `npm run dev` on Windows
- Use `npm run dev:win` in CMD
- Or make sure `cross-env` is installed: `npm install --save-dev cross-env`

### Port already in use
- Change the port in the `.env` file: `PORT=3000`
- Or stop the process using port 5001

### Database connection error
- Verify that the database is running
- Confirm that the connection URL is correct
- For Neon, make sure to use `?sslmode=require` in the URL

---

## 📚 Features

- ✅ User authentication (signup and login)
- ✅ Favorite team selection
- ✅ Personalized dashboard with news feed
- ✅ Player ratings system
- ✅ News and exclusive journalism
- ✅ Video content support (TikTok-style)
- ✅ Image upload with automatic compression
- ✅ User profile management
- ✅ Role system (FAN, JOURNALIST, ADMIN, INFLUENCER)
- ✅ Influencer request system
- ✅ Badge/achievement system
- ✅ RESTful API with Swagger documentation

---

## 🎯 Getting Started

After running the project:

1. Access http://localhost:5001
2. Create an account or login
3. Select your favorite team
4. Explore the dashboard and features!

---

## 📄 License

MIT

---

Built with ⚽ for Brazilian football fans!
