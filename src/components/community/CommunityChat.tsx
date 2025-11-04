// src/components/community/CommunityChat.tsx
import { FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { usePlayer } from '@/components/context/PlayerContext';
import { ChatMessage } from '@/lib/types';

const CommunityChat: FC = () => {
  const { userId, playerData } = usePlayer();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(
      collection(db, 'CommunityChat'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      snapshot.forEach(doc => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(fetchedMessages.reverse()); // Reverse to show oldest first
      setLoading(false);
      scrollToBottom();
    }, (err) => {
      console.error('Failed to fetch chat:', err);
      setError('Failed to load chat. Please try again.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !playerData || newMessage.trim() === "") return;

    const messageText = newMessage;
    setNewMessage(""); // Clear input immediately

    try {
      await addDoc(collection(db, 'CommunityChat'), {
        userId: userId,
        username: playerData.username,
        profilePictureUrl: playerData.profilePictureUrl || null, // Use new 2D avatar
        text: messageText,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message: ", err);
      setError("Failed to send message.");
      setNewMessage(messageText); // Put message back on error
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900/50 rounded-lg border border-gray-700">
      {/* Message Display Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {loading && <p className="text-center text-gray-400">Loading chat...</p>}
        {error && <p className="text-center text-rose-400">{error}</p>}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${msg.userId === userId ? 'justify-end' : ''}`}
            >
              {/* Avatar */}
              <img
                src={msg.profilePictureUrl || `https://placehold.co/40x40/7e22ce/FFFFFF?text=${msg.username.charAt(0)}`}
                alt={msg.username}
                className={`w-10 h-10 rounded-full object-cover ${msg.userId === userId ? 'order-2' : 'order-1'}`}
              />
              {/* Bubble */}
              <div className={`p-3 rounded-lg max-w-xs ${msg.userId === userId ? 'order-1 bg-primary/20' : 'order-2 bg-gray-800'}`}>
                <p className={`text-sm font-bold ${msg.userId === userId ? 'text-primary' : 'text-cyan-400'}`}>
                  {msg.username}
                </p>
                <p className="text-white text-md break-words">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSendMessage} className="flex items-center p-4 border-t border-gray-700">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={userId ? "Type your message..." : "Sign in to chat"}
          className="input flex-grow bg-gray-800"
          disabled={!userId || !playerData}
        />
        <motion.button
          type="submit"
          className="btn-primary ml-2"
          disabled={!userId || !playerData || newMessage.trim() === ""}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </div>
  );
};

export default CommunityChat;
