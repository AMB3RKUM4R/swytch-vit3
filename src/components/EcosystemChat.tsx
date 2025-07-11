import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; // Added query, orderBy, limit, onSnapshot
import { db, auth } from '@/lib/firebaseConfig';
import Confetti from 'react-confetti';

// IMPORTANT: Import ChatMessage and EcosystemChatProps from lib/types.ts
import { ChatMessage as ImportedChatMessage, EcosystemChatProps as ImportedEcosystemChatProps } from '../lib/types';


// chatMessages will be dynamically loaded from Firestore.
// const chatMessages: ChatMessage[] = [ ... ]; // Removed static mock data

// Use ImportedEcosystemChatProps as the type for the FC
const EcosystemChat: React.FC<ImportedEcosystemChatProps> = ({ userId, goldBalance, setGoldBalance, updatePlayerFirestore, setActiveModal, setShowMessage }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [messages, setMessages] = useState<ImportedChatMessage[]>([]); // State to hold fetched messages
  const chatRef = useRef<HTMLDivElement>(null);
  // Removed const { setActiveModal, setShowMessage } = useModal(); as they are now passed as props

  // Effect for fetching and listening to chat messages from Firestore
  useEffect(() => {
    // Order by timestamp and limit to recent messages
    const q = query(collection(db, 'chatMessages'), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ImportedChatMessage[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id } as ImportedChatMessage); // Cast to ImportedChatMessage
      });
      setMessages(fetchedMessages);
      // Scroll to bottom after new messages arrive
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      setShowMessage("⚠️ Failed to load chat messages.");
    });

    // Initial scroll to bottom when component mounts
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }

    return () => unsubscribe(); // Clean up listener on unmount
  }, [setShowMessage]); // Dependencies include setShowMessage

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    // Rely on userId prop for authentication check
    if (!userId) { // Using userId prop directly for auth check
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to send messages!');
      return;
    }
    const messageCost = 1;
    if (goldBalance < messageCost) { // Check goldBalance
      setActiveModal('payment'); // Open payment modal if not enough gold
      setShowMessage('⚠️ You need at least 1 GOLD to send a message! Deposit now.'); // Corrected from JEWEL to GOLD
      return;
    }
    if (chatMessage.trim()) {
      try {
        const newGoldBalance = goldBalance - messageCost; // Deduct 1 GOLD
        setGoldBalance(newGoldBalance); // Update local state immediately
        await updatePlayerFirestore({ gold: newGoldBalance }); // FIX: Update 'gold' field in Firestore
        
        await addDoc(collection(db, 'chatMessages'), { // Ensure 'chatMessages' collection exists
          userId,
          message: chatMessage.trim(),
          timestamp: serverTimestamp(),
          avatar: auth.currentUser?.photoURL || `/avatar${Math.floor(Math.random() * 5) + 1}.jpg`, // Use user's photoURL or random
          user: auth.currentUser?.displayName || auth.currentUser?.email || userId.slice(0, 6), // Use user's display name, email, or sliced ID
        });
        setShowMessage(`✅ Message sent: ${chatMessage}`);
        setActiveModal('payment'); // Trigger payment modal (as intended for monetization/engagement)
        setChatMessage(''); // Clear input
        setShowConfetti(true); // Trigger confetti
        setTimeout(() => setShowConfetti(false), 2000); // Hide confetti after 2 seconds
      } catch (err) {
        console.error('Chat message error:', err);
        setShowMessage('⚠️ Failed to send message. Please try again.');
        setActiveModal('error');
      }
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="space-y-6 relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
      />
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <MessageCircle className="w-8 h-8 text-cyan-400 animate-pulse" /> PET Chat Room
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Connect with the Swytch community to discuss the Petaverse and earn JEWELS.
      </p>
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
        <div className="space-y-4">
          <div
            ref={chatRef}
            className="h-[300px] overflow-y-auto no-scrollbar p-4 bg-gray-800/80 rounded-lg"
          >
            <AnimatePresence>
              {messages.map((msg) => ( // Use 'messages' state here
                <motion.div
                  key={msg.id} // Use Firestore doc ID for key
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-start gap-3 mb-4"
                >
                  <img src={msg.avatar} alt={msg.user} className="w-8 h-8 rounded-full border border-cyan-500/20" onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }} />
                  <div>
                    <p className="text-white font-semibold font-poppins">
                      {msg.user} <span className="text-gray-400 text-xs ml-2">{msg.timestamp && typeof msg.timestamp === 'object' ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.timestamp}</span>
                    </p>
                    <p className="text-gray-300 text-sm font-inter">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 bg-gray-800 text-white rounded-md border border-cyan-500/20 focus:border-cyan-500"
              required
              aria-label="Chat message"
              disabled={!userId || goldBalance < 1} // Disable if no userId or not enough gold
            />
            <motion.button
              type="submit"
              className="px-4 py-2 bg-rose-600 text-white hover:bg-cyan-500 rounded-md flex items-center gap-2 font-poppins"
              whileHover={{ scale: 1.05 }}
              disabled={!userId || goldBalance < 1 || !chatMessage.trim()} // Disable if no userId, not enough gold, or empty message
              aria-label="Send message"
            >
              <Send className="w-5 h-5" /> Send
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EcosystemChat;