
export type Vendor = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  city?: string;
  state?: string;
  bio?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  portfolio?: {
    imageUrl: string;
    description: string;
  }[];
  rating?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
};

export type PlannerProfile = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  city?: string;
  state?: string;
  bio?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
};

export type Guest = {
  id: string; // The document ID, which is now stable
  userProfileId?: string; // The auth UID of the user, if they have one
  guestCode: string;
  name: string;
  email: string;
  phoneNumber?: string;
  category: string;
  rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
  hasCheckedIn: boolean;
  checkInTime?: any; // Can be null or a Firestore Timestamp
  serialNumber?: number;
};
