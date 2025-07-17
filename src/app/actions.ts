"use server";

import {
  translateSafetyPractices,
  type TranslateSafetyPracticesInput,
  type TranslateSafetyPracticesOutput,
} from "@/ai/flows/translate-safety-practices";
import {
  summarizeFishingLaws,
  type SummarizeFishingLawsInput,
  type SummarizeFishingLawsOutput,
} from "@/ai/flows/summarize-fishing-laws";
import { z } from "zod";

const safetyTipsSchema = z.object({
  query: z.string(),
  targetLanguage: z.string(),
});

const fishingLawsSchema = z.object({
  query: z.string(),
  state: z.string(),
});

export async function handleSafetyTips(
  data: TranslateSafetyPracticesInput
): Promise<TranslateSafetyPracticesOutput> {
  const validatedData = safetyTipsSchema.parse(data);
  const result = await translateSafetyPractices(validatedData);
  return result;
}

export async function handleFishingLaws(
  data: SummarizeFishingLawsInput
): Promise<SummarizeFishingLawsOutput> {
  const validatedData = fishingLawsSchema.parse(data);
  const result = await summarizeFishingLaws(validatedData);
  return result;
}
