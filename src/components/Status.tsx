"use client";

import { type FC, useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useBlockNumber,
  useEnsName,
  useFeeData,
  useContractWrite,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import {
  FaWallet,
  FaChartLine,
  FaPaypal,
  FaLink,
  FaUserCheck,
  FaRegMoneyBillAlt,
  FaCoins,
  FaUniversity,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Mainnet USDT
const ENERGY_TRUST_ADDRESS = "0xDE9978913D9a969d799A2ba9381FB82450b92CE0"; // Energy Trust address

const ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

const Status: FC = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { data: ensName } = useEnsName({ address });
  const { data: blockNumber } = useBlockNumber();
  const { data: feeData } = useFeeData();
  const { data: usdtBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
    chainId: mainnet.id,
  });
  const { writeContractAsync } = useContractWrite();

  const [membership, setMembership] = useState("");
  const [capitalInvested, setCapitalInvested] = useState(0);
  const [roi, setRoi] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [payPalEmail, setPayPalEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isMember, setIsMember] = useState(false);

  // Local Storage for Membership Status
  useEffect(() => {
    const storedMembership = localStorage.getItem("swytch_membership");
    if (storedMembership) {
      const parsed = JSON.parse(storedMembership);
      setIsMember(parsed.isMember || false);
      setMembership(parsed.membership || "");
      setCapitalInvested(parsed.capitalInvested || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "swytch_membership",
      JSON.stringify({ isMember, membership, capitalInvested })
    );
  }, [isMember, membership, capitalInvested]);

  // Calculate ROI
  useEffect(() => {
    if (isConnected && address) {
      const monthlyRoi = capitalInvested * 0.05;
      setRoi(monthlyRoi);
    }
  }, [isConnected, address, capitalInvested]);

  // Auto-dismiss Message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleMembershipPayment = async (packageName: string, amount: number) => {
    if (!isConnected) {
      setMessage("⚠️ Please connect your wallet.");
      return;
    }
    if (chainId !== mainnet.id) {
      setMessage("⚠️ Please switch to Ethereum Mainnet.");
      return;
    }
    if (usdtBalance && Number(formatUnits(usdtBalance.value, 6)) < amount) {
      setMessage(`⚠️ Insufficient USDT balance. Need ${amount} USDT.`);
      return;
    }

    try {
      await writeContractAsync({
        address: USDT_ADDRESS,
        abi: ABI,
        functionName: "transfer",
        args: [ENERGY_TRUST_ADDRESS, parseUnits(String(amount), 6)],
      });
      setMembership(packageName);
      setCapitalInvested(amount);
      setIsMember(true);
      setMessage(`🎉 You joined the ${packageName} membership for ${amount} USDT! Welcome to the PETverse.`);
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("⚠️ Payment failed. Please try again.");
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (!isConnected) {
      setMessage("⚠️ Please connect your wallet.");
      return;
    }
    if (chainId !== mainnet.id) {
      setMessage("⚠️ Please switch to Ethereum Mainnet.");
      return;
    }
    if (amount < 10) {
      setMessage("⚠️ Minimum withdrawal is $10.");
      return;
    }
    if (
      usdtBalance?.value &&
      amount * 1e6 > parseFloat(formatUnits(usdtBalance.value, 6))
    ) {
      setMessage("⚠️ Insufficient USDT balance.");
      return;
    }

    const fee = amount * 0.05;
    const netAmount = amount - fee;

    try {
      await writeContractAsync({
        address: ENERGY_TRUST_ADDRESS,
        abi: ABI,
        functionName: "withdraw",
        args: [parseUnits(String(netAmount), 6)],
      });
      setMessage(`✅ Withdrawn ${netAmount} USDT (5% fee: ${fee})!`);
      setWithdrawalAmount("");
      setRoi(roi - netAmount);
    } catch (err) {
      console.error("Withdrawal error:", err);
      setMessage("⚠️ Withdrawal failed.");
    }
  };

  const handlePayPalPayment = () => {
    if (!payPalEmail || capitalInvested <= 0) {
      setMessage("⚠️ Enter a valid PayPal email and select a membership.");
      return;
    }
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${payPalEmail}&amount=${capitalInvested}&currency_code=USD`;
    window.open(paypalUrl, "_blank");
    setMessage(`💰 PayPal payment of ${capitalInvested} USD started!`);
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-lg rounded-3xl border border-neon-green/20 shadow-2xl p-8 space-y-6 transition"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <h2 className="text-3xl font-bold text-center text-purple-500 flex items-center justify-center gap-2 font-poppins">
        <FaWallet className="text-neon-green" /> Swytch Investment Vault
      </h2>
      <p className="text-center text-gray-300 font-inter">
        Join the Swytch Energy Trust to earn JEWELS through gameplay and up to 5% monthly ROI via AI-driven arbitrage.
      </p>

      {!isConnected ? (
        <div className="text-center">
          <motion.button
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl transition shadow-md font-poppins"
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(57, 255, 20, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMessage("⚠️ Connect your wallet via MetaMask or WalletConnect.")}
          >
            Connect Wallet
          </motion.button>
        </div>
      ) : (
        <div className="space-y-6 text-sm text-gray-200">
          {/* Wallet Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info icon={<FaChartLine className="text-neon-green" />} label="Network" value={chainId === mainnet.id ? "🟢 Ethereum" : "⚪️ Switch to Mainnet"} />
            <Info icon={<FaLink className="text-neon-green" />} label="Address" value={`${address?.slice(0, 6)}...${address?.slice(-4)}`} />
            <Info icon={<FaUserCheck className="text-neon-green" />} label="ENS" value={ensName || "No ENS"} />
            <Info icon={<FaUniversity className="text-neon-green" />} label="Block #" value={blockNumber?.toString() ?? "..."} />
            <Info icon={<FaCoins className="text-neon-green" />} label="Gas Price" value={feeData?.gasPrice ? `${formatUnits(feeData.gasPrice, 9)} gwei` : "..."} />
            <Info icon={<FaRegMoneyBillAlt className="text-neon-green" />} label="USDT Balance" value={`${formatUnits(usdtBalance?.value || 0n, 6)} USDT`} />
            <Info icon="📦" label="Membership" value={membership || "Not Selected"} />
            <Info icon="🏦" label="Capital Invested" value={`${capitalInvested} USDT`} />
            <Info icon="📈" label="Monthly ROI" value={`${roi.toFixed(2)} USDT`} />
            <Info icon="💼" label="Status" value={isMember ? "PET Member" : "Non-Member"} />
          </div>

          {/* Membership Benefits */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-neon-green/20">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-4 font-poppins">
              <FaCoins className="text-neon-green animate-pulse" /> Membership Benefits
            </h3>
            <p className="text-gray-300 mb-4 font-inter">
              As a Swytch PET, unlock exclusive gameplay rewards, voting rights, and up to 3.3% monthly yields in our decentralized ecosystem.
            </p>
            <ul className="space-y-2 text-gray-300 text-sm font-inter">
              <li className="flex items-center gap-2">
                <FaCoins className="text-neon-green" /> Earn JEWELS through daily quests and Energy Vault interactions.
              </li>
              <li className="flex items-center gap-2">
                <FaChartLine className="text-neon-green" /> Convert SWYT to USDT for trading or withdrawals.
              </li>
              <li className="flex items-center gap-2">
                <FaUserCheck className="text-neon-green" /> Access private channels and governance voting.
              </li>
            </ul>
          </div>

          {/* Membership Packages */}
          <div className="flex flex-wrap gap-4 justify-center">
            {([
              ["Standard", 100],
              ["Classic", 250],
              ["Premium", 500],
              ["Royal", 1000],
              ["Elite", 5000],
            ] as [string, number][]).map(([label, value]) => (
              <motion.button
                key={label}
                onClick={() => handleMembershipPayment(label, value)}
                className="rounded-xl px-5 py-3 font-medium text-sm shadow-md backdrop-blur bg-gradient-to-br from-purple-500 via-neon-green/50 to-purple-600 hover:from-purple-600 hover:to-neon-green/70 transition text-white font-poppins"
                whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(57, 255, 20, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                disabled={isMember}
                aria-label={`Join ${label} membership for ${value} USDT`}
              >
                {label} <span className="text-xs opacity-80">(${value})</span>
              </motion.button>
            ))}
          </div>

          {/* Withdrawal and PayPal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1 block text-gray-400 font-inter">Withdraw (min $10)</label>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 bg-gray-900 border-neon-green/20 text-white text-sm font-inter"
                aria-label="Withdrawal amount"
              />
              <motion.button
                onClick={handleWithdrawal}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded-xl text-sm transition font-poppins"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Withdraw USDT"
              >
                Withdraw USDT
              </motion.button>
            </div>

            <div>
              <label className="text-xs mb-1 block text-gray-400 font-inter">PayPal Email</label>
              <input
                type="email"
                value={payPalEmail}
                onChange={(e) => setPayPalEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 bg-gray-900 border-neon-green/20 text-white text-sm font-inter"
                aria-label="PayPal email"
              />
              <motion.button
                onClick={handlePayPalPayment}
                className="mt-2 bg-purple-500 hover:bg-purple-600 text-white w-full py-2 rounded-xl text-sm transition flex items-center justify-center gap-1 font-poppins"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Pay with PayPal"
              >
                Pay with PayPal <FaPaypal />
              </motion.button>
            </div>
          </div>

          {/* Message Popup */}
          <AnimatePresence>
            {message && (
              <motion.div
                variants={rewardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-gray-800 border border-neon-green/20 text-neon-green text-sm shadow-sm font-inter"
              >
                <FaExclamationTriangle className="text-lg" /> {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        :root {
          --purple-500: #6B46C1;
          --neon-green: #39FF14;
          --dark-gray: #1A202C;
        }
        .backdrop-blur { backdrop-filter: blur(10px); }
        button:focus, input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(57, 255, 20, 0.5);
        }
        @media (prefers-reduced-motion) {
          .animate-pulse {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

const Info = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2 bg-gray-800/50 border border-neon-green/20 px-4 py-3 rounded-xl shadow-sm backdrop-blur">
    <div className="text-neon-green">{icon}</div>
    <div className="text-sm">
      <div className="font-medium text-white font-poppins">{label}</div>
      <div className="text-gray-300 font-inter">{value}</div>
    </div>
  </div>
);

export default Status;