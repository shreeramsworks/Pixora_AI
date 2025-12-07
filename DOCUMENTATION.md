# Pixora AI - Architectural & Functional Documentation

## 1. Core Logic & Data Flow

The application follows a linear data flow:
`Upload -> Pre-processing -> AI Analysis -> Visualization -> Export`

### Step 1: Image Pre-processing (`fileToPart`)
Before sending data to Gemini, images are converted to Base64 strings.
-   **Location**: `services/geminiService.ts`
-   **Method**: `FileReader` reads the blob, strips the data URI prefix, and prepares the `inlineData` object required by `@google/genai`.

### Step 2: AI Analysis (`analyzeImageBatch`)
We utilizes **Gemini 3 Pro Preview** for its superior vision capabilities.
-   **Input**: Array of Base64 images + A text map of filenames.
-   **System Instruction**: A strictly engineered prompt that defines the "Persona" (SEO Expert) and specific rules for Amazon, Etsy, and Shopify.
-   **Schema Validation**: The API response is forced into a strict JSON schema using the `responseSchema` configuration. This guarantees that the UI never breaks due to malformed LLM output.

### Step 3: State Management
The `App.tsx` component acts as the "Controller".
-   `files` state: Tracks upload progress and preview URLs.
-   `results` state: Stores the parsed JSON response from Gemini.
-   `currentView` state: Manages the virtual routing.

---

## 2. SEO Strategy & Prompt Engineering

The efficacy of Pixora AI lies in its System Instruction (`services/geminiService.ts`). We enforce specific ranking factors:

### Universal Rules
-   **Semantic Clustering**: We explicitly ask for "12-14 semantic keyword clusters" to capture long-tail traffic.
-   **Attribute Detection**: The AI is forced to identify Material, Color, and Style based on visual pixels, not just user input.

### Platform-Specific Rules implemented:

| Platform | Constraint | Implementation Strategy |
| :--- | :--- | :--- |
| **Amazon** | A9 Algorithm | Generates 5 distinct bullet points focusing on "Benefits" over features. Includes hidden "Backend Keywords". |
| **Etsy** | Query Matching | Generates exactly 13 tags (Etsy's limit). Focuses on "Occasion" (e.g., 'Gift for her') and "Aesthetic" (e.g., 'Boho'). |
| **Shopify** | Google SEO | Generates clean URL handles (kebab-case) and Alt Text optimized for accessibility and Google Images. |

---

## 3. Data Schema

The application relies on a strict TypeScript interface defined in `types.ts` which mirrors the Gemini Response Schema.

```typescript
interface AnalysisResult {
  batch_summary: {
    preset: string;          // e.g., "fashion", "home_decor"
    primary_category: string;
  };
  images: {
    detected: {
      material: string;
      color: string;
      style: string;
      // ...
    };
    seo: {
      seo_filename: string;  // heavily weighted for SEO
      alt_text: string;
      focus_keywords: string[];
    };
    shopify: {
      handle: string;
      metafields: { key: string; value: string }[];
    };
    etsy: {
      tags_13: string[];     // Array of exactly 13 strings
    };
    amazon: {
      bullet_points: string[];
      search_terms_keywords: string[];
    };
  }[];
}
```

---

## 4. Component Documentation

### `FileUpload.tsx`
-   **UX**: Uses a fullscreen drag-and-drop zone.
-   **Visuals**: Features a "breathing" gradient animation and grid pattern overlay.
-   **Logic**: Filters for `image/*` MIME types before accepting files.

### `ResultsView.tsx`
-   **Dashboard Design**: Displays a comprehensive audit of the generated data.
-   **Interactivity**:
    -   **Tabs**: Switch between General, Shopify, Etsy, Amazon views.
    -   **Copy Buttons**: Custom clipboard hook with "Copied!" feedback state.
    -   **Color Coding**: Attributes (Material, Color, etc.) are semantically colored for quick scanning.

### `App.tsx` (The Router)
-   **Clean URL Handling**: Intercepts browser history to render components based on `window.location.pathname` without reloading the page.
-   **SEO Head Injection**: Dynamically updates `<title>` and `<meta name="description">` tags based on the active view to ensure the tool itself is SEO optimized.

---

## 5. Deployment Guidelines

1.  **Environment**: Ensure `API_KEY` is set in the production environment variables (e.g., Vercel, Netlify).
2.  **Build**: Run `npm run build`. This generates a static `dist/` folder.
3.  **Routing**: Since this is an SPA with custom history routing, configure your host to rewrite all 404s to `index.html`.
    *   *Netlify*: Create `_redirects` file with `/*  /index.html  200`
    *   *Vercel*: Configure `rewrites` in `vercel.json`.

---

## 6. Future Roadmap

-   **Integration**: Direct API connection to Shopify Admin to push updates automatically.
-   **Localization**: Support for generating SEO keywords in Spanish, French, and German.
-   **Edit Mode**: Allow users to manually edit the AI-generated text before exporting CSV.
