import { FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Shield } from 'lucide-react';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { usePlayer } from '@/components/context/PlayerContext';
import { ChatMessage } from '@/lib/types';

const CommunityChat: FC = () => {
  const { userId, playerData } = usePlayer();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
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
      setMessages(fetchedMessages.reverse()); 
      setTimeout(scrollToBottom, 100); // Small delay to ensure render
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !playerData || newMessage.trim() === "") return;

    const messageText = newMessage;
    setNewMessage(""); 

    try {
      await addDoc(collection(db, 'CommunityChat'), {
        userId: userId,
        username: playerData.username,
        profilePictureUrl: playerData.profilePictureUrl || null,
        text: messageText,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message: ", err);
      setNewMessage(messageText); 
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border-l border-white/10 font-inter">
      
      {/* Messages Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-3 ${msg.userId === userId ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-none border border-white/20 flex-shrink-0 bg-black overflow-hidden ${msg.userId === userId ? 'border-primary' : ''}`}>
                  {msg.profilePictureUrl ? (
                      <img src={msg.profilePictureUrl} alt={msg.username} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <span className="text-[10px] text-white/50">{msg.username.charAt(0)}</span>
                      </div>
                  )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] space-y-1 ${msg.userId === userId ? 'items-end text-right' : 'items-start'}`}>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold font-mono uppercase ${msg.userId === userId ? 'text-primary' : 'text-gray-500'}`}>
                        {msg.username}
                    </span>
                    {/* Admin/Verified Badge Logic Mock */}
                    {msg.username.includes("Admin") && <Shield className="w-3 h-3 text-red-500" />}
                </div>
                
                <div className={`p-3 text-xs leading-relaxed border ${
                    msg.userId === userId 
                    ? 'bg-primary/10 border-primary/30 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-300'
                }`}>
                    {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Pinned to Bottom) */}
      <div className="p-3 border-t border-white/10 bg-black">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <div className="relative flex-grow">
                <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={userId ? "TRANSMIT MESSAGE..." : "LOGIN TO CHAT"}
                    className="w-full bg-white/5 border border-white/10 py-3 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors font-mono"
                    disabled={!userId}
                />
            </div>
            <button
                type="submit"
                disabled={!userId || !newMessage.trim()}
                className="btn-primary w-12 h-full flex items-center justify-center border-l-0"
            >
                <Send className="w-4 h-4" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default CommunityChat;