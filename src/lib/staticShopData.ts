// src/lib/staticShopData.ts


export const staticShopItems = [
    {
        id: "d-rank-pickaxe",
        itemName: "D-Rank Mana Pickaxe",
        itemType: "weapon",
        rarity: "D-Rank",
        description: "Increases Mana Ore yield by 10%. Essential Phase 1 tool.",
        imageUrl: "/items/weapons/pickaxe_d_icon.png", // Dedicated Path for Item Icons
        priceInJoules: 500,
        priceUSD: 5,
    },
    {
        id: "neon-assassin-skin",
        itemName: "Neon Assassin Skin Blueprint",
        itemType: "character_skin",
        rarity: "C-Rank",
        description: "Unlock the Neon Assassin archetype for permanent customization.",
        imageUrl: "/items/avatars/assassin_skin_icon.png", // Dedicated Path for Avatar Icons
        priceInJoules: 1500,
        priceUSD: 15,
    },
    {
        id: "s-rank-shield",
        itemName: "S-Rank Kinetic Shield",
        itemType: "armor",
        rarity: "S-Rank",
        description: "Passive defense system. Reduces damage from E-Rank Gates by 50%.",
        imageUrl: "/items/armor/shield_s_icon.png", // Dedicated Path for Armor Icons
        priceInJoules: 10000,
        priceUSD: 100,
    },
    {
        id: "core-energy-booster",
        itemName: "Core Energy Booster",
        itemType: "consumable",
        rarity: "B-Rank",
        description: "Temporarily doubles Energy generation rate for 1 hour.",
        imageUrl: "/items/consumables/energy_booster_icon.png", 
        priceInJoules: 800,
        priceUSD: 8,
    },
];

export const staticBattleArenas = [
    {
        id: "arena-void-lock",
        name: "Void Lock Arena Access",
        priceInJoules: 200,
        priceUSD: 2,
        description: "One-time ticket for a high-risk solo simulation in the Void Lock arena.",
        imageUrl: "/arena_covers/void_lock_tile.webp", // Dedicated Path for Arena Tiles
        rarity: "Common",
    },
    {
        id: "arena-pet-proving",
        name: "PET Proving Grounds Entry",
        priceInJoules: 500,
        priceUSD: 5,
        description: "Entry to the advanced P.E.T. Proving Grounds. High rewards.",
        imageUrl: "/arena_covers/proving_grounds_tile.webp", // Dedicated Path for Arena Tiles
        rarity: "Rare",
    },
];