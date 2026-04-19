"use client";
import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  where, 
  increment, 
  updateDoc 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { db, auth, googleProvider } from "@/lib/firebase";
import { 
  Plus, 
  X, 
  Link2, 
  LogOut, 
  Globe, 
  Home, 
  Activity,
  TrendingUp, 
  Lock, 
  Crown,
  Search
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeView, setActiveView] = useState<"personal" | "community">("personal");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [globalPages, setGlobalPages] = useState<any[]>([]);
  const [authError, setAuthError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestUrl, setRequestUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const qProfs = query(collection(db, "fbProfiles"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubProfs = onSnapshot(qProfs, (s) => {
      const profs = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setProfiles(profs);
      if (profs.length > 0 && !selectedProfileId) setSelectedProfileId(profs[0].id);
    });
    const qGlobal = query(collection(db, "globalPages"), orderBy("clicks", "desc"));
    const unsubGlobal = onSnapshot(qGlobal, (s) => setGlobalPages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubProfs(); unsubGlobal(); };
  }, [user, selectedProfileId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) { setAuthError(err.message); }
  };

  const handleGoogleAuth = async () => {
    try {
      // @ts-ignore
      const isAndroid = typeof window !== 'undefined' && window.Capacitor?.getPlatform() === 'android';
      if (isAndroid) await signInWithRedirect(auth, googleProvider);
      else await signInWithPopup(auth, googleProvider);
    } catch (err: any) { setAuthError(err.message); }
  };

  const handleRequestCasino = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "casinoRequests"), {
      url: requestUrl, requestedBy: user?.email, status: "pending", createdAt: new Date()
    });
    setRequestUrl("");
    setShowRequestModal(false);
  };

  const trackClick = async (pageId: string) => {
    const ref = doc(db, "globalPages", pageId);
    await updateDoc(ref, { clicks: increment(1) });
  };

  if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-sky-400 font-black italic">APEX INITIALIZING...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
          <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-700 mb-10 italic tracking-tighter">APEX HUB</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-sky-500 font-bold" required />
            <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-sky-500 font-bold" required />
            <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-sky-600/20 italic uppercase">{isRegistering ? "Create Account" : "Access Hub"}</button>
          </form>
          <div className="relative my-8"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-900 px-2 text-zinc-600 font-black">OR</span></div></div>
          
          {/* FIXED BUTTON LINE 155 */}
          <button onClick={handleGoogleAuth} className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition italic uppercase">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google Auth
          </button>
          
          <p onClick={() => setIsRegistering(!isRegistering)} className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-8 cursor-pointer hover:text-sky-400 transition">{isRegistering ? "Already a Member? Login" : "New Operator? Register"}</p>
          {authError && <p className="text-red-500 text-[10px] text-center mt-4 uppercase font-black">{authError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12 bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20"><TrendingUp className="text-black" size={28}/></div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter leading-none">APEX <span className="text-zinc-500">HUB</span></h1>
              <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] mt-1 flex items-center gap-2"><Activity size={10}/> Telemetry Online</p>
            </div>
          </div>
          <nav className="flex gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
            <button onClick={() => setActiveView("personal")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === "personal" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-inner" : "text-zinc-600 hover:text-zinc-300"}`}><Home size={16}/> MY SESSIONS</button>
            <button onClick={() => setActiveView("community")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === "community" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner" : "text-zinc-600 hover:text-zinc-300"}`}><Globe size={16}/> HEAT MAP</button>
          </nav>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-zinc-500 uppercase">{user.email}</p>
               <button onClick={() => signOut(auth)} className="text-[9px] font-black text-red-500 uppercase hover:text-red-400 transition">Terminate Session</button>
             </div>
             <button onClick={() => signOut(auth)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-red-500/50 text-zinc-500 hover:text-red-400 transition md:hidden"><LogOut size={20}/></button>
          </div>
        </header>

        <section className="mb-12">
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-xs font-black italic text-zinc-400 flex items-center gap-2 uppercase tracking-widest">Global Payout Velocity</h3>
            <button onClick={() => setShowRequestModal(true)} className="text-[9px] font-black text-sky-500 hover:text-sky-400 transition flex items-center gap-1 uppercase tracking-widest"><Search size={10}/> Request Scraper</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {globalPages.slice(0, 6).map(gp => (
               <div key={gp.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl hover:border-sky-500/30 transition-all group">
                 <p className="text-[10px] font-black text-zinc-200 truncate group-hover:text-sky-400 transition-colors uppercase italic">{gp.pageName}</p>
                 <div className="flex justify-between items-center mt-3">
                    <span className="text-[9px] font-black text-green-500">HOT</span>
                    <span className="text-[10px] font-mono text-zinc-500">{gp.clicks || 0}s</span>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {activeView === "personal" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xs font-black text-zinc-500 tracking-[0.3em] uppercase italic">Managed Profiles</h2>
                <button onClick={() => setShowProfileModal(true)} className="w-8 h-8 bg-sky-500/10 text-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-500 hover:text-black transition-all shadow-lg"><Plus size={18}/></button>
              </div>
              <div className="space-y-4">
                {profiles.map(p => (
                  <div key={p.id} onClick={() => setSelectedProfileId(p.id)} className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 ${selectedProfileId === p.id ? "bg-zinc-800 border-sky-500/50 shadow-2xl shadow-sky-500/10 scale-[1.02]" : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700"}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-black text-lg italic tracking-tighter uppercase">{p.name}</p>
                      <Lock size={14} className={selectedProfileId === p.id ? "text-sky-500" : "text-zinc-700"}/>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{p.loginHint || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Active Session Links</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-full py-32 border-2 border-dashed border-zinc-800/50 rounded-[3rem] flex flex-col items-center justify-center text-zinc-700">
                  <Activity size={48} className="mb-4 opacity-20"/>
                  <p className="text-xs font-black uppercase tracking-[0.4em] italic">Awaiting Profile Selection</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {globalPages.map(page => (
                <div key={page.id} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] group hover:border-orange-500/50 transition-all relative overflow-hidden">
                   <h4 className="font-black text-2xl italic uppercase tracking-tighter group-hover:text-orange-400 transition-colors leading-none">{page.pageName}</h4>
                   <button onClick={() => { trackClick(page.id); window.open(page.fbUrl, '_blank'); }} className="w-full bg-zinc-100 hover:bg-white text-black py-4 rounded-2xl text-[10px] font-black italic transition uppercase mt-6">Analyze Platform</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[150] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition"><X size={28}/></button>
            <h2 className="text-4xl font-black italic tracking-tighter mb-10 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600">NEW PROFILE</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowProfileModal(false); }} className="space-y-6">
              <input placeholder="e.g. PRIMARY MCLUCK" className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-sky-500 transition-all font-bold" required />
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-2xl transition shadow-2xl mt-6 italic uppercase tracking-tighter text-lg">Initialize Operator</button>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[150] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowRequestModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition"><X size={28}/></button>
            <h2 className="text-4xl font-black italic tracking-tighter mb-10 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600">SCRAPER REQ</h2>
            <form onSubmit={handleRequestCasino} className="space-y-6">
              <input placeholder="https://casino-platform.com" value={requestUrl} onChange={e => setRequestUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-sky-500 transition-all font-bold" required />
              <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl transition shadow-2xl mt-6 italic uppercase tracking-tighter text-lg">Submit for Mapping</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}