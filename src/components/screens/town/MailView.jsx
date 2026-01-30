import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, ArrowLeft, User } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'; // updateDoc, doc 追加
import { db, GAME_APP_ID } from '../../../lib/firebase';

const MailView = ({ player, initialTarget, onClose }) => {
  const [targetFriend, setTargetFriend] = useState(initialTarget);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  // フレンドリスト取得
  useEffect(() => {
    const q = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends');
    const unsub = onSnapshot(q, (snap) => {
      setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [player.id]);

  // メッセージ監視 & 既読処理
  useEffect(() => {
    if (!targetFriend) return;

    const participants = [player.id, targetFriend.id].sort();
    
    const q = query(
      collection(db, 'artifacts', GAME_APP_ID, 'chats'),
      where('participants', '==', participants),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = [];
      snap.docs.forEach(d => {
        const data = d.data();
        const msg = { id: d.id, ...data };
        msgs.push(msg);

        // ★追加: 相手からのメッセージで、かつ未読の場合は既読にする
        if (data.senderId !== player.id && data.read === false) {
          updateDoc(doc(db, 'artifacts', GAME_APP_ID, 'chats', d.id), {
            read: true
          }).catch(e => console.error("Read update error:", e));
        }
      });
      setMessages(msgs);

      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });

    return () => unsub();
  }, [targetFriend, player.id]);

  const handleSend = async () => {
    if (!inputText.trim() || !targetFriend) return;
    
    const participants = [player.id, targetFriend.id].sort();
    
    try {
      await addDoc(collection(db, 'artifacts', GAME_APP_ID, 'chats'), {
        participants,
        senderId: player.id,
        text: inputText,
        read: false, // ★追加: 未読状態で作成
        createdAt: serverTimestamp()
      });
      setInputText('');
    } catch (e) {
      console.error(e);
      alert('送信失敗');
    }
  };

  // 相手選択画面
  if (!targetFriend) {
    return (
      <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Mail className="text-blue-500" />
          <h2 className="font-bold text-slate-800">メール / チャット</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-bold text-slate-500 mb-2">会話するフレンドを選択</div>
          {friends.length === 0 && <div className="text-center text-slate-400 py-10">フレンドがいません</div>}
          {friends.map(f => (
            <div key={f.id} onClick={() => setTargetFriend(f)} className="p-3 bg-white border rounded mb-2 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
              <div className="bg-slate-200 p-2 rounded-full"><User size={16}/></div>
              <div className="font-bold text-slate-700">{f.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // チャット画面
  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      <div className="p-3 bg-white border-b flex items-center gap-2 shadow-sm z-10">
        <button onClick={() => setTargetFriend(null)} className="p-1 rounded hover:bg-slate-100"><ArrowLeft size={20}/></button>
        <span className="font-bold text-slate-700">{targetFriend.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map(msg => {
          const isMe = msg.senderId === player.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${isMe ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'}`}>
                {msg.text}
                {isMe && <div className={`text-[9px] text-right mt-1 ${msg.read ? 'text-blue-200' : 'text-blue-300'}`}>{msg.read ? '既読' : '未読'}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-white border-t flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          placeholder="メッセージを入力..."
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default MailView;