import type { Request, Response } from 'express';
import { chat, parseJsonResponse } from '../services/ai.service.js';
import type { ValidateFeedbackRequest, ValidateFeedbackResponse, ApiResponse } from '../types/index.js';

const VALIDATION_PROMPT = `You are a simple feedback validator. Determine if the text sounds like a review or feedback about a place/location.

VALID examples (accept these):
- "this place is nice, must visit place"
- "great food"
- "loved the ambiance"
- "worst experience ever"
- "5 stars, highly recommend"
- "the service was slow"
- "beautiful view"

INVALID examples (reject these):
- Random gibberish like "asdfghjkl"
- Completely unrelated text like "my cat is cute"
- Empty or meaningless text
- Just numbers or symbols

Be LENIENT. If it sounds like someone describing an experience at a place, mark it valid.

Respond ONLY with JSON:
{"isValid": boolean, "reason": "brief reason", "confidence": 0.0-1.0}`;

interface ValidationResult {
    isValid: boolean;
    reason: string;
    confidence: number;
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
