import { initializeApp } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence, inMemoryPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Log environment variables (without exposing values)
console.log("Firebase environment variables check:")
console.log("API Key exists:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log("Auth Domain exists:", !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
console.log("Project ID exists:", !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
console.log("Firebase initialized successfully")

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Set persistence - use LOCAL for desktop/laptop browsers and IN_MEMORY for mobile to avoid storage issues
const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Choose the appropriate persistence based on device type
const persistenceType = isMobile ? inMemoryPersistence : browserLocalPersistence;

setPersistence(auth, persistenceType)
  .then(() => {
    console.log(`Firebase auth persistence set to ${isMobile ? 'IN_MEMORY' : 'LOCAL'}`);
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Export the app instance
export default app

