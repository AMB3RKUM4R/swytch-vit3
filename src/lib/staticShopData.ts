// src/lib/staticShopData.ts
import { ItemDefinition } from './types';

export const staticShopItems: ItemDefinition[] = [
    // ────────────────────────────────────────────────────────────────
    // WEAPONS
    // ────────────────────────────────────────────────────────────────
    {
        id: "d-rank-pickaxe",
        itemName: "D-Rank Pickaxe",
        itemType: "weapon",
        rarity: "D-Rank",
        description: "Standard issue mining tool. Increases ore yield by 15%.",
        visuals: { prefabName: "Pickaxe_D", iconName: "/items/weapons/pickaxe_d.jpg" },
        price: { joules: 500 },
        stats: { attack: 5, miningSpeed: 10, levelReq: 1 },
        levelRequirement: 0
    },
    {
        id: "plasma-rifle",
        itemName: "Plasma Rifle",
        itemType: "weapon",
        rarity: "B-Rank",
        description: "High-energy ranged weapon. Effective against shielded enemies.",
        visuals: { prefabName: "PlasmaRifle", iconName: "/items/weapons/plasma_rifle.jpg" },
        price: { joules: 2500 },
        stats: { attack: 45, range: 20, levelReq: 5 },
        levelRequirement: 0
    },
    {
        id: "gravity-hammer",
        itemName: "Gravity Hammer",
        itemType: "weapon",
        rarity: "C-Rank",
        description: "Heavy melee weapon that causes AOE shockwaves.",
        visuals: { prefabName: "GravityHammer", iconName: "/items/weapons/gravity_hammer.jpg" },
        price: { joules: 1200 },
        stats: { attack: 30, stunChance: 0.2, levelReq: 3 },
        levelRequirement: 0
    },
    {
        id: "void-blade",
        itemName: "Void Blade",
        itemType: "weapon",
        rarity: "A-Rank",
        description: "A blade forged from dark matter. Ignores 50% of armor.",
        visuals: { prefabName: "VoidBlade", iconName: "/items/weapons/void_blade.jpg" },
        price: { joules: 8000 },
        stats: { attack: 75, armorPen: 0.5, levelReq: 10 },
        levelRequirement: 0
    },
    {
        id: "neural-whip",
        itemName: "Neural Whip",
        itemType: "weapon",
        rarity: "B-Rank",
        description: "Lashes out with psionic energy. High crit chance.",
        visuals: { prefabName: "NeuralWhip", iconName: "/items/weapons/neural_whip.jpg" },
        price: { joules: 3000 },
        stats: { attack: 35, critChance: 0.25, levelReq: 6 },
        levelRequirement: 0
    },
    {
        id: "quantum-bow",
        itemName: "Quantum Bow",
        itemType: "weapon",
        rarity: "S-Rank",
        description: "Fires arrows that exist in multiple states. Never misses.",
        visuals: { prefabName: "QuantumBow", iconName: "/items/weapons/quantum_bow.jpg" },
        price: { joules: 15000 },
        stats: { attack: 90, accuracy: 1.0, levelReq: 15 },
        levelRequirement: 0
    },

    // ────────────────────────────────────────────────────────────────
    // ARMOR
    // ────────────────────────────────────────────────────────────────
    {
        id: "s-rank-shield",
        itemName: "S-Rank Kinetic Shield",
        itemType: "armor",
        rarity: "S-Rank",
        description: "Blocks 90% of incoming projectile damage.",
        visuals: { prefabName: "Shield_S", iconName: "/items/armor/shield_s.jpg" },
        price: { joules: 10000 },
        stats: { defense: 100, blockChance: 0.9, levelReq: 15 },
        levelRequirement: 0
    },
    {
        id: "stealth-cloak",
        itemName: "Stealth Cloak",
        itemType: "armor",
        rarity: "A-Rank",
        description: "Grants invisibility when stationary.",
        visuals: { prefabName: "StealthCloak", iconName: "/items/armor/stealth_cloak.jpg" },
        price: { joules: 4000 },
        stats: { defense: 20, stealth: 1.0, levelReq: 8 },
        levelRequirement: 0
    },
    {
        id: "nano-suit",
        itemName: "Nano-Weave Suit",
        itemType: "armor",
        rarity: "B-Rank",
        description: "Auto-repairs minor damage over time.",
        visuals: { prefabName: "NanoSuit", iconName: "/items/armor/nano_suit.jpg" },
        price: { joules: 3000 },
        stats: { defense: 40, regen: 5, levelReq: 5 },
        levelRequirement: 0
    },
    {
        id: "heavy-plate",
        itemName: "Titanium Plate",
        itemType: "armor",
        rarity: "C-Rank",
        description: "Standard heavy infantry armor.",
        visuals: { prefabName: "HeavyPlate", iconName: "/items/armor/heavy_plate.jpg" },
        price: { joules: 1500 },
        stats: { defense: 60, speedMalus: 0.1, levelReq: 3 },
        levelRequirement: 0
    },

    // ────────────────────────────────────────────────────────────────
    // CONSUMABLES
    // ────────────────────────────────────────────────────────────────
    {
        id: "core-booster",
        itemName: "Core Energy Booster",
        itemType: "consumable",
        rarity: "B-Rank",
        description: "Instantly restores 500 Energy.",
        visuals: { prefabName: "CoreBooster", iconName: "/items/consumables/core_booster.jpg" },
        price: { joules: 800 },
        stats: { energyRestore: 500, levelReq: 1 },
        levelRequirement: 0
    },
    {
        id: "health-injector",
        itemName: "Health Injector",
        itemType: "consumable",
        rarity: "D-Rank",
        description: "Restores 50 HP.",
        visuals: { prefabName: "HealthInj", iconName: "/items/consumables/health_injector.jpg" },
        price: { joules: 100 },
        stats: { hpRestore: 50, levelReq: 1 },
        levelRequirement: 0
    },
    {
        id: "xp-tome",
        itemName: "Tome of Knowledge",
        itemType: "consumable",
        rarity: "A-Rank",
        description: "Grants 1000 XP instantly.",
        visuals: { prefabName: "XPTome", iconName: "/items/consumables/xp_tome.jpg" },
        price: { joules: 5000 },
        stats: { xpGrant: 1000, levelReq: 1 },
        levelRequirement: 0
    },

    // ────────────────────────────────────────────────────────────────
    // ARTIFACTS
    // ────────────────────────────────────────────────────────────────
    {
        id: "void-badge",
        itemName: "Badge of the Void",
        itemType: "artifact", // FIX: Changed from 'title' to 'artifact'
        rarity: "A-Rank",
        description: "Proof of conquering the Void Pit. Unlocks elite status.",
        visuals: { prefabName: "VoidBadge", iconName: "/items/artifacts/void_badge.jpg" },
        price: { joules: 5000 },
        levelRequirement: 10, // Added base property
        stats: { prestige: 50 }
    },
    {
        id: "data-key",
        itemName: "Encrypted Data Key",
        itemType: "artifact", // FIX: Changed from 'title' to 'artifact'
        rarity: "S-Rank",
        description: "Unlocks the secret developer room in Tech Assault.",
        visuals: { prefabName: "DataKey", iconName: "/items/artifacts/data_key.jpg" },
        price: { joules: 12000 },
        levelRequirement: 20, // Added base property
        stats: { accessLevel: 5 }
    }
];

// Optional export for arenas if needed by older components
export const staticBattleArenas = [
    {
        id: "arena_void_pit",
        name: "Void Lock Arena",
        priceInJoules: 200,
        description: "High-risk solo simulation.",
        imageUrl: "/arenas/void_pit.mp4",
        rarity: "Common",
    },
];