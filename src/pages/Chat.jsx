import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

const Chat = () => {
  const { chatId } = useParams(); // This will be the request ID
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const scrollRef = useRef();

  // Fetch Chat Context (Request Details)
  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!chatId) return;
      const docRef = doc(db, "requests", chatId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChatInfo({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Chat not found!");
        navigate("/home");
      }
    };
    fetchChatInfo();
  }, [chatId, navigate]);

  // Realtime Messages Listener
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "requests", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      // Auto scroll to bottom
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsub();
  }, [chatId]);

  // Mark messages as Read
  useEffect(() => {
      if(!uid || messages.length === 0) return;

      const unreadMessages = messages.filter(msg => msg.senderId !== uid && !msg.read);
      
      if(unreadMessages.length > 0) {
          const batch = writeBatch(db);
          unreadMessages.forEach(msg => {
              const docRef = doc(db, "requests", chatId, "messages", msg.id);
              batch.update(docRef, { read: true });
          });
          batch.commit().catch(err => console.error("Error marking read:", err));
      }
  }, [messages, uid, chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "requests", chatId, "messages"), {
        text: newMessage,
        senderId: uid,
        senderName: auth.currentUser.displayName || "User",
        createdAt: serverTimestamp(),
        read: false,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Message error:", err);
    }
  };

  if (!chatInfo) return <div className="text-center mt-20">Loading Chat...</div>;

  // Determine other party name
  const otherName = uid === chatInfo.donorId ? chatInfo.receiverName : chatInfo.donorName;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-white shadow px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 text-xl">
          ←
        </button>
        <div>
          <h2 className="font-bold text-lg text-green-700">{otherName}</h2>
          <p className="text-xs text-gray-500">Item: {chatInfo.itemName}</p>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === uid;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                  isMe
                    ? "bg-green-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1`}>
                    <span className={`text-[10px] ${isMe ? "text-green-200" : "text-gray-400"}`}>
                        {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "sending..."}
                    </span>
                    {isMe && (
                        <span className={`text-[12px] ${msg.read ? "text-blue-200" : "text-green-200"}`}>
                            {msg.read ? "✓✓" : "✓"}
                        </span>
                    )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      {/* INPUT AREA */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
        {chatInfo.status === 'completed' ? (
             <div className="w-full text-center text-gray-500 italic bg-gray-100 p-2 rounded">
                 This item has been delivered. Chat is archived. 🔒
             </div>
        ) : (
            <>
                <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition shadow-lg"
                >
                ➤
                </button>
            </>
        )}
      </form>
    </div>
  );
};

export default Chat;
