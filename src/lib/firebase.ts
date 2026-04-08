import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
console.log("Initializing Firebase with project:", firebaseConfig.projectId);
console.log("Using Firestore database ID:", firebaseConfig.firestoreDatabaseId || '(default)');
const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust settings for sandboxed environments
export const db = initializeFirestore(app, { 
  host: "firestore.googleapis.com",
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
}, firebaseConfig.firestoreDatabaseId || '(default)');

// Validate Connection to Firestore
async function testConnection() {
  try {
    // This will trigger a network request to check if the backend is reachable
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firestore connection successful.");
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message?.includes('the client is offline')) {
      console.error("Firestore connection failed: Could not reach the backend. This usually means the database ID in firebase-applet-config.json is incorrect or the database is not provisioned.");
      console.error("Current Database ID:", firebaseConfig.firestoreDatabaseId);
    } else {
      // Other errors (like permission denied) mean we ARE connected, just not authorized for this specific path.
      console.log("Firestore connected (received expected permission error or other response).");
    }
  }
}
testConnection();

export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
