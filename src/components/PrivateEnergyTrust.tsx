"use client";

import { FC, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, ShoppingCart, Users, X, Sparkles, Trophy, Wallet, Globe } from "lucide-react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useContractWrite,
  useBalance,
  useChainId,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { mainnet } from "viem/chains";

const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Mainnet USDT
const ENERGY_TRUST_ADDRESS = "0xDE9978913D9a969d799A2ba9381FB82450b92CE0"; // Energy Trust address
const ADMIN_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual admin address

const USDT_ABI = [
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
];

const nftImages = [
  "/nfts/nft.jpg", "/nfts/nft2.jpg", "/nfts/nft3.jpg", "/nfts/nft4.jpg",
  "/nfts/nft5.jpg", "/nfts/nft6.jpg", "/nfts/nft7.jpg", "/nfts/nft8.jpg",
  "/nfts/nft9.jpg", "/nfts/nft10.jpg", "/nfts/nft11.jpg", "/nfts/nft12.jpg"
];

const nftItems = nftImages.map((img, i) => ({
  id: i + 1,
  img,
  title: `PET Artifact #${i + 1}`,
  price: `${(20 + i * 3).toFixed(2)} USDT`,
  energyBoost: `+${10 + i * 5}% Energy Yield`,
  priceValue: 20 + i * 3, // Numeric value for USDT payment
}));

// Animation variants
const sectionVariants = { hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", type: "spring", stiffness: 80 } } };
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.3 } } };
const infiniteScroll = { animate: { x: ["0%", "-50%"], transition: { x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" } } } };
const dustVariants = { animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const modalVariants = { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } }, exit: { opacity: 0, scale: 0.8 } };

interface ModalProps {
  title: string;
  content: string;
  onClose: () => void;
  onConfirm?: () => void;
  showConfirm?: boolean;
  children?: React.ReactNode; // Added children prop
}

const Modal = ({ title, content, onClose, onConfirm, showConfirm = false, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        ref={modalRef}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-gray-900 p-8 rounded-2xl max-w-md w-full border border-rose-500/20 shadow-2xl backdrop-blur-md"
        tabIndex={-1}
      >
        <motion.button
          className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
          onClick={onClose}
          whileHover={{ rotate: 90 }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </motion.button>
        <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center gap-2 font-poppins">
          <Sparkles className="w-6 h-6 animate-pulse" /> {title}
        </h3>
        <p className="text-gray-300 mb-6 font-inter">{content}</p>
        {children && <div className="mb-6">{children}</div>}
        <div className="flex gap-4">
          {showConfirm && onConfirm && (
            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all font-poppins"
              aria-label={`Confirm ${title}`}
            >
              Confirm
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-gray-700 text-white hover:bg-gray-800 transition-all font-poppins"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ConnectWalletButton: FC<{ onConnect: () => void }> = ({ onConnect }) => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: usdtBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
    chainId: mainnet.id,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {!isConnected ? (
        <div className="flex gap-4">
          {connectors
            .filter((connector) => connector.id === "metaMask" || connector.id === "walletConnect")
            .map((connector) => (
              <motion.button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  onConnect();
                }}
                className="px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all font-poppins"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Connect with ${connector.name}`}
              >
                Connect with {connector.name}
              </motion.button>
            ))}
        </div>
      ) : (
        <div className="text-center text-gray-200 font-inter">
          <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <p>Network: {chainId === mainnet.id ? "Ethereum" : "Switch to Mainnet"}</p>
          <p>Balance: {usdtBalance ? `${formatUnits(usdtBalance.value, 6)} USDT` : "Loading..."}</p>
          <motion.button
            onClick={() => disconnect()}
            className="mt-2 px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Disconnect wallet"
          >
            Disconnect
          </motion.button>
        </div>
      )}
    </div>
  );
};

const PrivateEnergyTrust: FC = () => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: usdtBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
    chainId: mainnet.id,
  });
  const { writeContractAsync } = useContractWrite();
  const [isMember, setIsMember] = useState(false);
  const [message, setMessage] = useState("");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");

  // Local Storage for Membership Status
  useEffect(() => {
    const storedMembership = localStorage.getItem("swytch_membership");
    if (storedMembership) {
      const parsed = JSON.parse(storedMembership);
      setIsMember(parsed.isMember || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("swytch_membership", JSON.stringify({ isMember }));
  }, [isMember]);

  // Auto-dismiss Message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Infinite Scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let frameId: number;
    const scroll = () => {
      scrollContainer.scrollLeft += 1;
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      }
      frameId = requestAnimationFrame(scroll);
    };
    frameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Mouse Position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMembershipPayment = async () => {
    if (!isConnected) {
      setShowModal("Connect Wallet");
      return;
    }
    if (chainId !== mainnet.id) {
      setMessage("⚠️ Please switch to Ethereum Mainnet.");
      return;
    }
    if (usdtBalance && Number(formatUnits(usdtBalance.value, 6)) < 10) {
      setMessage("⚠️ Insufficient USDT balance. Need 10 USDT.");
      return;
    }

    try {
      await writeContractAsync({
        address: USDT_ADDRESS,
        abi: USDT_ABI,
        functionName: "transfer",
        args: [ENERGY_TRUST_ADDRESS, parseUnits("10", 6)],
      });
      setIsMember(true);
      setMessage("🎉 You joined the PETverse for 10 USDT! Welcome!");
      setShowModal(null);
    } catch (err) {
      console.error("Membership payment error:", err);
      setMessage("⚠️ Payment failed. Please try again.");
    }
  };

  const handleNFTPurchase = async (nft: typeof nftItems[0]) => {
    if (!isConnected) {
      setShowModal("Connect Wallet");
      return;
    }
    if (chainId !== mainnet.id) {
      setMessage("⚠️ Please switch to Ethereum Mainnet.");
      return;
    }
    if (usdtBalance && Number(formatUnits(usdtBalance.value, 6)) < nft.priceValue) {
      setMessage(`⚠️ Insufficient USDT balance. Need ${nft.priceValue} USDT.`);
      return;
    }

    try {
      await writeContractAsync({
        address: USDT_ADDRESS,
        abi: USDT_ABI,
        functionName: "transfer",
        args: [ENERGY_TRUST_ADDRESS, parseUnits(String(nft.priceValue), 6)],
      });
      setMessage(`🎉 Purchased ${nft.title} for ${nft.price}!`);
      setShowModal(null);
    } catch (err) {
      console.error("NFT purchase error:", err);
      setMessage("⚠️ Purchase failed. Please try again.");
    }
  };

  const handlePayout = async () => {
    if (!isConnected || address?.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      setMessage("⚠️ Only admins can initiate payouts.");
      return;
    }
    if (chainId !== mainnet.id) {
      setMessage("⚠️ Please switch to Ethereum Mainnet.");
      return;
    }
    if (!payoutAddress || !/^(0x)?[0-9a-fA-F]{40}$/.test(payoutAddress)) {
      setMessage("⚠️ Invalid recipient address.");
      return;
    }
    const amount = Number(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage("⚠️ Invalid payout amount.");
      return;
    }
    if (usdtBalance && Number(formatUnits(usdtBalance.value, 6)) < amount) {
      setMessage(`⚠️ Insufficient USDT balance. Need ${amount} USDT.`);
      return;
    }

    try {
      await writeContractAsync({
        address: USDT_ADDRESS,
        abi: USDT_ABI,
        functionName: "transfer",
        args: [payoutAddress, parseUnits(payoutAmount, 6)],
      });
      setMessage(`🎉 Payout of ${payoutAmount} USDT sent to ${payoutAddress.slice(0, 6)}...${payoutAddress.slice(-4)}!`);
      setPayoutAddress("");
      setPayoutAmount("");
    } catch (err) {
      console.error("Payout error:", err);
      setMessage("⚠️ Payout failed. Please try again.");
    }
  };

  const recentPurchases = Array.from({ length: 5 }).map((_, i) => ({
    avatar: `/avatars/avatar${(i % 3) + 1}.png`,
    address: isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 8)}`,
    amount: `${(20 + i * 10).toFixed(2)} USDT`,
  }));

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-purple-950 via-black-950/20 to-black text-gray-100 overflow-hidden">
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 192}px`, left: `${mousePosition.x - 192}px` }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-pink-400/20 rounded-full opacity-20 blur-2xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 128}px`, left: `${mousePosition.x - 128}px` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${mousePosition.y - 50 + Math.random() * 100}px`,
              left: `${mousePosition.x - 50 + Math.random() * 100}px`,
              backgroundColor: i % 2 === 0 ? "rgba(236, 72, 153, 0.5)" : "rgba(34, 211, 238, 0.5)",
            }}
            variants={dustVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      <motion.div className="relative z-20 max-w-7xl mx-auto space-y-32" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/50 to-pink-900/50 rounded-3xl" />
          <div className="relative">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-rose-400 mb-6 tracking-tight flex items-center justify-center gap-4 font-poppins">
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Private Energy Trust
            </h2>
            <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed font-inter">
              A gamified ecosystem blending NFT rewards, JEWELS earnings, SWYT trading, and DAO governance, owned by PETs for a decentralized future.
            </p>
            {isMember ? (
              <p className="text-lg text-neon-green font-inter">Welcome, PET! You're shaping the PETverse.</p>
            ) : (
              <motion.button
                className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group font-poppins"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal("Join PETverse")}
                aria-label="Become a PET"
              >
                Become a PET
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {isConnected && address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase() && (
          <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-rose-500/10 rounded-3xl" />
            <div className="relative space-y-6">
              <h3 className="text-3xl font-extrabold text-white text-center font-poppins">Admin Payout</h3>
              <p className="text-lg text-gray-300 text-center font-inter">Send USDT payouts to user wallets for JEWELS or SWYT rewards.</p>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Recipient Address (0x...)"
                  value={payoutAddress}
                  onChange={(e) => setPayoutAddress(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-rose-500/20 focus:ring-2 focus:ring-rose-500 font-inter"
                  aria-label="Recipient address"
                />
                <input
                  type="number"
                  placeholder="Amount in USDT"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-rose-500/20 focus:ring-2 focus:ring-rose-500 font-inter"
                  aria-label="Payout amount"
                />
                <motion.button
                  onClick={handlePayout}
                  className="px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all font-poppins"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Initiate payout"
                >
                  Send Payout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-pink-500/30 shadow-2xl hover:shadow-pink-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-3xl" />
          <div className="relative flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h3 className="text-4xl font-extrabold text-white flex items-center gap-4 font-poppins">
                <ShieldCheck className="w-10 h-10 text-rose-400 animate-pulse" /> Freedom as a PET
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed font-inter">
                As a Private Ministerial Association (PMA), Swytch shields PETs from external interference, empowering you as an income beneficiary with JEWELS and SWYT rewards.
              </p>
              <motion.div variants={fadeUp}>
                <svg viewBox="0 0 600 400" className="w-full h-auto">
                  <defs>
                    <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "#22d3ee", stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="600" height="400" fill="url(#trustGradient)" opacity="0.1" rx="20" />
                  <circle cx="300" cy="200" r="100" fill="none" stroke="#ec4899" strokeWidth="4" />
                  <text x="300" y="200" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">Trust Rewards</text>
                  <g transform="translate(100 50)">
                    <rect width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                    <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">NFTs</text>
                  </g>
                  <g transform="translate(400 50)">
                    <rect width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                    <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Yield</text>
                  </g>
                  <g transform="translate(100 290)">
                    <rect width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                    <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Voting</text>
                  </g>
                  <g transform="translate(400 290)">
                    <rect width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                    <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Assets</text>
                  </g>
                </svg>
                <p className="text-sm text-gray-400 mt-2 font-inter">Diagram: Trust rewards via NFTs, yield, voting, and assets.</p>
              </motion.div>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-rose-500/20 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic font-inter">“As a PET, you shape your financial destiny with Energy and Trust.”</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="space-y-8">
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
            <Trophy className="w-10 h-10 text-rose-400 animate-pulse" /> Featured PET Artifacts
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
            Collect PET Artifacts to boost your Energy yield and influence in the PETverse. Requires PET membership.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {nftItems.slice(0, 3).map((nft) => (
              <motion.div
                key={nft.id}
                className="bg-gray-900/60 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/30 transition-all"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <img src={nft.img} alt={nft.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h4 className="text-xl font-semibold text-rose-300 mb-2 font-poppins">{nft.title}</h4>
                <p className="text-gray-200 mb-2 font-inter">Price: {nft.price}</p>
                <p className="text-gray-200 mb-4 font-inter">Boost: {nft.energyBoost}</p>
                <motion.button
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg w-full font-semibold font-poppins"
                  onClick={() => setShowModal(`Purchase ${nft.title}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!isMember}
                  aria-label={`Purchase ${nft.title}`}
                >
                  {isMember ? "Buy Now" : "Join PET to Buy"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="space-y-8">
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
            <ShoppingCart className="w-10 h-10 text-pink-400 animate-pulse" /> Explore PET Artifacts
          </h2>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6 no-scrollbar"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...nftItems, ...nftItems].map((nft, i) => (
                <motion.div
                  key={`${nft.id}-${i}`}
                  className="flex-shrink-0 w-[240px] bg-gray-900/60 rounded-xl p-4 border border-pink-500/20 shadow-xl hover:shadow-pink-500/30 transition-all"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <img src={nft.img} alt={nft.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                  <h4 className="text-lg font-semibold text-pink-300 mb-2 font-poppins">{nft.title}</h4>
                  <p className="text-gray-200 mb-2 font-inter">Price: {nft.price}</p>
                  <p className="text-gray-200 mb-3 font-inter">Boost: {nft.energyBoost}</p>
                  <motion.button
                    className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg w-full font-semibold font-poppins"
                    onClick={() => setShowModal(`Purchase ${nft.title}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isMember}
                    aria-label={`Purchase ${nft.title}`}
                  >
                    {isMember ? "Buy Now" : "Join PET to Buy"}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
            <svg viewBox="0 0 600 400" className="w-full h-auto">
              <defs>
                <linearGradient id="nftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: "#22d3ee", stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="600" height="400" fill="url(#nftGradient)" opacity="0.1" rx="20" />
              <g>
                <rect x="50" y="50" width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                <text x="100" y="80" textAnchor="middle" fill="#fff" fontSize="14">Mint NFT</text>
                <path d="M150 80 L200 80" fill="none" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow)" />
                <rect x="200" y="50" width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                <text x="250" y="80" textAnchor="middle" fill="#fff" fontSize="14">Trade</text>
                <path d="M300 80 L350 80" fill="none" stroke="#ec4899" strokeWidth="2" markerEnd="url(#arrow)" />
                <rect x="350" y="50" width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                <text x="400" y="80" textAnchor="middle" fill="#fff" fontSize="14">Hold</text>
                <path d="M450 80 L500 80" fill="none" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow)" />
                <rect x="500" y="50" width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                <text x="550" y="80" textAnchor="middle" fill="#fff" fontSize="14">Boost</text>
              </g>
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#fff" />
                </marker>
              </defs>
            </svg>
            <p className="text-sm text-gray-400 mt-2 font-inter">Diagram: NFT lifecycle from minting to boosting Energy.</p>
          </motion.div>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-rose-500/10 rounded-3xl" />
          <div className="relative flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h3 className="text-4xl font-extrabold text-white flex items-center gap-4 font-poppins">
                <Users className="w-10 h-10 text-rose-400 animate-pulse" /> PET Community Panel
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed font-inter">
                Join a hierarchy-free digital society to vote, propose, and earn reputation with JEWELS, guided by NPCs in the Community Panel.
              </p>
              <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
                <svg viewBox="0 0 600 400" className="w-full h-auto">
                  <defs>
                    <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "#22d3ee", stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="600" height="400" fill="url(#communityGradient)" opacity="0.1" rx="20" />
                  <circle cx="300" cy="200" r="100" fill="none" stroke="#ec4899" strokeWidth="4" />
                  <text x="300" y="200" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">Community Panel</text>
                  {["Voting", "Proposals", "Reputation", "Quests"].map((item, i) => (
                    <g key={i} transform={`rotate(${i * 90} 300 200) translate(300 100)`}>
                      <circle r="40" fill="#22d3ee" opacity="0.3" />
                      <text textAnchor="middle" y="5" fill="#fff" fontSize="14">{item}</text>
                    </g>
                  ))}
                </svg>
                <p className="text-sm text-gray-400 mt-2 font-inter">Diagram: Decentralized Community Panel for voting and reputation.</p>
              </motion.div>
              <motion.button
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-semibold group font-poppins"
                onClick={() => setShowModal("Connect with PETs")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Connect with PETs"
              >
                Connect with PETs
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-200" />
              </motion.button>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-rose-500/20 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic font-inter">“Build the PETverse with trust, not contracts.”</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="space-y-8">
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
            <Wallet className="w-10 h-10 text-pink-400 animate-pulse" /> Recent PET Purchases
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPurchases.map((item, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 p-4 rounded-lg flex items-center space-x-4 border border-pink-500/20 shadow-xl hover:shadow-pink-500/30 transition-all"
                whileHover={{ scale: 1.03 }}
              >
                <img src={item.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-pink-500/20" />
                <div>
                  <p className="text-pink-300 font-semibold font-poppins">{item.address}</p>
                  <p className="text-gray-200 text-sm font-inter">Paid: {item.amount}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <ShoppingCart className="mx-auto text-rose-400 w-12 h-12 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white font-poppins">No Artifacts to Trade?</h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto font-inter">
              Purchase your first PET Artifact to amplify your Energy in the PETverse.
            </p>
            <motion.button
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-semibold font-poppins"
              onClick={() => setShowModal("Start Trading")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start Trading"
            >
              Start Trading
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="text-center space-y-6">
          <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins">
            <Globe className="w-10 h-10 text-rose-400 animate-pulse" /> Join the PETverse
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-inter">
            Become a PET, stake your claim in a decentralized future, and let your Energy shape the PETverse.
          </p>
          <ConnectWalletButton onConnect={() => setMessage("🎉 Wallet connected! Proceed to join the PETverse.")} />
        </motion.div>

        <AnimatePresence>
          {showModal === "Join PETverse" && (
            <Modal
              title="Join the PETverse"
              content={`Pay 10 USDT to become a PET, unlocking Swytch’s ecosystem with JEWELS rewards, SWYT trading, and DAO governance. ${isConnected ? "Confirm to proceed." : "Connect your wallet to proceed."}`}
              onClose={() => setShowModal(null)}
              onConfirm={isConnected ? handleMembershipPayment : undefined}
              showConfirm={isConnected}
            />
          )}
          {showModal === "Connect with PETs" && (
            <Modal
              title="Connect with PETs"
              content="Join the Community Panel to vote, propose, and earn reputation in a hierarchy-free digital society. PET membership required."
              onClose={() => setShowModal(null)}
            />
          )}
          {showModal === "Start Trading" && (
            <Modal
              title="Start Trading"
              content={`Purchase your first PET Artifact to boost your Energy yield and influence in the PETverse. ${isConnected ? "Browse artifacts above." : "Connect your wallet to proceed."}`}
              onClose={() => setShowModal(null)}
            />
          )}
          {showModal === "Connect Wallet" && (
            <Modal
              title="Connect Wallet"
              content="Connect your wallet to join the PETverse or purchase artifacts."
              onClose={() => setShowModal(null)}
              onConfirm={() => setShowModal(null)}
              showConfirm={false}
            >
              <ConnectWalletButton onConnect={() => setMessage("🎉 Wallet connected! Proceed with your action.")} />
            </Modal>
          )}
          {nftItems.map((nft) => (
            showModal === `Purchase ${nft.title}` && (
              <Modal
                key={nft.id}
                title={`Purchase ${nft.title}`}
                content={`Acquire ${nft.title} for ${nft.price} to gain ${nft.energyBoost}. ${isConnected ? (isMember ? "Confirm to proceed." : "Join PET membership to purchase.") : "Connect your wallet to proceed."}`}
                onClose={() => setShowModal(null)}
                onConfirm={isConnected && isMember ? () => handleNFTPurchase(nft) : undefined}
                showConfirm={isConnected && isMember}
              />
            )
          ))}
          {message && (
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-4 right-4 bg-gray-900 p-4 rounded-xl border border-rose-500/20 shadow-xl backdrop-blur-md text-neon-green font-inter"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          :root {
            --rose-500: #ec4899;
            --cyan-500: #22d3ee;
            --neon-green: #39FF14;
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .blur-3xl { filter: blur(64px); }
          .blur-2xl { filter: blur(32px); }
          button:focus, input:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.5);
          }
          .bg-[url('/noise.png')] {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr精细2z3p4jBAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiQpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
            background-repeat: repeat;
            background-size: 64px 64px;
          }
          @media (prefers-reduced-motion) {
            .animate-pulse, .animate-bounce {
              animation: none !important;
            }
          }
        `}</style>
      </motion.div>
    </section>
  );
};

export default PrivateEnergyTrust;