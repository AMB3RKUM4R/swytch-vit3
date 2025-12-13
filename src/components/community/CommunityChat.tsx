import { FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Shield, User, Bot, Sparkles, X, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
import { usePlayer } from '@/components/context/PlayerContext';
import { ChatMessage } from '@/lib/types';

// FIX: Explicitly match the ChatMessage type where timestamp can be null
interface ExtendedMessage extends Omit<ChatMessage, 'timestamp'> {
  timestamp: Timestamp | FieldValue | null;
  isLocal?: boolean;
  isAdminBroadcast?: boolean;
}

const FAQ_COMMANDS = [
    { label: 'HOW TO EARN', response: '>> PLAY GAMES in the Feed or complete Daily Quests to mine JOULES.' },
    { label: 'WITHDRAW RULES', response: '>> Go to VAULT > EXTRACT. Min: 10 J. Requires verified wallet.' },
    { label: 'BUY GOLD', response: '>> Go to MARKET. Select a package. Pay via Crypto/UPI to get Credits.' },
    { label: 'VIP STATUS', response: '>> Buy ELITE STATUS in the Vault to unlock 2x Yield Multipliers.' },
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
        
        // Cast data to ensure it fits our interface
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
    <div className="flex flex-col h-full bg-black border-l border-gray-800 font-mono text-xs">
      
      {pinnedAnnouncement && (
          <div className="bg-[#050505] border-b border-red-900/30 p-3 flex items-start gap-3 shadow-md relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 animate-pulse" />
              <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-grow">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1 flex justify-between">
                      <span>SYSTEM BROADCAST</span>
                      <span className="opacity-50">LATEST</span>
                  </p>
                  <p className="text-white text-[10px] leading-tight uppercase font-bold">
                      {pinnedAnnouncement.text}
                  </p>
              </div>
          </div>
      )}

      <div className="flex-grow p-4 space-y-4 overflow-y-auto no-scrollbar bg-black relative">
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
                    <div className={`w-8 h-8 rounded-sm border flex-shrink-0 overflow-hidden flex items-center justify-center ${
                        isBot ? 'border-[#39FF14] bg-[#39FF14]/10' : 
                        isAdmin ? 'border-red-500 bg-red-900/20' :
                        isMe ? 'border-gray-500' : 'border-gray-800 bg-[#050505]'
                    }`}>
                        {isBot ? <Bot className="w-5 h-5 text-[#39FF14]" /> : 
                         isAdmin ? <AlertTriangle className="w-4 h-4 text-red-500" /> :
                         msg.profilePictureUrl ? <img src={msg.profilePictureUrl} className="w-full h-full object-cover" /> :
                         <User className="w-4 h-4 text-gray-500" />
                        }
                    </div>

                    <div className={`max-w-[85%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                isBot ? 'text-[#39FF14]' : 
                                isAdmin ? 'text-red-500' :
                                isMe ? 'text-white' : 'text-gray-500'
                            }`}>
                                {msg.username}
                            </span>
                            {isBot && <span className="bg-[#39FF14] text-black text-[8px] px-1 font-bold rounded-sm">BOT</span>}
                            {isAdmin && <span className="bg-red-500 text-black text-[8px] px-1 font-bold rounded-sm">ADMIN</span>}
                        </div>
                        
                        <div className={`p-2.5 text-xs leading-relaxed border rounded-sm shadow-sm ${
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

      <div className="bg-[#050505] border-t border-gray-800 relative z-20">
        <AnimatePresence>
            {showBotMenu && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-2 grid grid-cols-2 gap-2 border-b border-gray-800 bg-gray-900/90"
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

        <div className="p-3 flex items-center gap-2">
             <button 
                onClick={() => setShowBotMenu(!showBotMenu)}
                className={`h-10 w-10 flex-shrink-0 flex items-center justify-center border rounded-sm transition-all ${
                    showBotMenu 
                    ? 'bg-[#39FF14] text-black border-[#39FF14] rotate-90' 
                    : 'border-gray-700 text-gray-500 hover:text-[#39FF14] hover:border-[#39FF14]'
                }`}
                title="Open Support Terminal"
             >
                 {showBotMenu ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
             </button>

             <form onSubmit={handleSendMessage} className="flex-grow flex items-center gap-2">
                <div className="relative flex-grow group">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={userId ? "ENTER_MESSAGE..." : "LOGIN_REQUIRED"}
                        className="w-full bg-black border border-gray-800 py-2 pl-3 pr-3 text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-[#39FF14] transition-colors font-mono rounded-sm h-10 uppercase"
                        disabled={!userId}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!userId || !newMessage.trim()}
                    className="h-10 w-12 flex-shrink-0 flex items-center justify-center bg-[#39FF14] text-black hover:bg-white transition-colors disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-600 rounded-sm"
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