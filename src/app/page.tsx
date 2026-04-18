"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
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
  signInWithPopup 
} from "firebase/auth";
import { db, auth, googleProvider } from "@/lib/firebase";
import { 
  ExternalLink, 
  Plus, 
  Trash2, 
  X, 
  ChevronDown, 
  UserPlus, 
  Link2, 
  UserCircle, 
  LogOut, 
  ShieldAlert, 
  Globe, 
  Home, 
  CheckCircle, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Download, 
  TrendingUp, 
  Lock, 
  Crown,
  Activity
} from "lucide-react";

export default function Dashboard() {
  // Auth & UI State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeView, setActiveView] = useState<"personal" | "community">("personal");
  const [isPro, setIsPro] = useState(false); // Placeholder for subscription logic
  
  // Data States
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [links, setLinks] = useState<any[]>([]);
  const [globalPages, setGlobalPages] = useState<any[]>([]);
  const [authError, setAuthError] = useState("");

  // Modal & Form States
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newProfile, setNewProfile] = useState({ name: "", loginHint: "", securePass: "" });
  const [newPage, setNewPage] = useState({ name: "", url: "", task: "", rating: "Unrated", proof: "" });

  // Listen for Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Personal & Global Data
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

  // Telemetry Tracker
  const trackClick = async (pageId: string) => {
    const ref = doc(db, "globalPages", pageId);
    await updateDoc(ref, { clicks: increment(1) });
  };

  // Auth Handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) { setAuthError(err.message); }
  };

  const handleGoogleAuth = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (err: any) { setAuthError(err.message); }
  };

  if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-sky-400">Initializing Apex Hub...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-zinc-500 mb-8 italic">APEX HUB</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-sky-500" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-sky-500" required />
            <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-sky-600/20">{isRegistering ? "Register" : "Sign In"}</button>
          </form>
          <button onClick={handleGoogleAuth} className="w-full mt-4 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition">Continue with Google</button>
          <p onClick={() => setIsRegistering(!isRegistering)} className="text-center text-zinc-500 text-xs mt-6 cursor-pointer hover:text-sky-400">{isRegistering ? "Already have an account? Login" : "New user? Create an account"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        
        {/* Header Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-white to-zinc-600 bg-clip-text text-transparent">APEX HUB</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Systems Online // {user.email}</p>
          </div>
          
          <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
            <button onClick={() => setActiveView("personal")} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition ${activeView === "personal" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-inner" : "text-zinc-600 hover:text-zinc-400"}`}><Home size={16}/> MY HUB</button>
            <button onClick={() => setActiveView("community")} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition ${activeView === "community" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner" : "text-zinc-600 hover:text-zinc-400"}`}><Globe size={16}/> TRENDS</button>
          </div>

          <button onClick={() => signOut(auth)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-red-500/50 hover:text-red-400 transition"><LogOut size={18}/></button>
        </header>

        {/* Live Telemetry Bar */}
        <section className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black italic text-orange-400 flex items-center gap-2 tracking-widest uppercase">
              <TrendingUp size={14}/> Live SC Payout Telemetry
            </h3>
            <span className="flex items-center gap-1.5 text-[9px] font-black text-green-500 bg-green-500/5 border border-green-500/20 px-2 py-0.5 rounded-full animate-pulse">
              <Activity size={10}/> OPT-IN DATA STREAM ACTIVE
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
             {globalPages.slice(0, 5).map(gp => (
               <div key={gp.id} className="min-w-[180px] bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                 <div className="flex justify-between items-start">
                   <p className="text-[10px] font-bold truncate text-zinc-200">{gp.pageName}</p>
                   <span className="text-[8px] text-green-400 font-black">+{gp.clicks || 0}% Heat</span>
                 </div>
                 <div className="w-full h-1 bg-zinc-800 mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ width: '65%' }}></div>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {activeView === "personal" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar: Profiles & Vault */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase">Profiles</h2>
                <button onClick={() => setShowProfileModal(true)} className="text-sky-400 hover:scale-110 transition"><Plus size={20}/></button>
              </div>
              <div className="space-y-3">
                {profiles.map(p => (
                  <div key={p.id} onClick={() => setSelectedProfileId(p.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedProfileId === p.id ? "bg-zinc-800 border-sky-500/50 shadow-lg" : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"}`}>
                    <div className="flex justify-between items-start">
                      <p className="font-black text-sm italic uppercase tracking-tighter">{p.name}</p>
                      {p.securePass && <Lock size={12} className="text-orange-500"/>}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">{p.loginHint || 'No login reminder'}</p>
                  </div>
                ))}
              </div>
              
              {/* Premium Upsell Card */}
              {!isPro && (
                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Crown size={16}/> <span className="text-xs font-black italic">APEX PRO</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mb-4">Unlock the Secure Credential Vault and machine-specific pattern analysis.</p>
                  <button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-2 rounded-lg text-[10px] transition uppercase italic">Upgrade Dashboard</button>
                </div>
              )}
            </div>

            {/* Task Area */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black italic tracking-tight">Active Sessions</h2>
                <button onClick={() => setShowLinkModal(true)} disabled={!selectedProfileId} className="bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/30 text-sky-400 p-2 rounded-xl transition"><Link2 size={18}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logic to filter links by selectedProfileId */}
                <div className="col-span-full py-20 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-600">
                  <Activity size={32} className="mb-2 opacity-20"/>
                  <p className="text-xs font-bold uppercase tracking-widest">Select a profile to begin tracking</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic tracking-tighter">Community Trends</h2>
              <button onClick={() => setShowGlobalModal(true)} className="bg-orange-500 hover:bg-orange-400 text-black font-black py-2 px-6 rounded-xl transition italic shadow-lg shadow-orange-500/20">Submit Data</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {globalPages.map(page => (
                <div key={page.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group hover:border-orange-500/50 transition-all relative">
                   <h4 className="font-black text-lg italic uppercase tracking-tighter mb-2 group-hover:text-orange-400 transition-colors">{page.pageName}</h4>
                   <div className="flex gap-2 mb-4">
                     <span className="text-[9px] font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-500 uppercase">{page.rating}</span>
                     <span className="text-[9px] font-black bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-orange-400 uppercase tracking-widest">{page.clicks || 0} SESSIONS</span>
                   </div>
                   <button onClick={() => trackClick(page.id)} className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-xs font-black italic transition border border-zinc-700">ANALYZE PLATFORM</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-transparent"></div>
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition"><X size={24}/></button>
            <h2 className="text-3xl font-black italic tracking-tighter mb-8">NEW PROFILE</h2>
            <form onSubmit={(e) => { e.preventDefault(); /* Save logic here */ setShowProfileModal(false); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Profile Name</label>
                <input placeholder="e.g. MAIN MCLUCK" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-sky-500 transition-colors" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Login Hint</label>
                <input placeholder="e.g. gmail_address@me.com" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-sky-500 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-sky-600/20 mt-4 italic">ESTABLISH PROFILE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}