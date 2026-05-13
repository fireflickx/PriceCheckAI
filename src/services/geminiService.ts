import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PriceEstimationRequest {
  productName: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
}

export interface PriceEstimationResult {
  verdict: 'GREAT_DEAL' | 'FAIR' | 'OVERPRICED' | 'UNKNOWN';
  estimatedReferencePrice: string;
  reasoning: string;
  marketContext: string;
  confidence: number;
}

export async function estimatePrice(request: PriceEstimationRequest): Promise<PriceEstimationResult> {
  const prompt = `
    Estimate if the following product price is fair based on current market data.
    Product: ${request.productName}
    Input Price: ${request.price} ${request.currency}
    Quantity: ${request.quantity} ${request.unit}

    Consider:
    1. Average market price for this product in similar quantities.
    2. Regional price variations (assume general global/online market if unspecified).
    3. Current inflation or supply trends.

    Respond with a detailed analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              enum: ['GREAT_DEAL', 'FAIR', 'OVERPRICED', 'UNKNOWN'],
              description: "The overall assessment of the price.",
            },
            estimatedReferencePrice: {
              type: Type.STRING,
              description: "A string representing the expected price range (e.g., '$10 - $12').",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief explanation of why this verdict was given.",
            },
            marketContext: {
              type: Type.STRING,
              description: "Extra info about current market trends for this product.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score from 0 to 1.",
            },
          },
          required: ["verdict", "estimatedReferencePrice", "reasoning", "marketContext", "confidence"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as PriceEstimationResult;
  } catch (error) {
    console.error("Error estimating price:", error);
    throw error;
  }
}
