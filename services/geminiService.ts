
import { GoogleGenAI, Type, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { ConversionPlan, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const conversionPlanSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A human-readable summary of the conversion plan." },
    vehicle: {
      type: Type.OBJECT,
      properties: {
        make: { type: Type.STRING },
        model: { type: Type.STRING },
        year: { type: Type.INTEGER },
      },
      required: ["make", "model", "year"],
    },
    drivetrain: {
      type: Type.OBJECT,
      properties: {
        motor: { type: Type.STRING },
        inverter: { type: Type.STRING },
        gearRatio: { type: Type.NUMBER },
      },
       required: ["motor", "inverter", "gearRatio"],
    },
    battery: {
      type: Type.OBJECT,
      properties: {
        chemistry: { type: Type.STRING, enum: ["LFP", "NMC", "LTO"] },
        voltage: { type: Type.NUMBER },
        capacity_kWh: { type: Type.NUMBER },
        packLayout: { type: Type.STRING },
      },
       required: ["chemistry", "voltage", "capacity_kWh", "packLayout"],
    },
    safety: {
        type: Type.OBJECT,
        properties: {
            standards: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        code: { type: Type.STRING },
                        severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                        remediation: { type: Type.STRING },
                    },
                    required: ["code", "severity", "remediation"],
                }
            }
        },
        required: ["standards", "risks"],
    },
    bom: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                sku: { type: Type.STRING },
                qty: { type: Type.NUMBER },
                unitCost: { type: Type.NUMBER },
                description: { type: Type.STRING },
            },
            required: ["sku", "qty", "unitCost", "description"],
        }
    },
    laborHours: { type: Type.NUMBER },
    cost: {
        type: Type.OBJECT,
        properties: {
            parts: { type: Type.NUMBER },
            labor: { type: Type.NUMBER },
            overhead: { type: Type.NUMBER },
            total: { type: Type.NUMBER },
        },
        required: ["parts", "labor", "total"],
    },
  },
  required: ["summary", "vehicle", "drivetrain", "battery", "safety", "bom", "laborHours", "cost"],
};

export const generateConversionPlan = async (file: File, prompt: string, useThinkingMode: boolean): Promise<ConversionPlan> => {
    const imagePart = await fileToGenerativePart(file);
    const model = 'gemini-2.5-pro';

    const systemInstruction = `You are EV.AI, an expert automotive electrification copilot. 
    1. Analyze the user's prompt and the provided image of a vehicle.
    2. Generate a comprehensive and structured EV Conversion Plan based on the user's request.
    3. The output MUST be a single JSON object that strictly adheres to the provided schema.
    4. Ground any safety-critical claims with citations using Google Search.
    5. Be realistic and practical in your component suggestions and cost estimations.
    6. Refuse any unsafe or impossible requests.`;

    const contents = {
        parts: [
            { text: prompt },
            imagePart,
        ],
    };

    const response = await ai.models.generateContent({
        model: model,
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: conversionPlanSchema,
            ...(useThinkingMode && { thinkingConfig: { thinkingBudget: 32768 } }),
            tools: [{googleSearch: {}}],
        },
    });

    const planJson = JSON.parse(response.text);
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: GroundingChunk) => chunk.web).filter(Boolean) as {uri: string, title: string}[];
    
    return { ...planJson, citations: citations };
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<{ text: string, citations: any[] }> => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
             tools: [{googleSearch: {}}, {googleMaps: {}}],
        }
    });
    
    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: GroundingChunk) => chunk.web || chunk.maps).filter(Boolean) || [];

    return { text: response.text, citations };
};

// --- Text-to-Speech (TTS) Functions ---

// Base64 decoding function
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
  
// Raw PCM audio data to AudioBuffer decoding function
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

export const generateSpeech = async (text: string, audioContext: AudioContext): Promise<AudioBuffer> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with a professional and clear tone: ${text}` }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    const audioBytes = decode(base64Audio);
    return await decodeAudioData(audioBytes, audioContext, 24000, 1);
};
