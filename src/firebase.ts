'use client'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyA8kJYXyDwhitc4WmMbf9XcSJgW4dQYAco",
  authDomain: "gis-fram.firebaseapp.com",
  projectId: "gis-fram",
  storageBucket: "gis-fram.appspot.com",
  messagingSenderId: "450414681177",
  appId: "1:450414681177:web:5aba975a1d734902e7e548"
};

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)