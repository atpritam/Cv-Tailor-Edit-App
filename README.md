# CV Tailor App

The CV Tailor App is an AI-powered application designed to help users tailor their CVs to specific job descriptions. By leveraging advanced generative AI models, the application parses resumes, analyzes job requirements, and provides intelligent suggestions to optimize a CV for a higher chance of success.

## Features

- **AI-Powered CV Tailoring:** Utilize Google's Generative AI to analyze job descriptions and provide targeted CV adjustments.
- **Resume Parsing:** Upload and process your existing CVs in PDF format.
- **Job Description Analysis:** Input job descriptions for comprehensive analysis against your CV.
- **Intelligent Suggestions:** Receive AI-driven recommendations for improving your CV content.
- **Interactive Chat:** Engage with the AI to refine your CV and get real-time feedback.
- **Resume Preview:** Visualize your CV changes and download the tailored version.

## Technologies Used

This project is built using modern web technologies and a robust component library:

- **Next.js:** A React framework for building fast web applications.
- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
- **Shadcn/ui:** A collection of re-usable components built using Radix UI and Tailwind CSS.
- **Google Generative AI:** For intelligent content generation and analysis.
- **PDF.js & JSPDF:** For handling PDF parsing and generation.
- **Zod & React Hook Form:** For robust form validation and management.
- **pnpm:** A fast, disk space efficient package manager.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (You can install it globally via `npm install -g pnpm`)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone git@github.com:atpritam/Cv-Tailor-Edit-App.git
    cd cv-tailor-app
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

### Environment Variables

Create a `.env` file in the root of the project and add your Google Generative AI API key:

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace `YOUR_GEMINI_API_KEY` with your actual API key obtained from Google AI Studio.

### Running the Development Server

To start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application will automatically reload if you make changes to the source code.

### Building for Production

To build the application for production:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## Usage

1.  Upload your resume (PDF format) to the application.
2.  Input the job description you want to tailor your CV for.
3.  Receive AI-powered suggestions and insights to improve your CV.
4.  Utilize the interactive chat for further refinement.
5.  Preview and download your tailored CV.

## Project Structure

```
.
├── app/                  # Next.js app router: pages, layout, API routes
├── components/           # Reusable React components, UI library (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions, type definitions, prompt templates
├── public/               # Static assets
└── services/             # API service integrations (e.g., gen-ai.ts)
```

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.

## Contact

For any questions or inquiries, please contact [atpritam@outlook.com](mailto:atpritam@outlook.com).
