// Mock properties, hotels, and places for reviews

export interface Property {
  id: string;
  name: string;
  type: "hotel" | "restaurant" | "attraction" | "service" | "protocol";
  category: string;
  description: string;
  location?: string;
}

export const MOCK_PROPERTIES: Property[] = [
  // Hotels
  {
    id: "hotel-1",
    name: "Monad Grand Hotel",
    type: "hotel",
    category: "Luxury Hotel",
    description: "5-star luxury hotel in the heart of the city",
    location: "Downtown Monad City"
  },
  {
    id: "hotel-2",
    name: "Crypto Inn",
    type: "hotel",
    category: "Boutique Hotel",
    description: "Modern boutique hotel with blockchain-themed rooms",
    location: "Tech District"
  },
  {
    id: "hotel-3",
    name: "DeFi Suites",
    type: "hotel",
    category: "Business Hotel",
    description: "Premium business hotel with conference facilities",
    location: "Financial District"
  },
  // Restaurants
  {
    id: "restaurant-1",
    name: "The Blockchain Bistro",
    type: "restaurant",
    category: "Fine Dining",
    description: "Upscale restaurant serving fusion cuisine",
    location: "Riverside"
  },
  {
    id: "restaurant-2",
    name: "Smart Contract Cafe",
    type: "restaurant",
    category: "Casual Dining",
    description: "Cozy cafe with excellent coffee and pastries",
    location: "Arts Quarter"
  },
  {
    id: "restaurant-3",
    name: "NFT Noodle Bar",
    type: "restaurant",
    category: "Asian Fusion",
    description: "Authentic Asian cuisine with modern twist",
    location: "Cultural District"
  },
  // Attractions
  {
    id: "attraction-1",
    name: "Monad Blockchain Museum",
    type: "attraction",
    category: "Museum",
    description: "Interactive museum showcasing blockchain history",
    location: "Historic Center"
  },
  {
    id: "attraction-2",
    name: "Crypto Art Gallery",
    type: "attraction",
    category: "Art Gallery",
    description: "Contemporary art gallery featuring digital and NFT art",
    location: "Arts Quarter"
  },
  {
    id: "attraction-3",
    name: "Web3 Innovation Hub",
    type: "attraction",
    category: "Tech Center",
    description: "Co-working space and innovation center",
    location: "Tech District"
  },
  // Services/Protocols
  {
    id: "protocol-1",
    name: "Uniswap V4",
    type: "protocol",
    category: "DeFi Protocol",
    description: "Decentralized exchange protocol",
  },
  {
    id: "protocol-2",
    name: "Monad Bridge",
    type: "protocol",
    category: "Bridge Protocol",
    description: "Cross-chain bridge for asset transfers",
  },
  {
    id: "protocol-3",
    name: "Monad Wallet",
    type: "service",
    category: "Wallet Service",
    description: "Official Monad blockchain wallet",
  },
  {
    id: "protocol-4",
    name: "Staking Platform",
    type: "service",
    category: "Staking Service",
    description: "Validator staking and delegation platform",
  },
  {
    id: "protocol-5",
    name: "DeFi Lending Protocol",
    type: "protocol",
    category: "DeFi Protocol",
    description: "Decentralized lending and borrowing platform",
  },
];

export function getPropertiesByType(type: Property["type"]): Property[] {
  return MOCK_PROPERTIES.filter(p => p.type === type);
}

export function getPropertyById(id: string): Property | undefined {
  return MOCK_PROPERTIES.find(p => p.id === id);
}

