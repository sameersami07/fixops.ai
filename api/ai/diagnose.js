import { GoogleGenAI } from '@google/genai';

const MAX_PROBLEM_LENGTH = 5000;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return response.status(503).json({
      error: 'Gemini is not configured. Set GEMINI_API_KEY in Vercel Project Settings, then redeploy.',
    });
  }

  const { equipmentName, equipmentCode, equipmentCategory, problem, maintenanceHistory } = request.body || {};
  if (typeof problem !== 'string' || !problem.trim()) {
    return response.status(400).json({ error: 'A problem description is required.' });
  }
  if (problem.length > MAX_PROBLEM_LENGTH) {
    return response.status(413).json({ error: `Problem description must be ${MAX_PROBLEM_LENGTH} characters or fewer.` });
  }

  const prompt = `You are an expert industrial equipment maintenance engineer AI assistant for FixOps AI platform.

Equipment Details:
- Name: ${equipmentName || 'Unknown Equipment'}
- Code: ${equipmentCode || 'N/A'}
- Category: ${equipmentCategory || 'General'}
- Recent Maintenance History: ${maintenanceHistory || 'No history available'}

Problem Description:
${problem}

Provide a comprehensive, safety-focused maintenance diagnostic as valid JSON only, with these fields:
{
  "possibleCauses": ["cause1", "cause2", "cause3"],
  "inspectionSteps": ["step1", "step2", "step3"],
  "safetyConsiderations": ["safety1", "safety2", "safety3"],
  "estimatedDowntime": "X-Y hours",
  "suggestedPriority": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommendedParts": ["part1", "part2"],
  "maintenanceHistory": "Brief context about this type of issue",
  "disclaimer": "Brief professional disclaimer"
}
Return only the JSON object without markdown.`;

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    const text = result.text?.trim();
    if (!text) {
      console.error('Gemini returned an empty diagnostic response.');
      return response.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
    }

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return response.status(200).json({ response: cleanText, isDemo: false });
  } catch (error) {
    const status = typeof error?.status === 'number' ? error.status : undefined;
    console.error('Gemini diagnostic request failed.', status ? `Upstream status: ${status}` : '');
    return response.status(502).json({
      error: 'Gemini could not complete the diagnostic. Check that the Vercel GEMINI_API_KEY is valid and try again.',
    });
  }
}
