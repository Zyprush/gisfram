'use client'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBIBMfnLa6yDxKpvzrmFAkQV4E7CUApq-Q",
  authDomain: "gifram-b557d.firebaseapp.com",
  projectId: "gifram-b557d",
  storageBucket: "gifram-b557d.appspot.com",
  messagingSenderId: "351311185950",
  appId: "1:351311185950:web:d3be28d38da728b1fb860f",
  measurementId: "G-0NGMYZTLFN"
};  

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)