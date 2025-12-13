import { useState, useEffect } from "react";


interface WriteReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (review: any) => void;
}

interface AIAnalysis {
    score: number;
    feedback: string[];
    status: "Excellent" | "Good" | "Fair" | "Poor";
}

const WriteReviewModal = ({ isOpen, onClose, onSubmit }: WriteReviewModalProps) => {
    const [product, setProduct] = useState("");
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            setProduct("");
            setRating(0);
            setContent("");
            setAiResult(null);
        }
    }, [isOpen]);

    const handleAnalyze = async () => {
        if (content.length < 20) return;

        setIsAnalyzing(true);

        // Mock AI Analysis Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple mock logic for demo
        const lengthScore = Math.min(content.length / 2, 50);
        const keywordBonus = /fees|speed|ui|ux|transaction/i.test(content) ? 20 : 0;
        const score = Math.min(Math.round(40 + lengthScore + keywordBonus), 98);

        let status: AIAnalysis["status"] = "Poor";
        if (score >= 90) status = "Excellent";
        else if (score >= 70) status = "Good";
        else if (score >= 50) status = "Fair";

        const feedback = [];
        if (content.length < 100) feedback.push("Try adding more specific details to increase your score.");
        if (!/transaction|speed|cost/i.test(content)) feedback.push("Mentioning transaction details (speed, cost) helps other users.");
        if (score > 80) feedback.push("Great job! This review is highly detailed and helpful.");

        setAiResult({ score, feedback, status });
        setIsAnalyzing(false);
    };

    const handleSubmit = () => {
        if (!aiResult) return;

        onSubmit({
            product,
            rating,
            content,
            qualityScore: aiResult.score,
            timestamp: Date.now(),
            status: "Pending" // Starts as pending until "on-chain" verification
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {/* Product Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product / Protocol</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6E54FF] focus:border-[#6E54FF] outline-none transition-all placeholder:text-gray-400"
                            placeholder="e.g. Uniswap V3, Monad Wallet"
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                        />
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${rating >= star ? "bg-yellow-400 text-white shadow-md scale-105" : "bg-gray-100 text-gray-300 hover:bg-gray-200"
                                        }`}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6E54FF] focus:border-[#6E54FF] outline-none transition-all h-32 resize-none placeholder:text-gray-400"
                            placeholder="Share details about usability, transaction speed, fees, and support..."
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                if (aiResult) setAiResult(null); // Reset analysis on edit
                            }}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{content.length} characters</span>
                            {!aiResult && content.length > 20 && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="text-sm font-medium text-[#6E54FF] hover:text-[#5a42de] flex items-center gap-1 transition-colors"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>✨ Analyze with AI</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* AI Feedback Section */}
                    {aiResult && (
                        <div className={`mb-6 p-4 rounded-xl border ${aiResult.status === "Excellent" ? "bg-green-50 border-green-200" :
                            aiResult.status === "Good" ? "bg-blue-50 border-blue-200" :
                                "bg-yellow-50 border-yellow-200"
                            } animate-fade-in-up`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className={`font-bold ${aiResult.status === "Excellent" ? "text-green-800" :
                                        aiResult.status === "Good" ? "text-blue-800" :
                                            "text-yellow-800"
                                        }`}>AI Quality Score: {aiResult.score}/100</h3>
                                    <p className="text-xs opacity-80">{aiResult.status} Quality Review</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${aiResult.status === "Excellent" ? "bg-green-200 text-green-800" :
                                    aiResult.status === "Good" ? "bg-blue-200 text-blue-800" :
                                        "bg-yellow-200 text-yellow-800"
                                    }`}>
                                    +{(aiResult.score * 0.5).toFixed(0)} MR Reward Est.
                                </div>
                            </div>

                            {aiResult.feedback.length > 0 && (
                                <div className="space-y-1">
                                    {aiResult.feedback.map((tip, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm opacity-90">
                                            <span>•</span>
                                            <span>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!aiResult || !product || rating === 0}
                        className={`px-6 py-2 text-white font-medium rounded-xl transition-all shadow-lg ${!aiResult || !product || rating === 0
                            ? "bg-gray-300 cursor-not-allowed shadow-none"
                            : "bg-[#6E54FF] hover:bg-[#5a42de] hover:shadow-[#6E54FF]/30 hover:-translate-y-0.5"
                            }`}
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WriteReviewModal;
