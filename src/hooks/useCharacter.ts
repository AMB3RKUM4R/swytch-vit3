// src/hooks/useCharacter.ts
import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseConfig';
import { PlayerData } from '../lib/types';

/**
 * Custom hook to manage the user's character data in real-time from Firestore.
 */
export const useCharacter = () => {
  const [characterModel, setCharacterModel] = useState<PlayerData['character'] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Listen to auth state changes directly to get the user object
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to the character data
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
      } else {
        // Handle case where user exists but PlayerData doesn't (should be rare due to auth hook)
        setCharacterModel(null);
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