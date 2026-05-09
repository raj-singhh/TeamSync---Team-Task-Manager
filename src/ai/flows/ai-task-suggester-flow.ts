'use server';
/**
 * @fileOverview An AI agent that suggests sub-tasks and action items for a given project description.
 *
 * - aiTaskSuggester - A function that handles the AI task suggestion process.
 * - AITaskSuggesterInput - The input type for the aiTaskSuggester function.
 * - AITaskSuggesterOutput - The return type for the aiTaskSuggester function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITaskSuggesterInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the project.'),
});
export type AITaskSuggesterInput = z.infer<typeof AITaskSuggesterInputSchema>;

const AITaskSuggesterOutputSchema = z.object({
  subTasks: z.array(z.string()).describe('A list of suggested sub-tasks to break down the project.'),
  actionItems: z.array(z.string()).describe('A list of specific action items required to complete the sub-tasks.'),
});
export type AITaskSuggesterOutput = z.infer<typeof AITaskSuggesterOutputSchema>;

export async function aiTaskSuggester(input: AITaskSuggesterInput): Promise<AITaskSuggesterOutput> {
  return aiTaskSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTaskSuggesterPrompt',
  input: {schema: AITaskSuggesterInputSchema},
  output: {schema: AITaskSuggesterOutputSchema},
  prompt: `You are an experienced project manager. Your task is to break down a given project description into a list of logical sub-tasks and detailed action items.

Focus on creating actionable and distinct items.

Project Description:
{{{projectDescription}}} `,
});

const aiTaskSuggesterFlow = ai.defineFlow(
  {
    name: 'aiTaskSuggesterFlow',
    inputSchema: AITaskSuggesterInputSchema,
    outputSchema: AITaskSuggesterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
