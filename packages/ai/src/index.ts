import { streamText, type StreamTextResult } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
import { ASSISTANT_RULES } from './assistant.config';

const ollama = {
  baseURL: process.env.OLLAMA_BASE_URL as string,
  model: process.env.OLLAMA_BASE_MODEL as string,
};

export async function generateAssistantStream({
  prompt,
  history = [],
  isAdmin,
  tools,
  locale,
}: {
  prompt: string;
  history: any[];
  isAdmin: boolean;
  tools?: any;
  locale: string;
}): Promise<StreamTextResult<any, any>> {
  const ollamaProvider = createOllama({
    baseURL: ollama.baseURL,
  });
  const now = new Date().toISOString();

  const languageNames: Record<string, string> = {
    ru: 'Russian',
    en: 'English',
    uk: 'Ukrainian',
  };
  const targetLanguage = languageNames[locale] || 'English';

  const systemPrompt = `
    ${ASSISTANT_RULES.GENERAL(now)}
    ${isAdmin ? ASSISTANT_RULES.ADMIN : ASSISTANT_RULES.WEBSITE}
    
   [STRICT FORMATTING]
    1. Respond in ${targetLanguage}.
    2. Use **bullet point lists** for data. Do NOT use tables.
    3. Format: "- **Email**: \`address\` | **Role**: \`ROLE\`"
    4. Keep emails and roles in English.
  `;

  return (streamText as any)({
    model: ollamaProvider(ollama.model),
    system: systemPrompt,
    messages: [...history.slice(-10), { role: 'user', content: prompt }],
    tools: tools,
    maxSteps: 5,
    executeRemoteTools: true,
    toolChoice: 'auto',
    temperature: 0.7,
  });
}
