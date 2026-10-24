export default function handler(_request, response) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const aiConfigured = Boolean(apiKey && apiKey !== 'your-gemini-api-key-here');

  return response.status(200).json({
    status: 'ok',
    ai: aiConfigured ? 'configured' : 'demo-mode',
  });
}
