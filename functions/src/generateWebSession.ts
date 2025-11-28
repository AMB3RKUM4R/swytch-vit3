// functions/src/generateWebSession.ts
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {randomBytes} from 'crypto';
import {Request} from 'firebase-functions/v2/https';
import type {Response} from 'express';

export const generateWebSessionHandler = async (request: Request, response: Response) => {
  const db = getFirestore();
  const auth = getAuth();

  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method Not Allowed'});
    return;
  }

  const authorization = request.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    response.status(401).json({error: 'Unauthorized'});
    return;
  }

  const idToken = authorization.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error: any) {
    console.error('Invalid ID token:', error);
    response.status(401).json({error: 'Invalid token'});
    return;
  }

  const userId = decodedToken.uid;
  const webSessionToken = randomBytes(32).toString('hex');

  try {
    const playerRef = db.collection('Players').doc(userId);

    await playerRef.update({
      'session.webToken': webSessionToken,
      'session.webTokenCreatedAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });

    console.log(`Web session token generated for user: ${userId}`);
    response.status(200).json({token: webSessionToken});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API: Failed to generate web session for user ${userId}:`, errorMessage);
    response.status(500).json({error: 'Failed to create session'});
  }
};