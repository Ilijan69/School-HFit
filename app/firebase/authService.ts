import { auth, db, googleProvider } from "./firebaseConfig"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
} from "firebase/auth"
import { GoogleAuthProvider, setPersistence, browserSessionPersistence } from "firebase/auth"

import { setDoc, doc, collection, query, where, getDocs, getDoc } from "firebase/firestore"

// Function to register a user with email & password
export const registerWithEmail = async (
  email: string,
  password: string,
  username: string,
  gender: string,
  role = "user"
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the Firebase Auth profile
    await updateProfile(user, { displayName: username })

    // Check if the user is an admin
    const isAdmin = email === "ilijan.kurshumov@gmail.com" // Replace with your admin email
    const userRole = isAdmin ? "admin" : role

    // Store user in Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      gender,
      createdAt: new Date(),
      role: userRole,
      authProvider: "email",
    })

    return user
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Function to log in with username or email
export const loginWithUsernameOrEmail = async (identifier: string, password: string) => {
  try {
    let email = identifier

    if (!identifier.includes("@")) {
      // Look up email from Firestore using username
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("username", "==", identifier))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error("Username not found")
      }

      email = querySnapshot.docs[0].data().email
    }

    // Log in with email and password
    return await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    console.error("Error logging in:", error)
    throw error
  }
}

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    await setPersistence(auth, browserSessionPersistence) // Ensures session persistence

    const provider = new GoogleAuthProvider()

    let result
    try {
      result = await signInWithPopup(auth, provider) // Try the popup method
    } catch (popupError: any) {
      if (popupError.code === "auth/popup-closed-by-user") {
        throw new Error("Popup closed before authentication. Please try again.")
      }
      if (popupError.code === "auth/cancelled-popup-request") {
        // If a popup request was canceled, retry with redirect
        console.warn("Popup request canceled. Trying redirect login.")
        return await signInWithRedirect(auth, provider)
      }
      throw popupError
    }

    const user = result.user
    if (!user) throw new Error("No user found after Google sign-in.")

    // Store user in Firestore if they don't exist
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })
    }

    return user
  } catch (error) {
    console.error("Google sign-in error:", error)
    throw error
  }
}

// Function to log out the user
export const logout = async () => {
  try {
    await signOut(auth)
    console.log("User signed out")
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

// Function to fetch the user's role
export const getUserRole = async (uid: string) => {
  try {
    const userDocRef = doc(db, "users", uid)
    const docSnap = await getDoc(userDocRef)

    if (docSnap.exists()) {
      return docSnap.data().role
    } else {
      throw new Error("User not found")
    }
  } catch (error) {
    console.error("Error fetching user role:", error)
    throw error
  }
}
