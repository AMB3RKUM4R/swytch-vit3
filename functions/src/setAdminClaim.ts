import {getAuth} from 'firebase-admin/auth';
import {Request, Response} from 'express';

const ADMIN_CLAIM_REQUIRED = 'admin';

export const setAdminClaimHandler = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(405).send({status: 'error', message: 'Method Not Allowed'});
  }

  const auth = getAuth();

  // 1. Check Caller's Authentication and Admin Claim
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(403).send({status: 'error', message: 'Unauthorized: No token provided'});
  }

  const idToken = req.headers.authorization.split('Bearer ')[1];
  let decodedToken;

  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).send({status: 'error', message: 'Unauthorized: Invalid token'});
  }

  // Check if the caller has the required Admin claim
  if (!decodedToken[ADMIN_CLAIM_REQUIRED]) {
    return res.status(403).send({status: 'error', message: 'Forbidden: Only existing admins can set new claims.'});
  }

  // 2. Validate Request Body
  const {targetUserId} = req.body;
  const adminUserId = decodedToken.uid;

  if (!targetUserId || typeof targetUserId !== 'string') {
    return res.status(400).send({status: 'error', message: 'Invalid targetUserId provided.'});
  }

  // 3. Perform Admin Action: Set Custom Claim
  try {
    // Fetch user data
    const user = await auth.getUser(targetUserId);
    const currentClaims = user.customClaims || {};

    // Set the new claims
    await auth.setCustomUserClaims(targetUserId, {
      ...currentClaims,
      [ADMIN_CLAIM_REQUIRED]: true,
    });

    // IMPORTANT: Revoke all refresh tokens to force the user to re-authenticate
    await auth.revokeRefreshTokens(targetUserId);

    console.log(`Admin ${adminUserId} successfully set admin claim for user ${targetUserId}.`);

    return res.status(200).send({
      status: 'success',
      message: `User ${targetUserId} is now an administrator. They must log out and back in to gain full privileges.`,
    });
  } catch (error: any) {
    console.error('Failed to set admin claim:', error);
    return res.status(500).send({
      status: 'error',
      message: `Failed to set admin claim: ${error.message}`,
    });
  }
};
