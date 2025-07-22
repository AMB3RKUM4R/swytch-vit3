
// src/components/community/CommunityChat.tsx
import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { ChatMessage, PlayerData } from '@/lib/types'; // Import ChatMessage and PlayerData

interface CommunityChatProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const CommunityChat: FC<CommunityChatProps> = ({ userId, setActiveModal, setShowMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState('Guest'); // State to store username for chat
  const [avatar, setAvatar] = useState('https://placehold.co/40x40/random/FFFFFF?text=U'); // State for user avatar

  // Fetch user's username and avatar on load
  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setUsername(data.username || 'User');
          // Placeholder for avatar, if you have it in PlayerData
          // setAvatar(data.avatarUrl || 'https://placehold.co/40x40/random/FFFFFF?text=U');
        }
      }, (err) => {
        console.error("Failed to fetch user data for chat:", err);
      });
      return () => unsubscribe();
    } else {
      setUsername('Guest');
      setAvatar('https://placehold.co/40x40/random/FFFFFF?text=G');
    }
  }, [userId]);


  // Fetch messages
  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'CommunityChat'), orderBy('timestamp', 'asc'), limit(50)); // Fetch last 50 messages

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      snapshot.forEach(doc => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(fetchedMessages);
      setLoading(false);
    }, (err) => {
      console.error('Failed to fetch chat messages:', err);
      setError('Failed to load chat messages.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to chat.');
      setActiveModal('auth');
      return;
    }
    if (newMessage.trim() === '') {
      setShowMessage('⚠️ Message cannot be empty.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'CommunityChat'), {
        userId,
        user: username,
        avatar: avatar, // Use actual avatar if available
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
      setShowMessage('✅ Message sent!');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message.');
      setShowMessage('⚠️ Failed to send message.');
    } finally {
      setLoading(false);
    }
  }, [userId, newMessage, username, avatar, setShowMessage, setActiveModal]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  return (
    <SwytchCard gradient="from-green-700/20 to-teal-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <MessageCircle className="w-7 h-7 text-primary" /> Community Chat
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Chat with fellow PETverse members in real-time!
      </p>

      <div className="flex flex-col h-96 bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          {loading ? (
            <p className="text-center text-gray-400">Loading messages...</p>
          ) : error ? (
            <p className="text-center text-rose-400">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400">No messages yet. Be the first to say hello!</p>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex items-start gap-3 mb-4 ${msg.userId === userId ? 'justify-end' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.userId !== userId && (
                  <img
                    src={msg.avatar || 'https://placehold.co/40x40/random/FFFFFF?text=U'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/40x40/random/FFFFFF?text=U"; }}
                  />
                )}
                <div className={`p-3 rounded-lg max-w-[80%] ${msg.userId === userId ? 'bg-blue-600/70 text-white' : 'bg-gray-700/70 text-gray-100'}`}>
                  <p className="font-semibold text-sm">{msg.user}</p>
                  <p className="text-md">{msg.message}</p>
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : ''}
                  </p>
                </div>
                {msg.userId === userId && (
                  <img
                    src={msg.avatar || 'https://placehold.co/40x40/random/FFFFFF?text=U'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/40x40/random/FFFFFF?text=U"; }}
                  />
                )}
              </motion.div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700 flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="input flex-grow bg-gray-800/50 border-gray-600 text-white"
            disabled={loading || !userId}
          />
          <motion.button
            onClick={handleSendMessage}
            className="btn-primary p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={loading || !userId || newMessage.trim() === ''}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </SwytchCard>
  );
};

export default CommunityChat;
