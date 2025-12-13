import type { Request, Response } from 'express';
import { chat, parseJsonResponse } from '../services/ai.service.js';
import type { ValidateFeedbackRequest, ValidateFeedbackResponse, ApiResponse } from '../types/index.js';

const VALIDATION_PROMPT = `You are a review quality analyzer. Evaluate the given review text for authenticity and quality.

SCORING CRITERIA (each 0-25 points, total 0-100):
1. AUTHENTICITY (0-25): Does it sound like a genuine personal experience? Not spam/fake?
2. HELPFULNESS (0-25): Does it provide useful information for others?
3. DETAIL (0-25): Are there specific details (names, features, comparisons)?
4. CLARITY (0-25): Is it well-written and easy to understand?

VALID REVIEWS (accept these):
- "The hotel had amazing rooftop views, breakfast was included"
- "Fast transactions, low fees, great UI"
- "Service was slow but food was excellent"
- "5 stars, best experience ever, highly recommend"

INVALID REVIEWS (reject these):
- Random gibberish like "asdfghjkl"
- Unrelated text like "my cat is cute"
- Empty or meaningless text
- Just numbers or symbols

Be LENIENT for isValid - if it sounds like someone describing any experience, accept it.
Be STRICT for scoring - only high-quality detailed reviews get high scores.

Respond ONLY with JSON:
{
  "isValid": boolean,
  "reason": "brief reason if invalid",
  "confidence": 0.0-1.0,
  "score": 0-100,
  "breakdown": {
    "authenticity": 0-25,
    "helpfulness": 0-25,
    "detail": 0-25,
    "clarity": 0-25
  },
  "feedback": ["suggestion 1", "suggestion 2"]
}`;

interface ValidationResult {
    isValid: boolean;
    reason: string;
    confidence: number;
    score: number;
    breakdown: {
        authenticity: number;
        helpfulness: number;
        detail: number;
        clarity: number;
    };
    feedback: string[];
}

/**
 * POST /api/feedback/validate
 */
export async function validateFeedback(
    req: Request<object, ApiResponse<ValidateFeedbackResponse>, ValidateFeedbackRequest>,
    res: Response<ApiResponse<ValidateFeedbackResponse>>
): Promise<void> {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
        res.status(400).json({
            success: false,
            error: { code: 'INVALID_INPUT', message: 'Text field is required' },
            timestamp: new Date().toISOString(),
        });
        return;
    }

    if (text.trim().length < 3) {
        res.status(200).json({
            success: true,
            data: { isValid: false, reason: 'Text too short', confidence: 1 },
            timestamp: new Date().toISOString(),
        });
        return;
    }

    try {
        const response = await chat([
            { role: 'system', content: VALIDATION_PROMPT },
            { role: 'user', content: text },
        ]);

        const result = parseJsonResponse<ValidationResult>(response);

        const responseData: ValidateFeedbackResponse = {
            isValid: result.isValid,
            confidence: result.confidence,
            score: result.score,
            breakdown: result.breakdown,
            feedback: result.feedback,
        };

        if (!result.isValid) {
            responseData.reason = result.reason;
        }

        res.status(200).json({
            success: true,
            data: responseData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date().toISOString(),
        });
    }
}
