'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function getClientApp(): FirebaseApp {
  if (app) return app;

  const apps = getApps();
  if (apps.length > 0) {
    app = apps[0];
    return app;
  }

  app = initializeApp(firebaseConfig);
  return app;
}

export function getClientAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getClientApp());
  return auth;
}

export function getClientDb(): Firestore {
  if (db) return db;
  db = getFirestore(getClientApp());
  return db;
}

export function getClientStorage(): FirebaseStorage {
  if (storage) return storage;
  storage = getStorage(getClientApp());
  return storage;
}
