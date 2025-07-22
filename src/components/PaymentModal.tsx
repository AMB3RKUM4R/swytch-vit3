// src/components/PaymentModal.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, ArrowUpCircle, ArrowDownCircle, Star } from 'lucide-react';
import { useModal } from '../components/context/ModalContext';
import { useTheme } from '../components/context/ThemeContext';

import RazorTransaction from '../components/RazorWithdraw'; // Your RazorTransaction component
import { MEMBERSHIP_TIERS, SupportedCurrency, TransactionType, PaymentModalProps } from '@/lib/types'; // Types from your lib/types.ts

// The PaymentModalProps interface is already defined in types.ts and passed down from App.tsx
// No need to redefine it here.

type PaymentView = 'selection' | 'transaction';

const PaymentModal: FC<PaymentModalProps> = ({ userId, setShowMessage }) => {
  const { isDarkMode } = useTheme();
  const { activeModal, setActiveModal } = useModal();

  const [currentView, setCurrentView] = useState<PaymentView>('selection');
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<SupportedCurrency>('INR'); // Default to INR
  const [itemId, setItemId] = useState<string | null>(null);

  // Reset modal state when it's opened or closed
  useEffect(() => {
    if (activeModal === 'payment') {
      setCurrentView('selection');
      setTransactionType(null);
      setAmount(0);
      setCurrency('INR'); // Reset currency to default
      setItemId(null);
    }
  }, [activeModal]);

  const handleTransactionSuccess = (submittedItemId: string | null) => {
    setShowMessage(`🎉 Your ${submittedItemId ? 'membership' : transactionType} transaction is submitted! Awaiting verification.`);
    setActiveModal(null); // Close modal on success
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setCurrentView('selection');
    setTransactionType(null);
    setAmount(0);
    setCurrency('INR');
    setItemId(null);
  };

  const renderSelectionView = () => (
    <>
      <h2 className="text-2xl font-bold font-poppins text-primary mb-4">Choose Transaction Type</h2>
      <div className="space-y-4">
        <motion.button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={() => {
            setTransactionType('deposit');
            setAmount(0); // Reset amount for new input
            setCurrentView('transaction');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUpCircle className="w-5 h-5" /> Deposit Funds
        </motion.button>

        <motion.button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={() => {
            setTransactionType('withdraw');
            setAmount(0); // Reset amount for new input
            setCurrentView('transaction');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDownCircle className="w-5 h-5" /> Withdraw Funds
        </motion.button>

        <div className="text-lg font-bold text-foreground mt-4">Membership Tiers:</div>
        {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
          <motion.button
            key={key}
            className="btn-secondary flex flex-col items-center justify-center gap-1 p-2 text-center"
            onClick={() => {
              setTransactionType('membership');
              setAmount(tier.amount);
              setItemId(key);
              setCurrentView('transaction');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className="w-5 h-5" />
            <span className="font-bold">{tier.name}</span>
            <span className="text-sm">{tier.amount} {currency}</span>
            <span className="text-xs text-gray-400">({tier.usdAmount} USD)</span>
          </motion.button>
        ))}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {activeModal === 'payment' && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md bg-noise`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'} p-6 rounded-lg max-w-sm w-full mx-4 border border-rose-400/20`}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <motion.button
              className={`absolute top-4 right-4 text-foreground`}
              onClick={handleCloseModal}
              whileHover={{ scale: 1.1 }}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {currentView === 'selection' ? (
              renderSelectionView()
            ) : (
              transactionType && (
                <>
                  <h2 className="text-2xl font-bold font-poppins text-primary mb-4">
                    {transactionType === 'deposit' ? 'Deposit Funds' :
                     transactionType === 'withdraw' ? 'Withdraw Funds' :
                     `Purchase ${MEMBERSHIP_TIERS[itemId as keyof typeof MEMBERSHIP_TIERS]?.name || 'Membership'}`}
                  </h2>
                  {(transactionType === 'deposit' || transactionType === 'withdraw') && (
                      <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-primary" />
                          <input
                              type="number"
                              value={amount === 0 ? '' : amount}
                              onChange={(e) => setAmount(Number(e.target.value))}
                              placeholder="Enter amount"
                              className={`input bg-${isDarkMode ? 'gray-700' : 'gray-300'} p-3 rounded-md border border-rose-400/20 w-full text-${isDarkMode ? 'gray-200' : 'gray-700'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter`}
                              aria-label="Amount"
                              min={transactionType === 'deposit' && currency === 'INR' ? 50 : 0} // Enforce minimum deposit
                          />
                      </div>
                  )}

                  {userId ? (
                      <RazorTransaction
                          amount={amount}
                          currency={currency}
                          itemId={itemId}
                          transactionType={transactionType}
                          userId={userId}
                          onSuccess={handleTransactionSuccess}
                          setShowMessage={setShowMessage}
                          // paymentMethod is handled internally by RazorTransaction based on context
                      />
                  ) : (
                      <p className="text-rose-400 text-center">Please sign in to make payments.</p>
                  )}

                  <div className="text-center mt-4">
                    <motion.button
                      className={`text-foreground hover:text-secondary font-inter text-sm`}
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
