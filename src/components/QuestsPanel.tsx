import { FC, useState, useCallback } from 'react';
import { Zap } from 'lucide-react';
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
        <div className="space-y-2 font-mono">
            {quests.map((quest) => {
                const isClaimed = quest.completed;
                return (
                    <div key={quest.id} className="p-3 bg-black border border-gray-800 flex items-center justify-between group hover:border-[#39FF14] transition-colors">
                        <div>
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">{quest.title}</h3>
                            <p className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-[#39FF14]" /> {quest.rewardJOULES} JOULES
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => !isClaimed && handleClaimReward(quest)}
                            disabled={isClaimed || claimingId === quest.id}
                            className={`text-[10px] px-3 py-1 font-bold uppercase border transition-all ${
                                isClaimed 
                                ? 'border-gray-800 text-gray-600 cursor-not-allowed' 
                                : 'border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black'
                            }`}
                        >
                            {isClaimed ? 'COMPLETED' : (claimingId === quest.id ? '...' : 'CLAIM')}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default QuestsPanel;