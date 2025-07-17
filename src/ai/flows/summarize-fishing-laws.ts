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
  output: {schema: z.string()},
  prompt: `You are an expert in Indian fishing laws. Summarize the fishing laws for the state of {{state}} in response to the following query: {{query}}.`,
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
      prompt: summary!,
    });

    if (!media) {
      throw new Error('no media returned');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {summary: summary!, audio};
  }
);
