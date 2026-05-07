# DevSensei

> An AI-powered learning platform for CS students. Practice coding, debugging, interviews, quizzes, riddles, and code reviews in one focused workspace.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white&style=for-the-badge)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white&style=for-the-badge)

## What it does

DevSensei combines several study tools into one app so users can switch from practice to feedback without leaving the platform.

- Coding challenges with language and difficulty selection.
- AI-driven code review in roast or mentor mode.
- Error explanations for JavaScript, Python, Java, and C++.
- Multi-turn mock interviews with scoring and feedback.
- Quizzes and riddles with fallback content when AI is unavailable.

## Live Demo

https://dev-sensei.netlify.app/

## Screenshots

Add screenshots under `docs/screenshots/` to make the repo feel more complete:

- Home: `docs/screenshots/home.png`
- Coding Challenge: `docs/screenshots/coding.png`
- Mock Interview: `docs/screenshots/interview.png`

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, React Query
- UI: Tailwind CSS, shadcn/ui, Radix UI, Monaco Editor
- Backend: Express for local development, Netlify Functions for production
- AI: Google Gemini 2.5 Flash
- Validation: Shared Zod schemas across client and server

## Getting Started

1. Install dependencies.

```bash
pnpm install
```

2. Create your environment file.

```bash
cp .env.example .env
```

3. Add your Gemini API key.

```env
GEMINI_API_KEY=your_new_key_here
PING_MESSAGE=pong
```

4. Start the app.

```bash
pnpm dev
```

## Deployment

The repository is configured for Netlify.

- Build command: `npm run build:client`
- Publish directory: `dist/spa`
- Functions directory: `netlify/functions`
- Required environment variable: `GEMINI_API_KEY`

## API Overview

The app exposes these AI-backed routes:

- `GET /api/health`
- `GET /api/riddles`
- `GET /api/coding-question`
- `POST /api/coding-check`
- `GET /api/quiz`
- `POST /api/explain-error`
- `POST /api/mock-interview`
- `POST /api/roast-code`

## Security Notes

- Never commit `.env`.
- If a key is exposed, revoke it immediately and generate a new one.
- Commit only `.env.example`.

## Author

Aniruddha

- GitHub: https://github.com/StreetCoder02
