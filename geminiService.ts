
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this image to identify the species of animal, plant, or fungi present.
            Provide a strict JSON response.
            
            Scoring Rules:
            - Common species: 10 points.
            - Rare or protected species: 50 points.
            - Invasive species identification: 20 points (for reporting).
            
            Provide common name, scientific name, category, rarity, description, conservation status, points, and one fun fact.
            
            CRITICAL: Detect if this image is likely from the internet (e.g., stock photo, screenshot, has watermarks, professional studio lighting, or is a known internet image). 
            If it looks like a real-life photo taken by a mobile phone in a natural setting, set isInternetImage to false. 
            If it looks like a professional photograph, a digital illustration, or a screenshot from a website, set isInternetImage to true.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Bird", "Mammal", "Reptile", "Amphibian", "Insect", "Arachnid", "Plant", "Fungi", "Other"] },
            rarity: { type: Type.STRING, enum: ["Common", "Uncommon", "Rare", "Varying"] },
            description: { type: Type.STRING },
            conservationStatus: { type: Type.STRING },
            estimatedPoints: { type: Type.INTEGER },
            funFact: { type: Type.STRING },
            isInternetImage: { type: Type.BOOLEAN, description: "True if the image appears to be from the internet/stock photo/screenshot, false if it looks like an original user photo." }
          },
          required: ["itemName", "scientificName", "category", "rarity", "description", "conservationStatus", "estimatedPoints", "funFact", "isInternetImage"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    
    const result = JSON.parse(text) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Gemini Wildlife Analysis Error:", error);
    throw error;
  }
};
