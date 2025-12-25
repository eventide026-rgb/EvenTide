
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
