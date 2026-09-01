export type Tab = 'home' | 'map' | 'community' | 'market' | 'me' | 'admin_dashboard';

export type UserRole = 'admin' | 'user';

export type BroadcastCategory = 'news' | 'marketing' | 'announcement' | 'emergency' | 'weather' | 'traffic';
export type BroadcastSeverity = 'urgent' | 'high' | 'normal' | 'special';

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  category: BroadcastCategory;
  severity: BroadcastSeverity;
  targetArea?: string;
  broadcastAt: number; // Unix timestamp in ms
  broadcastDateStr: string; // YYYY-MM-DD for midnight reset comparison
  adminName: string;
  adminRole: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  mediaFileName?: string;
  videoDurationSeconds?: number;
  contactNumber?: string;
  actionText?: string;
  actionUrl?: string;
  pinned: boolean;
  isActive: boolean;
}

export interface Location {
  province: string;
  district: string;
  subdistrict: string;
  village?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  isGps?: boolean;
  timestamp?: number;
}

export type VerificationStatus = 'unconfirmed' | 'members' | 'authority';

export interface Alert {
  id: string;
  type: 'flood' | 'power' | 'road' | 'accident' | 'general';
  title: string;
  description: string;
  location: Location;
  time: string;
  status: VerificationStatus;
  confirmations: number;
  rejections: number;
  userVoted?: 'up' | 'down';
  image?: string;
  reportedBy?: string;
}

export interface PostComment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  location: Location;
  time: string;
  likes: number;
  comments: number;
  image?: string;
  isLiked?: boolean;
  category?: string;
  commentList?: PostComment[];
}

export interface Product {
  id: string;
  title: string;
  price: number;
  seller: string;
  sellerPhone?: string;
  distance: number;
  image: string;
  category: string;
  description?: string;
  locationName?: string;
}

export interface LocalShop {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  distance: number;
  openHours: string;
  phone: string;
  address: string;
  image: string;
  tags: string[];
}

export interface LocalJob {
  id: string;
  title: string;
  company: string;
  salary: string;
  type: 'งานประจำ' | 'งานพาร์ทไทม์' | 'รายวัน';
  location: string;
  distance: number;
  phone: string;
  description: string;
}

export interface LocalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  distance: number;
  organizer: string;
  description: string;
  joinedCount: number;
  isJoined?: boolean;
  image: string;
}

export interface RealEstateItem {
  id: string;
  title: string;
  type: 'เช่า' | 'ขาย';
  price: string;
  location: string;
  distance: number;
  phone: string;
  image: string;
  details: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'broadcast' | 'community' | 'market';
}

export interface UserProfileData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  villageOrCondo?: string;
  bio: string;
  avatar: string;
  isVerified: boolean;
  joinedDate: string;
  reputationScore: number;
}

export interface MorningBrief {
  weather: string;
  roadClosures: number;
  events: number;
  newShops: number;
  newJobs: number;
  announcements: number;
}

