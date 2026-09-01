import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Alert, 
  Post, 
  Product, 
  Location, 
  AppNotification, 
  LocalEvent, 
  Tab,
  UserProfileData
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
  isLocatingGps: boolean;
  locationPermissionStatus: 'prompt' | 'granted' | 'denied';
  isLocationPermissionModalOpen: boolean;
  openLocationPermissionModal: () => void;
  closeLocationPermissionModal: () => void;
  requestRealLocation: () => Promise<boolean>;

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

  // User Profile & Authentication
  isLoggedIn: boolean;
  userProfile: UserProfileData;
  updateUserProfile: (data: Partial<UserProfileData>) => void;
  verifyUserAccount: () => void;
  login: (credentials: { phoneOrEmail: string; password?: string; name?: string; avatar?: string; address?: string }) => boolean;
  register: (data: { name: string; phone: string; email?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string }) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  requireAuth: (actionCallback: () => void, promptMessage?: string) => boolean;

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

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('locallink_is_logged_in');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem('locallink_profile');
      return saved ? JSON.parse(saved) : {
        id: 'user_default',
        name: 'สมชาย รักดี',
        phone: '081-234-5678',
        email: 'somchai.local@email.com',
        address: 'หมู่บ้านพหลโยธินวิลล่า ซอย 3',
        villageOrCondo: 'พหลโยธินวิลล่า',
        bio: 'ชาวชุมชนพหลโยธิน สนใจงานจิตอาสาและอาหารการกิน',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        isVerified: true,
        joinedDate: 'มกราคม 2024',
        reputationScore: 98
      };
    } catch {
      return {
        id: 'user_default',
        name: 'สมชาย รักดี',
        phone: '081-234-5678',
        email: 'somchai.local@email.com',
        address: 'หมู่บ้านพหลโยธินวิลล่า ซอย 3',
        villageOrCondo: 'พหลโยธินวิลล่า',
        bio: 'ชาวชุมชนพหลโยธิน สนใจงานจิตอาสาและอาหารการกิน',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        isVerified: true,
        joinedDate: 'มกราคม 2024',
        reputationScore: 98
      };
    }
  });

  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isLocationPermissionModalOpen, setIsLocationPermissionModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openLocationPermissionModal = () => setIsLocationPermissionModalOpen(true);
  const closeLocationPermissionModal = () => setIsLocationPermissionModalOpen(false);

  // Real GPS Location Request handler
  const requestRealLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      showToast('อุปกรณ์หรือเบราว์เซอร์ของคุณไม่รองรับการตรวจจับพิกัด GPS', 'error');
      setLocationPermissionStatus('denied');
      return false;
    }

    setIsLocatingGps(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          setLocationPermissionStatus('granted');
          setIsLocatingGps(false);

          // Reverse geocode or intelligent Thai location matching
          let matchedDistrict = 'จตุจักร';
          let matchedSubdistrict = 'ลาดยาว';
          let matchedProvince = 'กรุงเทพมหานคร';
          let matchedVillage = `พิกัด GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          // Try reverse geocoding via OpenStreetMap Nominatim with fallback
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
              signal: controller.signal,
              headers: { 'Accept-Language': 'th,en' }
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const addr = data.address;
                matchedProvince = addr.province || addr.state || addr.city || 'กรุงเทพมหานคร';
                matchedDistrict = addr.city_district || addr.district || addr.suburb || addr.town || addr.county || 'จตุจักร';
                matchedSubdistrict = addr.subdistrict || addr.neighbourhood || addr.quarter || addr.village || 'ลาดยาว';
                matchedVillage = addr.road || addr.residential || `ใกล้เคียง (${accuracy} ม.)`;
              }
            }
          } catch {
            // If offline/timeout, keep smart defaults
          }

          const realLoc: Location = {
            province: matchedProvince,
            district: matchedDistrict,
            subdistrict: matchedSubdistrict,
            village: matchedVillage,
            distance: 0,
            latitude: lat,
            longitude: lng,
            accuracy: accuracy,
            isGps: true,
            timestamp: Date.now()
          };

          setLocation(realLoc);
          showToast(`🎯 ระบุพิกัด GPS จริงสำเร็จ: ${matchedDistrict}, ${matchedProvince} (ความแม่นยำ ±${accuracy}ม.)`, 'success');
          resolve(true);
        },
        (error) => {
          setIsLocatingGps(false);
          let errMsg = 'ไม่สามารถระบุพิกัดตำแหน่งจริงได้';
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermissionStatus('denied');
            errMsg = 'คุณได้ปฏิเสธการขอเข้าถึงตำแหน่ง (Location Permission Denied)';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errMsg = 'สัญญาณดาวเทียมหรือพิกัดตำแหน่งไม่พร้อมใช้งาน';
          } else if (error.code === error.TIMEOUT) {
            errMsg = 'การค้นหาพิกัดตำแหน่งหมดเวลา กรุณาลองใหม่อีกครั้ง';
          }
          showToast(errMsg, 'error');
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  };

  // Persistence helpers
  useEffect(() => {
    try { localStorage.setItem('locallink_is_logged_in', JSON.stringify(isLoggedIn)); } catch {}
  }, [isLoggedIn]);

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

  // Authentication Actions
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAuthAction(null);
  };

  const login = (credentials: { phoneOrEmail: string; password?: string; name?: string; avatar?: string; address?: string }): boolean => {
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);

    // If custom details were provided during login
    setUserProfile(prev => ({
      ...prev,
      name: credentials.name || prev.name,
      phone: credentials.phoneOrEmail?.includes('@') ? prev.phone : (credentials.phoneOrEmail || prev.phone),
      email: credentials.phoneOrEmail?.includes('@') ? credentials.phoneOrEmail : prev.email,
      avatar: credentials.avatar || prev.avatar,
      address: credentials.address || prev.address
    }));

    showToast(`👋 ยินดีต้อนรับกลับ, ${credentials.name || userProfile.name}! เข้าสู่ระบบสำเร็จแล้ว`, 'success');
    
    if (pendingAuthAction) {
      pendingAuthAction();
      setPendingAuthAction(null);
    }
    return true;
  };

  const register = (data: { name: string; phone: string; email?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string }) => {
    const newProfile: UserProfileData = {
      id: `user_${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || `${data.phone.replace(/[^0-9]/g, '')}@locallink.app`,
      address: data.address.trim(),
      villageOrCondo: data.villageOrCondo?.trim() || location.village || 'ชุมชนท้องถิ่น',
      bio: data.bio?.trim() || `สมาชิกใหม่แห่งชุมชน ${location.district}`,
      avatar: data.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?auto=format&fit=crop&q=80&w=200`,
      isVerified: false,
      joinedDate: 'วันนี้',
      reputationScore: 50
    };

    setUserProfile(newProfile);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    showToast(`🎉 ยินดีต้อนรับคุณ ${data.name}! สมัครสมาชิกและเข้าสู่ระบบเรียบร้อยแล้ว`, 'success');

    if (pendingAuthAction) {
      pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว เข้าสู่โหมดผู้เยี่ยมชม', 'info');
  };

  const requireAuth = (actionCallback: () => void, promptMessage?: string): boolean => {
    if (isLoggedIn) {
      actionCallback();
      return true;
    }
    setPendingAuthAction(() => actionCallback);
    if (promptMessage) {
      showToast(promptMessage, 'info');
    }
    openAuthModal('register');
    return false;
  };

  return (
    <CommunityContext.Provider
      value={{
        activeTab,
        setActiveTab,
        location,
        setLocation,
        availableLocations,
        isLocatingGps,
        locationPermissionStatus,
        isLocationPermissionModalOpen,
        openLocationPermissionModal,
        closeLocationPermissionModal,
        requestRealLocation,
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
        isLoggedIn,
        userProfile,
        updateUserProfile,
        verifyUserAccount,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        requireAuth,
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
