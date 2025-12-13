// Request/Response Types

export interface ValidateFeedbackRequest {
    text: string;
    locationId?: string;
}

export interface ValidateFeedbackResponse {
    isValid: boolean;
    reason?: string;
    confidence?: number;
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
