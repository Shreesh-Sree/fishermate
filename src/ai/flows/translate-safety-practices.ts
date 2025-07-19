// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview A translation AI agent, which takes a request for safety practices and translates the request, returning
 * the translated request and associated safety guidelines in the requested language.
 *
 * - translateSafetyPractices - A function that handles the translation and information retrieval process.
 * - TranslateSafetyPracticesInput - The input type for the translateSafetyPractices function.
 * - TranslateSafetyPracticesOutput - The return type for the translateSafetyPractices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  TranslateSafetyPracticesInputSchema,
  TranslateSafetyPracticesOutputSchema,
  type TranslateSafetyPracticesInput,
  type TranslateSafetyPracticesOutput,
} from '@/types';

export async function translateSafetyPractices(
  input: TranslateSafetyPracticesInput
): Promise<TranslateSafetyPracticesOutput> {
  return translateSafetyPracticesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateSafetyPracticesPrompt',
  input: {schema: TranslateSafetyPracticesInputSchema},
  output: {schema: TranslateSafetyPracticesOutputSchema},
  prompt: `You are a translation AI agent specializing in translating queries related to safety practices at sea and providing relevant safety guidelines in the target language.

  Translate the user's query into the target language and provide safety guidelines related to the query in the target language.  Here is the user's query and the target language:

  Query: {{{query}}}
  Target Language: {{{targetLanguage}}}

  Respond with the translation of the query, and the safety guidelines in the target language.
  `,
});

const translateSafetyPracticesFlow = ai.defineFlow(
  {
    name: 'translateSafetyPracticesFlow',
    inputSchema: TranslateSafetyPracticesInputSchema,
    outputSchema: TranslateSafetyPracticesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
