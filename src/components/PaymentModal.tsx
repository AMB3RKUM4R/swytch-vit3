// src/components/PaymentModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, ArrowUpCircle, ArrowDownCircle, Star } from 'lucide-react';
import { useModal } from '../components/context/ModalContext';
import { useTheme } from '../components/context/ThemeContext';
import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog';

import RazorTransaction from '../RazorWithdraw';
import { MEMBERSHIP_TIERS, SupportedCurrency, TransactionType, PaymentModalProps } from '@/lib/types';

type PaymentView = 'selection' | 'transaction';

const PaymentModal: FC<PaymentModalProps> = ({ userId, setShowMessage }) => {
  useTheme();
  const { activeModal, setActiveModal } = useModal();

  const [currentView, setCurrentView] = useState<PaymentView>('selection');
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [, setCurrency] = useState<SupportedCurrency>('USD');
  const [itemId, setItemId] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'payment') {
      setCurrentView('selection');
      setTransactionType(null);
      setAmount(0);
      setCurrency('USD');
      setItemId(null);
    }
  }, [activeModal]);

  const handleTransactionSuccess = (submittedItemId: string | null) => {
    setShowMessage(`🎉 Your ${submittedItemId ? 'membership' : transactionType} transaction is submitted! Awaiting verification.`);
    setActiveModal(null);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setCurrentView('selection');
    setTransactionType(null);
    setAmount(0);
    setCurrency('USD');
    setItemId(null);
  };

  const renderSelectionView = () => (
    <>
      <DialogTitle className="text-2xl font-bold font-poppins text-primary mb-4 text-glow-primary text-center">Select Transaction</DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground text-center mb-6">Choose how you want to interact with the PETverse economy.</DialogDescription>
      <div className="space-y-4">
        <motion.button
          className="btn-primary w-full flex items-center justify-center gap-2"
          onClick={() => {
            setTransactionType('deposit');
            setAmount(0);
            setCurrency('USD');
            setCurrentView('transaction');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUpCircle className="w-5 h-5" /> Deposit Funds
        </motion.button>

        <motion.button
          className="btn-primary w-full flex items-center justify-center gap-2"
          onClick={() => {
            setTransactionType('withdraw');
            setAmount(0);
            setCurrency('USD');
            setCurrentView('transaction');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDownCircle className="w-5 h-5" /> Withdraw Funds
        </motion.button>

        <div className="text-lg font-bold text-foreground text-center mt-4 text-glow-primary">Membership Tiers:</div>
        {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
          <motion.button
            key={key}
            className="btn-secondary w-full flex flex-col items-center justify-center gap-1 p-2 text-center"
            onClick={() => {
              setTransactionType('membership');
              setAmount(tier.usdAmount);
              setItemId(key);
              setCurrency('USD');
              setCurrentView('transaction');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className="w-5 h-5" />
            <span className="font-bold">{tier.name}</span>
            <span className="text-sm">{tier.usdAmount} USD</span>
          </motion.button>
        ))}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {activeModal === 'payment' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md bg-noise"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative modal holographic-card p-6 rounded-lg max-w-sm w-full mx-4 border border-[hsl(var(--primary-hsl),0.2)]`}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <motion.button
              className="absolute top-4 right-4 text-foreground"
              onClick={handleCloseModal}
              whileHover={{ scale: 1.1 }}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6 text-[hsl(var(--secondary-hsl))] animate-neon-pulse" />
            </motion.button>
            <DialogTitle className="hidden">Payment Portal</DialogTitle>
            <DialogDescription className="hidden">This is where you can manage deposits, withdrawals, and memberships.</DialogDescription>

            {currentView === 'selection' ? (
              renderSelectionView()
            ) : (
              transactionType && (
                <>
                  <h2 className="text-2xl font-bold font-poppins text-primary mb-4 text-glow-primary text-center">
                    {transactionType === 'deposit' ? 'Deposit Funds' :
                     transactionType === 'withdraw' ? 'Withdraw Funds' :
                     `Purchase ${MEMBERSHIP_TIERS[itemId as keyof typeof MEMBERSHIP_TIERS]?.name || 'Membership'}`}
                  </h2>
                  {(transactionType === 'deposit' || transactionType === 'withdraw' || transactionType === 'membership') && (
                      <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-primary" />
                          <input
                              type="number"
                              value={amount === 0 ? '' : amount}
                              onChange={(e) => setAmount(Number(e.target.value))}
                              placeholder="Enter amount (USD)"
                              className={`input-system p-3 rounded-md border border-[hsl(var(--primary-hsl),0.2)] w-full text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-inter`}
                              aria-label="Amount"
                              min={1}
                          />
                      </div>
                  )}

                  {userId ? (
                        <RazorTransaction
                            amount={amount}
                            currency="USD"
                            itemId={itemId}
                            transactionType={transactionType}
                            userId={userId}
                            onSuccess={handleTransactionSuccess}
                            setShowMessage={setShowMessage}
                        />
                    ) : (
                        <p className="text-rose-400 text-center">Please sign in to make payments.</p>
                    )}

                  <div className="text-center mt-4">
                    <motion.button
                      className="text-foreground hover:text-secondary font-inter text-sm"
                      onClick={() => {
                          setCurrentView('selection');
                          setTransactionType(null);
                          setAmount(0);
                          setItemId(null);
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      Back to Payment Options
                    </motion.button>
                  </div>
                </>
              )
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;