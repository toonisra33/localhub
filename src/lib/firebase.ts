import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

// Configured Root Admins (Initial bootstrap emails)
export const ROOT_ADMIN_EMAILS = [
  'toonisra33@gmail.com',
  'admin@locallink.app',
  'admin@localhub.app'
];

/**
 * Checks if an email is authorized as an Admin
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ROOT_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email.toLowerCase().trim());
}

/**
 * Sign in with Google Popup and automatically sync with Firestore users collection
 */
export async function signInWithGoogleAuth() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user is in Root Admin list
    const isAdmin = isAuthorizedAdminEmail(user.email);
    const role = isAdmin ? 'admin' : 'user';

    // Sync or update user in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'สมาชิกชุมชน',
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      role: role,
      isVerified: true,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        phone: user.phoneNumber || '',
        address: 'พื้นที่กรุงเทพมหานคร',
        reputationScore: isAdmin ? 100 : 70,
      });
    } else {
      // Retain or promote role
      const existingData = userSnap.data();
      const finalRole = isAdmin ? 'admin' : (existingData.role || 'user');
      await setDoc(userRef, {
        ...userData,
        role: finalRole,
      }, { merge: true });
    }

    return { user, role };
  } catch (error) {
    console.error('Firebase Google Sign-in Error:', error);
    throw error;
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutAuth() {
  return signOut(auth);
}
