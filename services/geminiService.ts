import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are ImageSEO-Genius, an expert e-commerce SEO content generator trained on Amazon, Shopify, and Etsy marketplace ranking systems.

UNIVERSAL SEO GUIDELINES (All Platforms):
1. Start the title with the **primary keyword**.
2. Use **long-tail keyword phrases** relevant to buyer/commercial intent.
3. Include product attributes (material, size, color, style, benefits).
4. Include 12-14 **semantic keyword clusters** (e.g., "gym shoes," "training sneakers," etc.).
5. Write **unique, non-duplicated copy** with natural language.
6. Structure description using H1, H2, bullets, and concise paragraphs (Shopify + Google).
7. Include image SEO instructions: optimized filenames, alt text (≤125 chars).

🛒 AMAZON RULES (A9 Algorithm):
- Title: 150–200 characters, primary keyword first, include brand, material, benefit, use case.
- Bullet Points: 5 bullets with keywords, benefits, features.
- Backend Keywords: 250 characters, no commas, no brand names, include synonyms and misspellings.
- Image: 1600px+, pure white background.

🛍 SHOPIFY RULES (Google SEO):
- Title: 50–70 characters, primary keyword first.
- Description: Include headings, bullets, and care instructions.
- URL handle and filename must include keywords.
- Image Alt Text: Descriptive, ≤125 chars, keyword-rich but not stuffed.

🎨 ETSY RULES:
- Title: 140 characters max, long-tail keywords separated by commas.
- Tags: Use all 13 tags with high-ranking phrases.
- Attributes: Color, material, style, use cases.

OUTPUT CONTRACT:
- Analyze the uploaded images to detect product attributes.
- Respond in valid JSON matching the schema exactly.
- Group variants logically (same variant_group_id for same product).
- If info is unclear, make a reasonable guess (e.g. "likely cotton").
- Do not output markdown code blocks, just the raw JSON.
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

// Helper to convert File to Base64
const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImageBatch = async (files: File[]): Promise<AnalysisResult> => {
  try {
    const imageParts = await Promise.all(files.map(file => fileToPart(file)));
    
    // We create a text prompt that maps filenames to the images so the AI knows which is which
    const fileMapPrompt = "Here are the files in this batch:\n" + 
      files.map((f, i) => `Image ${i + 1}: ${f.name}`).join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
            ...imageParts, 
            { text: fileMapPrompt + "\nAnalyze these images and provide the SEO data according to the schema." }
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