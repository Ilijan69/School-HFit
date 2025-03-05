// authService.ts
import { auth, db } from './firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDoc } from "firebase/firestore";

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  // Force account selection to prevent automatic sign-in with the last used account
  prompt: 'select_account'
});

export const registerWithEmail = async (email: string, password: string, username: string, gender: string, role: string = "user") => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update the profile with the username in Firebase Auth
  await updateProfile(userCredential.user, { displayName: username });

  // If the email is a specific admin email, assign the "admin" role
  const isAdmin = email === "ilijan.kurshumov@gmail.com"; // Replace with your admin's email
  const userRole = isAdmin ? "admin" : role; // Set role to "admin" if condition matches

  // Save the user’s details in Firestore with the role (default to "user")
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    username,
    email,
    gender,
    createdAt: new Date(),
    role: userRole, // Store the role (either "user" or "admin")
  });

  // Return the updated user with displayName
  return userCredential.user;
};

export const loginWithUsernameOrEmail = async (identifier: string, password: string) => {
  let email = identifier;

  // Check if the identifier is a username (not an email)
  if (!identifier.includes('@')) {
    // Query Firestore to find the email associated with the username
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', identifier));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Username not found");
    }

    // Assuming username is unique, get the email from the first matched document
    email = querySnapshot.docs[0].data().email;
  }

  // Proceed to login with the found email and provided password
  return signInWithEmailAndPassword(auth, email, password);
};

// New improved Google sign-in function that tries popup first, then falls back to redirect
export const signInWithGoogle = async () => {
  try {
    console.log("Attempting Google sign-in with popup...");
    
    // Clear any previous auth errors
    localStorage.removeItem('googleAuthError');
    
    // Try popup first (better user experience when it works)
    try {
      // Use the resolver to make popup more reliable
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      console.log("Google popup sign-in successful");
      
      // Save the new user or update existing user in Firestore
      await saveGoogleUserToFirestore(result.user);
      
      return result.user;
    } catch (error) {
      console.log("Popup failed, error:", error);
      
      // If popup fails, try redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {
        
        console.log("Switching to redirect method...");
        localStorage.setItem('googleAuthStartTime', Date.now().toString());
        
        // Use direct redirect as fallback
        await signInWithRedirect(auth, googleProvider);
        return null; // This will redirect and return later
      }
      
      // For other errors, throw them
      throw error;
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    localStorage.setItem('googleAuthError', error.message || 'Unknown error');
    throw error;
  }
};

// Handle redirect result - called on component mount
export const handleRedirectResult = async () => {
  try {
    console.log("Checking for Google redirect result...");
    
    // Check if we have a redirect result
    const result = await getRedirectResult(auth);
    
    // If no result, user might already be signed in or no redirect happened
    if (!result) {
      console.log("No redirect result found");
      
      // Check if user is already signed in
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log("User is already signed in:", currentUser.uid);
        return currentUser;
      }
      
      return null;
    }
    
    // Redirect successful, process the user
    console.log("Google redirect successful:", result.user.uid);
    
    // Save or update user in Firestore
    await saveGoogleUserToFirestore(result.user);
    
    return result.user;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    localStorage.setItem('googleAuthError', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

// Helper function to save Google user to Firestore
const saveGoogleUserToFirestore = async (user) => {
  if (!user) return;
  
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Get user profile data from Google account
    const userData = {
      username: user.displayName || 'User',
      email: user.email || '',
      gender: 'Male', // Default since Google doesn't provide gender
      updatedAt: new Date(),
      authProvider: 'google',
      photoURL: user.photoURL || null
    };
    
    // If user doesn't exist, add creation data
    if (!userDoc.exists()) {
      console.log("Creating new Google user in Firestore");
      
      // Check if this is an admin email
      const isAdmin = user.email === "ilijan.kurshumov@gmail.com";
      
      // Add creation-specific fields
      const newUserData = {
        ...userData,
        createdAt: new Date(),
        role: isAdmin ? "admin" : "user",
      };
      
      await setDoc(userDocRef, newUserData);
    } else {
      console.log("Updating existing Google user in Firestore");
      
      // Merge with existing data
      const existingData = userDoc.data();
      
      // Don't overwrite createdAt and role
      await setDoc(userDocRef, {
        ...userData,
        role: existingData.role || "user",
        createdAt: existingData.createdAt || new Date(),
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error saving Google user to Firestore:", error);
    // We don't throw here to avoid blocking auth success
  }
};

// Get the current authenticated user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const getUserRole = async (uid: string) => {
  const userDocRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userDocRef);
  
  if (docSnap.exists()) {
    return docSnap.data().role;  // Return the role (e.g., "user" or "admin")
  } else {
    throw new Error("User not found");
  }
};