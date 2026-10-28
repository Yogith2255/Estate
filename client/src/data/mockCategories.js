export const propertyTypes = [
  { id: 'all', label: 'All Property Types' },
  { id: 'apartment', label: 'Premium Apartment' },
  { id: 'villa', label: 'Gated Villa' },
  { id: 'penthouse', label: 'Penthouse' },
  { id: 'high-rise', label: 'Luxury High-rise' },
  { id: 'commercial', label: 'Commercial IT Park' },
];

export const priceRanges = [
  { label: 'Any Budget', min: null, max: null },
  { label: 'Under ₹50 Lakhs', min: 0, max: 5000000 },
  { label: '₹50 Lakhs - ₹1.5 Cr', min: 5000000, max: 15000000 },
  { label: '₹1.5 Cr - ₹3 Cr', min: 15000000, max: 30000000 },
  { label: '₹3 Cr - ₹5 Cr', min: 30000000, max: 50000000 },
  { label: 'Above ₹5 Cr', min: 50000000, max: null },
];

export const mockLocations = [
  { city: 'Hyderabad', state: 'Telangana', activeListings: 184, microMarkets: ['Gachibowli', 'HITEC City', 'Financial District', 'Jubilee Hills'] },
  { city: 'Bengaluru', state: 'Karnataka', activeListings: 242, microMarkets: ['Whitefield', 'Sarjapur Rd', 'Indiranagar', 'Electronic City'] },
  { city: 'Mumbai', state: 'Maharashtra', activeListings: 198, microMarkets: ['Worli', 'BKC', 'Powai', 'Thane West'] },
  { city: 'Pune', state: 'Maharashtra', activeListings: 114, microMarkets: ['Hinjawadi', 'Kharadi', 'Wakad', 'Baner'] },
  { city: 'Chennai', state: 'Tamil Nadu', activeListings: 92, microMarkets: ['OMR', 'Guindy', 'Anna Nagar', 'ECR'] },
];
