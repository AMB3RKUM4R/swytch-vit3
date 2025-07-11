import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { addDoc, collection, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

// IMPORTANT: Import ChatMessage and CommunityChatProps from lib/types.ts
import { ChatMessage, CommunityChatProps } from '../lib/types';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CommunityChat: FC<CommunityChatProps> = ({ userId, setActiveModal, setShowMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    const q = query(collection(db, 'ChatMessages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnap) => {
      const fetchedMessages: ChatMessage[] = [];
      querySnap.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(fetchedMessages);
    }, (err) => {
      console.error('Failed to fetch chat messages:', err);
      setShowMessage('⚠️ Failed to load chat messages.');
      setActiveModal('error');
    });
    return () => unsubscribe();
  }, [setShowMessage, setActiveModal]);

  const handleSendMessage = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to send messages!');
      setActiveModal('auth');
      return;
    }
    if (!newMessage.trim()) {
      setShowMessage('⚠️ Message cannot be empty!');
      return;
    }
    try {
      await addDoc(collection(db, 'ChatMessages'), {
        user: 'Anonymous', // Replace with actual user name if available
        avatar: '/default-avatar.jpg', // Replace with actual avatar
        message: newMessage,
        timestamp: serverTimestamp(),
        userId,
      });
      setNewMessage('');
      setShowMessage('🎉 Message sent!');
    } catch (err) {
      console.error('Failed to send message:', err);
      setShowMessage('⚠️ Failed to send message. Try again.');
      setActiveModal('error');
    }
  }, [userId, newMessage, setShowMessage, setActiveModal]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <MessageCircle className="w-8 h-8 text-cyan-400 animate-pulse" /> Community Chat
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Chat with fellow PETs in real-time.
      </p>
      <div className="h-64 overflow-y-auto space-y-4 bg-gray-800/80 p-4 rounded-lg border border-cyan-500/20">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            variants={messageVariants}
            className={`flex items-start gap-3 ${msg.userId === userId ? 'justify-end' : ''}`}
          >
            <img src={msg.avatar} alt={msg.user} className="w-8 h-8 rounded-full" onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }} />
            <div className={`p-3 rounded-lg ${msg.userId === userId ? 'bg-rose-600' : 'bg-gray-700'}`}>
              <p className="text-sm text-white font-inter">{msg.message}</p>
              <p className="text-xs text-gray-400 mt-1 font-inter">{new Date(msg.timestamp?.toDate()).toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
          aria-label="Chat message input"
          disabled={!userId}
        />
        <motion.button
          className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold font-poppins flex items-center gap-2"
          onClick={handleSendMessage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Send message"
          disabled={!userId || !newMessage.trim()}
        >
          <Send className="w-5 h-5" /> Send
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CommunityChat;