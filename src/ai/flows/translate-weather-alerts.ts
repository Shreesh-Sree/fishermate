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
import {
  TranslateWeatherAlertsInputSchema,
  TranslateWeatherAlertsOutputSchema,
  type TranslateWeatherAlertsInput,
  type TranslateWeatherAlertsOutput,
} from '@/types';

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
