'use client'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDCgqORU1nHN7Hi7vyTCuMD_R3l-BptHGY",
  authDomain: "hrbio-fd338.firebaseapp.com",
  projectId: "hrbio-fd338",
  storageBucket: "hrbio-fd338.appspot.com",
  messagingSenderId: "893765682545",
  appId: "1:893765682545:web:4fa4a83d9d46a0601ea2d0"
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)