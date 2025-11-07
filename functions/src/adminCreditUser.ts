import {getAuth} from 'firebase-admin/auth';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {Request, Response} from 'express'; // Import types from express for clarity

const ADMIN_CLAIM_REQUIRED = 'admin';
const db = getFirestore();

// NOTE: We change the return type to Promise<void> for compatibility with https.onRequest
export const adminCreditUserHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).send({status: 'error', message: 'Method Not Allowed'});
    return;
  }

  const auth = getAuth();

  // 1. Check Caller's Authentication and Admin Claim
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send({status: 'error', message: 'Unauthorized: No token provided'});
    return;
  }

  const idToken = req.headers.authorization.split('Bearer ')[1];
  let decodedToken;

  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(403).send({status: 'error', message: 'Unauthorized: Invalid token'});
    return;
  }

  // Check if the caller has the required Admin claim
  if (!decodedToken[ADMIN_CLAIM_REQUIRED]) {
    res.status(403).send({status: 'error', message: 'Forbidden: Only administrators can use this tool.'});
    return;
  }

  // 2. Validate Request Body
  const {targetUserId, amount, transactionNote} = req.body;
  const adminUserId = decodedToken.uid;
  const parsedAmount = parseFloat(amount);

  if (!targetUserId || isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400).send({status: 'error', message: 'Invalid targetUserId or amount provided.'});
    return;
  }

  const playerRef = db.collection('Players').doc(targetUserId);
  const transactionRef = db.collection('Transactions').doc();

  // 3. Perform Transaction (Credit User Balance)
  try {
    await db.runTransaction(async (t) => {
      const playerDoc = await t.get(playerRef);
      if (!playerDoc.exists) {
        throw new Error('Target player not found.');
      }

      // Update player balance
      t.update(playerRef, {
        balance: FieldValue.increment(parsedAmount),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Log the transaction
      t.set(transactionRef, {
        transactionId: transactionRef.id,
        userId: targetUserId,
        amount: parsedAmount,
        currency: 'USD_MANUAL',
        transactionType: 'deposit_admin_approved',
        status: 'success',
        timestamp: FieldValue.serverTimestamp(),
        adminId: adminUserId,
        note: transactionNote || 'Manual credit via admin tool.',
      });
    });

    console.log(`Admin ${adminUserId} successfully credited user ${targetUserId} with $${parsedAmount}.`);

    res.status(200).send({
      status: 'success',
      message: `User ${targetUserId} credited with $${parsedAmount.toFixed(2)}.`,
    });
  } catch (error: any) {
    console.error(`Failed to credit user ${targetUserId}:`, error);
    res.status(500).send({
      status: 'error',
      message: `Failed to credit user: ${error.message}`,
    });
  }
};
