import {z} from 'genkit';

// Chat Types
const HistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  history: z.array(HistoryItemSchema).describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  content: z.string().describe('The AI response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Safety Practices Types
export const TranslateSafetyPracticesInputSchema = z.object({
  query: z.string().describe('The query for safety practices at sea.'),
  targetLanguage: z.string().describe('The target language for translation.'),
});
export type TranslateSafetyPracticesInput = z.infer<typeof TranslateSafetyPracticesInputSchema>;

export const TranslateSafetyPracticesOutputSchema = z.object({
  translatedQuery: z.string().describe('The translated query.'),
  safetyGuidelines: z.string().describe('Relevant safety guidelines in the target language.'),
  audio: z.string().optional().describe('Audio URL of the guidelines (if available).'),
});
export type TranslateSafetyPracticesOutput = z.infer<typeof TranslateSafetyPracticesOutputSchema>;

// Fishing Laws Types
export const SummarizeFishingLawsInputSchema = z.object({
  state: z.string().min(1, "State is required").describe('The state for which to summarize fishing laws.'),
  query: z.string().min(1, "Query is required").describe('The user query about fishing laws.'),
});
export type SummarizeFishingLawsInput = z.infer<typeof SummarizeFishingLawsInputSchema>;

export const SummarizeFishingLawsOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the fishing laws for the given state.'),
  audio: z.string().optional().describe('Audio URL of the summary (if available).'),
});
export type SummarizeFishingLawsOutput = z.infer<typeof SummarizeFishingLawsOutputSchema>;

// Weather Alerts Types
export const TranslateWeatherAlertsInputSchema = z.object({
  weatherAlert: z.string().describe('The weather alert text to translate.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});
export type TranslateWeatherAlertsInput = z.infer<typeof TranslateWeatherAlertsInputSchema>;

export const TranslateWeatherAlertsOutputSchema = z.object({
  translatedAlert: z.string().describe('The translated weather alert.'),
});
export type TranslateWeatherAlertsOutput = z.infer<typeof TranslateWeatherAlertsOutputSchema>;
