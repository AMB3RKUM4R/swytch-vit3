import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, UserPlus, BarChart2, ShieldAlert, CheckCircle, Loader2, Feather, DollarSign, ListChecks, ShieldCheck, Activity, Users, Database } from 'lucide-react'; 
import { doc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { db } from '../lib/firebaseConfig'; 
import { ItemDefinition, Transaction } from '../lib/types'; 
import { usePlayer } from '../components/context/PlayerContext';
import { useModal } from '../components/context/ModalContext';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'; 

import SwytchErrorBoundary from '../components/ErrorBoundaryComponent'; 

// Firebase Config
const FUNCTIONS_BASE_URL = 'https://us-central1-swytch-pet.cloudfunctions.net'; 

// ────────────────────────────────────────────────────────────────
// HELPER: CreditUser (Razor Style)
// ────────────────────────────────────────────────────────────────

interface CreditUserProps { adminIdToken: string; }

const CreditUser: FC<CreditUserProps> = ({ adminIdToken }) => {
    const { setShowMessage } = useModal();
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleCredit = useCallback(async () => {
        const parsedAmount = parseFloat(amount);
        if (!targetUserId || isNaN(parsedAmount) || parsedAmount <= 0) {
            setShowMessage('⚠️ INVALID INPUT: CHECK ID OR AMOUNT');
            return;
        }

        setLoading(true);
        const maxRetries = 3;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(`${FUNCTIONS_BASE_URL}/adminCreditUser`, { 
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminIdToken}`, 
                    },
                    body: JSON.stringify({
                        targetUserId: targetUserId.trim(),
                        amount: parsedAmount,
                        transactionNote: 'Manual Deposit Approval',
                    }),
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    setShowMessage(`✅ USER CREDITED: $${parsedAmount.toFixed(2)}`);
                    setTargetUserId('');
                    setAmount('');
                    setLoading(false);
                    return; 
                } else if (response.status === 403) {
                    setShowMessage(`❌ PERMISSION DENIED: ADMIN CLAIM MISSING`);
                    setLoading(false);
                    return; 
                } else {
                    throw new Error(result.message || `HTTP Error: ${response.status}`);
                }
            } catch (error: any) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                if (attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    setShowMessage('❌ APPROVAL FAILED: NETWORK ERROR');
                }
            }
        }
        setLoading(false);
    }, [targetUserId, amount, adminIdToken, setShowMessage]);

    return (
        <div className="p-6 bg-black border border-white/10 shadow-lg">
            <h4 className="text-lg font-bold font-russo text-white flex items-center gap-2 uppercase tracking-wide">
                <CheckCircle size={20} className="text-green-500" /> Manual Deposit Approval
            </h4>
            <p className="text-xs text-gray-500 font-mono mt-2 mb-6">
                // CREDIT USER ACCOUNT DIRECTLY (BYPASSES PAYMENT GATEWAY)
            </p>

            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Target UID</label>
                    <input
                        type="text"
                        placeholder="e.g. 7X8..."
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="input w-full font-mono"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Amount (USD)</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input w-full font-mono"
                        disabled={loading}
                    />
                </div>
            </div>

            <button
                className="btn-primary w-full mt-6"
                onClick={handleCredit}
                disabled={loading || !targetUserId || !amount || parseFloat(amount) <= 0}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'EXECUTE CREDIT'}
            </button>
        </div>
    );
};


// ────────────────────────────────────────────────────────────────
// HELPER: SetAdminClaim (Razor Style)
// ────────────────────────────────────────────────────────────────

interface AdminClaimProps { adminIdToken: string; }

const SetAdminClaim: FC<AdminClaimProps> = ({ adminIdToken }) => {
    const { setShowMessage } = useModal();
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSetClaim = useCallback(async () => {
        if (!targetUserId) {
            setShowMessage('⚠️ MISSING TARGET USER ID');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${FUNCTIONS_BASE_URL}/setAdminClaim`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminIdToken}`, 
                },
                body: JSON.stringify({
                    targetUserId: targetUserId.trim(),
                }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setShowMessage(`✅ SUCCESS: ADMIN CLAIM GRANTED TO ${targetUserId}`);
                setTargetUserId('');
            } else if (response.status === 403) {
                setShowMessage(`❌ DENIED: ROOT ACCESS REQUIRED`);
            } else {
                throw new Error(result.message || 'Failed to set admin claim.');
            }
        } catch (error: any) {
            console.error('Set Admin Claim failed:', error);
            setShowMessage(`❌ ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [targetUserId, adminIdToken, setShowMessage]);

    return (
        <div className="p-6 bg-black border border-primary/30 shadow-lg">
            <h4 className="text-lg font-bold font-russo text-white flex items-center gap-2 uppercase tracking-wide">
                <UserPlus size={20} className="text-primary" /> Grant Root Access
            </h4>
            <p className="text-xs text-gray-500 font-mono mt-2 mb-6">
                // ELEVATE USER PRIVILEGES. TARGET MUST RE-LOGIN.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Target UID</label>
                    <input
                        type="text"
                        placeholder="User ID (UID)"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="input w-full font-mono"
                        disabled={loading}
                    />
                </div>
            </div>

            <button
                className="btn-secondary w-full mt-6 text-primary border-primary hover:bg-primary hover:text-black"
                onClick={handleSetClaim}
                disabled={loading || !targetUserId}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'GRANT ADMIN'}
            </button>
        </div>
    );
};


// ────────────────────────────────────────────────────────────────
// HELPER: ContentManager (Razor Style)
// ────────────────────────────────────────────────────────────────

const ContentManager: FC = () => {
    const { setShowMessage } = useModal();
    const [itemName, setItemName] = useState('');
    const [itemType, setItemType] = useState<ItemDefinition['itemType']>('weapon');
    const [rarity, setRarity] = useState<ItemDefinition['rarity']>('D-Rank');
    const [description, setDescription] = useState('');
    const [priceUSD, setPriceUSD] = useState('');
    const [loading, setLoading] = useState(false);

    const itemTypes: ItemDefinition['itemType'][] = ['weapon', 'armor', 'consumable', 'character_skin', 'title'];
    const itemRarities: ItemDefinition['rarity'][] = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank'];

    const handleCreateItem = useCallback(async () => {
        if (!itemName || !description || isNaN(parseFloat(priceUSD))) {
            setShowMessage('⚠️ INCOMPLETE DATA FIELDS');
            return;
        }

        setLoading(true);

        const newItem: ItemDefinition = {
            id: 'TBD', 
            itemName: itemName.trim(),
            itemType: itemType,
            rarity: rarity,
            description: description.trim(),
            levelRequirement: 1,
            stats: { attack: 10, defense: 5 }, 
            visuals: { prefabName: itemName.replace(/\s/g, ''), iconName: itemName.replace(/\s/g, '') + '_icon' },
            price: { USD: parseFloat(priceUSD) },
        };

        try {
            const itemsCollection = collection(db, 'ItemDefinitions');
            const newDocRef = doc(itemsCollection);
            newItem.id = newDocRef.id;

            await setDoc(newDocRef, newItem);
            
            setShowMessage(`✅ BLUEPRINT CREATED: ${newItem.itemName}`);
            
            // Reset
            setItemName('');
            setDescription('');
            setPriceUSD('');
            setItemType('weapon');
            setRarity('D-Rank');

        } catch (error: any) {
            console.error('Failed to create item:', error);
            setShowMessage(`❌ CREATION FAILED: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [itemName, itemType, rarity, description, priceUSD, setShowMessage]);

    return (
        <div className="p-6 bg-black border border-white/10">
            <h4 className="text-lg font-bold font-russo text-white flex items-center gap-2 uppercase tracking-wide">
                <Feather size={20} className="text-yellow-500" /> Blueprint Constructor
            </h4>
            <p className="text-xs text-gray-500 font-mono mt-2 mb-6">
                // DEFINE NEW ASSETS FOR GLOBAL DISTRIBUTION
            </p>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="input"
                        disabled={loading}
                    />
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Price (USD)"
                            value={priceUSD}
                            onChange={(e) => setPriceUSD(e.target.value)}
                            className="input w-full pl-8"
                            disabled={loading}
                        />
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                </div>

                <textarea
                    placeholder="Item Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black border border-white/20 p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary h-24"
                    disabled={loading}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Type</label>
                        <select
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value as ItemDefinition['itemType'])}
                            className="input w-full"
                            disabled={loading}
                        >
                            {itemTypes.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Rarity</label>
                        <select
                            value={rarity}
                            onChange={(e) => setRarity(e.target.value as ItemDefinition['rarity'])}
                            className="input w-full"
                            disabled={loading}
                        >
                            {itemRarities.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <button
                className="btn-primary w-full mt-6"
                onClick={handleCreateItem}
                disabled={loading || !itemName || !description || parseFloat(priceUSD) <= 0}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'MINT BLUEPRINT'}
            </button>
        </div>
    );
};


// ────────────────────────────────────────────────────────────────
// HELPER: WithdrawalApprovalList (Razor Style)
// ────────────────────────────────────────────────────────────────

interface PendingTransaction extends Transaction {
    id: string;
}

const WithdrawalApprovalList: FC<{ adminIdToken: string }> = ({ adminIdToken }) => {
    const { setShowMessage } = useModal();
    const [pendingRequests, setPendingRequests] = useState<PendingTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const transactionsRef = collection(db, 'Transactions');
        const q = query(
            transactionsRef, 
            where('transactionType', '==', 'withdraw'),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requests: PendingTransaction[] = [];
            snapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() } as PendingTransaction);
            });
            setPendingRequests(requests);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching pending withdrawals:", error);
            setShowMessage('❌ DB READ ERROR');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setShowMessage]);

    const handleApprove = useCallback(async (request: PendingTransaction) => {
        setProcessingId(request.id);
        
        try {
            const response = await fetch(`${FUNCTIONS_BASE_URL}/processWithdrawalPayoutApi`, { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminIdToken}`, 
                },
                body: JSON.stringify({
                    transactionId: request.id,
                    targetAddress: request.paymentGatewayId,
                    amount: Math.abs(request.amount),
                }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setShowMessage(`✅ PAYOUT APPROVED: $${Math.abs(request.amount).toFixed(2)}`);
            } else if (response.status === 403) {
                 setShowMessage(`❌ DENIED: ADMIN ONLY`);
            } else {
                throw new Error(result.message || `Status: ${response.status}`);
            }
        } catch (error: any) {
            console.error('Payout processing error:', error);
            setShowMessage(`❌ PAYOUT ERROR: ${error.message}`);
        } finally {
            setProcessingId(null);
        }
    }, [adminIdToken, setShowMessage]);

    return (
        <div className="p-6 bg-black border border-red-500/50 shadow-lg">
            <h4 className="text-lg font-bold font-russo text-red-500 flex items-center gap-2 uppercase tracking-wide">
                <ListChecks size={20} /> Pending Payouts
            </h4>
            <p className="text-xs text-gray-500 font-mono mt-2 mb-6">
                // MANUAL APPROVAL QUEUE. VERIFY BEFORE SENDING.
            </p>

            {loading ? (
                <div className="text-center py-12 text-primary">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2" /> LOADING QUEUE...
                </div>
            ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 border border-white/5 bg-white/5">
                    <p className="text-green-500 font-mono font-bold">QUEUE CLEARED</p>
                    <p className="text-xs text-gray-500">No pending actions.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {pendingRequests.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row items-center justify-between bg-white/5 p-4 border border-white/10 hover:border-red-500/50 transition-colors">
                            <div className="flex-1 min-w-0 space-y-1 mb-3 sm:mb-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-red-400 font-mono">
                                        {Math.abs(req.amount).toFixed(2)} JOULES 
                                    </p>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-sm text-gray-400">{req.currency}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono truncate">
                                    TO: <span className="text-white">{req.paymentGatewayId || 'N/A'}</span>
                                </p>
                                <p className="text-[10px] text-gray-500 font-mono truncate">
                                    UID: <span className="text-white">{req.userId}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleApprove(req)}
                                className="btn-destructive text-xs w-full sm:w-auto"
                                disabled={processingId === req.id || processingId !== null}
                            >
                                {processingId === req.id ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : 'APPROVE PAYOUT'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// ────────────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ────────────────────────────────────────────────────────────────

const AdminPage: FC = () => {
  const { dataLoading, authLoading, idToken, userId, isAdmin } = usePlayer(); 
  const { setShowMessage, setActiveModal } = useModal();

  const isPending = dataLoading;

  // Mock Wagmi hooks for smart contract admin functions
  useAccount();
  useReadContract({ query: { enabled: true } });
  useReadContract({ query: { enabled: true } });
  const { data: hash } = useWriteContract();
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({ hash: hash });

  const [newAdminAddress, setNewAdminAddress] = useState<string>('');
  const [updateLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'management' | 'stats' | 'content'>('management'); 

  const handleGrantAdmin = useCallback(async () => {
    setShowMessage('⚠️ CONTRACT METHOD MOCKED (DEV MODE).');
  }, [setShowMessage]);

  if (authLoading || isPending) {
    return null; // Global loader handles this
  }

  // REAL ADMIN CHECK
  if (!isAdmin()) {
    return (
      <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="border border-red-600 bg-red-900/10 p-12 text-center max-w-lg w-full shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-4xl font-russo text-red-600 mb-2 uppercase">Access Denied</h1>
                <p className="text-red-400 font-mono text-sm tracking-widest">// CLEARANCE LEVEL: 0</p>
                <Link to="/home" className="inline-block mt-8 btn-primary px-8 py-4 text-xs">
                    RETURN TO HUB
                </Link>
            </div>
        </div>
      </SwytchErrorBoundary>
    );
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <div className="min-h-screen bg-black text-white font-inter p-6 pb-24">
        
        {/* HEADER */}
        <div className="max-w-6xl mx-auto mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-russo text-white uppercase tracking-tighter">System Command</h1>
                </div>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.2em]">// ROOT_ACCESS_GRANTED: {userId?.slice(0,8)}</p>
            </div>
            
            <div className="flex gap-1">
                {(['management', 'content', 'stats'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                            activeTab === tab 
                            ? 'border-primary text-primary bg-white/5' 
                            : 'border-transparent text-gray-600 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab === 'management' && 'USERS & FINANCE'}
                        {tab === 'content' && 'CONTENT OPS'}
                        {tab === 'stats' && 'SYSTEM LOGS'}
                    </button>
                ))}
            </div>
        </div>

        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                
                {/* 1. MANAGEMENT TAB */}
                {activeTab === 'management' && (
                    <motion.div 
                        key="management" 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <div className="space-y-8">
                            {/* Payouts */}
                            {idToken && <WithdrawalApprovalList adminIdToken={idToken} />}
                            
                            {/* Contract Admin (Mock) */}
                            <div className="p-6 bg-black border border-white/10">
                                <h3 className="text-sm font-bold font-russo text-white uppercase mb-4">Contract Privileges</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Wallet Address (0x...)"
                                        value={newAdminAddress}
                                        onChange={(e) => setNewAdminAddress(e.target.value)}
                                        className="input w-full font-mono text-xs"
                                        disabled={updateLoading || isTxPending}
                                    />
                                    <button
                                        className="btn-secondary text-xs"
                                        onClick={handleGrantAdmin}
                                        disabled={updateLoading || isTxPending || !newAdminAddress.trim()}
                                    >
                                        GRANT
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Credit */}
                            {idToken && <CreditUser adminIdToken={idToken} />}
                            
                            {/* Permissions */}
                            {idToken && <SetAdminClaim adminIdToken={idToken} />}
                        </div>
                    </motion.div>
                )}
                
                {/* 2. CONTENT TAB */}
                {activeTab === 'content' && (
                    <motion.div 
                        key="content" 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="max-w-2xl mx-auto space-y-8"
                    >
                        <ContentManager /> 
                        
                        <div className="p-6 bg-black border border-white/10 text-center">
                            <h4 className="text-white font-bold uppercase mb-2">Additional Tools</h4>
                            <p className="text-xs text-gray-500 font-mono">
                                Quest Editor and Dungeon Config modules are currently offline.
                            </p>
                        </div>
                    </motion.div>
                )}
                
                {/* 3. STATS TAB */}
                {activeTab === 'stats' && (
                    <motion.div 
                        key="stats" 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                       <div className="p-6 bg-black border border-white/10">
                           <Users className="w-8 h-8 text-white mb-2" />
                           <h3 className="text-2xl font-bold text-white">1,204</h3>
                           <p className="text-[10px] text-gray-500 font-mono uppercase">Total Users</p>
                       </div>
                       <div className="p-6 bg-black border border-white/10">
                           <Database className="w-8 h-8 text-primary mb-2" />
                           <h3 className="text-2xl font-bold text-primary">14.2k</h3>
                           <p className="text-[10px] text-gray-500 font-mono uppercase">DB Reads (24h)</p>
                       </div>
                       <div className="p-6 bg-black border border-white/10">
                           <Activity className="w-8 h-8 text-green-500 mb-2" />
                           <h3 className="text-2xl font-bold text-green-500">100%</h3>
                           <p className="text-[10px] text-gray-500 font-mono uppercase">System Health</p>
                       </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </SwytchErrorBoundary>
  );
};

export default AdminPage;