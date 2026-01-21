import { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { auth, db } from "../services/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  writeBatch,
} from "firebase/firestore";

const ChatWidget = () => {
  const { isChatOpen, closeChat, activeChatId, setActiveChatId, userChats } = useChat();
  const uid = auth.currentUser?.uid;
  
  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-h-[500px] h-[500px]">
      
      {/* HEADER */}
      <div className="bg-green-600 text-white p-3 flex justify-between items-center shadow-md">
        <h3 className="font-bold">
            {activeChatId ? "💬 Chat" : "💌 My Messages"}
        </h3>
        <div className="flex gap-2">
            {activeChatId && (
                <button onClick={() => setActiveChatId(null)} className="text-white hover:text-gray-200 text-sm">
                    Back
                </button>
            )}
            <button onClick={closeChat} className="text-white hover:text-gray-200 font-bold">
            ✕
            </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeChatId ? (
            <ActiveChatWindow chatId={activeChatId} />
        ) : (
            <ChatList chats={userChats} uid={uid} onSelect={setActiveChatId} />
        )}
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ChatList = ({ chats, uid, onSelect }) => {
    if(chats.length === 0) {
        return <div className="p-8 text-center text-gray-500">No active chats yet.</div>
    }

    return (
        <div className="divide-y divide-gray-100">
            {chats.map(chat => {
                // Determine other party name safely
                let otherName = "Unknown User";
                if (uid === chat.donorId) {
                    otherName = chat.receiverName || "Unknown Receiver";
                } else {
                    otherName = chat.donorName || "Unknown Donor";
                }

                return (
                    <div 
                        key={chat.id} 
                        onClick={() => onSelect(chat.id)}
                        className="p-3 hover:bg-gray-100 cursor-pointer transition flex items-center gap-3"
                    >
                        <div className="bg-green-100 text-green-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                            {otherName ? otherName[0]?.toUpperCase() : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{otherName}</h4>
                            <p className="text-xs text-gray-500 truncate">{chat.itemName}</p>
                        </div>
                        <span className="text-xs text-gray-400">➤</span>
                    </div>
                )
            })}
        </div>
    )
}

const ActiveChatWindow = ({ chatId }) => {
  const uid = auth.currentUser?.uid;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();
  
  // Fetch Messages
  useEffect(() => {
    const q = query(
      collection(db, "requests", chatId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [chatId]);

  // Read Receipts
  useEffect(() => {
    if(!uid || messages.length === 0) return;
    const unreadMessages = messages.filter(msg => msg.senderId !== uid && !msg.read);
    if(unreadMessages.length > 0) {
        const batch = writeBatch(db);
        unreadMessages.forEach(msg => {
            const docRef = doc(db, "requests", chatId, "messages", msg.id);
            batch.update(docRef, { read: true });
        });
        batch.commit().catch(console.error);
    }
  }, [messages, uid, chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Get latest display name or fallback
    const senderName = auth.currentUser.displayName || 
                       (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : "User");

    try {
      await addDoc(collection(db, "requests", chatId, "messages"), {
        text: newMessage,
        senderId: uid,
        senderName: senderName,
        createdAt: serverTimestamp(),
        read: false,
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <div className="flex flex-col h-full">
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {messages.map(msg => {
                  const isMe = msg.senderId === uid;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${isMe ? "bg-green-600 text-white" : "bg-white border rounded-bl-none shadow-sm"}`}>
                            {!isMe && <p className="text-[10px] text-gray-500 mb-0.5">{msg.senderName}</p>}
                            <p>{msg.text}</p>
                            <div className={`flex justify-end gap-1 mt-1 text-[10px] ${isMe ? "text-green-200" : "text-gray-400"}`}>
                                {isMe && <span>{msg.read ? "✓✓" : "✓"}</span>}
                            </div>
                        </div>
                    </div>
                  )
              })}
              <div ref={scrollRef}></div>
          </div>

          <form onSubmit={sendMessage} className="p-2 bg-white border-t flex gap-2">
              <input 
                className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Type..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className="bg-green-600 text-white p-2 rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-700">
                  ➤
              </button>
          </form>
      </div>
  )
}

export default ChatWidget;
