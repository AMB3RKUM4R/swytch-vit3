import { FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Shield, User, Bot, Sparkles, X, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
import { usePlayer } from '@/components/context/PlayerContext';
import { ChatMessage } from '@/lib/types';

interface ExtendedMessage extends Omit<ChatMessage, 'timestamp'> {
  timestamp: Timestamp | FieldValue | null;
  isLocal?: boolean;
  isAdminBroadcast?: boolean;
}

const FAQ_COMMANDS = [
    { label: 'HOW TO EARN', response: '>> PLAY GAMES or complete QUESTS to mine JOULES.' },
    { label: 'WITHDRAW', response: '>> Go to VAULT > EXTRACT. Min: 10 J.' },
    { label: 'BUY GOLD', response: '>> Go to MARKET. Use Crypto/UPI for Credits.' },
    { label: 'VIP STATUS', response: '>> Buy ELITE STATUS in the Vault for 2x Yield.' },
];

const CommunityChat: FC = () => {
  const { userId, playerData } = usePlayer();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<ExtendedMessage | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showBotMenu, setShowBotMenu] = useState(false);
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
      const fetchedMessages: ExtendedMessage[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const isSystem = data.username === 'Admin' || data.username === 'System';
        
        const msg: ExtendedMessage = { 
            id: doc.id, 
            userId: data.userId,
            username: data.username,
            text: data.text,
            profilePictureUrl: data.profilePictureUrl,
            timestamp: data.timestamp,
            isAdminBroadcast: isSystem 
        };

        fetchedMessages.push(msg);
      });

      const latestAnnouncement = fetchedMessages.find(m => m.isAdminBroadcast);
      setPinnedAnnouncement(latestAnnouncement || null);

      setMessages(fetchedMessages.reverse()); 
      setTimeout(scrollToBottom, 200);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !playerData || newMessage.trim() === "") return;

    const text = newMessage;
    setNewMessage(""); 

    try {
      await addDoc(collection(db, 'CommunityChat'), {
        userId,
        username: playerData.username,
        profilePictureUrl: playerData.profilePictureUrl || null,
        text,
        timestamp: serverTimestamp()
      });
      scrollToBottom();
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  const triggerBotResponse = (response: string) => {
      const botMsg: ExtendedMessage = {
          id: `bot-${Date.now()}`,
          userId: 'SYSTEM_BOT', 
          username: 'SUPPORT_AI',
          text: response,
          timestamp: null, 
          isLocal: true,
          profilePictureUrl: null
      };
      setMessages(prev => [...prev, botMsg]);
      setShowBotMenu(false);
      setTimeout(scrollToBottom, 100);
  };

  return (
    <div className="flex flex-col h-full bg-black/95 font-mono text-xs relative overflow-hidden">
      
      {/* Background Visuals */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5 pointer-events-none"></div>

      {/* Pinned Message */}
      {pinnedAnnouncement && (
          <div className="bg-red-900/10 border-b border-red-900/50 p-3 flex items-start gap-3 relative z-10 backdrop-blur-md">
              <Shield className="w-4 h-4 text-red-500 mt-0.5 animate-pulse flex-shrink-0" />
              <div className="flex-grow">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1 flex justify-between">
                      <span>SYSTEM BROADCAST</span>
                      <span className="opacity-50 text-[8px] border border-red-500/50 px-1 rounded">PRIORITY_1</span>
                  </p>
                  <p className="text-white text-[10px] leading-tight uppercase font-bold">
                      {pinnedAnnouncement.text}
                  </p>
              </div>
          </div>
      )}

      {/* Messages Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto no-scrollbar relative z-10 scrollbar-thin scrollbar-thumb-gray-800">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
             const isBot = msg.isLocal;
             const isAdmin = msg.isAdminBroadcast;
             const isMe = msg.userId === userId;

             return (
                <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-sm border flex-shrink-0 overflow-hidden flex items-center justify-center ${
                        isBot ? 'border-[#39FF14] bg-[#39FF14]/10' : 
                        isAdmin ? 'border-red-500 bg-red-900/20' :
                        isMe ? 'border-gray-500' : 'border-gray-800 bg-[#050505]'
                    }`}>
                        {isBot ? <Bot className="w-4 h-4 text-[#39FF14]" /> : 
                         isAdmin ? <AlertTriangle className="w-3 h-3 text-red-500" /> :
                         msg.profilePictureUrl ? <img src={msg.profilePictureUrl} className="w-full h-full object-cover" /> :
                         <User className="w-3 h-3 text-gray-500" />
                        }
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[85%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                isBot ? 'text-[#39FF14]' : isAdmin ? 'text-red-500' : isMe ? 'text-white' : 'text-gray-500'
                            }`}>
                                {msg.username}
                            </span>
                        </div>
                        
                        <div className={`px-2.5 py-2 text-xs leading-relaxed border rounded-sm ${
                            isBot ? 'bg-[#39FF14]/5 border-[#39FF14] text-[#39FF14] font-bold' :
                            isAdmin ? 'bg-red-900/10 border-red-500/50 text-white' :
                            isMe ? 'bg-white/10 border-white/20 text-white' : 
                            'bg-[#111] border-gray-800 text-gray-400'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                </motion.div>
             );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#050505] border-t border-gray-800 relative z-20">
        
        {/* Bot Menu */}
        <AnimatePresence>
            {showBotMenu && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-2 grid grid-cols-2 gap-2 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md absolute bottom-full w-full left-0"
                >
                    {FAQ_COMMANDS.map(cmd => (
                        <button 
                            key={cmd.label}
                            onClick={() => triggerBotResponse(cmd.response)}
                            className="px-3 py-2 bg-black border border-[#39FF14]/30 text-[#39FF14] text-[9px] font-bold uppercase hover:bg-[#39FF14] hover:text-black transition-colors text-left flex items-center gap-2"
                        >
                            <Terminal className="w-3 h-3" /> {cmd.label}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        <div className="p-2 flex items-center gap-2">
             <button 
                onClick={() => setShowBotMenu(!showBotMenu)}
                className={`h-9 w-9 flex-shrink-0 flex items-center justify-center border rounded-sm transition-all ${
                    showBotMenu 
                    ? 'bg-[#39FF14] text-black border-[#39FF14] rotate-90' 
                    : 'border-gray-700 text-gray-500 hover:text-[#39FF14] hover:border-[#39FF14]'
                }`}
             >
                 {showBotMenu ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
             </button>

             <form onSubmit={handleSendMessage} className="flex-grow flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={userId ? "TRANSMIT..." : "LOGIN_REQ"}
                    className="w-full bg-black border border-gray-800 py-2 pl-3 pr-3 text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-[#39FF14] transition-colors font-mono rounded-sm h-9 uppercase"
                    disabled={!userId}
                />
                <button
                    type="submit"
                    disabled={!userId || !newMessage.trim()}
                    className="h-9 w-10 flex-shrink-0 flex items-center justify-center bg-[#39FF14] text-black hover:bg-white transition-colors disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-600 rounded-sm"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;