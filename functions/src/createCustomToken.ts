// functions/src/createCustomToken.ts

import {getAuth} from 'firebase-admin/auth';
import {Request} from 'firebase-functions/v2/https';
import type {Response} from 'express';

export const createCustomTokenHandler = async (request: Request, response: Response) => {
  const auth = getAuth();

  console.log('API: createCustomToken route hit.');

  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }

  const {idToken} = request.body;

  if (!idToken || typeof idToken !== 'string') {
    console.error('API: Missing or invalid idToken for custom token creation.');
    response.status(400).json({error: 'Missing or invalid idToken'});
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const customToken = await auth.createCustomToken(decoded.uid);
    console.log(`API: Custom token created for UID: ${decoded.uid}`);
    response.status(200).json({customToken});
  } catch (error: any) {
    console.error('API: Failed to create custom token:', error);
    let errorMessage = 'Internal server error';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'ID token expired';
    } else if (error.code === 'auth/invalid-id-token') {
      errorMessage = 'Invalid ID token';
    }
    response.status(500).json({error: errorMessage});
  }
};
// Final EOL added