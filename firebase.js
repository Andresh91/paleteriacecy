import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, setDoc, doc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAohT7GeVAh-G1LIyQCzqGmdfWePsXq7Eg",
  authDomain: "heladostiacecy.firebaseapp.com",
  projectId: "heladostiacecy",
  storageBucket: "heladostiacecy.appspot.com",
  messagingSenderId: "938330303714",
  appId: "1:938330303714:web:fe3ac4fcd7db03486f82bb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, signInWithEmailAndPassword, collection, getDocs, addDoc, setDoc, doc, deleteDoc, Timestamp, storage, ref, uploadBytes, getDownloadURL, getStorage };