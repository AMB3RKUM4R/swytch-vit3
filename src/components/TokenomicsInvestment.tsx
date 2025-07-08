import { FC, memo, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useAccount } from 'wagmi';
import { SwytchCard } from './SwytchCard';

interface TokenomicsInvestmentProps {
  investmentAmount: string;
  setInvestmentAmount: React.Dispatch<React.SetStateAction<string>>;
  handleInvestmentSubmit: (e: FormEvent<HTMLFormElement>, method: 'usdt' | 'paypal' | 'upi') => Promise<void>;
  handlePayPalPayment: (data: any, actions: any) => Promise<any>;
  handlePayPalApprove: (data: any, actions: any) => Promise<void>;
  isPending: boolean;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsInvestment: FC<TokenomicsInvestmentProps> = memo(({ investmentAmount, setInvestmentAmount, handleInvestmentSubmit, handlePayPalPayment, handlePayPalApprove, isPending }) => {
  const { address } = useAccount();

  return (
    <motion.div variants={sectionVariants}>
      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2 font-poppins">
            <Gift className="w-6 h-6 text-teal-400 animate-pulse" /> Invest in the Petaverse
          </h3>
          <p className="text-gray-300 text-center max-w-xl mx-auto font-inter">Support Swytch and unlock governance rights!</p>
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <motion.div className="relative" whileHover={{ scale: 1.1 }}>
              <img
                src="/qr_donation.png"
                alt="UPI QR Code"
                className="w-32 h-32 rounded-lg border border-rose-500/30"
                onError={(e) => { e.currentTarget.src = '/fallback-qr.png'; }}
              />
              <p className="text-sm text-gray-400 mt-2 font-inter">Send UPI to deamonstillaliv3@icici</p>
            </motion.div>
            <SwytchCard gradient="from-rose-500/10 to-pink-500/10" className="max-w-md w-full">
              <motion.form
                className="space-y-4"
                onSubmit={(e) => handleInvestmentSubmit(e, 'usdt')}
              >
                <div className="relative">
                  <h4 className="text-rose-400 font-bold text-lg mb-2 font-poppins">Invest in Swytch</h4>
                  <input
                    type="text"
                    placeholder="Your Wallet Address"
                    className="w-full p-3 bg-gray-900 text-white rounded-md border border-rose-500/20 focus:border-rose-500 font-inter"
                    value={address || ''}
                    disabled
                    aria-label="Wallet Address"
                  />
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount in USDT"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="w-full p-3 mt-3 bg-gray-900 text-white rounded-md border border-rose-500/20 focus:border-rose-500 font-inter"
                    aria-label="Investment Amount in USDT"
                    min="0"
                    step="0.01"
                  />
                  <motion.button
                    type="submit"
                    className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold font-poppins"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Invest with USDT"
                    disabled={isPending}
                  >
                    {isPending ? 'Processing...' : 'Invest with USDT'}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold font-poppins"
                    onClick={() => handleInvestmentSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>, 'upi')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Invest with UPI"
                    disabled={isPending}
                  >
                    {isPending ? 'Processing...' : 'Invest with UPI'}
                  </motion.button>
                  <div className="mt-2">
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                      createOrder={handlePayPalPayment}
                      onApprove={handlePayPalApprove}
                      onError={(err) => {
                        console.error('PayPal payment error:', err);
                        handleInvestmentSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>, 'paypal');
                      }}
                      disabled={isPending || !investmentAmount || parseFloat(investmentAmount) <= 0}
                    />
                  </div>
                </div>
              </motion.form>
            </SwytchCard>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
});

export default TokenomicsInvestment;