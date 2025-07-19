"use server";

import { translateSafetyPractices } from "@/ai/flows/translate-safety-practices";
import { summarizeFishingLaws } from "@/ai/flows/summarize-fishing-laws";
import { chat } from "@/ai/flows/chatbot-flow";
import { z } from "zod";
import { 
  ChatInputSchema, 
  type ChatInput, 
  type ChatOutput,
  type TranslateSafetyPracticesInput,
  type TranslateSafetyPracticesOutput,
  type SummarizeFishingLawsInput,
  type SummarizeFishingLawsOutput,
} from "@/types";

const safetyTipsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  targetLanguage: z.string().min(1, "Target language is required"),
});

const fishingLawsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  state: z.string().min(1, "State is required"),
});

export async function handleSafetyTips(
  data: TranslateSafetyPracticesInput
): Promise<TranslateSafetyPracticesOutput> {
  try {
    // Validate and clean the input data
    const cleanedData = {
      query: data.query?.trim() || "",
      targetLanguage: data.targetLanguage?.trim() || "",
    };
    
    // Check for empty values after cleaning
    if (!cleanedData.query || !cleanedData.targetLanguage) {
      return {
        translatedQuery: cleanedData.query || "Please provide a safety query",
        safetyGuidelines: "Please provide both a safety query and target language to get safety guidelines.",
        audio: undefined,
      };
    }
    
    const validatedData = safetyTipsSchema.parse(cleanedData);
    const result = await translateSafetyPractices(validatedData);
    return result;
  } catch (error) {
    console.error("Error in handleSafetyTips:", error);
    return {
      translatedQuery: data.query || "Safety query",
      safetyGuidelines: "Sorry, there was an error processing your safety request. Please try again.",
      audio: undefined,
    };
  }
}

export async function handleFishingLaws(
  data: SummarizeFishingLawsInput
): Promise<SummarizeFishingLawsOutput> {
  try {
    // Validate and clean the input data
    const cleanedData = {
      query: data.query?.trim() || "",
      state: data.state?.trim() || "",
    };
    
    // Check for empty values after cleaning
    if (!cleanedData.state || !cleanedData.query) {
      return {
        summary: "Please provide both a state and a question to get fishing law information.",
        audio: undefined,
      };
    }
    
    const validatedData = fishingLawsSchema.parse(cleanedData);
    const result = await summarizeFishingLaws(validatedData);
    return result;
  } catch (error) {
    console.error("Error in handleFishingLaws:", error);
    return {
      summary: "Sorry, there was an error processing your fishing laws request. Please try again with a valid state and question.",
      audio: undefined,
    };
  }
}

export async function handleChat(data: ChatInput): Promise<ChatOutput> {
  const validatedData = ChatInputSchema.parse(data);
  const result = await chat(validatedData);
  return result;
}
