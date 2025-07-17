'use server';

/**
 * @fileOverview A general purpose chatbot flow.
 * - chat - A function that handles a chat conversation.
 */

import {ai} from '@/ai/genkit';
import {ChatInputSchema, ChatOutputSchema, type ChatInput} from '@/ai/types';

export async function chat(input: ChatInput) {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful assistant.

{{#each history}}
{{#if (this.role === 'user')}}
User: {{{this.content}}}
{{else}}
Assistant: {{{this.content}}}
{{/if}}
{{/each}}

User: {{{message}}}
Assistant:`,
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
