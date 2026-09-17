
import { GoogleGenAI } from "@google/genai";

import env from "../config/env.js";

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});


const generateJson = async (prompt) => {
  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: prompt,

    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
};


export { generateJson };