# PrepWise - AI-Powered Interview Prep Platform

A production-ready web application for interview preparation with AI-powered features including:
- Live interview practice with AI interviewer (Gemini)
- Real-time speech-to-text transcription
- Intelligent coaching tips
- Resume analysis with ATA scoring
- Session history and detailed feedback

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **AI Services**: Google Gemini AI, WAPI (Speech-to-Text/Text-to-Speech)
- **UI Components**: Radix UI, shadcn/ui

## Features

### Interview Practice
- Three-actor system: AI Assistant, Coach, and You
- Streaming responses from Gemini AI
- Live microphone recording
- Real-time transcription via WAPI
- Pause/resume functionality
- Mark messages for review
- Session recording and storage

### Resume Analysis
- Upload PDF, DOCX, or TXT files
- Calculate ATA score (Applicant Tracking System Alignment)
  - 45% Keyword Match
  - 45% Semantic Similarity (Gemini embeddings)
  - 10% Formatting Score
- Identify matched and missing keywords
- AI-generated improvement suggestions
- Downloadable revised resume snippet

### User Management
- Email/password authentication
- User profiles
- Session history
- Analytics dashboard

## Prerequisites

- Node.js 18+ and npm
- Firebase project with:
  - Authentication enabled
  - Firestore database
  - Storage bucket
- Google Gemini API key
- WAPI account with Web Token and Workflow ID

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

The `.env.local` file has been pre-configured with your credentials. For production or other environments, copy `.env.example`:

```bash
cp .env.example .env.production
```

Required variables:
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `FIREBASE_CLIENT_EMAIL`: Service account email
- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini API key
- `NEXT_PUBLIC_VAPI_WEB_TOKEN`: WAPI web token
- `NEXT_PUBLIC_VAPI_WORKFLOW_ID`: WAPI workflow ID
- `NEXT_PUBLIC_FIREBASE_*`: Firebase client configuration

### 3. Set Up Firebase Security Rules

Deploy the security rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

Or manually copy the rules from `firebase.rules` to your Firebase Console.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── interview-session/
│   │   │   ├── interview-feedback/
│   │   │   ├── resume-analysis/
│   │   │   └── profile/
│   │   ├── api/               # API routes
│   │   │   ├── gemini/
│   │   │   ├── wapi/
│   │   │   └── resume/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                  # Utilities
│   │   ├── firebase/
│   │   │   ├── client.ts
│   │   │   └── admin.ts
│   │   └── utils.ts
│   └── types/               # TypeScript types
│       └── index.ts
├── public/                   # Static assets
├── firebase.rules           # Firestore and Storage rules
├── .env.example            # Environment variables template
├── .env.local              # Your local environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## API Routes

### `/api/gemini/generate` (POST)
Stream AI-generated interview questions and responses.

**Request:**
```json
{
  "prompt": "Tell me about yourself",
  "history": [...],
  "systemInstruction": "You are an interviewer..."
}
```

**Response:** Server-Sent Events (SSE) stream

### `/api/gemini/embeddings` (POST)
Generate embeddings for semantic similarity.

**Request:**
```json
{
  "text": "Resume text or job description"
}
```

**Response:**
```json
{
  "embedding": [0.1, 0.2, ...]
}
```

### `/api/resume/analyze` (POST)
Analyze resume against job description.

**Request:** multipart/form-data
- `resume`: File (PDF/DOCX/TXT)
- `jobDescription`: string

**Response:**
```json
{
  "ataScore": 75,
  "keywordScore": 80,
  "semanticScore": 85,
  "formattingScore": 90,
  "breakdown": {...},
  "revisedSnippet": "..."
}
```

### `/api/wapi/stt` (POST)
Speech-to-text transcription (placeholder for WAPI integration).

### `/api/wapi/tts` (POST)
Text-to-speech synthesis (placeholder for WAPI integration).

## Security

- All API keys are server-side only
- Firebase security rules enforce user-level access control
- Protected routes require authentication
- CORS configured for API endpoints

## Testing

Run the test suite:

```bash
npm test
```

Tests include:
- ATA score calculation
- Keyword extraction
- Cosine similarity
- Component rendering

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard

### Other Platforms

Build the project:
```bash
npm run build
```

Then deploy the `.next` folder according to your platform's documentation.

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## Support

For issues and questions, please open a GitHub issue.
