// Request/Response Types

export interface ValidateFeedbackRequest {
    text: string;
    locationId?: string;
}

export interface ValidateFeedbackResponse {
    isValid: boolean;
    reason?: string;
    confidence?: number;
    score?: number;           // 0-100 quality score
    feedback?: string[];      // Improvement suggestions
    breakdown?: {
        authenticity: number; // 0-25
        helpfulness: number;  // 0-25
        detail: number;       // 0-25
        clarity: number;      // 0-25
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    timestamp: string;
}

// AI Service Types
export interface AIValidationResult {
    isValid: boolean;
    reason: string;
    confidence: number;
}
