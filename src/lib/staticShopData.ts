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
        price: { JOULES: 500 },
        stats: { attack: 5, miningSpeed: 10 }
    },
    {
        id: "plasma-rifle",
        itemName: "Plasma Rifle",
        itemType: "weapon",
        rarity: "B-Rank",
        description: "High-energy ranged weapon. Effective against shielded enemies.",
        visuals: { prefabName: "PlasmaRifle", iconName: "/items/weapons/plasma_rifle.jpg" },
        price: { JOULES: 2500 },
        stats: { attack: 45, range: 20 }
    },
    {
        id: "gravity-hammer",
        itemName: "Gravity Hammer",
        itemType: "weapon",
        rarity: "C-Rank",
        description: "Heavy melee weapon that causes AOE shockwaves.",
        visuals: { prefabName: "GravityHammer", iconName: "/items/weapons/gravity_hammer.jpg" },
        price: { JOULES: 1200 },
        stats: { attack: 30, stunChance: 0.2 }
    },
    {
        id: "void-blade",
        itemName: "Void Blade",
        itemType: "weapon",
        rarity: "A-Rank",
        description: "A blade forged from dark matter. Ignores 50% of armor.",
        visuals: { prefabName: "VoidBlade", iconName: "/items/weapons/void_blade.jpg" },
        price: { JOULES: 8000 },
        stats: { attack: 75, armorPen: 0.5 }
    },
    {
        id: "neural-whip",
        itemName: "Neural Whip",
        itemType: "weapon",
        rarity: "B-Rank",
        description: "Lashes out with psionic energy. High crit chance.",
        visuals: { prefabName: "NeuralWhip", iconName: "/items/weapons/neural_whip.jpg" },
        price: { JOULES: 3000 },
        stats: { attack: 35, critChance: 0.25 }
    },
    {
        id: "quantum-bow",
        itemName: "Quantum Bow",
        itemType: "weapon",
        rarity: "S-Rank",
        description: "Fires arrows that exist in multiple states. Never misses.",
        visuals: { prefabName: "QuantumBow", iconName: "/items/weapons/quantum_bow.jpg" },
        price: { JOULES: 15000 },
        stats: { attack: 90, accuracy: 1.0 }
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
        price: { JOULES: 10000 },
        stats: { defense: 100, blockChance: 0.9 }
    },
    {
        id: "stealth-cloak",
        itemName: "Stealth Cloak",
        itemType: "armor",
        rarity: "A-Rank",
        description: "Grants invisibility when stationary.",
        visuals: { prefabName: "StealthCloak", iconName: "/items/armor/stealth_cloak.jpg" },
        price: { JOULES: 4000 },
        stats: { defense: 20, stealth: 1.0 }
    },
    {
        id: "nano-suit",
        itemName: "Nano-Weave Suit",
        itemType: "armor",
        rarity: "B-Rank",
        description: "Auto-repairs minor damage over time.",
        visuals: { prefabName: "NanoSuit", iconName: "/items/armor/nano_suit.jpg" },
        price: { JOULES: 3000 },
        stats: { defense: 40, regen: 5 }
    },
    {
        id: "heavy-plate",
        itemName: "Titanium Plate",
        itemType: "armor",
        rarity: "C-Rank",
        description: "Standard heavy infantry armor.",
        visuals: { prefabName: "HeavyPlate", iconName: "/items/armor/heavy_plate.jpg" },
        price: { JOULES: 1500 },
        stats: { defense: 60, speedMalus: 0.1 }
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
        price: { JOULES: 800 },
        stats: { energyRestore: 500 }
    },
    {
        id: "health-injector",
        itemName: "Health Injector",
        itemType: "consumable",
        rarity: "D-Rank",
        description: "Restores 50 HP.",
        visuals: { prefabName: "HealthInj", iconName: "/items/consumables/health_injector.jpg" },
        price: { JOULES: 100 },
        stats: { hpRestore: 50 }
    },
    {
        id: "xp-tome",
        itemName: "Tome of Knowledge",
        itemType: "consumable",
        rarity: "A-Rank",
        description: "Grants 1000 XP instantly.",
        visuals: { prefabName: "XPTome", iconName: "/items/consumables/xp_tome.jpg" },
        price: { JOULES: 5000 },
        stats: { xpGrant: 1000 }
    },

    // ────────────────────────────────────────────────────────────────
    // ARTIFACTS
    // ────────────────────────────────────────────────────────────────
    {
        id: "void-badge",
        itemName: "Badge of the Void",
        itemType: "title",
        rarity: "A-Rank",
        description: "Proof of conquering the Void Pit. Unlocks elite status.",
        visuals: { prefabName: "VoidBadge", iconName: "/items/artifacts/void_badge.jpg" },
        price: { JOULES: 5000 }
    },
    {
        id: "data-key",
        itemName: "Encrypted Data Key",
        itemType: "title",
        rarity: "S-Rank",
        description: "Unlocks the secret developer room in Tech Assault.",
        visuals: { prefabName: "DataKey", iconName: "/items/artifacts/data_key.jpg" },
        price: { JOULES: 12000 }
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