import { FC, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, UserPlus, BarChart2, ShieldAlert, CheckCircle, Loader2, Feather, DollarSign, ListChecks } from 'lucide-react'; 
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
// ANIMATION VARIANTS
// ────────────────────────────────────────────────────────────────

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.3 } } };
const sectionVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}


// ────────────────────────────────────────────────────────────────
// 🟢 HELPER COMPONENT 1: CreditUser
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
            setShowMessage('⚠️ Please provide a valid User ID and a positive amount.');
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
                    setShowMessage(`✅ Payment Approved! User ${targetUserId} credited with $${parsedAmount.toFixed(2)}.`);
                    setTargetUserId('');
                    setAmount('');
                    setLoading(false);
                    return; 
                } else if (response.status === 403) {
                    setShowMessage(`❌ Permission Denied. You must have the Admin claim set in Firebase Auth.`);
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
                    setShowMessage('❌ Approval Failed: Server or network error after multiple retries.');
                }
            }
        }
        setLoading(false);
    }, [targetUserId, amount, adminIdToken, setShowMessage]);

    return (
        <div className="p-6 bg-black/30 rounded-lg space-y-4 border border-[hsl(var(--secondary),0.2)] max-w-lg mx-auto">
            <h4 className="text-xl font-bold font-russo text-[hsl(var(--secondary))] flex items-center gap-2">
                <CheckCircle size={20} /> Manual Deposit Approval
            </h4>
            <p className="text-sm text-muted-foreground font-inter">
                Use this after manually confirming a deposit (PayPal, UPI, Direct ETH) to credit a user's account securely.
            </p>

            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Target Player User ID (UID)"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="input-system w-full"
                    disabled={loading}
                    aria-label="Target User ID"
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Amount to Credit (USD/Equivalent)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-system w-full"
                    disabled={loading}
                    aria-label="Amount to Credit"
                />
            </div>

            <button
                className="btn-system-secondary-glow w-full"
                onClick={handleCredit}
                disabled={loading || !targetUserId || !amount || parseFloat(amount) <= 0}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" /> Processing...
                    </div>
                ) : 'Approve & Credit User'}
            </button>
        </div>
    );
};


// ────────────────────────────────────────────────────────────────
// 🟢 HELPER COMPONENT 2: SetAdminClaim
// ────────────────────────────────────────────────────────────────

interface AdminClaimProps { adminIdToken: string; }

const SetAdminClaim: FC<AdminClaimProps> = ({ adminIdToken }) => {
    const { setShowMessage } = useModal();
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSetClaim = useCallback(async () => {
        if (!targetUserId) {
            setShowMessage('⚠️ Please provide a target User ID to promote.');
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
                setShowMessage(`✅ Success! User ${targetUserId} is now an admin. They must log out and back in.`);
                setTargetUserId('');
            } else if (response.status === 403) {
                setShowMessage(`❌ Permission Denied. You must be an existing admin to promote others.`);
            } else {
                throw new Error(result.message || 'Failed to set admin claim.');
            }
        } catch (error: any) {
            console.error('Set Admin Claim failed:', error);
            setShowMessage(`❌ Failed to set admin claim: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [targetUserId, adminIdToken, setShowMessage]);

    return (
        <div className="p-6 bg-black/30 rounded-lg space-y-4 border border-[hsl(var(--primary),0.2)] max-w-lg mx-auto">
            <h4 className="text-xl font-bold font-russo text-glow-primary flex items-center gap-2">
                <UserPlus size={20} /> Set Admin Claim
            </h4>
            <p className="text-sm text-muted-foreground font-inter">
                Grant administrator privileges to a specific User ID. The target user must log out and log back in for the changes to take effect.
            </p>

            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="User ID (UID) to Promote"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="input-system w-full"
                    disabled={loading}
                    aria-label="User ID to Promote"
                />
            </div>

            <button
                className="btn-system-glow w-full"
                onClick={handleSetClaim}
                disabled={loading || !targetUserId}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" /> Granting...
                    </div>
                ) : 'Grant Admin Claim'}
            </button>
        </div>
    );
};


// ────────────────────────────────────────────────────────────────
// 🟢 HELPER COMPONENT 3: ContentManager
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
            setShowMessage('⚠️ Please fill out the Item Name, Description, and Price fields.');
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
            
            setShowMessage(`✅ Successfully created new item blueprint: ${newItem.itemName} (${newDocRef.id})`);
            
            // Reset form
            setItemName('');
            setDescription('');
            setPriceUSD('');
            setItemType('weapon');
            setRarity('D-Rank');

        } catch (error: any) {
            console.error('Failed to create item:', error);
            setShowMessage(`❌ Item creation failed: ${error.message}. Check your admin claim and Firestore rules.`);
        } finally {
            setLoading(false);
        }
    }, [itemName, itemType, rarity, description, priceUSD, setShowMessage]);

    return (
        <div className="p-6 bg-black/30 rounded-lg space-y-6 border border-[hsl(var(--secondary),0.2)] max-w-lg mx-auto">
            <h4 className="text-xl font-bold font-russo text-[hsl(var(--secondary))] flex items-center gap-2">
                <Feather size={20} /> Create Item Blueprint
            </h4>
            <p className="text-sm text-muted-foreground font-inter">
                Add a new item definition to the `ItemDefinitions` collection.
            </p>

            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Item Name (e.g., 'Arcane Blade')"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="input-system w-full"
                    disabled={loading}
                    aria-label="Item Name"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-system w-full h-20"
                    disabled={loading}
                    aria-label="Item Description"
                />

                <div className="flex gap-3">
                    <select
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value as ItemDefinition['itemType'])}
                        className="input-system flex-1"
                        disabled={loading}
                        aria-label="Item Type"
                    >
                        {itemTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value as ItemDefinition['rarity'])}
                        className="input-system flex-1"
                        disabled={loading}
                        aria-label="Item Rarity"
                    >
                        {itemRarities.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                
                <div className="relative">
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Price in USD"
                        value={priceUSD}
                        onChange={(e) => setPriceUSD(e.target.value)}
                        className="input-system w-full pl-8"
                        disabled={loading}
                        aria-label="Price in USD"
                    />
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
            </div>

            <button
                className="btn-system-secondary-glow w-full"
                onClick={handleCreateItem}
                disabled={loading || !itemName || !description || parseFloat(priceUSD) <= 0}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" /> Creating...
                    </div>
                ) : 'Create Item Definition'}
            </button>
        </div>
    );
};


// ────────────────────────────────────────────────────────────────
// 🟢 HELPER COMPONENT 4: WithdrawalApprovalList
// ────────────────────────────────────────────────────────────────

interface PendingTransaction extends Transaction {
    id: string;
}

const WithdrawalApprovalList: FC<{ adminIdToken: string }> = ({ adminIdToken }) => {
    const { setShowMessage } = useModal();
    const [pendingRequests, setPendingRequests] = useState<PendingTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // 1. Real-time Listener for Pending Withdrawals
    useEffect(() => {
        const transactionsRef = collection(db, 'Transactions');
        // Query: transactionType == 'withdraw' AND status == 'pending'
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
            setShowMessage('❌ Error loading withdrawal requests.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setShowMessage]);


    // 2. Handler for Approving a Request
    const handleApprove = useCallback(async (request: PendingTransaction) => {
        setProcessingId(request.id);
        
        try {
            // FIX: Ensure this endpoint exists and is correctly implemented in Firebase Functions
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
                setShowMessage(`✅ Payout Approved and Processed for $${Math.abs(request.amount).toFixed(2)}. Transaction ID: ${result.payoutTxHash}`);
            } else if (response.status === 403) {
                 setShowMessage(`❌ Permission Denied. Check admin claim.`);
            } else {
                throw new Error(result.message || `Payout failed (Status: ${response.status})`);
            }
        } catch (error: any) {
            console.error('Payout processing error:', error);
            setShowMessage(`❌ Payout error: ${error.message}`);
        } finally {
            setProcessingId(null);
        }
    }, [adminIdToken, setShowMessage]);

    return (
        <div className="p-6 bg-black/30 rounded-lg space-y-4 border border-[hsl(var(--destructive),0.2)] max-w-4xl mx-auto">
            <h4 className="text-2xl font-bold font-russo text-[hsl(var(--destructive))] flex items-center gap-2">
                <ListChecks size={24} /> Pending Withdrawal Requests
            </h4>
            <p className="text-sm text-muted-foreground font-inter">
                These requests have been deducted from the user's JOULES balance and are awaiting manual crypto/fiat payout.
            </p>

            {loading ? (
                <div className="text-center py-6 text-primary">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2" /> Loading Requests...
                </div>
            ) : pendingRequests.length === 0 ? (
                <p className="text-center py-6 text-green-400">
                    🎉 No pending withdrawal requests found!
                </p>
            ) : (
                <div className="space-y-3">
                    {pendingRequests.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row items-center justify-between bg-black/40 p-3 rounded-lg border border-border">
                            <div className="flex-1 min-w-0 space-y-1 sm:space-y-0 sm:pr-4">
                                <p className="text-lg font-bold text-red-400">
                                    {Math.abs(req.amount).toFixed(2)} JOULES 
                                    <span className="text-xs text-muted-foreground ml-2">({req.currency})</span>
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    To: <span className="text-foreground">{req.paymentGatewayId || 'N/A'}</span>
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    UID: <span className="text-foreground">{req.userId}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleApprove(req)}
                                className="btn-danger w-full sm:w-auto mt-2 sm:mt-0"
                                disabled={processingId === req.id || processingId !== null}
                            >
                                {processingId === req.id ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
                                ) : 'Approve Payout'}
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
  // FIX: Destructure idToken
  const { dataLoading, authLoading, idToken, userId } = usePlayer(); 
  const { setShowMessage, setActiveModal } = useModal();

  const isPending = dataLoading;

  // Mocked Wagmi logic (using actual hooks but expecting mocks if dependencies aren't resolved)
  useAccount();
  useReadContract({ query: { enabled: true } });
  useReadContract({ query: { enabled: true } });
  const { data: hash } = useWriteContract();
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({ hash: hash });


  const [newAdminAddress, setNewAdminAddress] = useState<string>('');
  const [updateLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'management' | 'stats' | 'content'>('management'); 

  const handleGrantAdmin = useCallback(async () => {
    setShowMessage('⚠️ Smart contract function is mocked and disabled due to missing dependencies.');
  }, [setShowMessage]);


  if (authLoading || isPending) {
    return null; // Let the global LoadingScreen handle this
  }

  // FIX: Using a mock check for demonstration, but should rely on Firebase isAdmin() if implemented
  const isAuthorized = !!userId; // Assume user is authorized if logged in and accessing admin page

  if (!isAuthorized) {
    // (Access Denied Block)
    return (
      <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
        <div className="min-h-screen text-foreground font-orbitron bg-noise">
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="text-center p-8 bg-black/20 rounded-lg border border-[hsl(var(--destructive),0.2)] backdrop-blur-sm max-w-2xl">
              <ShieldAlert className="mx-auto w-16 h-16 text-[hsl(var(--destructive))] animate-pulse mb-4" />
              <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground font-russo mb-4 text-glow-destructive tracking-tight">
                Access Denied
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 font-inter">
                You do not have the required clearance to access the Admin Command Center. This area is restricted to authorized users only.
              </p>
              <Link to="/home" className="btn-system-glow text-lg font-semibold group">
                Return to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </SwytchErrorBoundary>
    );
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Header */}
            <motion.section variants={sectionVariants} className="text-center">
                <Settings className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
                <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
                Admin Command Center
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
                Manage user permissions, content, and system activity for the PETverse.
                </p>
            </motion.section>

            {/* TABS */}
            <motion.section variants={sectionVariants}>
                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-10 p-2 bg-black/20 border border-[hsl(var(--primary),0.1)] rounded-lg">
                    {(['management', 'content', 'stats'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative w-full text-center px-4 py-3 font-russo text-lg capitalize rounded-md transition-colors duration-300 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                        {activeTab === tab && (
                            <motion.div layoutId="admin-tab-indicator" className="absolute inset-0 bg-[hsl(var(--primary),0.2)] rounded-md z-0" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {tab === 'management' && <UserPlus size={20} />}
                            {tab === 'content' && <Feather size={20} />} 
                            {tab === 'stats' && <BarChart2 size={20} />}
                            {tab === "management" ? "User Management" : tab === "content" ? "Content Manager" : "System Stats"}
                        </span>
                        </button>
                    ))}
                </div>

                <div className="min-h-[250px] p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
                    <AnimatePresence mode="wait">
                        {/* 1. MANAGEMENT TAB (UPDATED) */}
                        {activeTab === 'management' && (
                            <motion.div key="management" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                
                                <h3 className="text-2xl font-bold font-russo text-glow-primary text-center">User Accounts & Financial Controls</h3>

                                {/* NEW: Pending Withdrawal List */}
                                {idToken && <WithdrawalApprovalList adminIdToken={idToken} />}

                                {/* Manual Credit / Approval Tool */}
                                {idToken && <CreditUser adminIdToken={idToken} />}

                                {/* Set Admin Claim Tool */}
                                {idToken && <SetAdminClaim adminIdToken={idToken} />}

                                {/* Blockchain Admin Tool (Mocked) */}
                                <div className="space-y-6 max-w-lg mx-auto p-6 bg-black/30 rounded-lg border border-[hsl(var(--primary),0.2)]">
                                    <h3 className="text-2xl font-bold font-russo text-glow-secondary">Grant Admin Privileges (Blockchain)</h3>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <input
                                            type="text"
                                            placeholder="Enter wallet address (0x...)"
                                            value={newAdminAddress}
                                            onChange={(e) => setNewAdminAddress(e.target.value)}
                                            className="input-system w-full flex-grow"
                                            aria-label="Wallet Address to Promote"
                                            disabled={updateLoading || isTxPending}
                                        />
                                        <button
                                            className="btn-system-glow w-full sm:w-auto flex-shrink-0"
                                            onClick={handleGrantAdmin}
                                            disabled={updateLoading || isTxPending || !newAdminAddress.trim()}
                                        >
                                            {updateLoading || isTxPending ? 'Granting...' : 'Grant Access'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center font-inter pt-2">
                                        This action will add a new wallet address to the list of platform administrators on the smart contract. (Mocked function call)
                                    </p>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* 2. CONTENT TAB */}
                         {activeTab === 'content' && (
                            <motion.div key="content" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                                <h3 className="text-2xl font-bold font-russo text-glow-secondary text-center">Game Content Blueprints</h3>
                                
                                {/* Content Manager Component */}
                                <ContentManager /> 

                                <div className="p-6 bg-black/30 rounded-lg border border-[hsl(var(--primary),0.2)] max-w-lg mx-auto">
                                    <h4 className="text-xl font-bold font-russo text-glow-secondary">Other Content Tools</h4>
                                    <p className="text-sm text-muted-foreground font-inter mt-2">
                                        Tools for managing Dungeons, Quests, and Shop Listings (which reference Item Definitions) can be added here.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* 3. STATS TAB */}
                        {activeTab === 'stats' && (
                               <motion.div key="stats" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                                   <h3 className="text-2xl font-bold font-russo text-glow-secondary">System Statistics</h3>
                                   <p className="text-muted-foreground mt-4 font-inter">
                                       System health monitoring and analytics dashboards will be available in a future update.
                                   </p>
                               </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default AdminPage;