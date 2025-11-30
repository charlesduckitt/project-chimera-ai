import { GoogleGenAI, Type } from "@google/genai";
import { QualitativeAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRaceQualitative = async (
  raceContext: string,
  horseName: string,
  trainerJockey: string,
  conditions: string
): Promise<QualitativeAnalysis> => {
  try {
    const prompt = `
      You are the AI Adjudicator for "Project Chimera", a horse racing lay betting system.
      Your goal is to validate if a horse is a "False Favourite" based on strict qualitative rules.

      TARGET SELECTION:
      Horse: ${horseName}
      Connections: ${trainerJockey}
      Conditions: ${conditions}
      Context/Form Analysis: ${raceContext}

      RULES TO APPLY (Section 4.0 of Strategy):
      1. REJECT if Trainer/Jockey are elite high-strike rate combinations (e.g., Willie Mullins, Ryan Moore). These are too risky to lay.
      2. APPROVE if Trainer/Jockey are on a "Cold Streak" (poor recent form).
      3. APPROVE if Ground/Surface is unsuitable based on history (e.g., Turf horse on All-weather, or dislikes Heavy ground).
      4. APPROVE if Course/Distance weakness exists (history of failure at this track/trip).
      
      OUTPUT REQUIREMENTS:
      Analyze the text provided. Return a JSON object indicating if we should LAY this horse.
      "isApproved": true only if vulnerabilities exist and no exclusion rules (like elite trainer) are triggered.
      "confidenceScore": 0-100 based on strength of negative indicators.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isApproved: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING },
            riskFactors: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["isApproved", "reasoning", "riskFactors", "confidenceScore"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QualitativeAnalysis;
    }
    
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      isApproved: false,
      reasoning: "AI Analysis Failed due to API error. Defaulting to rejection for safety.",
      riskFactors: ["API Error"],
      confidenceScore: 0
    };
  }
};