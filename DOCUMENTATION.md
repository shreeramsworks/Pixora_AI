
# Pixora AI - Technical Documentation

## 1. System Architecture

Pixora AI is a client-side Single Page Application (SPA) designed for automated e-commerce image optimization. It leverages modern web technologies to provide a seamless, high-performance experience.

### Core Stack
*   **Framework**: React 19 (Functional Components + Hooks)
*   **Build Tool**: Vite (ESBuild based)
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS (Utility-first) + Custom Animations
*   **AI Engine**: Google Gemini 3 Pro Preview via `@google/genai` SDK

### Execution Flow
1.  **User Interaction**: User uploads up to 10 images via drag-and-drop.
2.  **Pre-processing**: Images are converted to Base64 strings in the browser.
3.  **AI Request**: The application sends a multimodal payload (Text + Images) to the Gemini API.
4.  **Schema Validation**: The API response is strictly enforced against a predefined JSON Schema to ensure type safety.
5.  **Visualization**: Data is rendered in an interactive dashboard with platform-specific views (Shopify, Etsy, Amazon).
6.  **Export**: Data is converted to a CSV format for bulk import.

---

## 2. Component Reference & Parameters

### `App.tsx` (Root Controller)
The central hub for state management and routing.
*   **State**:
    *   `currentView`: Controls the visible "page" (virtual routing).
    *   `files`: Array of `UploadedFile` objects representing the queue.
    *   `results`: Stores the `AnalysisResult` from the AI.
    *   `activeBlogPost`: Tracks which blog post is currently open.
*   **Key Functions**:
    *   `handleStartBatch`: Resets state and scrolls to upload area.
    *   `handleNavigate`: Updates browser history API and changes view.

### `FileUpload.tsx`
Handles the drag-and-drop zone and file selection.
*   **Props**:
    *   `onFilesSelected`: `(files: File[]) => void` - Callback when valid images are dropped.
    *   `disabled`: `boolean` - Prevents interaction during AI processing.

### `ImageGrid.tsx`
Displays the queue of images before processing.
*   **Props**:
    *   `files`: `UploadedFile[]` - The current queue.
    *   `onRemove`: `(id: string) => void` - Handler for removing a single image.
    *   `onClear`: `() => void` - Handler for clearing the entire queue.

### `ResultsView.tsx`
The main dashboard for viewing AI analysis.
*   **Props**:
    *   `data`: `AnalysisResult` - The raw JSON data from Gemini.
    *   `files`: `UploadedFile[]` - Reference to original files for previews.
*   **Internal State**:
    *   `activePlatform`: Switches between 'General', 'Shopify', 'Etsy', 'Amazon' tabs.

### `TiltCard.tsx` & `Nav3DLink.tsx`
Wrapper components that apply 3D CSS transforms based on mouse position.
*   **Props**:
    *   `children`: React Node.
    *   `className`: String for Tailwind classes.
    *   `onClick` / `href`: Standard anchor props (for NavLink).

### `Logo.tsx`
Renders the SVG logo inline to prevent loading issues.
*   **Props**:
    *   `className`: String for sizing (e.g., "w-10 h-10").

---

## 3. Data Dictionary (Parameters)

The application relies on a strict interface defined in `types.ts` which mirrors the Gemini Response Schema. These are the parameters available in the application's data flow.

### `AnalysisResult` (Root Object)
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `batch_summary` | Object | High-level context about the uploaded batch. |
| `images` | Array | List of analysis results per image. |

### `batch_summary`
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `detected_platforms` | String[] | E.g., ["shopify", "amazon"]. Platforms detected based on image style. |
| `primary_category` | String | The dominant product category (e.g., "Footwear"). |
| `preset` | String | The detected industry preset (e.g., "fashion", "home_decor"). |

### `ImageResult` (Per Image Analysis)
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `input_filename` | String | Name of the original uploaded file. |
| `variant_role` | String | AI guess of image role (e.g., "Main", "Back View", "Detail"). |
| `detected` | Object | Visual attributes extracted by Computer Vision. |
| `seo` | Object | General SEO metadata usable on any platform. |
| `shopify` | Object | Shopify-specific fields. |
| `etsy` | Object | Etsy-specific fields. |
| `amazon` | Object | Amazon-specific fields. |

#### `detected` (Attributes)
*   `product_type`
*   `category`
*   `material` (e.g., "Leather", "Cotton")
*   `color` (e.g., "Navy Blue")
*   `style` (e.g., "Minimalist", "Vintage")
*   `gender` (e.g., "Unisex", "Womens")
*   `use_case` (e.g., "Running", "Casual Wear")
*   `keywords` (Array of visual tags)

#### `seo` (General)
*   `seo_filename`: Optimized filename (lowercase, hyphenated).
*   `alt_text`: Descriptive text for accessibility (<125 chars).
*   `title`: Generic HTML title tag.
*   `description`: Meta description.
*   `focus_keywords`: Array of high-value keywords.

#### `shopify` (Platform)
*   `handle`: Clean URL slug (e.g., `mens-leather-jacket`).
*   `alt_text`: Same as general but optimized for Google Shopping.
*   `metafields`: Array of `{ key, value }` pairs for structured data.

#### `etsy` (Platform)
*   `seo_title`: Front-loaded title with keywords (<140 chars).
*   `description`: Intro paragraph.
*   `tags_13`: **Exactly 13** comma-separated strings for Etsy's algorithm.

#### `amazon` (Platform)
*   `title`: Feature-heavy title (up to 200 chars).
*   `bullet_points`: Array of 5 benefit-driven feature bullets.
*   `search_terms_keywords`: Hidden backend keywords string (<250 bytes).

---

## 4. AI Service Configuration

The connection to Google Gemini is handled in `services/geminiService.ts`.

*   **Model**: `gemini-3-pro-preview` (Selected for superior multimodal reasoning capabilities).
*   **System Prompt**: Enforces a persona of an "E-commerce SEO Expert". It includes specific instructions for:
    *   **Amazon A9**: Focus on conversion and benefits.
    *   **Etsy**: Focus on "Findability" via tags.
    *   **Google/Shopify**: Focus on semantic relevance and clean data.
*   **Schema Enforcement**: The `responseMimeType` is set to `application/json` and a strictly typed `responseSchema` is passed to the model API to guarantee that the output matches the `AnalysisResult` TypeScript interface exactly.

---

## 5. Routing & SEO

Since the app is hosted as a static SPA, it uses a custom "Virtual Router".

*   **Clean URLs**: It uses the History API (`pushState`) to simulate real URLs (e.g., `/shopify`) without triggering a server reload.
*   **Dynamic Head**: The `updateHead` helper dynamically injects `<title>` and `<meta name="description">` tags based on the current view to ensure the tool itself ranks well on search engines and provides accurate social sharing previews.

---

## 6. Security & Stability

To ensure service reliability and prevent abuse, the application implements the following security measures:

*   **Rate Limiting (Client-Side)**:
    *   **Mechanism**: Strict batch size enforcement in `App.tsx`.
    *   **Limit**: Maximum `10` images per processing batch (`MAX_BATCH_SIZE`).
    *   **Behavior**: If a user attempts to upload more than the limit, the application blocks the addition of files and displays an error message. This prevents browser memory crashes and excessive API usage.
*   **Input Validation**:
    *   **File Type**: The `FileUpload` component strictly accepts `image/*` MIME types.
    *   **Content Safety**: The Gemini API has built-in safety filters that block harmful content generation.
*   **API Key Protection**:
    *   Keys are injected via environment variables (`process.env.API_KEY`) at build time, ensuring they are not exposed in the source code repository.
