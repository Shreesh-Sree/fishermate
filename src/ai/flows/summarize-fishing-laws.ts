'use server';

/**
 * @fileOverview A flow that summarizes fishing laws for a given state.
 * Rebuilt for better reliability and error handling.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  SummarizeFishingLawsInputSchema,
  SummarizeFishingLawsOutputSchema,
  type SummarizeFishingLawsInput,
  type SummarizeFishingLawsOutput,
} from '@/types';

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
  output: {schema: z.string().min(1, "Response must not be empty")},
  model: 'googleai/gemini-1.5-flash',
  config: {
    temperature: 0.2,
    maxOutputTokens: 1500,
    topP: 0.8,
  },
  prompt: `You are an expert on Indian fishing laws and marine regulations.

State: {{state}}
User Question: {{query}}

Provide a comprehensive response about fishing laws for {{state}}. Include:

1. State-specific regulations for {{state}}
2. Central/National laws applicable across India  
3. Practical guidance for fisherfolk
4. Licensing and permit requirements
5. Seasonal restrictions and banned periods
6. Equipment and method restrictions

If specific {{state}} information is unavailable, provide general Indian fishing guidelines and clearly state this limitation.

Use clear, simple language suitable for fishing communities. Always provide a substantive response - never return empty content.`,
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

      console.log('Calling AI prompt with input:', input);
      
      let summary: string | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      // Retry logic for AI prompt calls
      while (retryCount < maxRetries && !summary) {
        try {
          const result = await summarizeFishingLawsPrompt(input);
          summary = result.output;
          
          if (!summary || summary.trim().length === 0) {
            throw new Error(`AI returned empty response on attempt ${retryCount + 1}`);
          }
          
          console.log('AI response received:', summary ? 'success' : 'empty');
        } catch (promptError) {
          console.error(`AI prompt attempt ${retryCount + 1} failed:`, promptError);
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
      
      if (!summary || typeof summary !== 'string' || summary.trim().length === 0) {
        console.error('All AI prompt attempts failed or returned empty response');
        throw new Error('AI model failed to generate a valid response after multiple attempts');
      }

      // Try to generate audio, but don't fail if it doesn't work
      let audioUrl: string | undefined;
      try {
        if (summary && summary.length > 50) { // Only try audio for substantial content
          const {media} = await ai.generate({
            model: 'googleai/gemini-2.0-flash-thinking-exp',
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {voiceName: 'Algenib'},
                },
              },
            },
            prompt: summary.substring(0, 1000), // Limit length for audio
          });

          if (media?.url) {
            audioUrl = media.url;
          }
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
      
      // Use comprehensive fallback response with state-specific information
      return {
        summary: generateFallbackFishingLawsInfo(input.state, input.query),
        audio: undefined,
      };
    }
  }
);

// Backup function for generating fishing laws information without AI
const generateFallbackFishingLawsInfo = (state: string, query: string): string => {
  const stateInfo = getFishingLawsByState(state);
  
  return `**Fishing Laws Information for ${state}**

${stateInfo}

**Your Question:** "${query}"

**General Indian Fishing Laws:**

**🏛️ Central Government Regulations:**
- Marine Fishing Regulation Acts apply to all coastal states
- Commercial fishing requires licenses from Department of Fisheries
- Deep-sea fishing beyond 12 nautical miles needs special permits
- Boat registration mandatory for all mechanized vessels

**📅 Seasonal Restrictions:**
- Monsoon fishing ban typically from June to August (varies by state)
- Ban periods designed to protect fish breeding seasons
- Emergency fishing may be allowed with special permissions
- Dates announced annually by state fisheries departments

**🎣 Equipment Regulations:**
- Minimum mesh size requirements (usually 35mm for trawl nets)
- Prohibition of certain destructive fishing methods
- LED lights and fish aggregating devices regulated
- GPS and communication equipment mandatory for deep-sea boats

**⚖️ Compliance Requirements:**
- Valid fishing license and boat registration
- Adherence to gear and mesh size restrictions
- Compliance with seasonal fishing bans
- Proper fish landing documentation

**🚨 Penalties:**
- Violations can result in fines ranging from ₹5,000 to ₹50,000
- Repeat offenses may lead to license cancellation
- Illegal fishing equipment may be confiscated
- Criminal charges for serious violations

**📞 Contact Information:**
- Local Fisheries Office: Contact your district fisheries department
- State Fisheries Department: Check official state government websites
- Central Marine Fisheries Research Institute (CMFRI) for technical guidance

**Important:** Laws change frequently. Always verify current regulations with official sources before fishing activities.`;
};

// State-specific information helper
const getFishingLawsByState = (state: string): string => {
  const stateData: { [key: string]: string } = {
    'Andhra Pradesh': 'Andhra Pradesh Marine Fishing Regulation Act, 1995 applies. Fishing ban typically from April 15 to June 14.',
    'Tamil Nadu': 'Tamil Nadu Marine Fishing Regulation Act, 1983 governs fishing activities. Ban period usually April 15 to June 14.',
    'Kerala': 'Kerala Marine Fishing Regulation Act, 1980 is applicable. Monsoon ban from June 15 to July 31.',
    'Karnataka': 'Karnataka Marine Fishing Regulation Act, 1986 applies. Fishing ban from June 1 to July 31.',
    'Goa': 'Goa Marine Fishing Regulation Rules apply. Monsoon ban typically from June 1 to July 31.',
    'Maharashtra': 'Maharashtra Marine Fishing Regulation Act, 1981 governs fishing. Ban period usually June 1 to August 31.',
    'Gujarat': 'Gujarat Marine Fishing Regulation Act, 2003 applies. Fishing ban from June 1 to August 14.',
    'Odisha': 'Odisha Marine Fishing Regulation Act, 1982 is applicable. Ban period April 1 to May 31.',
    'West Bengal': 'West Bengal Marine Fishing Regulation Act, 1993 applies. Fishing restrictions during monsoon season.',
    'Puducherry': 'Puducherry Marine Fishing Regulation Rules apply similar to Tamil Nadu regulations.',
  };

  return stateData[state] || `Specific regulations for ${state} should be obtained from the local Department of Fisheries. General Indian fishing laws apply.`;
};
