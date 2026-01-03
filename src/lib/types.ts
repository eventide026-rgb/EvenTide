

export type Vendor = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  city?: string;
  state?: string;
  bio?: string;
  avatarUrl?: string;
  portfolio?: {
    imageUrl: string;
    description: string;
  }[];
};

export type PlannerProfile = {
  id: string;
  name?: string; // Kept for compatibility if some profiles still use it
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  state?: string;
  bio?: string;
  avatarUrl?: string;
};

export type Guest = {
  id: string; // This is now the user's auth UID
  guestCode: string;
  name: string;
  email: string;
  phoneNumber?: string;
  category: string;
  rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
  hasCheckedIn: boolean;
  serialNumber?: number;
};
