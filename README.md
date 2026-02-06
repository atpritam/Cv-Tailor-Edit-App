# CV Tailor App

AI-powered resume ATS optimization with real-time streaming and multi-modal processing. Built for performance and enhanced user experience.

[![Tailor View](Screenshots/Tailor-View.png)](https://cv-tailor-edit-app.vercel.app)

**Live:** [cv-tailor-edit-app.vercel.app](https://cv-tailor-edit-app.vercel.app/)

## Features

- **AI-Powered CV Tailoring:** Utilize Google's Generative AI to analyze job descriptions and provide targeted CV adjustments.
- **Multi-Modal AI:** Supports image formats, with intelligent text extraction using Gemini Vision API.
- **Interactive AI Refinement:** Engage in a chat-based experience with the AI to continuously refine your CV, with the ability to undo and redo changes.
- **Job Compatibility Analysis:** Input job descriptions for comprehensive analysis and scoring against your CV.
- **Resume Preview:** Visualize your CV changes in real-time before saving.
- **PDF Generation & Printing:** Download your tailored CV as a PDF or print it directly.

## Performance Optimizations

- **Parallel Processing Architecture**: Reduced CV analysis + tailoring from **18-24s → 8-10s** (58% faster) using concurrent AI streaming
- **Image Preprocessing Pipeline**: Optimized multi-modal parsing from **10-12s → 2-4s** (75% faster) with intelligent image preprocessing
- **LRU Cache System**: Built persistent sessionStorage-backed cache for parsed images, eliminating redundant API calls and improving UX
- **Prompt Engineering**: Structured prompts with weighted scoring algorithm, data validation rules, and JSON schema enforcement for consistent AI outputs

## Tech Stack

- **Next.js 15** + TypeScript + Tailwind CSS
- **Google Gemini** (2.5 Flash, Flash Lite, 3 Flash Preview)
- **Server-Sent Events (SSE)** for real-time streaming
- **pnpm:** A fast, disk space efficient package manager.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Setup

```bash
git clone git@github.com:atpritam/Cv-Tailor-Edit-App.git
cd cv-tailor-app
pnpm install
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
BROWSERLESS_API_TOKEN=your_token  # For PDF generation
CUSTOMJS_API_KEY=your_key          # Fallback (optional)
```

### Run

```bash
pnpm dev  # Development on localhost:3000
pnpm build && pnpm start  # Production
```

## Usage

1.  **Upload your resume:** Begin by uploading your existing CV in PDF or image format (PNG, JPG, JPEG).
2.  **Provide a job description:** Paste the job description you're targeting, or upload it as a file (TXT, PDF, or image).
3.  **Receive tailored suggestions:** The AI will process your resume and the job description, then generate an optimized CV and produce a compatibility score.
4.  **Refine with chat (optional):** Use the interactive chat with the AI, requesting further changes to your tailored CV. Utilize the undo/redo functionality to manage revisions.
5.  **Customize appearance:** Choose from various color themes and upload a profile photo to personalize your resume's look.
6.  **Preview and export:** Review the real-time preview of your tailored and customized CV, then download it as a PDF or print it directly.

**Key Implementation:**

- [tailor-stream/route.ts](app/api/tailor-stream/route.ts): Parallel AI processing with SSE
- [useFileParser.ts](hooks/useFileParser.ts): Multi-modal parsing with caching
- [persistent-lru-cache.ts](lib/persistent-lru-cache.ts): SessionStorage-backed cache
- [image.ts](lib/image.ts): Image preprocessing optimization
- [gen-ai.ts](services/gen-ai.ts): Multi-model AI service with retry logic

---

**Built by [Pritam](https://github.com/atpritam)** • [Contact](mailto:atpritam@outlook.com)
