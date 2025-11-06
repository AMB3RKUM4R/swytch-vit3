// functions/src/createCustomToken.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { Request } from "firebase-functions/v2/https"; // <-- THE FIX
import type { Response } from "express"; // <-- THE FIX

// (Firebase Admin Setup... no changes)
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
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
// ---

export const createCustomTokenHandler = async (request: Request, response: Response) => { // <-- CORRECT TYPES
  console.log('API: createCustomToken route hit.');

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  // (Rest of the function is identical)
  const { idToken } = request.body;

  if (!idToken || typeof idToken !== "string") {
    console.error("API: Missing or invalid idToken for custom token creation.");
    response.status(400).json({ error: "Missing or invalid idToken" });
    return;
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const customToken = await getAuth().createCustomToken(decoded.uid);
    console.log(`API: Custom token created for UID: ${decoded.uid}`);
    response.status(200).json({ customToken });
  } catch (error: any) {
    console.error("API: Failed to create custom token:", error);
    let errorMessage = "Internal server error";
    if (error.code === "auth/id-token-expired") {
      errorMessage = "ID token expired";
    } else if (error.code === "auth/invalid-id-token") {
      errorMessage = "Invalid ID token";
    }
    response.status(500).json({ error: errorMessage });
  }
};