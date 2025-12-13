import { useState, useMemo } from "react";
import { MOCK_PROPERTIES, type Property } from "../data/mockProperties";
import PropertyCard from "./PropertyCard";

interface PropertyMarketplaceProps {
    onWriteReview: (property: Property) => void;
    disabled?: boolean;
}

type FilterType = "all" | Property["type"];

const FilterTabs: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Places" },
    { value: "hotel", label: "Hotels" },
    { value: "restaurant", label: "Restaurants" },
    { value: "attraction", label: "Attractions" },
    { value: "protocol", label: "Protocols" },
    { value: "service", label: "Services" },
];

const PropertyMarketplace = ({ onWriteReview, disabled }: PropertyMarketplaceProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    const filteredProperties = useMemo(() => {
        let properties = MOCK_PROPERTIES;

        // Filter by type
        if (activeFilter !== "all") {
            properties = properties.filter((p) => p.type === activeFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            properties = properties.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    (p.location && p.location.toLowerCase().includes(query))
            );
        }

        return properties;
    }, [searchQuery, activeFilter]);

    return (
        <div className="space-y-6">
            {/* Header with Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Explore Places</h2>
                    <p className="text-gray-500 text-sm">
                        {filteredProperties.length} {filteredProperties.length === 1 ? "place" : "places"} to review
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search places, hotels, restaurants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6E54FF] focus:border-[#6E54FF] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
                {FilterTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveFilter(tab.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            activeFilter === tab.value
                                ? "bg-[#6E54FF] text-white shadow-md shadow-[#6E54FF]/25"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-[#6E54FF]/30 hover:text-[#6E54FF]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProperties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onWriteReview={onWriteReview}
                            disabled={disabled}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No places found</h3>
                    <p className="text-gray-500 text-sm">
                        Try adjusting your search or filter to find what you're looking for.
                    </p>
                    {(searchQuery || activeFilter !== "all") && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setActiveFilter("all");
                            }}
                            className="mt-4 px-4 py-2 text-[#6E54FF] font-medium text-sm hover:bg-[#6E54FF]/5 rounded-lg transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PropertyMarketplace;
