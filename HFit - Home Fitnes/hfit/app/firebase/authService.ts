// authService.ts
import { auth, db } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { getDoc } from "firebase/firestore";

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


