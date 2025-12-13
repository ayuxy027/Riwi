import { type Property } from "../data/mockProperties";

interface PropertyCardProps {
    property: Property;
    onWriteReview: (property: Property) => void;
    disabled?: boolean;
}

const TypeIcons: Record<Property["type"], React.ReactNode> = {
    hotel: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
            <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/>
            <path d="M8 7h.01"/><path d="M16 7h.01"/><path d="M12 7h.01"/>
            <path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M8 11h.01"/>
        </svg>
    ),
    restaurant: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/>
            <path d="M18 22v-7"/>
        </svg>
    ),
    attraction: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="m16 16-4-4-4 4"/>
        </svg>
    ),
    service: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    protocol: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/>
        </svg>
    ),
};

const TypeColors: Record<Property["type"], { bg: string; text: string; border: string }> = {
    hotel: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    restaurant: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
    attraction: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    service: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    protocol: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
};

const PropertyCard = ({ property, onWriteReview, disabled }: PropertyCardProps) => {
    const typeColor = TypeColors[property.type];
    const typeIcon = TypeIcons[property.type];

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-[#6E54FF]/20 transition-all duration-300 flex flex-col">
            {/* Image/Placeholder Header */}
            <div className={`h-36 ${typeColor.bg} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                    <div className="scale-[4] text-current">
                        {typeIcon}
                    </div>
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeColor.bg} ${typeColor.text} ${typeColor.border} border backdrop-blur-sm`}>
                        {property.category}
                    </span>
                </div>
                {/* Type Icon */}
                <div className={`absolute top-3 right-3 w-8 h-8 rounded-lg ${typeColor.bg} ${typeColor.text} ${typeColor.border} border flex items-center justify-center`}>
                    {typeIcon}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#6E54FF] transition-colors line-clamp-1">
                    {property.name}
                </h3>
                
                {property.location && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span className="line-clamp-1">{property.location}</span>
                    </div>
                )}

                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                    {property.description}
                </p>

                {/* Action Button */}
                <button
                    onClick={() => onWriteReview(property)}
                    disabled={disabled}
                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#6E54FF]/5 text-[#6E54FF] hover:bg-[#6E54FF] hover:text-white border border-[#6E54FF]/20 hover:border-[#6E54FF]"
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Write Review
                </button>
            </div>
        </div>
    );
};

export default PropertyCard;
