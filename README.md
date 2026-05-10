# TeamSync - Team Task Manager

TeamSync is a modern, AI-powered team task management application built with Next.js. It leverages the latest web technologies to provide a seamless and collaborative task tracking experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Frontend**: React 19, Tailwind CSS, Radix UI
- **Backend & Database**: Prisma ORM, Firebase
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with Google GenAI
- **Styling**: Tailwind CSS with class-variance-authority and tailwind-merge
- **Icons**: Lucide React

## 📦 Features

- **Task Management**: Create, assign, and track team tasks effortlessly.
- **AI-Powered Suggestions**: Uses Genkit to provide AI-assisted task suggestions and insights.
- **Modern UI**: Fully responsive and accessible UI components built with Radix UI and Tailwind CSS.
- **Real-time Sync**: Keep the whole team on the same page.

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

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### AI Setup

If you want to run the Genkit AI features locally:

```bash
npm run genkit:dev
```

## 🗄️ Database Setup

Ensure your database is configured properly with Prisma:

```bash
npm run db:generate
npm run db:push
```

## 📄 License

This project is open-source.
