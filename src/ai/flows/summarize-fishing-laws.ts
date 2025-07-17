'use server';

/**
 * @fileOverview A flow that summarizes fishing laws for a given state.
 * Rebuilt for better reliability and error handling.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFishingLawsInputSchema = z.object({
  state: z.string().min(1, "State is required").describe('The state for which to summarize fishing laws.'),
  query: z.string().min(1, "Query is required").describe('The user query about fishing laws.'),
});
export type SummarizeFishingLawsInput = z.infer<typeof SummarizeFishingLawsInputSchema>;

const SummarizeFishingLawsOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the fishing laws for the given state.'),
  audio: z.string().optional().describe('Audio URL of the summary (if available).'),
});
export type SummarizeFishingLawsOutput = z.infer<typeof SummarizeFishingLawsOutputSchema>;

export async function summarizeFishingLaws(input: SummarizeFishingLawsInput): Promise<SummarizeFishingLawsOutput> {
  // Validate input before processing
  if (!input || !input.state || !input.query) {
    return {
      summary: "Invalid input: Please provide both a state and a query about fishing laws.",
      audio: undefined,
    };
  }
  
  // Ensure strings are properly trimmed
  const cleanInput = {
    state: input.state.trim(),
    query: input.query.trim(),
  };
  
  if (!cleanInput.state || !cleanInput.query) {
    return {
      summary: "Please provide both a valid state and a question about fishing laws.",
      audio: undefined,
    };
  }
  
  return summarizeFishingLawsFlow(cleanInput);
}

const summarizeFishingLawsPrompt = ai.definePrompt({
  name: 'summarizeFishingLawsPrompt',
  input: {schema: SummarizeFishingLawsInputSchema},
  output: {schema: z.string()},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an expert on Indian fishing laws and marine regulations with comprehensive knowledge of state-specific and central government fishing policies.

State: {{state}}
Query: "{{query}}"

Please provide a detailed and accurate response about fishing laws for {{state}} based on the query. Your response should include:

1. **State-specific regulations** for {{state}} if available
2. **Central/National laws** that apply across India
3. **Practical guidance** for fisherfolk
4. **Penalties and consequences** for violations
5. **Licensing and permit requirements**
6. **Seasonal restrictions and banned periods**
7. **Equipment and method restrictions**
8. **Marine protected areas and restricted zones**

If specific information for {{state}} is not available, clearly state this and provide general Indian fishing law guidelines. Always prioritize accuracy and include relevant legal references where possible.

Format your response in clear, easy-to-understand language suitable for fisherfolk communities.`,
});

const summarizeFishingLawsFlow = ai.defineFlow(
  {
    name: 'summarizeFishingLawsFlow',
    inputSchema: SummarizeFishingLawsInputSchema,
    outputSchema: SummarizeFishingLawsOutputSchema,
  },
  async (input) => {
    try {
      // Additional validation within the flow
      if (!input?.state || !input?.query || typeof input.state !== 'string' || typeof input.query !== 'string') {
        console.error('Invalid input to fishing laws flow:', input);
        return {
          summary: "Invalid input provided. Please ensure both state and query are valid strings.",
          audio: undefined,
        };
      }

      const {output: summary} = await summarizeFishingLawsPrompt(input);
      
      if (!summary || typeof summary !== 'string') {
        throw new Error('No valid summary generated from AI model');
      }

      // Try to generate audio, but don't fail if it doesn't work
      let audioUrl: string | undefined;
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.5-flash-preview-tts',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {voiceName: 'Algenib'},
              },
            },
          },
          prompt: summary,
        });

        if (media?.url) {
          audioUrl = media.url;
        }
      } catch (audioError) {
        console.warn('Audio generation failed:', audioError);
        // Continue without audio
      }

      return {
        summary: summary,
        audio: audioUrl,
      };
    } catch (error) {
      console.error('Fishing laws flow error:', error);
      
      // Return a fallback response
      return {
        summary: `I apologize, but I'm currently unable to provide specific fishing law information for ${input.state}. Here are some general guidelines:

**General Indian Fishing Laws:**
- Commercial fishing requires valid licenses from the Department of Fisheries
- Seasonal bans typically occur during monsoon months (varies by state)
- Minimum mesh size regulations apply to fishing nets
- Marine protected areas have specific restrictions
- Deep-sea fishing requires additional permits

**Recommended Actions:**
1. Contact your local Department of Fisheries office for ${input.state}-specific regulations
2. Check with local fishermen associations for current guidelines
3. Verify seasonal restrictions before planning fishing activities
4. Ensure all required licenses and permits are current

For the most accurate and up-to-date information, please consult official government sources or local fisheries authorities.`,
        audio: undefined,
      };
    }
  }
);
