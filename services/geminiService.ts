import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Lazy initialization to prevent top-level crashes if API_KEY is missing on load
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check Vercel settings and Redeploy.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

// Optimized System Instruction: Concise and token-efficient
const SYSTEM_INSTRUCTION = `
Analyze uploaded product images for e-commerce SEO (Amazon, Shopify, Etsy).
Task: Extract visual attributes and generate platform-specific metadata.

Strict Guidelines:
1. **Amazon**: A9 Algorithm. Titles: [Brand] + [Feature] + [Keywords]. Bullets: Benefit-driven. Backend Keywords: <250 bytes, synonyms.
2. **Shopify**: Google SEO. Handle: lowercase-hyphenated. Metafields: Structured data.
3. **Etsy**: Tagging. EXACTLY 13 tags. Multi-word phrases. Title: Front-load keywords.
4. **Visual Analysis**: Be specific (e.g., "Crimson" vs "Red", "Silk" vs "Satin").

Output strictly valid JSON matching the schema. No markdown.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    batch_summary: {
      type: Type.OBJECT,
      properties: {
        detected_platforms: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Platforms likely used based on image context."
        },
        primary_category: { type: Type.STRING },
        preset: {
          type: Type.STRING,
          description: "One of: fashion, jewelry, shoes, beauty, electronics, home_decor, generic"
        }
      },
      required: ["preset"]
    },
    images: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input_filename: { type: Type.STRING },
          variant_group_id: { type: Type.STRING },
          variant_role: { type: Type.STRING },
          detected: {
            type: Type.OBJECT,
            properties: {
              product_type: { type: Type.STRING },
              category: { type: Type.STRING },
              material: { type: Type.STRING },
              color: { type: Type.STRING },
              style: { type: Type.STRING },
              gender: { type: Type.STRING },
              use_case: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          seo: {
            type: Type.OBJECT,
            properties: {
              seo_filename: { type: Type.STRING },
              alt_text: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              focus_keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["seo_filename", "alt_text", "title"]
          },
          shopify: {
            type: Type.OBJECT,
            properties: {
              handle: { type: Type.STRING },
              alt_text: { type: Type.STRING },
              metafields: { 
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    value: { type: Type.STRING }
                  },
                  required: ["key", "value"]
                }
              }
            }
          },
          etsy: {
            type: Type.OBJECT,
            properties: {
              seo_title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags_13: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          amazon: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              search_terms_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              main_features: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        required: ["input_filename", "seo"]
      }
    }
  },
  required: ["images", "batch_summary"]
};

// Helper: Compress Image to prevent huge payloads (Speed Optimization)
const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                // Resize to max 1024px (sufficient for AI vision, drastically reduces size)
                const MAX_SIZE = 1024; 

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                // Export as JPEG with 0.8 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl.split(',')[1]); // Remove "data:image/jpeg;base64," prefix
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    const base64Data = await compressImage(file);
    return {
        inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg', // Always converting to JPEG for consistency
        },
    };
};

export const analyzeImageBatch = async (files: File[]): Promise<AnalysisResult> => {
  try {
    const client = getAiClient();
    
    // Process images in parallel
    const imageParts = await Promise.all(files.map(file => fileToPart(file)));
    
    // Create a simplified file map prompt
    const fileMapPrompt = "Files:\n" + 
      files.map((f, i) => `Img ${i + 1}: ${f.name}`).join("\n");

    const response = await client.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
            ...imageParts, 
            { text: fileMapPrompt + "\nAnalyze images. Return JSON." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};