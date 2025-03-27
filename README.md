[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)


# CodeGuide Starter Pro

A modern web application starter template built with Next.js 14, featuring authentication, database integration, and payment processing capabilities.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Payments:** [Stripe](https://stripe.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Development Tools:** [VS Code](https://code.visualstudio.com/) and [Cursor](https://cursor.sh/)

## Prerequisites

Before you begin, ensure you have the following:
- Node.js 18+ installed
- A [Clerk](https://clerk.com/) account for authentication
- A [Supabase](https://supabase.com/) account for database
- A [Stripe](https://stripe.com/) account for payments (optional)
- [VS Code](https://code.visualstudio.com/) as your primary IDE
- [Cursor](https://cursor.sh/) extension for AI-assisted code completion
- Generated project documents from [CodeGuide](https://codeguide.dev/) for best development experience

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codeguide-starter-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Variables Setup**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in the environment variables in `.env` (see Configuration section below)

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

## Configuration

### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to API Keys
4. Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Supabase Setup
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Go to Project Settings > API
4. Copy the `Project URL` as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the `anon` public key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Stripe Setup (Optional)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from the Developers section
3. Add the required keys to your `.env` file

### Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the following APIs:
   - Cloud Text-to-Speech API
   - Cloud Speech-to-Text API
4. Create a service account with the following roles:
   - Cloud Text-to-Speech User
   - Cloud Speech-to-Text User
5. Generate a JSON key for the service account
6. Copy the JSON key content to the `GOOGLE_CLOUD_CREDENTIALS` environment variable
7. Configure the Google Cloud settings in the `.env` file for:
   - Australian accent voice settings for Text-to-Speech
   - Speech recognition settings for Speech-to-Text

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_CREDENTIALS=your_service_account_json_key

# Google Cloud Text-to-Speech
GOOGLE_TTS_VOICE_NAME=en-AU-Neural2-B
GOOGLE_TTS_LANGUAGE_CODE=en-AU
GOOGLE_TTS_SPEAKING_RATE=0.9

# Google Cloud Speech-to-Text
GOOGLE_STT_LANGUAGE_CODE=en-AU
GOOGLE_STT_MODEL=command_and_search
GOOGLE_STT_ENABLE_AUTOMATIC_PUNCTUATION=true
GOOGLE_STT_ENABLE_WORD_TIME_OFFSETS=true

# OpenAI (for future enhancements)
OPENAI_API_KEY=your_openai_api_key
```

## VS Code and Cursor Setup

To optimize your development experience with this project, we recommend the following setup:

### VS Code Setup

1. Open the project in VS Code
2. Install the recommended extensions when prompted, or go to the Extensions view and filter by "Recommended"
3. VS Code settings are already configured in the `.vscode/settings.json` file for:
   - Formatting on save with Prettier
   - ESLint integration
   - TypeScript workspace version
   - Tailwind CSS IntelliSense
   - Improved import organization

### Cursor Setup

1. Install [Cursor](https://cursor.sh/) - An IDE built on VS Code with AI features
2. Open the project in Cursor
3. The project includes custom Cursor rules in the `.cursor/rules` directory for:
   - Project-specific best practices
   - IDE configuration recommendations
   - Code style guidelines

4. Use Cursor's AI features by:
   - Pressing Ctrl+K to generate code
   - Pressing Ctrl+L to explain code
   - Using inline chat for context-aware coding assistance

The combination of VS Code and Cursor provides an optimal development environment for this project with code completion, AI assistance, and consistent code style enforcement.

## Features

- 🔐 Authentication with Clerk
- 📦 Supabase Database
- 💳 Stripe Payments Integration
- 🎨 Modern UI with Tailwind CSS
- 🚀 App Router Ready
- 🔄 Real-time Updates
- 📱 Responsive Design

## Project Structure

```
codeguide-starter/
├── app/                # Next.js app router pages
├── components/         # React components
├── utils/             # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
├── documentation/     # Generated documentation from CodeGuide
└── supabase/          # Supabase configurations and migrations
```

## Documentation Setup

To implement the generated documentation from CodeGuide:

1. Create a `documentation` folder in the root directory:
   ```bash
   mkdir documentation
   ```

2. Place all generated markdown files from CodeGuide in this directory:
   ```bash
   # Example structure
   documentation/
   ├── project_requirements_document.md             
   ├── app_flow_document.md
   ├── frontend_guideline_document.md
   └── backend_structure_document.md
   ```

3. These documentation files will be automatically tracked by git and can be used as a reference for your project's features and implementation details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
