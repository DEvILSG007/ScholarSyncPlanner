import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  Auth
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Firestore
} from "firebase/firestore";

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD11Q1DvQHBcjXiYQl8fx--DjJCMGlk0Lc",
  authDomain: "scholarsync-planner.firebaseapp.com",
  projectId: "scholarsync-planner",
  storageBucket: "scholarsync-planner.firebasestorage.app",
  messagingSenderId: "404104786046",
  appId: "1:404104786046:web:ce25ffe4476a11e4a7282f",
  measurementId: "G-Z9GSC6CHQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics removed to avoid build errors with missing module members
// const analytics = getAnalytics(app);

// --- Auth Setup ---
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    // Explicit handling for unauthorized domains (common in previews)
    if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`Configuration Error: The domain "${domain}" is not authorized for Firebase Authentication.\n\nTo fix this:\n1. Go to the Firebase Console (console.firebase.google.com)\n2. Select project "scholarsync-planner"\n3. Navigate to Authentication > Settings > Authorized Domains\n4. Add "${domain}" to the list.`);
    } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup closed by user");
    } else {
        alert(`Sign in failed: ${error.message}`);
    }
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// --- Firestore Setup ---
const db: Firestore = getFirestore(app);

// Generic subscription helper
const subscribeToCollection = <T>(collectionName: string, userId: string, callback: (data: T[]) => void) => {
  if (!userId) return () => {};
  
  const q = query(collection(db, collectionName), where("userId", "==", userId));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as unknown as T);
    });
    callback(items);
  }, (error) => {
    console.error(`Firestore subscription error (${collectionName}):`, error);
  });
  
  return unsubscribe;
};

// Tasks
export const subscribeToTasks = (userId: string, callback: (tasks: any[]) => void) => 
  subscribeToCollection("tasks", userId, callback);

export const addTask = async (task: any) => {
  try {
    await addDoc(collection(db, "tasks"), task);
  } catch (e) {
    console.error("Error adding task: ", e);
  }
};

export const updateTask = async (taskId: string, updates: any) => {
  try {
    await updateDoc(doc(db, "tasks", taskId), updates);
  } catch (e) {
    console.error("Error updating task: ", e);
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
  } catch (e) {
    console.error("Error deleting task: ", e);
  }
};

// Subjects
export const subscribeToSubjects = (userId: string, callback: (subjects: any[]) => void) =>
  subscribeToCollection("subjects", userId, callback);

export const addSubject = async (subject: any) => {
  try {
    await addDoc(collection(db, "subjects"), subject);
  } catch (e) {
    console.error("Error adding subject: ", e);
  }
};

export const deleteSubject = async (subjectId: string) => {
  try {
    await deleteDoc(doc(db, "subjects", subjectId));
  } catch (e) {
    console.error("Error deleting subject: ", e);
  }
};

// Goals
export const subscribeToGoals = (userId: string, callback: (goals: any[]) => void) =>
  subscribeToCollection("goals", userId, callback);

export const addGoal = async (goal: any) => {
  try {
    await addDoc(collection(db, "goals"), goal);
  } catch (e) {
    console.error("Error adding goal: ", e);
  }
};

export const updateGoal = async (goalId: string, updates: any) => {
  try {
    await updateDoc(doc(db, "goals", goalId), updates);
  } catch (e) {
    console.error("Error updating goal: ", e);
  }
};

export const deleteGoal = async (goalId: string) => {
  try {
    await deleteDoc(doc(db, "goals", goalId));
  } catch (e) {
    console.error("Error deleting goal: ", e);
  }
};

// Study Sessions
export const subscribeToSessions = (userId: string, callback: (sessions: any[]) => void) =>
  subscribeToCollection("studySessions", userId, callback);

export const addSession = async (session: any) => {
  try {
    await addDoc(collection(db, "studySessions"), session);
  } catch (e) {
    console.error("Error adding session: ", e);
  }
};

export { auth, db };