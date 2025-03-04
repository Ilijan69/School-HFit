import { auth, db } from "./firebaseConfig"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth"
import { setDoc, doc, collection, query, where, getDocs, getDoc } from "firebase/firestore"

// Create a Google provider instance
const googleProvider = new GoogleAuthProvider()

export const registerWithEmail = async (
  email: string,
  password: string,
  username: string,
  gender: string,
  role = "user",
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Update the profile with the username in Firebase Auth
  await updateProfile(userCredential.user, { displayName: username })

  // If the email is a specific admin email, assign the "admin" role
  const isAdmin = email === "ilijan.kurshumov@gmail.com" // Replace with your admin's email
  const userRole = isAdmin ? "admin" : role // Set role to "admin" if condition matches

  // Save the user's details in Firestore with the role (default to "user")
  await setDoc(doc(db, "users", userCredential.user.uid), {
    username,
    email,
    gender,
    createdAt: new Date(),
    role: userRole, // Store the role (either "user" or "admin")
  })

  // Return the updated user with displayName
  return userCredential.user
}

export const loginWithUsernameOrEmail = async (identifier: string, password: string) => {
  let email = identifier

  // Check if the identifier is a username (not an email)
  if (!identifier.includes("@")) {
    // Query Firestore to find the email associated with the username
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", identifier))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error("Username not found")
    }

    // Assuming username is unique, get the email from the first matched document
    email = querySnapshot.docs[0].data().email
  }

  // Proceed to login with the found email and provided password
  return signInWithEmailAndPassword(auth, email, password)
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Check if this user already exists in Firestore
    const userDocRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(userDocRef)

    if (!docSnap.exists()) {
      // This is a new user, create a document in Firestore
      const username = user.displayName || user.email?.split("@")[0] || "User"
      const email = user.email || ""

      // Default gender to "Not specified" for Google sign-ins
      const gender = "Not specified"

      // Check if this is an admin email
      const isAdmin = email === "ilijan.kurshumov@gmail.com"
      const role = isAdmin ? "admin" : "user"

      await setDoc(userDocRef, {
        username,
        email,
        gender,
        createdAt: new Date(),
        role,
        authProvider: "google",
      })
    }

    return user
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

// Add this new function for redirect-based sign-in
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider)
    // Note: The result will be handled when the page loads after redirect
    // using getRedirectResult()
  } catch (error) {
    console.error("Error initiating Google sign-in redirect:", error)
    throw error
  }
}

// Add this function to handle the redirect result
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth)

    if (result) {
      const user = result.user

      // Check if this user already exists in Firestore
      const userDocRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(userDocRef)

      if (!docSnap.exists()) {
        // This is a new user, create a document in Firestore
        const username = user.displayName || user.email?.split("@")[0] || "User"
        const email = user.email || ""

        // Default gender to "Not specified" for Google sign-ins
        const gender = "Not specified"

        // Check if this is an admin email
        const isAdmin = email === "ilijan.kurshumov@gmail.com"
        const role = isAdmin ? "admin" : "user"

        await setDoc(userDocRef, {
          username,
          email,
          gender,
          createdAt: new Date(),
          role,
          authProvider: "google",
        })
      }

      return user
    }

    return null // No redirect result
  } catch (error) {
    console.error("Error handling Google redirect result:", error)
    throw error
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    console.log("User signed out")
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

export const getUserRole = async (uid: string) => {
  const userDocRef = doc(db, "users", uid)
  const docSnap = await getDoc(userDocRef)

  if (docSnap.exists()) {
    return docSnap.data().role // Return the role (e.g., "user" or "admin")
  } else {
    throw new Error("User not found")
  }
}

