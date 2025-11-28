// src/components/QuestsPanel.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Loader2, Sparkles } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { Quest, SupportedCurrency, TransactionType, TransactionStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

// Static Quests defined here for the Pilot Phase
const pilotQuests: Quest[] = [
  { id: "daily-mana-run", title: "Complete Mana Miner Gate (3x)", progress: 0, goal: 3, rewardJOULES: 25, rewardXP: 50, completed: false },
  { id: "buy-first-item", title: "Acquire First Item Blueprint", progress: 0, goal: 1, rewardJOULES: 50, rewardXP: 100, completed: false },
  { id: "share-protocol", title: "Share Swytch on X (Daily)", progress: 0, goal: 1, rewardJOULES: 10, rewardXP: 20, completed: false },
  { id: "watch-adstraa-video", title: "Watch AdStraa Briefing (Daily)", progress: 0, goal: 1, rewardJOULES: 5, rewardXP: 10, completed: false },
];

const QuestsPanel: FC = () => {
    const { userId, logTransaction } = usePlayer();
    const { setShowMessage } = useModal();
    const [quests, setQuests] = useState<Quest[]>(pilotQuests);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [loading] = useState(false);

    // Mock function to check progress/status (In Season 2, this would hit a Firestore doc)
    // NOTE: For now, the 'Share' quest is the only one we can truly "complete" from the UI.
    const checkMockProgress = useCallback((q: Quest): boolean => {
        if (q.id === "community-visit" || q.id === "buy-first-item") {
            return Math.random() > 0.8; // Mock 20% chance of completion check success
        }
        return false;
    }, []);


    const handleClaimReward = useCallback(async (quest: Quest) => {
        if (!userId) {
            setShowMessage("⚠️ Please sign in to claim rewards.");
            return;
        }

        // 1. Mock Completion Check (If not already completed)
        if (!quest.completed && !checkMockProgress(quest)) {
             setShowMessage(`Mission not complete! Progress: ${quest.progress}/${quest.goal}`);
             return;
        }

        setClaimingId(quest.id);

        try {
            // 2. Log Transaction to the ledger (Reward)
            await logTransaction({
                transactionId: `QUEST_CLAIM_${userId}_${quest.id}_${Date.now()}`,
                userId: userId,
                amount: quest.rewardJOULES,
                currency: 'JOULES' as SupportedCurrency,
                transactionType: 'quest-reward' as TransactionType,
                status: 'success' as TransactionStatus,
                itemId: quest.id,
            });

            // 3. Update local state to mark as claimed/completed
            setQuests(prev => prev.map(q => 
                q.id === quest.id ? { ...q, completed: true, progress: q.goal } : q
            ));

            setShowMessage(`🏆 Reward claimed! +${quest.rewardJOULES} JOULES.`);
        } catch (error) {
            console.error("Failed to log quest transaction:", error);
            setShowMessage("❌ Failed to claim reward. Try again later.");
        } finally {
            setClaimingId(null);
        }
    }, [userId, logTransaction, setShowMessage, checkMockProgress]);
    
    // --- Initial Load/Progress Tracking Mock ---
    useEffect(() => {
        // Mock: Set 'Visit Community Hub' to completed for the initial flow.
        setQuests(prev => prev.map(q => 
             q.id === "community-visit" ? { ...q, progress: 1, goal: 1, completed: true } : q
        ));
    }, []);


    if (loading) return <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto my-12" />;

    return (
        <div className="space-y-4">
            {quests.map((quest) => {
                const isClaimed = quest.completed && quest.progress >= quest.goal;
                const isReadyToClaim = quest.progress >= quest.goal && !isClaimed;
                const isProcessing = claimingId === quest.id;

                return (
                    <motion.div
                        key={quest.id}
                        className={cn("p-4 rounded-lg border flex items-center justify-between",
                            isClaimed ? "bg-green-600/20 border-green-600/50" : 
                            isReadyToClaim ? "bg-primary/20 border-primary/50" :
                            "bg-card border-border"
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Left Side: Info */}
                        <div className="flex-1 min-w-0 pr-4">
                            <h3 className="text-lg font-poppins font-bold text-foreground truncate">{quest.title}</h3>
                            <p className="text-sm text-muted-foreground font-inter mt-1">
                                Reward: <Sparkles className="inline w-4 h-4 text-yellow-400" /> {quest.rewardJOULES} JOULES + {quest.rewardXP} XP
                            </p>
                            <div className="flex items-center text-xs mt-2">
                                <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                <span>Progress: {quest.progress}/{quest.goal}</span>
                            </div>
                        </div>

                        {/* Right Side: Action Button */}
                        <div className="flex-shrink-0">
                            {isProcessing ? (
                                <button className="btn-secondary px-4 py-2 disabled:opacity-70" disabled>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Claiming...
                                </button>
                            ) : isClaimed ? (
                                <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold cursor-not-allowed" disabled>
                                    <CheckCircle className="w-4 h-4 inline mr-2" /> Claimed
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleClaimReward(quest)}
                                    className={cn("px-4 py-2 rounded-md text-sm font-semibold", 
                                        isReadyToClaim ? "btn-primary" : "btn-secondary"
                                    )}
                                    disabled={!isReadyToClaim}
                                >
                                    Claim Reward
                                </button>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export default QuestsPanel;