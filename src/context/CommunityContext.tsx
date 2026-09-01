import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Alert, 
  Post, 
  Product, 
  Location, 
  AppNotification, 
  LocalEvent, 
  Tab 
} from '../types';
import { 
  initialAlerts, 
  initialPosts, 
  initialProducts, 
  initialLocation, 
  initialNotifications, 
  mockEvents, 
  availableLocations 
} from '../data';

interface UserProfileData {
  name: string;
  phone: string;
  address: string;
  bio: string;
  avatar: string;
  isVerified: boolean;
  joinedDate: string;
  reputationScore: number;
}

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface CommunityContextType {
  // Navigation & Location
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  location: Location;
  setLocation: (loc: Location) => void;
  availableLocations: Location[];

  // Alerts State
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => void;
  voteAlert: (alertId: string, voteType: 'up' | 'down') => void;

  // Posts State
  posts: Post[];
  addPost: (content: string, category: string, image?: string) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  deletePost: (postId: string) => void;

  // Products & Market State
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'seller' | 'distance'>) => void;

  // Events State
  events: LocalEvent[];
  toggleJoinEvent: (eventId: string) => void;

  // Notifications State
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // User Profile
  userProfile: UserProfileData;
  updateUserProfile: (data: Partial<UserProfileData>) => void;
  verifyUserAccount: () => void;

  // Toast System
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Quick Action Modal Triggers
  activeModal: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [location, setLocation] = useState<Location>(() => {
    try {
      const saved = localStorage.getItem('locallink_user_location');
      return saved ? JSON.parse(saved) : initialLocation;
    } catch {
      return initialLocation;
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_alerts');
      return saved ? JSON.parse(saved) : initialAlerts;
    } catch {
      return initialAlerts;
    }
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_posts');
      return saved ? JSON.parse(saved) : initialPosts;
    } catch {
      return initialPosts;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [events, setEvents] = useState<LocalEvent[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_events');
      return saved ? JSON.parse(saved) : mockEvents;
    } catch {
      return mockEvents;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_notifications');
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem('locallink_profile');
      return saved ? JSON.parse(saved) : {
        name: 'สมชาย รักดี',
        phone: '081-234-5678',
        address: 'หมู่บ้านพหลโยธินวิลล่า ซอย 3',
        bio: 'ชาวชุมชนพหลโยธิน สนใจงานจิตอาสาและอาหารการกิน',
        avatar: 'https://i.pravatar.cc/150?u=me',
        isVerified: true,
        joinedDate: 'มกราคม 2024',
        reputationScore: 98
      };
    } catch {
      return {
        name: 'สมชาย รักดี',
        phone: '081-234-5678',
        address: 'หมู่บ้านพหลโยธินวิลล่า ซอย 3',
        bio: 'ชาวชุมชนพหลโยธิน สนใจงานจิตอาสาและอาหารการกิน',
        avatar: 'https://i.pravatar.cc/150?u=me',
        isVerified: true,
        joinedDate: 'มกราคม 2024',
        reputationScore: 98
      };
    }
  });

  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Persistence helpers
  useEffect(() => {
    try { localStorage.setItem('locallink_alerts', JSON.stringify(alerts)); } catch {}
  }, [alerts]);

  useEffect(() => {
    try { localStorage.setItem('locallink_posts', JSON.stringify(posts)); } catch {}
  }, [posts]);

  useEffect(() => {
    try { localStorage.setItem('locallink_products', JSON.stringify(products)); } catch {}
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem('locallink_events', JSON.stringify(events)); } catch {}
  }, [events]);

  useEffect(() => {
    try { localStorage.setItem('locallink_notifications', JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  useEffect(() => {
    try { localStorage.setItem('locallink_profile', JSON.stringify(userProfile)); } catch {}
  }, [userProfile]);

  useEffect(() => {
    try { localStorage.setItem('locallink_user_location', JSON.stringify(location)); } catch {}
  }, [location]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  // Alerts Actions
  const addAlert = (alertData: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      time: 'เมื่อสักครู่',
      status: 'unconfirmed',
      confirmations: 1,
      rejections: 0,
      userVoted: 'up',
      reportedBy: userProfile.name
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast('📢 รายงานเหตุการณ์เรียบร้อยแล้ว');
  };

  const voteAlert = (alertId: string, voteType: 'up' | 'down') => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id !== alertId) return alert;

      let newConfirmations = alert.confirmations;
      let newRejections = alert.rejections;
      let newVoted: 'up' | 'down' | undefined = voteType;

      if (alert.userVoted === voteType) {
        // Toggle off
        newVoted = undefined;
        if (voteType === 'up') newConfirmations = Math.max(0, newConfirmations - 1);
        if (voteType === 'down') newRejections = Math.max(0, newRejections - 1);
        showToast('ยกเลิกการยืนยันแล้ว', 'info');
      } else {
        // Switch or new vote
        if (alert.userVoted === 'up') newConfirmations = Math.max(0, newConfirmations - 1);
        if (alert.userVoted === 'down') newRejections = Math.max(0, newRejections - 1);

        if (voteType === 'up') {
          newConfirmations += 1;
          showToast('✅ คุณได้ร่วมยืนยันเหตุการณ์นี้แล้ว');
        } else {
          newRejections += 1;
          showToast('คุณได้รายงานว่าไม่พบเหตุการณ์นี้', 'info');
        }
      }

      // Auto update status if confirmed by many members
      let newStatus = alert.status;
      if (newConfirmations >= 5 && alert.status === 'unconfirmed') {
        newStatus = 'members';
      }

      return {
        ...alert,
        confirmations: newConfirmations,
        rejections: newRejections,
        userVoted: newVoted,
        status: newStatus
      };
    }));
  };

  // Posts Actions
  const addPost = (content: string, category: string = 'ทั่วไป', image?: string) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar
      },
      content,
      category,
      image,
      location: { ...location, distance: 0.1 },
      time: 'เมื่อสักครู่',
      likes: 0,
      comments: 0,
      isLiked: false,
      commentList: []
    };
    setPosts(prev => [newPost, ...prev]);
    showToast('✨ แชร์เรื่องราวลงกระดานชุมชนแล้ว');
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const isLiked = !post.isLiked;
      return {
        ...post,
        isLiked,
        likes: isLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
      };
    }));
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const newComment = {
      id: `c_${Date.now()}`,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar
      },
      content,
      time: 'เมื่อสักครู่'
    };

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const existingComments = post.commentList || [];
      return {
        ...post,
        comments: post.comments + 1,
        commentList: [...existingComments, newComment]
      };
    }));
    showToast('💬 ส่งความคิดเห็นแล้ว');
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast('ลบโพสต์เรียบร้อยแล้ว', 'info');
  };

  // Products Actions
  const addProduct = (prodData: Omit<Product, 'id' | 'seller' | 'distance'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod_${Date.now()}`,
      seller: userProfile.name,
      sellerPhone: userProfile.phone,
      distance: 0.1
    };
    setProducts(prev => [newProd, ...prev]);
    showToast('🛍️ ลงขายสินค้าในตลาดชุมชนเรียบร้อยแล้ว');
  };

  // Events Actions
  const toggleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const isJoined = !ev.isJoined;
      const count = isJoined ? ev.joinedCount + 1 : Math.max(0, ev.joinedCount - 1);
      showToast(isJoined ? '🎉 คุณได้เข้าร่วมกิจกรรมนี้แล้ว' : 'ยกเลิกการเข้าร่วมกิจกรรมแล้ว', 'info');
      return {
        ...ev,
        isJoined,
        joinedCount: count
      };
    }));
  };

  // Notifications Actions
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('ล้างการแจ้งเตือนทั้งหมดแล้ว', 'info');
  };

  // Profile Actions
  const updateUserProfile = (data: Partial<UserProfileData>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
    showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
  };

  const verifyUserAccount = () => {
    setUserProfile(prev => ({
      ...prev,
      isVerified: true,
      reputationScore: Math.min(100, prev.reputationScore + 15)
    }));
    showToast('🎖️ ยืนยันตัวตนสำเร็จ บัญชีของคุณได้รับสถานะยืนยันแล้ว');
  };

  return (
    <CommunityContext.Provider
      value={{
        activeTab,
        setActiveTab,
        location,
        setLocation,
        availableLocations,
        alerts,
        addAlert,
        voteAlert,
        posts,
        addPost,
        toggleLikePost,
        addComment,
        deletePost,
        products,
        addProduct,
        events,
        toggleJoinEvent,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        clearAllNotifications,
        userProfile,
        updateUserProfile,
        verifyUserAccount,
        toasts,
        showToast,
        removeToast,
        activeModal,
        openModal,
        closeModal
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
