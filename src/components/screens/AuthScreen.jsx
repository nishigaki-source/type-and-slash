import React, { useState } from 'react';
import { Mail, Lock, RefreshCw, UserPlus, LogIn, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { SVGs } from '../GameSvgs';

const AuthScreen = ({ onLogin, onGuest, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // パスワードリセットモード
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // 成功メッセージ用
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (isResetting) {
        // パスワード再設定メール送信
        await sendPasswordResetEmail(auth, email);
        setMessage('パスワード再設定メールを送信しました。メールを確認してください。');
      } else if (isRegistering) {
        // 新規登録
        await createUserWithEmailAndPassword(auth, email, password);
        onLogin();
      } else {
        // ログイン
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      }
    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (err.code === 'auth/invalid-email') msg = 'メールアドレスの形式が正しくありません。';
      if (err.code === 'auth/user-not-found') msg = 'ユーザーが見つかりません。';
      if (err.code === 'auth/wrong-password') msg = 'パスワードが間違っています。';
      if (err.code === 'auth/email-already-in-use') msg = 'このメールアドレスは既に使用されています。';
      if (err.code === 'auth/weak-password') msg = 'パスワードは6文字以上で設定してください。';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 画面表示切り替え
  const toggleMode = (mode) => {
    setError(null);
    setMessage(null);
    if (mode === 'RESET') {
      setIsResetting(true);
      setIsRegistering(false);
    } else if (mode === 'REGISTER') {
      setIsResetting(false);
      setIsRegistering(true);
    } else {
      setIsResetting(false);
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800 animate-fade-in relative px-4">
      <SVGs.TownBg />
      <div className="absolute inset-0 bg-white/40 z-0 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-slate-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-600 drop-shadow-sm flex items-center justify-center gap-2">
          {isResetting ? <KeyRound /> : (isRegistering ? <UserPlus /> : <LogIn />)}
          {isResetting ? 'パスワード再設定' : (isRegistering ? '新規冒険者登録' : 'ギルドログイン')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded pl-10 p-3 text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                placeholder="adventurer@example.com"
                required
              />
            </div>
          </div>

          {!isResetting && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-10 p-3 text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          {error && <div className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded">{error}</div>}
          {message && <div className="text-green-600 text-sm text-center font-bold bg-green-50 p-2 rounded">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white text-lg font-bold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" /> : (isResetting ? <Mail /> : (isRegistering ? <UserPlus /> : <LogIn />))}
            {isResetting ? '再設定メールを送信' : (isRegistering ? '登録して開始' : 'ログイン')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          {!isResetting ? (
            <>
              <button
                onClick={() => toggleMode('RESET')}
                className="text-slate-500 hover:text-blue-600 text-xs underline"
              >
                パスワードを忘れた方はこちら
              </button>
              <button
                onClick={() => toggleMode(isRegistering ? 'LOGIN' : 'REGISTER')}
                className="text-blue-600 hover:text-blue-500 underline text-sm font-medium block w-full"
              >
                {isRegistering ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントをお持ちでない方はこちら'}
              </button>
            </>
          ) : (
            <button
              onClick={() => toggleMode('LOGIN')}
              className="text-blue-600 hover:text-blue-500 underline text-sm font-medium flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft size={14} /> ログイン画面に戻る
            </button>
          )}
          
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={onGuest}
              className="text-slate-500 hover:text-slate-800 text-sm flex items-center justify-center gap-1 w-full py-2 hover:bg-slate-100 rounded transition-colors"
            >
              ゲストとして遊ぶ（データ保存なし） <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="pt-2">
             <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600">タイトルへ戻る</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;