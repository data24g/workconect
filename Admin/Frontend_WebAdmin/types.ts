// src/types.ts

// 1. Các Enum (Định nghĩa trạng thái)
export enum UserRole {
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
  EMPLOYER = 'EMPLOYER'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum ReportStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED'
}

export enum SessionStatus {
  CONFIRMED = 'CONFIRMED',
  DONE = 'DONE',
  DISPUTE = 'DISPUTE',
  CANCELLED = 'CANCELLED'
}

// 2. Các Interface (Cấu trúc dữ liệu)
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'WARNED' | 'REJECTED';
  verified: boolean;
  avatar?: string;
  phone?: string;
  reportCount?: number;
  joinedDate?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  pendingVerifications: number;
  activeJobs: number;
  totalReports: number;
  openReports: number;
}

// Thêm các interface cũ nếu code cũ của bạn cần dùng (để tránh lỗi ở các file khác)
export interface BusinessProfile {
  id: string;
  companyName: string;
  status: VerificationStatus;
  // ... các trường khác
}

// Interface cho Identity Verification - CCCD
export interface UserVerification {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  phone: string;
  role: string;
  verificationStatus: string;
  idCardVerified: boolean;
  verified: boolean;
  createdAt: string;
  // Thông tin xác thực bổ sung
  companyName?: string;
  taxCode?: string;
  businessRegistrationCode?: string;
  legalRepresentative?: string;
  website?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  // CCCD images (from backend if available)
  idCardFrontImage?: string;
  idCardBackImage?: string;
}

export interface Report {
  id: string;
  type?: string;
  reporterId?: string;
  targetId?: string;
  reason?: string;
  status: ReportStatus;
  createdAt?: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  workSessionId?: string;
  score: number;
  comment: string;
  createdAt: string;
  isHidden?: boolean;
  isFlagged?: boolean;
}

export interface WorkSession {
  id: string;
  jobId?: string;
  workerId?: string;
  businessId?: string;
  workerName?: string;
  jobTitle?: string;
  status: SessionStatus;
  startDate?: string;
  endDate?: string;
  paymentAmount?: number;
  employerId?: string;
  updatedAt?: string;
  disputeNote?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  target: 'EMPLOYER' | 'WORKER';
  price: number;
  activeUsers: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Job {
  id: string;
  title: string;
  businessName?: string;
  businessAvatar?: string;
  businessId?: string;
  companyName?: string; // Tương thích ngược
  salary?: any;
  status: string;
  postedAt?: string;
  createdAt?: string;
  location?: string;
  description?: string;
  requirements?: string;
  reportCount?: number;
  employerId?: string;
  employerName?: string;
}
