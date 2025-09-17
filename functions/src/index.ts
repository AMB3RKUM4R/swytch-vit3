// functions/src/index.ts
import * as admin from "firebase-admin";
import {ethers} from "ethers";
import {onCall, HttpsError} from "firebase-functions/v2/https";

admin.initializeApp();

interface VerifyWalletData {
  address: string;
  signature: string;
}

export const verifywalletandsignin = onCall(
  {region: "asia-south1"},
  (request): Promise<{token: string}> => {
    const {address, signature} = request.data as VerifyWalletData;

    if (!address || !signature) {
      throw new HttpsError(
        "invalid-argument",
        "Missing 'address' or 'signature' arguments."
      );
    }

    try {
      const message =
        "Welcome to the SWYTCH PETverse! Sign this message to prove " +
        "you own this wallet and to log in. This won't cost any gas.";

      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new HttpsError(
          "unauthenticated",
          "The signature is not valid for the provided address."
        );
      }

      return admin.auth().createCustomToken(address)
        .then((customToken) => {
          return {token: customToken};
        });
    } catch (error) {
      console.error("Error verifying signature:", error);
      throw new HttpsError(
        "internal",
        "An internal error occurred while verifying the signature."
      );
    }
  }
);


