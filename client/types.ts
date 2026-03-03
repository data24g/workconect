
export enum UserRole {
  WORKER = 'WORKER',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN'
}

export enum SessionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  numericId?: number;
  name: string;
  fullName?: string;
  username?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  coverPhoto?: string;
  verified: boolean;
  rating: number;
  skills?: string[];
  bio?: string;
  title?: string;
  badge?: string;
  isPremium?: boolean;
  ratingCount: number;
  // Personal Info
  dob?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  isNewUser?: boolean; // Flag to trigger onboarding
  newUser?: boolean;   // Alternative naming from backend
  // Business specific (Optional)
  industry?: string;
  address?: string;
  location?: string;
  followersCount?: number;
  followingCount?: number;
  jobsCount?: number;
  description?: string;
  education?: string;
  certifications?: string; // JSON String
  lastSeen?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  industry: string;
  description: string;
  verified: boolean;
  rating: number;
  logo: string;
}

export interface Job {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  type: 'Full-time' | 'Part-time' | 'Freelance' | 'Contract';
  salary: string;
  location: string;
  minRating: number;
  requirements: string[];
  postedAt: string;
}

export interface WorkSession {
  id: string;
  jobId: string;
  workerId: string;
  businessId: string;
  jobTitle: string;
  workerName: string;
  workerNumericId?: number;
  businessName: string;
  businessNumericId?: number;
  status: SessionStatus;
  startDate: string;
  endDate?: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  sessionId: string;
  score: number;
  comment: string;
  createdAt: string;
  categories: {
    skill?: number;
    attitude?: number;
    punctuality?: number;
    environment?: number;
    payment?: number;
  };
}
