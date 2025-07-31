// src/api/createCustomToken.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
};

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized.");
    } catch (error: any) {
      if (error.code === 'app/duplicate-app') {
        console.warn("Firebase Admin SDK already initialized. Proceeding.");
      } else {
        console.error("Firebase Admin initialization failed:", error);
        throw new Error("Firebase Admin initialization failed: " + error.message);
      }
    }
  }
}

initializeFirebaseAdmin();

export default async function handler(request: Request): Promise<Response> {
  console.log('API: createCustomToken route hit.');

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const reqBody = await request.json();
  const { idToken } = reqBody;

  if (!idToken || typeof idToken !== "string") {
    console.error("API: Missing or invalid idToken for custom token creation.");
    return new Response(JSON.stringify({ error: "Missing or invalid idToken" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const customToken = await getAuth().createCustomToken(decoded.uid);
    console.log(`API: Custom token created for UID: ${decoded.uid}`);
    return new Response(JSON.stringify({ customToken }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error("API: Failed to create custom token:", error);
    let errorMessage = "Internal server error";
    if (error.code === "auth/id-token-expired") {
      errorMessage = "ID token expired";
    } else if (error.code === "auth/invalid-id-token") {
      errorMessage = "Invalid ID token";
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}