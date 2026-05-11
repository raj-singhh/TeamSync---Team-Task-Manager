# TeamSync - Team Task Manager

TeamSync is a modern, AI-powered team task management application built with Next.js. It leverages the latest web technologies to provide a seamless, collaborative, and intelligent task tracking experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Frontend**: React 19, Tailwind CSS, Radix UI
- **Backend & Authentication**: NextAuth.js (Auth.js) supporting Google, GitHub, and Manual credentials
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL) accessed via Prisma ORM
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with Google GenAI
- **Hosting**: Vercel

## 📦 Features

- **Robust Authentication**: Seamless login via Google, GitHub, or secure email/password combinations with unified email identities.
- **Task Management**: Create, assign, and track team tasks effortlessly across customizable projects.
- **AI-Powered Suggestions**: Uses Genkit to provide AI-assisted task suggestions, sprint planning, and actionable insights.
- **Modern UI**: Fully responsive, accessible, and fast UI components built with Radix UI and styled with Tailwind CSS.

## 🛠️ Getting Started

### Prerequisites

Ensure you have Node.js (>= v20) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/raj-singhh/TeamSync---Team-Task-Manager.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "TeamSync"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### ⚙️ Environment Variables

Create a `.env` file in the root of your project and add the following keys. These are absolutely required for the application to function locally and in production (Vercel).

```env
# Database
DATABASE_URL="postgres://your_neon_db_url"

# NextAuth
NEXTAUTH_URL="http://localhost:9002"
NEXTAUTH_SECRET="generate_a_random_32_character_string"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_ID="your_github_oauth_app_id"
GITHUB_SECRET="your_github_oauth_app_secret"

# AI Integration
GOOGLE_GENAI_API_KEY="your_google_gemini_api_key"
```

### 🗄️ Database Setup

Ensure your database is configured properly with Prisma and your `.env` variables are set.

```bash
# Push the schema to your Neon PostgreSQL database
npx prisma db push

# Generate the Prisma Client
npm run postinstall
```

### 🚀 Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### 🧠 AI Setup

If you want to run the Genkit AI features and developer UI locally:

```bash
npm run genkit:dev
```

## 🌐 Deployment (Vercel)

TeamSync is optimized for serverless deployment on Vercel. 
1. Connect your GitHub repository to Vercel.
2. Under **Environment Variables**, paste all the keys from your local `.env` file. Ensure `NEXTAUTH_URL` is updated to match your live Vercel domain (e.g., `https://your-app.vercel.app`).
3. Vercel will automatically run `npm run build` and `prisma generate` (via the postinstall script) during deployment.

## 📄 License

This project is open-source.
