import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, User, ArrowLeft, Clock } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, getDoc } from 'firebase/firestore';
import { db, GAME_APP_ID } from '../../../lib/firebase';
import { JOBS } from '../../../constants/data';

const MailView = ({ player, initialTarget, onClose }) => {
  const [friends, setFriends] = useState([]);
  const [targetFriend, setTargetFriend] = useState(initialTarget);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [friendLatestProfile, setFriendLatestProfile] = useState({});
  const scrollRef = useRef(null);

  // 1. フレンドリストの取得
  useEffect(() => {
    const q = collection(db, 'artifacts', GAME_APP_ID, 'users', player.id, 'friends');
    const unsub = onSnapshot(q, (snapshot) => {
      setFriends(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [player.id]);

  // 2. 選択中の相手の最新プロフィール取得（チャット中用）
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!targetFriend) return;
      try {
        const userRef = doc(db, 'artifacts', GAME_APP_ID, 'users', targetFriend.id, 'saveData', 'current');
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setFriendLatestProfile(data.player || {});
        }
      } catch (e) {
        console.error("Latest profile fetch error:", e);
      }
    };
    fetchLatestProfile();
  }, [targetFriend]);

  // 3. メッセージ購読
  useEffect(() => {
    if (!targetFriend) return;
    const participants = [player.id, targetFriend.id].sort();
    const q = query(
      collection(db, 'artifacts', GAME_APP_ID, 'chats'),
      where('participants', '==', participants),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
    });
    return () => unsubscribe();
  }, [targetFriend, player.id]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !targetFriend) return;
    const participants = [player.id, targetFriend.id].sort();
    const msgText = inputText;
    setInputText('');
    try {
      await addDoc(collection(db, 'artifacts', GAME_APP_ID, 'chats'), {
        participants,
        senderId: player.id,
        senderName: player.name,
        senderJob: player.profileJob || player.job, 
        text: msgText,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (e) { console.error("Send error:", e); }
  };

  // 共通プロフィール画像コンポーネント
  const ProfileImage = ({ job, gender, race, size = "w-10 h-10" }) => {
    const JobIllustration = JOBS[job]?.Illustration;
    return (
      <div className={`${size} rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center shadow-inner`}>
        {JobIllustration ? (
          <JobIllustration gender={gender || 'MALE'} race={race || 'HUMAN'} />
        ) : (
          <User size={size === "w-8 h-8" ? 16 : 20} className="text-slate-400" />
        )}
      </div>
    );
  };

  // ★追加: フレンドリストの各項目で最新プロフィールを読み込むコンポーネント
  const FriendListItem = ({ friend, onSelect }) => {
    const [latestJob, setLatestJob] = useState(friend.profileJob || friend.job);

    useEffect(() => {
      // リスト表示時にも最新の profileJob を取りに行く
      const updateIcon = async () => {
        const userRef = doc(db, 'artifacts', GAME_APP_ID, 'users', friend.id, 'saveData', 'current');
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.player?.profileJob) {
            setLatestJob(data.player.profileJob);
          }
        }
      };
      updateIcon();
    }, [friend.id]);

    return (
      <div 
        onClick={() => onSelect(friend)} 
        className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-sm"
      >
        <ProfileImage job={latestJob} gender={friend.gender} race={friend.race} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-700 truncate">{friend.name}</div>
          <div className="text-[10px] text-slate-400">Lv.{friend.level} {JOBS[friend.job]?.name || '冒険者'}</div>
        </div>
      </div>
    );
  };

  if (!targetFriend) {
    return (
      <div className="h-full flex flex-col bg-white/90 backdrop-blur-md animate-fade-in no-scrollbar">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Mail className="text-blue-500" size={20} />
          <h2 className="font-bold text-slate-800">チャット</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">フレンドを選択</div>
          {friends.map(f => (
            <FriendListItem key={f.id} friend={f} onSelect={setTargetFriend} />
          ))}
          {friends.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">フレンドがいません</div>
          )}
        </div>
      </div>
    );
  }

  const displayTargetJob = friendLatestProfile.profileJob || friendLatestProfile.job || targetFriend.profileJob || targetFriend.job;

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      <div className="p-3 bg-white border-b flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => { setTargetFriend(null); setFriendLatestProfile({}); }} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <ProfileImage job={displayTargetJob} gender={targetFriend.gender} race={targetFriend.race} size="w-8 h-8" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-slate-800 truncate">{targetFriend.name}</div>
          <div className="text-[9px] text-green-500 font-bold flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> ONLINE
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === player.id;
          const currentJob = isMe ? (player.profileJob || player.job) : (msg.senderJob || displayTargetJob);
          return (
            <div key={msg.id || idx} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <ProfileImage job={currentJob} gender={isMe ? player.gender : targetFriend.gender} race={isMe ? player.race : targetFriend.race} size="w-8 h-8" />
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}>
                {msg.text}
                <div className={`text-[8px] mt-1 opacity-60 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
        <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="メッセージを入力..." />
        <button type="submit" disabled={!inputText.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-md disabled:bg-slate-300">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MailView;