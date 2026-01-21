import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null); // If null, show list. If set, show chat.
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [userChats, setUserChats] = useState([]);

  // Listen to Auth
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setIsChatOpen(false);
      }
    });
    return () => unsub();
  }, []);

  // Listen to User's Requests (Chats)
  useEffect(() => {
    if (!currentUser) {
        setUserChats([]);
        setUnreadCount(0);
        return;
    }

    // We need 2 queries: one where user is donor, one where user is receiver
    // Firestore OR queries are limiting, so we'll use 2 listeners
    
    const q1 = query(collection(db, "requests"), where("donorId", "==", currentUser.uid), where("status", "==", "accepted"));
    const q2 = query(collection(db, "requests"), where("receiverId", "==", currentUser.uid), where("status", "==", "accepted"));

    const handleSnapshot = (snap1, snap2) => {
        const chats = [];
        const allDocs = [...snap1.docs, ...snap2.docs];
        // Deduplicate by ID just in case
        const uniqueDocs = new Map();
        allDocs.forEach(d => uniqueDocs.set(d.id, { id: d.id, ...d.data() }));

        const chatList = Array.from(uniqueDocs.values());
        
        // NOW: For each chat, we *should* ideally listen to unread messages
        // BUT listening to N subcollections is expensive.
        // TRADEOFF: For this Hackathon/Project level, we will fetch/listen to messages only when opened?
        // OR: We stick to a simpler "New Message" indicator if we update the parent doc.
        
        // BETTER APPROACH for Realtime Unread Count in Navbar without 100 listeners:
        // We will assume the `requests` doc has a `lastMessage` field or `unreadCount` map.
        // Since we didn't implement that backend logic yet, we will do a "Light" listen:
        // We will ONLY count unreads if we load these chats. 
        
        // Let's try to just separate the "List" from the "Unread Count".
        // For the purpose of this request ("Navbar icon knowing number of unseen messages"),
        // we essentially NEED to know which messages are unread.
        
        // Let's iterate and set up listeners for the *active* chats? No, that's too late.
        // We will do a Client-Side "Multi-Listener" approach for now (Limit to last 10 chats maybe?)
        // Or just map them.
        
        setUserChats(chatList);
    };

    // Setting up listeners properly
    let docs1 = [];
    let docs2 = [];

    const unsub1 = onSnapshot(q1, (snap) => {
        docs1 = snap.docs;
        updateChats();
    });
    const unsub2 = onSnapshot(q2, (snap) => {
        docs2 = snap.docs;
        updateChats();
    });

    const updateChats = () => {
         const allDocs = [...docs1, ...docs2];
         const unique = new Map();
         allDocs.forEach(d => unique.set(d.id, { id: d.id, ...d.data() }));
         setUserChats(Array.from(unique.values()));
    }

    return () => {
        unsub1();
        unsub2();
    };

  }, [currentUser]);

  // SEPARATE EFFECT: Calculate Unread Count
  // This is the tricky part without cloud functions. 
  // We will iterate through `userChats` and set up a listener for "unread messages" for EACH.
  // This might hit limits if user has 100 active chats, but it's the only frontend-only way.
  useEffect(() => {
    if(!currentUser || userChats.length === 0) return;

    const unsubs = [];
    let totalUnread = 0;
    const unreadMap = {}; 
    
    userChats.forEach(chat => {
        const q = query(
            collection(db, "requests", chat.id, "messages"),
            where("read", "==", false)
        );

        const unsub = onSnapshot(q, (snap) => {
            // Client-side filtering to avoid needing a composite index
            const unreadMessages = snap.docs.filter(doc => doc.data().senderId !== currentUser.uid);
            unreadMap[chat.id] = unreadMessages.length;
            
            // update total
            const sum = Object.values(unreadMap).reduce((a, b) => a + b, 0);
            setUnreadCount(sum);
        });
        unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, [userChats, currentUser]);


  const openChat = (chatId) => {
      setActiveChatId(chatId);
      setIsChatOpen(true);
  };

  const closeChat = () => {
      setIsChatOpen(false);
  };

  const toggleChat = () => {
      setIsChatOpen(!isChatOpen);
  };

  return (
    <ChatContext.Provider value={{ 
        isChatOpen, 
        setIsChatOpen, 
        activeChatId, 
        setActiveChatId, 
        openChat, 
        closeChat,
        toggleChat,
        unreadCount,
        userChats
    }}>
      {children}
    </ChatContext.Provider>
  );
};
