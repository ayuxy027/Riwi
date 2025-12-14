import { useEffect, useState } from "react";

export interface TransactionStatus {
  status: "pending" | "success" | "error";
  message: string;
  txHash?: string;
}

interface TransactionToastProps {
  transaction: TransactionStatus | null;
  onClose: () => void;
}

export const TransactionToast = ({ transaction, onClose }: TransactionToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (transaction) {
      setIsVisible(true);
      if (transaction.status === "success" || transaction.status === "error") {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [transaction, onClose]);

  if (!transaction || !isVisible) return null;

  const bgColor = 
    transaction.status === "success" ? "bg-green-500" :
    transaction.status === "error" ? "bg-red-500" :
    "bg-blue-500";

  const icon = 
    transaction.status === "success" ? "✓" :
    transaction.status === "error" ? "✕" :
    "⟳";

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
      <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md`}>
        <div className={`text-2xl ${transaction.status === "pending" ? "animate-spin" : ""}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{transaction.message}</p>
          {transaction.txHash && (
            <a
              href={`https://testnet-explorer.monad.xyz/tx/${transaction.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline opacity-90 hover:opacity-100 mt-1 block"
            >
              View on Explorer
            </a>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

