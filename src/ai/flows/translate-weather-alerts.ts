// src/ai/flows/translate-weather-alerts.ts
'use server';

/**
 * @fileOverview A flow to translate weather alerts to a specified language.
 *
 * - translateWeatherAlerts - A function that translates weather alerts.
 * - TranslateWeatherAlertsInput - The input type for the translateWeatherAlerts function.
 * - TranslateWeatherAlertsOutput - The return type for the translateWeatherAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateWeatherAlertsInputSchema = z.object({
  weatherAlert: z.string().describe('The weather alert text to translate.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});
export type TranslateWeatherAlertsInput = z.infer<typeof TranslateWeatherAlertsInputSchema>;

const TranslateWeatherAlertsOutputSchema = z.object({
  translatedAlert: z.string().describe('The translated weather alert.'),
});
export type TranslateWeatherAlertsOutput = z.infer<typeof TranslateWeatherAlertsOutputSchema>;

export async function translateWeatherAlerts(input: TranslateWeatherAlertsInput): Promise<TranslateWeatherAlertsOutput> {
  return translateWeatherAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateWeatherAlertsPrompt',
  input: {schema: TranslateWeatherAlertsInputSchema},
  output: {schema: TranslateWeatherAlertsOutputSchema},
  prompt: `Translate the following weather alert to {{targetLanguage}}:\n\n{{weatherAlert}}`,
});

const translateWeatherAlertsFlow = ai.defineFlow(
  {
    name: 'translateWeatherAlertsFlow',
    inputSchema: TranslateWeatherAlertsInputSchema,
    outputSchema: TranslateWeatherAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
