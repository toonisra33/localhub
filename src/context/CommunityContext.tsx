import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Alert, 
  Post, 
  Product, 
  Location, 
  AppNotification, 
  LocalEvent, 
  Tab,
  UserProfileData,
  AdminContactRequest,
  ContactRequestType,
  ContactRequestStatus
} from '../types';
import { 
  initialAlerts, 
  initialPosts, 
  initialProducts, 
  initialLocation, 
  initialNotifications, 
  initialContactRequests,
  mockEvents, 
  availableLocations 
} from '../data';
import { 
  auth, 
  db, 
  signInWithGoogleAuth, 
  signOutAuth, 
  isAuthorizedAdminEmail 
} from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

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
  addPost: (content: string, category: string, images?: string[]) => void;
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
  login: (credentials: { phoneOrEmail: string; password?: string; name?: string; avatar?: string; address?: string }) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: { name: string; phone: string; email?: string; password?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string }) => Promise<boolean>;
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

  // Global Fullscreen Media Viewer
  activeMedia: { url: string; type: 'image' | 'video'; title?: string; subtitle?: string } | null;
  openMediaViewer: (media: { url: string; type?: 'image' | 'video'; title?: string; subtitle?: string }) => void;
  closeMediaViewer: () => void;

  // Contact Admin & PR Requests
  contactRequests: AdminContactRequest[];
  isContactAdminModalOpen: boolean;
  contactAdminInitialType: ContactRequestType | undefined;
  openContactAdminModal: (defaultType?: ContactRequestType) => void;
  closeContactAdminModal: () => void;
  submitContactRequest: (data: Omit<AdminContactRequest, 'id' | 'createdAt' | 'timeStr' | 'status'>) => void;
  updateContactRequestStatus: (id: string, status: ContactRequestStatus, adminNote?: string) => void;
  deleteContactRequest: (id: string) => void;
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
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string; subtitle?: string } | null>(null);

  // Contact Admin & PR Requests State
  const [contactRequests, setContactRequests] = useState<AdminContactRequest[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_contact_requests');
      return saved ? JSON.parse(saved) : initialContactRequests;
    } catch {
      return initialContactRequests;
    }
  });
  const [isContactAdminModalOpen, setIsContactAdminModalOpen] = useState(false);
  const [contactAdminInitialType, setContactAdminInitialType] = useState<ContactRequestType | undefined>(undefined);

  const openContactAdminModal = (defaultType?: ContactRequestType) => {
    setContactAdminInitialType(defaultType);
    setIsContactAdminModalOpen(true);
  };

  const closeContactAdminModal = () => {
    setIsContactAdminModalOpen(false);
    setContactAdminInitialType(undefined);
  };

  const submitContactRequest = (data: Omit<AdminContactRequest, 'id' | 'createdAt' | 'timeStr' | 'status'>) => {
    const newRequest: AdminContactRequest = {
      ...data,
      id: `req_${Date.now()}`,
      createdAt: Date.now(),
      timeStr: 'เมื่อสักครู่',
      status: 'pending'
    };

    setContactRequests(prev => [newRequest, ...prev]);

    // Also add an AppNotification for the resident
    const newNotification: AppNotification = {
      id: `n_contact_${Date.now()}`,
      title: '📨 ส่งเรื่องถึงแอดมินเรียบร้อยแล้ว',
      message: `แอดมินได้รับเรื่อง "${data.title}" แล้ว อยู่ระหว่างการตรวจสอบข้อมูลเพื่อดำเนินการ`,
      time: 'เมื่อสักครู่',
      read: false,
      type: 'broadcast'
    };
    setNotifications(prev => [newNotification, ...prev]);

    showToast('📨 ส่งข้อความถึงแอดมินเรียบร้อยแล้ว! แอดมินจะตรวจสอบและดำเนินการให้โดยเร็ว', 'success');
  };

  const updateContactRequestStatus = (id: string, status: ContactRequestStatus, adminNote?: string) => {
    setContactRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        status,
        adminNote: adminNote !== undefined ? adminNote : req.adminNote
      };
    }));
    showToast('อัปเดตสถานะเรื่องติดต่อเรียบร้อยแล้ว', 'info');
  };

  const deleteContactRequest = (id: string) => {
    setContactRequests(prev => prev.filter(req => req.id !== id));
    showToast('ลบรายการคำขอติดต่อเรียบร้อยแล้ว', 'info');
  };

  const openMediaViewer = (media: { url: string; type?: 'image' | 'video'; title?: string; subtitle?: string }) => {
    setActiveMedia({
      url: media.url,
      type: media.type || (media.url.includes('.mp4') || media.url.includes('.webm') ? 'video' : 'image'),
      title: media.title,
      subtitle: media.subtitle
    });
  };

  const closeMediaViewer = () => {
    setActiveMedia(null);
  };

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

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        const isAdmin = isAuthorizedAdminEmail(firebaseUser.email);
        const role = isAdmin ? 'admin' : 'user';

        // Listen or fetch profile from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile(prev => ({
              ...prev,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: data.displayName || firebaseUser.displayName || prev.name,
              email: firebaseUser.email || prev.email,
              avatar: data.photoURL || firebaseUser.photoURL || prev.avatar,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              isVerified: true,
              role: (data.role || role) as 'admin' | 'user',
              isGoogleUser: true
            }));
          } else {
            setUserProfile(prev => ({
              ...prev,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || prev.name,
              email: firebaseUser.email || prev.email,
              avatar: firebaseUser.photoURL || prev.avatar,
              isVerified: true,
              role: role as 'admin' | 'user',
              isGoogleUser: true
            }));
          }
        } catch (e) {
          console.error('Error fetching Firestore user profile:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
    try { localStorage.setItem('locallink_contact_requests', JSON.stringify(contactRequests)); } catch {}
  }, [contactRequests]);

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
  const addPost = (content: string, category: string = 'ทั่วไป', images?: string[]) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar
      },
      content,
      category,
      images,
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

  const login = async (credentials: { phoneOrEmail: string; password?: string; name?: string; avatar?: string; address?: string }): Promise<boolean> => {
    if (!credentials.password) {
      showToast('กรุณากรอกรหัสผ่าน', 'error');
      return false;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.phoneOrEmail, credentials.password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        showToast('กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ (สามารถเช็คได้ใน Inbox ของคุณ)', 'error');
        await signOutAuth();
        return false;
      }
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let profileData = { ...userProfile };
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        profileData = {
          ...profileData,
          id: user.uid,
          name: data.displayName || user.displayName || 'สมาชิก',
          email: data.email || user.email || '',
          avatar: data.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          phone: data.phone || '',
          address: data.address || '',
          villageOrCondo: data.villageOrCondo || '',
          bio: data.bio || '',
          role: data.role || (isAuthorizedAdminEmail(user.email) ? 'admin' : 'user'),
          isVerified: true,
          reputationScore: data.reputationScore || 50,
          isGoogleUser: false
        };
      }
      
      setUserProfile(profileData);
      setIsLoggedIn(true);
      setIsAuthModalOpen(false);
      
      try {
        localStorage.setItem('locallink_user_role', profileData.role || 'user');
        localStorage.setItem('locallink_profile', JSON.stringify(profileData));
      } catch {}
      
      if (profileData.role === 'admin') {
        showToast(`👑 ยินดีต้อนรับผู้ดูแลระบบ (${user.email})! ได้รับสิทธิ์แอดมินเรียบร้อยแล้ว`, 'success');
      } else {
        showToast(`👋 ยินดีต้อนรับกลับ, ${profileData.name}! เข้าสู่ระบบสำเร็จแล้ว`, 'success');
      }
      
      if (pendingAuthAction) {
        pendingAuthAction();
        setPendingAuthAction(null);
      }
      
      return true;
    } catch (err: any) {
      console.error('Firebase Login Error:', err);
      showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากเพิ่งสมัครกรุณายืนยันอีเมลก่อน)', 'error');
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const { user, role } = await signInWithGoogleAuth();
      setIsLoggedIn(true);
      setIsAuthModalOpen(false);

      const updatedProfile: UserProfileData = {
        id: user.uid,
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || (role === 'admin' ? 'แอดมินศูนย์ควบคุมชุมชน' : 'สมาชิกชุมชน'),
        phone: user.phoneNumber || userProfile.phone || '081-000-0000',
        email: user.email || '',
        address: userProfile.address || `${location.district}, ${location.province}`,
        villageOrCondo: userProfile.villageOrCondo || location.village || 'ชุมชนท้องถิ่น',
        bio: `สมาชิกผ่านการยืนยันตัวตนด้วย Google (${role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : 'ผู้อยู่อาศัย'})`,
        avatar: user.photoURL || userProfile.avatar,
        isVerified: true,
        joinedDate: 'วันนี้',
        reputationScore: role === 'admin' ? 100 : 85,
        role: role as 'admin' | 'user',
        isGoogleUser: true
      };

      setUserProfile(updatedProfile);
      
      if (role === 'admin') {
        try {
          localStorage.setItem('locallink_user_role', 'admin');
        } catch {}
        showToast(`👑 ยินดีต้อนรับผู้ดูแลระบบสูงสุด (${user.email})! ได้รับสิทธิ์แอดมินและบันทึกลง Firebase แล้ว`, 'success');
      } else {
        try {
          localStorage.setItem('locallink_user_role', 'user');
        } catch {}
        showToast(`✅ เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${updatedProfile.name}`, 'success');
      }

      if (pendingAuthAction) {
        pendingAuthAction();
        setPendingAuthAction(null);
      }
      return true;
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showToast(err.message || 'การเข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
      return false;
    }
  };

  const register = async (data: { name: string; phone: string; email?: string; password?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string }): Promise<boolean> => {
    if (!data.email || !data.password) {
      showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'error');
      return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: data.name.trim(),
        photoURL: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      });
      
      await sendEmailVerification(user);
      
      const isAdmin = isAuthorizedAdminEmail(data.email);
      const assignedRole = isAdmin ? 'admin' : 'user';
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: data.name.trim(),
        photoURL: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        phone: data.phone.trim(),
        address: data.address.trim(),
        villageOrCondo: data.villageOrCondo?.trim() || location.village || 'ชุมชนท้องถิ่น',
        bio: data.bio?.trim() || `สมาชิกใหม่แห่งชุมชน ${location.district}`,
        role: assignedRole,
        isVerified: false,
        reputationScore: isAdmin ? 100 : 50,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      await signOutAuth();
      
      showToast(`ส่งลิงก์ยืนยันไปยังอีเมล ${data.email} แล้ว กรุณากดยืนยันในอีเมลก่อนเข้าสู่ระบบ`, 'success');
      setAuthModalMode('login');
      return true;
    } catch (err: any) {
      console.error('Firebase Registration Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        showToast('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน', 'error');
      } else {
        showToast(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOutAuth();
    } catch {}
    try {
      localStorage.setItem('locallink_user_role', 'user');
    } catch {}
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
        loginWithGoogle,
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
        closeModal,
        activeMedia,
        openMediaViewer,
        closeMediaViewer,
        contactRequests,
        isContactAdminModalOpen,
        contactAdminInitialType,
        openContactAdminModal,
        closeContactAdminModal,
        submitContactRequest,
        updateContactRequestStatus,
        deleteContactRequest
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
