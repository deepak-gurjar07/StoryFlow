
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Scene, ImageSize, ChatMessage } from "../types";

// Always create a new instance right before use to get the latest API key
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseScriptToScenes = async (scriptText: string): Promise<Scene[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following screenplay/script and break it down into a series of visual storyboard scenes. For each scene, provide a scene number, a visual description (what happens in the frame), a visual prompt (optimized for high-quality image generation), and the setting. Return the data as a clean JSON array.
    
    Script:
    ${scriptText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            setting: { type: Type.STRING },
            dialogue: { type: Type.STRING },
          },
          required: ["sceneNumber", "description", "visualPrompt", "setting"],
        },
      },
    },
  });

  try {
    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((s: any, index: number) => ({
      ...s,
      id: `scene-${index}-${Date.now()}`,
      status: 'pending'
    }));
  } catch (e) {
    console.error("Failed to parse script JSON", e);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const generateStoryboardImage = async (
  prompt: string, 
  size: ImageSize = '1K'
): Promise<string> => {
  const ai = getAIClient();
  
  // Upgrade to gemini-3-pro-image-preview for high-quality (2K/4K) requests as per guidelines
  const model = (size === '2K' || size === '4K') 
    ? 'gemini-3-pro-image-preview' 
    : 'gemini-2.5-flash-image';
  
  const config: any = {
    imageConfig: {
      aspectRatio: "16:9"
    }
  };

  // Set imageSize config specifically for gemini-3-pro-image-preview
  if (model === 'gemini-3-pro-image-preview') {
    config.imageConfig.imageSize = size;
  }
  
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { text: `A cinematic storyboard panel, professional film aesthetic, hand-drawn digital art style. Scene description: ${prompt}` }
      ]
    },
    config: config
  });

  // Iterate through parts to find the image part (base64 encoded)
  const candidate = response.candidates?.[0];
  if (candidate) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error(`No image data returned from ${model}.`);
};

export const getChatResponse = async (history: ChatMessage[], message: string) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are an expert film director and storyboard consultant. Help the user refine their script, visualize their scenes, and give advice on cinematography, lighting, and pacing.'
    },
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
