import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Loader2, Zap } from 'lucide-react';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { Quest, SupportedCurrency, TransactionType, TransactionStatus } from '@/lib/types';

const pilotQuests: Quest[] = [
  { id: "daily-mana-run", title: "Mana Miner Run (3x)", progress: 0, goal: 3, rewardJOULES: 25, rewardXP: 50, completed: false },
  { id: "buy-first-item", title: "First Market Purchase", progress: 0, goal: 1, rewardJOULES: 50, rewardXP: 100, completed: false },
  { id: "share-protocol", title: "Broadcast Signal (Daily)", progress: 0, goal: 1, rewardJOULES: 10, rewardXP: 20, completed: false },
];

const QuestsPanel: FC = () => {
    const { userId, logTransaction } = usePlayer();
    const { setShowMessage } = useModal();
    const [quests, setQuests] = useState<Quest[]>(pilotQuests);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const handleClaimReward = useCallback(async (quest: Quest) => {
        if (!userId) {
            setShowMessage("⚠️ LOGIN REQUIRED");
            return;
        }
        setClaimingId(quest.id);
        try {
            await logTransaction({
                transactionId: `QUEST_${userId}_${quest.id}_${Date.now()}`,
                userId: userId,
                amount: quest.rewardJOULES,
                currency: 'JOULES' as SupportedCurrency,
                transactionType: 'quest-reward' as TransactionType,
                status: 'success' as TransactionStatus,
                itemId: quest.id,
            });
            setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: true, progress: q.goal } : q));
            setShowMessage(`🏆 REWARD CLAIMED: +${quest.rewardJOULES} J`);
        } catch (error) {
            setShowMessage("❌ CLAIM FAILED");
        } finally {
            setClaimingId(null);
        }
    }, [userId, logTransaction, setShowMessage]);

    return (
        <div className="space-y-2">
            {quests.map((quest) => {
                const isClaimed = quest.completed;
                return (
                    <div key={quest.id} className="p-3 bg-white/5 border border-white/10 flex items-center justify-between group hover:border-primary/50 transition-colors">
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase">{quest.title}</h3>
                            <p className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-400" /> {quest.rewardJOULES} JOULES
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => !isClaimed && handleClaimReward(quest)}
                            disabled={isClaimed || claimingId === quest.id}
                            className={`text-[10px] px-3 py-1 font-bold uppercase border ${isClaimed ? 'border-green-600 text-green-600' : 'border-white/20 text-white hover:bg-white/10'}`}
                        >
                            {isClaimed ? 'COMPLETED' : (claimingId === quest.id ? 'CLAIMING...' : 'CLAIM')}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default QuestsPanel;