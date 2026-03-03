

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { QuizQuestion, StoryChunk } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "The question text."
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of 4 possible answers."
      },
      correctAnswers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array with the correct answer(s) from the options array."
      },
      type: {
        type: Type.STRING,
        description: "Question type: 'single' for one correct answer, 'multi' for multiple."
      }
    },
    required: ["question", "options", "correctAnswers", "type"],
  }
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 unique, single-choice multiple-choice quiz questions about ${topic}. The difficulty should be for a knowledgeable beginner. For each question, specify the type as 'single'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Fallback in case of API error
    return [{ question: `Could not load quiz on ${topic}. Please try again.`, options: ["OK"], correctAnswers: ["OK"], type: 'single' }];
  }
};

const storySchema = {
    type: Type.OBJECT,
    properties: {
        text: {
            type: Type.STRING,
            description: "A paragraph of the story."
        },
        choices: {
            type: Type.ARRAY,
            items: {type: Type.STRING},
            description: "Two possible actions for the user to take next. If it's the end of the story, this should be an empty array."
        }
    },
    required: ["text", "choices"]
};

export const generateStoryChunk = async (topic: string, previousText?: string): Promise<StoryChunk> => {
    const prompt = previousText 
        ? `Continue this story about ${topic}. The previous part was: "${previousText}". Generate the next paragraph and two choices.`
        : `Start an interactive story about ${topic}. Provide the first paragraph and two choices to begin the adventure.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating story:", error);
        return { text: `The story of ${topic} could not be told at this time.`, choices: [] };
    }
};

export const generateImageForTopic = async (topic: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A vibrant, high-quality illustration representing the concept of ${topic}. The style should be artistic and slightly abstract.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        return "https://picsum.photos/1280/720"; // Fallback
    }
}

export const generateQuestionForTopic = async (topic: string): Promise<QuizQuestion> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate one challenging single-choice multiple-choice question about ${topic}. Specify the type as 'single'.`,
             config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema.items,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating question for image:", error);
        return { question: `What is the core concept of ${topic}?`, options: ["Knowledge", "Curiosity", "Error"], correctAnswers: ["Error"], type: 'single' };
    }
};

// FIX: Add missing getCompassChallengeResponse function and its related types and schemas.
export interface CompassChallengeResult {
    text: string;
    status: 'CONTINUE' | 'WIN' | 'LOSE';
}

const compassChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        text: {
            type: Type.STRING,
            description: "The next part of the story or the result of the user's action. This should be engaging and descriptive."
        },
        status: {
            type: Type.STRING,
            description: "The current state of the game. It must be one of: 'CONTINUE', 'WIN', or 'LOSE'."
        }
    },
    required: ["text", "status"]
};

export const getCompassChallengeResponse = async (history: string[]): Promise<CompassChallengeResult> => {
    const systemInstruction = `You are a game master for a text-based adventure. The user is lost and needs to find a hidden treasure using only cardinal directions (North, East, South, West).
- Start by describing a scenario. When history is empty, this is the first turn.
- The user will provide a direction.
- You will describe what happens next.
- The path to the treasure should be a simple sequence of 3-5 correct directions. e.g., North, then East, then North again. Make up a new path for each game.
- If the user gives a correct direction, respond with a positive message and the next part of the story. The status should be 'CONTINUE'.
- If the user gives a wrong direction, they get one warning. After a second wrong direction, they lose. Respond with a consequence and update the status.
- If the user provides the final correct direction, they find the treasure. Respond with a winning message and set the status to 'WIN'.
- If the user makes two wrong moves, they are hopelessly lost. Respond with a losing message and set the status to 'LOSE'.
- Keep responses concise and focused on the adventure. The game should not be too easy or too hard.
- The conversation history will be provided. Your response should be the next logical step in the game.`;

    const contents = `Here is the story so far. Continue it based on the user's last move. If the history is empty, start the story.
--- HISTORY ---
${history.join('\n')}
--- END HISTORY ---

What happens next?`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: compassChallengeSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error in Compass Challenge:", error);
        return { text: "The connection to the spirit of adventure was lost. Please try again.", status: 'LOSE' };
    }
};
