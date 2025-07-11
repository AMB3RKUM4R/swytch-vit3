import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseConfig';
import { useModal } from '@/context/ModalContext';
import Confetti from 'react-confetti';
import { ChatMessage, DisclosureChatProps } from '@/lib/types';

const DisclosureChat: React.FC<DisclosureChatProps> = ({ userId, goldBalance, setGoldBalance, updatePlayerFirestore }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const { setActiveModal, setShowMessage } = useModal();

  useEffect(() => {
    const q = query(collection(db, 'chatMessages'), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id } as ChatMessage);
      });
      setMessages(fetchedMessages);
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      setShowMessage("⚠️ Failed to load chat messages.");
    });

    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }

    return () => unsubscribe();
  }, [setShowMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to send messages!');
      return;
    }
    if (goldBalance < 1) {
      setActiveModal('payment');
      setShowMessage('⚠️ You need at least 1 GOLD to send a message! Deposit now.');
      return;
    }
    if (chatMessage.trim()) {
      try {
        const newGoldBalance = goldBalance - 1;
        setGoldBalance(newGoldBalance);
        await updatePlayerFirestore({ gold: newGoldBalance });

        await addDoc(collection(db, 'chatMessages'), {
          userId,
          message: chatMessage.trim(),
          timestamp: serverTimestamp(),
          avatar: auth.currentUser?.photoURL || `/avatar${Math.floor(Math.random() * 5) + 1}.jpg`,
          user: auth.currentUser?.displayName || auth.currentUser?.email || userId.slice(0, 6),
        });
        setShowMessage(`✅ Message sent: ${chatMessage}`);
        setActiveModal('payment');
        setChatMessage('');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } catch (err) {
        console.error('Message submission error:', err);
        setShowMessage('⚠️ Failed to send message. Please try again.');
        setActiveModal('error');
      }
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
      className="space-y-6 relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins">
        <MessageCircle className="text-cyan-400 w-12 h-12 animate-pulse" /> PET Chat Room
      </h2>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto leading-relaxed font-inter">
        Discuss DSPET terms and connect with the Swytch community.
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
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
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
              disabled={!userId || goldBalance < 1}
            />
            <motion.button
              type="submit"
              className="px-4 py-2 bg-rose-600 text-white hover:bg-cyan-500 rounded-md flex items-center gap-2 font-poppins"
              whileHover={{ scale: 1.05 }}
              disabled={!userId || goldBalance < 1 || !chatMessage.trim()}
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

export default DisclosureChat;