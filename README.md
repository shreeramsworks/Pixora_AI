# Pixora AI 🧠

**E-commerce Image SEO Automation powered by Google Gemini 3.**

Pixora AI is a production-grade React application that uses multimodal AI to analyze product images and generate platform-specific SEO metadata for Shopify, Etsy, and Amazon. It transforms raw pixel data into conversion-ready assets (Alt Text, Titles, Tags, Structured Data) in milliseconds.

![Pixora AI Banner](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200)

---

## 🚀 Features

-   **Multi-Modal Analysis**: Uses `gemini-3-pro-preview` to "see" product details (Material, Style, Color, Context).
-   **Platform Native Output**:
    -   **Shopify**: Generates Handles, Alt Text, and Metafields.
    -   **Etsy**: Generates exactly 13 tags based on algorithm matching.
    -   **Amazon**: Generates A9-optimized Titles, Bullet Points, and Backend Keywords.
-   **Batch Processing**: Handles concurrent upload and analysis of multiple images.
-   **Performance Optimized**: 
    -   React 19 with Compiler optimizations.
    -   Zero-dependency routing (History API).
    -   Memoized components for 60fps interactions.
-   **CSV Export**: One-click export for bulk import into e-commerce platforms.

---

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS (with custom animations & glassmorphism)
-   **AI Model**: Google Gemini 3 Pro Preview (`@google/genai` SDK)
-   **Build Tool**: Vite
-   **State Management**: React Hooks (`useState`, `useCallback`, `useReducer` pattern)

---

## ⚡ Quick Start

### Prerequisites

-   Node.js v18+
-   A Google AI Studio API Key (Get one [here](https://aistudio.google.com/))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/pixora-ai.git
    cd pixora-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```
    *Note: The application expects `process.env.API_KEY` to be available.*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## ☁️ Deployment (Vercel)

1.  **Push to GitHub**: Commit your code and push it to a GitHub repository.
    *   *Note: Ensure `.env` is in your `.gitignore` so your API key isn't public.*

2.  **Import to Vercel**:
    *   Go to Vercel Dashboard -> Add New -> Project.
    *   Select your GitHub repository.

3.  **Configure Environment Variable**:
    *   In the "Environment Variables" section of the deployment setup:
    *   Key: `API_KEY`
    *   Value: `your_actual_google_gemini_api_key`

4.  **Deploy**: Click "Deploy". Vercel will build the project using Vite and deploy it.

*Note: The `vite.config.ts` file included in this project is configured to read the `API_KEY` from Vercel's environment and inject it into the client-side code automatically.*

---

## 📂 Project Structure

```
pixora-ai/
├── components/          # UI Components
│   ├── FileUpload.tsx   # Drag & Drop Zone with visual states
│   ├── ImageGrid.tsx    # Preview grid for uploaded assets
│   └── ResultsView.tsx  # Dashboard for viewing/copying AI data
├── services/
│   └── geminiService.ts # API Layer (Schema definitions & Prompt Engineering)
├── App.tsx              # Main Logic Controller & Routing
├── types.ts             # TypeScript Interfaces & API Response Types
├── index.html           # Entry point (SEO Meta tags, Fonts)
└── index.tsx            # React Mount point
```

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.