// src/lib/PlayerStatsUtils.ts

import { PlayerData, ItemDefinition, InventoryItem } from "./types";

// Base stats definition for a level 1 character without gear (Ported from EquipmentManager.cs)
const BASE_HEALTH = 100;
const HEALTH_PER_LEVEL = 10;
const BASE_ATTACK = 5;
const BASE_DEFENSE = 5;

/**
 * Calculates a player's final combat statistics by summing up base stats
 * and the stats provided by all equipped items.
 * * Logic ported directly from EquipmentManager.cs
 * @param playerData The current player's data object from Firestore.
 * @param itemDefinitions A map of all ItemDefinitions (blueprints).
 * @returns A dictionary of final, calculated player stats.
 */
export function calculateFinalPlayerStats(
  playerData: PlayerData,
  itemDefinitions: Record<string, ItemDefinition>
): Record<string, number> {
  const finalStats: Record<string, number> = {};

  // 1. Establish Base Stats (Matching C# logic)
  finalStats['Health'] = BASE_HEALTH + (playerData.level * HEALTH_PER_LEVEL);
  finalStats['Mana'] = playerData.mana;
  finalStats['Energy'] = playerData.energy;

  // Initialize Aggregated Stats (Attack/Defense are critical for display)
  finalStats['Attack'] = BASE_ATTACK;
  finalStats['Defense'] = BASE_DEFENSE;
  finalStats['JouleBonus'] = 0.0; // Your new stat
  finalStats['XpBonus'] = 0.0;     // Your new stat
  finalStats['CritChance'] = 0.05; // Base Crit 5%

  if (!playerData.inventory?.equipped || !playerData.inventory.items) {
    return finalStats;
  }

  // Helper to iterate equipped item instances
  const equippedInstances = Object.values(playerData.inventory.equipped)
    .filter((instanceId): instanceId is string => typeof instanceId === 'string' && !!playerData.inventory?.items[instanceId])
    .map(instanceId => playerData.inventory!.items[instanceId] as InventoryItem);

  // 2. Add Stats from Equipped Items
  for (const itemInstance of equippedInstances) {
    const definition = itemDefinitions[itemInstance.itemId];

    if (definition?.stats) {
      for (const [statKey, statValue] of Object.entries(definition.stats)) {
        const value = Number(statValue);
        
        // Additive Summation (Direct mirror of C# logic)
        if (finalStats.hasOwnProperty(statKey)) {
          finalStats[statKey] += value;
        } else {
          // If a new stat is found, initialize it
          finalStats[statKey] = value;
        }
      }
    }
  }

  return finalStats;
}