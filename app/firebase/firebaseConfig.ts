import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
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

// Export the app instance
export default app

