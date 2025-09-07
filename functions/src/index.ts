import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Get a reference to the Firestore database
const db = admin.firestore();

// CORRECTED: The handler now accepts a single 'request' object.
export const grantLootOnKill = functions.https.onCall(async (request) => {
  // 1. --- Security and Validation ---
  // Ensure the user calling this function is authenticated.
  // We now access the auth context via 'request.auth'.
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Get the user's ID from the authentication context. This is secure.
  const userId = request.auth.uid;
  // Get the ID of the enemy that was killed from the data sent by the game.
  // We now access the data via 'request.data'.
  const enemyId = request.data.enemyId;

  if (!enemyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with an 'enemyId' argument."
    );
  }

  // 2. --- Fetching the Blueprints from the Database ---
  const playerRef = db.collection("Players").doc(userId);
  const enemyRef = db.collection("EnemyDefinitions").doc(enemyId);

  // Run both database reads at the same time for efficiency.
  const [playerDoc, enemyDoc] = await Promise.all([
    playerRef.get(),
    enemyRef.get(),
  ]);

  if (!playerDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Player document not found.");
  }
  if (!enemyDoc.exists) {
    throw new functions.https.HttpsError("not-found", `Enemy definition '${enemyId}' not found.`);
  }

  const enemyData = enemyDoc.data();
  if (!enemyData) {
    throw new functions.https.HttpsError("internal", "Error reading enemy data.");
  }


  // 3. --- Calculating the Rewards ---
  const lootTable = enemyData.lootTable;
  const xpReward = enemyData.xpReward || 0;

  // Calculate a random gold drop between the min and max values in the blueprint.
  const minGold = lootTable?.guaranteedGold?.min || 0;
  const maxGold = lootTable?.guaranteedGold?.max || 0;
  const goldDropped = Math.floor(Math.random() * (maxGold - minGold + 1) + minGold);

  // TODO: Add logic for random item drops here in a future version.


  // 4. --- Securely Updating the Player's Data ---
  // We use FieldValue.increment() for a safe, atomic update that prevents race conditions.
  const updates = {
    gold: admin.firestore.FieldValue.increment(goldDropped),
    xp: admin.firestore.FieldValue.increment(xpReward),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await playerRef.update(updates);


  // 5. --- Send a Success Response Back to the Game ---
  // The Unity game will receive this response.
  console.log(`User ${userId} defeated ${enemyId} and received ${goldDropped} gold and ${xpReward} XP.`);
  return {
    success: true,
    goldAwarded: goldDropped,
    xpAwarded: xpReward,
  };
});