'use server';

/**
 * @fileOverview A general purpose chatbot flow.
 * - chat - A function that handles a chat conversation.
 */

import {ai} from '@/ai/genkit';
import {ChatInputSchema, ChatOutputSchema, type ChatInput} from '@/types';

export async function chat(input: ChatInput) {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are a specialized AI assistant with expertise in fisheries, oceanography, and marine life. Your purpose is to provide accurate and helpful information to fisherfolk, marine biologists, and enthusiasts. When asked a question, provide concise and clear answers related to fish species, fishing techniques, marine ecosystems, ocean currents, weather patterns relevant to the sea, and conservation practices. Use your most up-to-date knowledge to answer real-time questions.

{{#each history}}
{{this.role}}: {{{this.content}}}
{{/each}}

user: {{{message}}}
assistant:`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
