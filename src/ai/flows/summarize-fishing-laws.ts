'use server';

/**
 * @fileOverview A flow that summarizes fishing laws for a given state.
 *
 * - summarizeFishingLaws - A function that handles the summarization of fishing laws.
 * - SummarizeFishingLawsInput - The input type for the summarizeFishingLaws function.
 * - SummarizeFishingLawsOutput - The return type for the summarizeFishingLaws function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';


const SummarizeFishingLawsInputSchema = z.object({
  state: z.string().describe('The state for which to summarize fishing laws.'),
  query: z.string().describe('The user query about fishing laws.'),
});
export type SummarizeFishingLawsInput = z.infer<typeof SummarizeFishingLawsInputSchema>;

const SummarizeFishingLawsOutputSchema = z.object({
  summary: z.string().describe('A summary of the fishing laws for the given state.'),
  audio: z.string().describe('Audio of the summary of the fishing laws.'),
});
export type SummarizeFishingLawsOutput = z.infer<typeof SummarizeFishingLawsOutputSchema>;

export async function summarizeFishingLaws(input: SummarizeFishingLawsInput): Promise<SummarizeFishingLawsOutput> {
  return summarizeFishingLawsFlow(input);
}

const summarizeFishingLawsPrompt = ai.definePrompt({
  name: 'summarizeFishingLawsPrompt',
  input: {schema: SummarizeFishingLawsInputSchema},
  output: {schema: z.string().nullable()},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an expert on Indian fishing laws and marine regulations. Provide a comprehensive and accurate summary of the fishing laws for the state of {{state}} based on the following query:

Query: "{{query}}"

Your response should:
- Be specific to {{state}} state regulations
- Include relevant legal details, restrictions, and requirements
- Mention applicable penalties or consequences
- Be clear and easy to understand for fisherfolk
- Include practical guidance where appropriate

If specific information for {{state}} is not available, provide general Indian fishing law guidelines and clearly state when information is general rather than state-specific.`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const summarizeFishingLawsFlow = ai.defineFlow(
  {
    name: 'summarizeFishingLawsFlow',
    inputSchema: SummarizeFishingLawsInputSchema,
    outputSchema: SummarizeFishingLawsOutputSchema,
  },
  async input => {
    const {output: summary} = await summarizeFishingLawsPrompt(input);
    const validSummary = summary ?? "I'm sorry, I was unable to generate a summary for your query. Please try again with a different question or check if the state name is correct.";

    // Generate audio using the same AI instance
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
      prompt: validSummary,
    });

    if (!media) {
      throw new Error('no media returned');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {summary: validSummary, audio};
  }
);
