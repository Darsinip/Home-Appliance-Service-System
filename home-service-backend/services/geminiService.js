const DEFAULT_MODEL = 'gemini-2.5-flash';

const generateGeminiReply = async ({ systemInstruction, history }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || DEFAULT_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: history.map(({ role, text }) => ({
            role: role === 'assistant' ? 'model' : 'user',
            parts: [{ text }],
          })),
          generationConfig: { temperature: 0.25, maxOutputTokens: 700, responseMimeType: 'text/plain' },
        }),
      }
    );

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || 'Gemini request failed');

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();
    if (!text) throw new Error('Gemini returned an empty response');
    return text;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { generateGeminiReply };
