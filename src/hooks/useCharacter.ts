// src/hooks/useCharacter.ts
import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseConfig';
import { PlayerData } from '../lib/types';

/**
 * Custom hook to manage the user's character data in real-time from Firestore.
 * It provides the character model and a function to securely update it.
 */
export const useCharacter = () => {
  const [characterModel, setCharacterModel] = useState<PlayerData['character'] | null>(null);
  const [user, setUser] = useState<User | null>(null); // Assuming auth state is available globally

  // In a full implementation, you would get the user from an auth context.
  // For now, we'll listen to auth state changes directly.
  useEffect(() => {
    // Placeholder: You'll want to get the user from your auth context
    // This is a stand-in for `useUserAuth` or similar hook.
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setCharacterModel(null);
      return;
    }

    const playerRef = doc(db, 'Players', user.uid);
    const unsubscribe = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PlayerData;
        if (data.character) {
          setCharacterModel(data.character);
        }
      }
    }, (error) => {
      console.error("Error fetching character data:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const updateCharacter = useCallback(async (newCharacter: PlayerData['character']) => {
    if (!user) {
      console.error("User not authenticated. Cannot update character.");
      return;
    }
    
    const playerRef = doc(db, 'Players', user.uid);
    
    // The Firebase rules allow a user to update their own `character` field
    // as long as they also update the `updatedAt` field.
    try {
      await updateDoc(playerRef, {
        character: newCharacter,
        updatedAt: serverTimestamp(),
      });
      console.log("Character updated successfully.");
    } catch (error) {
      console.error("Failed to update character:", error);
    }
  }, [user]);

  return { characterModel, updateCharacter };
};