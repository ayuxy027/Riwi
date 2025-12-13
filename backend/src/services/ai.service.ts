import { Groq } from 'groq-sdk';

const groq = new Groq();

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * Generic chat completion - pass your own messages/prompts
 */
export async function chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
): Promise<string> {
    const {
        model = 'llama-3.3-70b-versatile',
        temperature = 0.3,
        maxTokens = 256,
    } = options;

    const response = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_completion_tokens: maxTokens,
        stream: false,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
        throw new Error('Empty response from AI');
    }

    return content;
}

/**
 * Parse JSON from AI response
 */
export function parseJsonResponse<T>(response: string): T {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Invalid JSON in AI response');
    }
    return JSON.parse(jsonMatch[0]) as T;
}
