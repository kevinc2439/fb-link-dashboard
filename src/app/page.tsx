"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, where } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, signInWithPopup } from "firebase/auth";
import { db, auth, googleProvider } from "@/lib/firebase";
import { ExternalLink, Plus, Trash2, X, ChevronDown, UserPlus, Link2, UserCircle, LogOut, ShieldAlert, Globe, Home, CheckCircle, ShieldCheck, AlertTriangle, HelpCircle, Download } from "lucide-react";

export default function Dashboard() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Data State
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [links, setLinks] = useState<any[]>([]);
  const [globalPages, setGlobalPages] = useState<any[]>([]);

  // UI State
  const [activeView, setActiveView] = useState<"personal" | "community">("personal");
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState<{isOpen: boolean, pageData: any}>({isOpen: false, pageData: null});

  // Form State
  const [newProfileName, setNewProfileName] = useState("");
  const [loginHint, setLoginHint] = useState("");
  const [pageName, setPageName] = useState("");
  const [fbUrl, setFbUrl] = useState("");
  const [taskType, setTaskType] = useState("");
  const [rating, setRating] = useState("Unrated");
  const [proofLink, setProofLink] = useState("");

  // Listen for Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Personal Data
  useEffect(() => {
    if (!user) return;
    const qProfs = query(collection(db, "fbProfiles"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubProfs = onSnapshot(qProfs, (snapshot) => {
      const profs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProfiles(profs);
      if (profs.length > 0 && !selectedProfileId) setSelectedProfileId(profs[0].id);
      else if (profs.length === 0) setSelectedProfileId("");
    });

    const qLinks = query(collection(db, "fbLinks"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubLinks = onSnapshot(qLinks, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProfs(); unsubLinks(); };
  }, [user]);

  // Fetch Global Data
  useEffect(() => {
    if (!user) return;
    const qGlobal = query(collection(db, "globalPages"), orderBy("createdAt", "desc"));
    const unsubGlobal = onSnapshot(qGlobal, (snapshot) => {
      setGlobalPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubGlobal();
  }, [user]);

  // Auth Handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError("");
    try {
      if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) { setAuthError(err.message.replace("Firebase: ", "")); }
  };
  const handleGoogleAuth = async () => {
    setAuthError("");
    try { await signInWithPopup(auth, googleProvider); } 
    catch (err: any) { setAuthError(err.message.replace("Firebase: ", "")); }
  };
  const handleLogout = () => { signOut(auth); setActiveView("personal"); };

  // Data Handlers
  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName || !user) return;
    const docRef = await addDoc(collection(db, "fbProfiles"), { name: newProfileName, loginHint, userId: user.uid, createdAt: new Date() });
    setSelectedProfileId(docRef.id); setNewProfileName(""); setLoginHint(""); setShowProfileModal(false);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName || !fbUrl || !selectedProfileId || !user) return;
    await addDoc(collection(db, "fbLinks"), { pageName, fbUrl, taskType: taskType || "Freeplay", profileId: selectedProfileId, userId: user.uid, createdAt: new Date() });
    setPageName(""); setFbUrl(""); setTaskType(""); setShowLinkModal(false);
  };

  const handleAddGlobalPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName || !fbUrl || !user) return;
    await addDoc(collection(db, "globalPages"), { pageName, fbUrl, taskType: taskType || "Freeplay", rating, proofLink, submittedBy: user.email, userId: user.uid, createdAt: new Date() });
    setPageName(""); setFbUrl(""); setTaskType(""); setRating("Unrated"); setProofLink(""); setShowGlobalModal(false);
  };

  const handleCloneToProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId || !showCloneModal.pageData || !user) return;
    await addDoc(collection(db, "fbLinks"), {
      pageName: showCloneModal.pageData.pageName,
      fbUrl: showCloneModal.pageData.fbUrl,
      taskType: showCloneModal.pageData.taskType,
      profileId: selectedProfileId,
      userId: user.uid,
      createdAt: new Date()
    });
    setShowCloneModal({isOpen: false, pageData: null});
    setActiveView("personal"); // Jump back to personal view to see it
  };

  const handleDeleteLink = async (id: string, collectionName: string) => { await deleteDoc(doc(db, collectionName, id)); };

  const getRatingBadge = (ratingStr: string) => {
    switch(ratingStr) {
      case 'Verified': return <span className="flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12}/> Verified Payout</span>;
      case 'Trusted': return <span className="flex items-center gap-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-1 rounded text-xs font-bold"><ShieldCheck size={12}/> Trusted Group</span>;
      case 'Scam': return <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 rounded text-xs font-bold"><AlertTriangle size={12}/> Scam / Fraud</span>;
      default: return <span className="flex items-center gap-1 bg-zinc-700/30 text-zinc-400 border border-zinc-600 px-2 py-1 rounded text-xs font-bold"><HelpCircle size={12}/> Unrated / Pending</span>;
    }
  };

  if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-sky-400">Loading Configuration...</div>;

  // --- RENDER AUTH SCREEN (Unchanged) ---
  if (!user) {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans selection:bg-orange-500/30">
        <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(56,189,248,0.1)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-gray-200 via-gray-400 to-zinc-600 mb-2">Apex Hub</h1>
            <p className="text-zinc-400 text-sm">Secure Portal Access</p>
          </div>
          {authError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-start gap-2"><ShieldAlert size={16} className="mt-0.5 shrink-0" /><span>{authError}</span></div>}
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" required />
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]">{isRegistering ? "Create Account" : "Sign In"}</button>
          </form>
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex-1 border-t border-zinc-700"></div><span className="text-zinc-500 text-sm">or</span><div className="flex-1 border-t border-zinc-700"></div>
          </div>
          <button onClick={handleGoogleAuth} className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Sign in with Google
          </button>
          <div className="mt-6 text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-zinc-500 hover:text-sky-400 transition-colors text-sm">{isRegistering ? "Already have an account? Sign in." : "Need access? Register here."}</button></div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN DASHBOARD ---
  const filteredLinks = links.filter(link => link.profileId === selectedProfileId);
  const selectedProfileData = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-orange-500/30">
      <div className="w-full max-w-5xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(56,189,248,0.05)] relative min-h-[700px] flex flex-col">
        
        {/* Header & View Tabs */}
        <header className="border-b border-zinc-800 pb-6 mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-gray-200 via-gray-400 to-zinc-600 drop-shadow-sm">Apex Hub</h1>
            <p className="text-zinc-400 mt-2 font-medium text-sm">Logged in as <span className="text-sky-400">{user.email}</span></p>
          </div>
          <button onClick={handleLogout} className="bg-zinc-900 border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-400 py-2 px-3 rounded-lg transition-all absolute top-6 right-6" title="Sign Out"><LogOut size={18} /></button>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
          <button onClick={() => setActiveView("personal")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${activeView === "personal" ? "bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-inner" : "text-zinc-500 hover:text-zinc-300"}`}><Home size={18}/> My Daily Tasks</button>
          <button onClick={() => setActiveView("community")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${activeView === "community" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-inner" : "text-zinc-500 hover:text-zinc-300"}`}><Globe size={18}/> Community Directory</button>
        </div>

        {/* -------------------- MY HUB VIEW -------------------- */}
        {activeView === "personal" && (
          <div className="flex-grow flex flex-col">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
               {/* Profile Selector */}
              <div className="flex items-center gap-3">
                {profiles.length > 0 ? (
                  <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-sky-100 py-2 px-4 rounded-lg focus:outline-none focus:border-sky-500 font-medium">
                    <option value="" disabled>Select a Profile</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                ) : <span className="text-zinc-500 italic">No profiles created yet.</span>}
              </div>

               {/* Add Menu */}
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="bg-zinc-800 hover:bg-zinc-700 border border-sky-500/50 text-sky-400 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <Plus size={20} /> Manage <ChevronDown size={16} />
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button onClick={() => { setShowProfileModal(true); setShowAddMenu(false); }} className="w-full text-left px-4 py-3 text-zinc-300 hover:bg-zinc-700 hover:text-sky-300 flex items-center gap-2 border-b border-zinc-700/50"><UserPlus size={16} /> New Profile</button>
                    <button onClick={() => { setShowLinkModal(true); setShowAddMenu(false); }} disabled={!selectedProfileId} className={`w-full text-left px-4 py-3 flex items-center gap-2 ${!selectedProfileId ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-300 hover:bg-zinc-700 hover:text-orange-300'}`}><Link2 size={16} /> Custom Link</button>
                  </div>
                )}
              </div>
            </div>

            {selectedProfileData && selectedProfileData.loginHint && (
              <div className="mb-6 bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-4 flex items-center gap-3">
                <ShieldAlert size={18} className="text-sky-400" />
                <p className="text-zinc-300 text-sm">Account Login: <span className="font-mono text-orange-400 tracking-wide">{selectedProfileData.loginHint}</span></p>
              </div>
            )}

            {!selectedProfileId ? (
              <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl py-12"><UserCircle size={48} className="text-zinc-700 mb-3" /><p className="text-zinc-500 font-medium">Create or select a profile to view links.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLinks.map((link) => (
                  <div key={link.id} className="bg-zinc-800/30 p-5 rounded-xl border border-zinc-700/50 hover:border-sky-500/50 transition-all group relative flex flex-col justify-between h-full hover:shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-200 group-hover:text-sky-300 transition-colors">{link.pageName}</h3>
                        <button onClick={() => handleDeleteLink(link.id, "fbLinks")} className="text-zinc-600 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <span className="inline-block bg-zinc-900/80 text-sky-400 text-xs px-2 py-1 rounded-md mb-4 border border-sky-500/20">{link.taskType}</span>
                    </div>
                    <a href={link.fbUrl} target="_blank" rel="noopener noreferrer" className="mt-auto bg-zinc-800 hover:bg-sky-600/20 border border-zinc-600 hover:border-sky-500 text-gray-300 hover:text-sky-300 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all">Open Link <ExternalLink size={16} /></a>
                  </div>
                ))}
                {filteredLinks.length === 0 && <div className="col-span-full text-zinc-500 italic bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 text-center">No tasks assigned. Add a custom link or browse the Community Directory to find some!</div>}
              </div>
            )}
          </div>
        )}

        {/* -------------------- COMMUNITY VIEW -------------------- */}
        {activeView === "community" && (
          <div className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">Global Directory</h2>
              <button onClick={() => setShowGlobalModal(true)} className="bg-orange-600/20 hover:bg-orange-600 border border-orange-500/50 text-orange-400 hover:text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(234,88,12,0.2)]">
                <Globe size={18} /> Submit a Page
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalPages.map((page) => (
                <div key={page.id} className="bg-zinc-800/50 p-5 rounded-xl border border-zinc-700 hover:border-orange-500/50 transition-all group flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-100">{page.pageName}</h3>
                      {page.userId === user?.uid && (
                        <button onClick={() => handleDeleteLink(page.id, "globalPages")} className="text-zinc-600 hover:text-red-500"><Trash2 size={16} /></button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getRatingBadge(page.rating)}
                      <span className="bg-zinc-900/80 text-orange-400 text-xs px-2 py-1 rounded border border-orange-500/20">{page.taskType}</span>
                    </div>
                    {page.proofLink && (
                      <a href={page.proofLink} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-sky-400 underline flex items-center gap-1 mb-4"><ExternalLink size={12}/> View Proof (External Link)</a>
                    )}
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <a href={page.fbUrl} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-700 text-gray-300 text-sm py-2 px-3 rounded flex justify-center items-center gap-1 transition-colors border border-zinc-700"><ExternalLink size={14}/> Visit</a>
                    <button onClick={() => setShowCloneModal({isOpen: true, pageData: page})} className="bg-orange-500/10 hover:bg-orange-500/30 text-orange-400 text-sm py-2 px-3 rounded flex justify-center items-center gap-1 transition-colors border border-orange-500/30"><Download size={14}/> Save</button>
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-3 text-right">Submitted by: {page.submittedBy}</p>
                </div>
              ))}
              {globalPages.length === 0 && <div className="col-span-full text-zinc-500 italic text-center p-8 border border-zinc-800 rounded-xl bg-zinc-900/50">The directory is empty. Be the first to submit a trusted group!</div>}
            </div>
          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      {/* 1. New Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-4 text-sky-400">Add New FB Profile</h2>
            <form onSubmit={handleAddProfile} className="space-y-4">
              <input type="text" placeholder="Profile Name (e.g., Main Account)" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500" required autoFocus />
              <input type="text" placeholder="Login Email / Phone (Reminder Only)" value={loginHint} onChange={(e) => setLoginHint(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500" />
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg">Save Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. New Custom Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowLinkModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-4 text-sky-400">Add Custom Link</h2>
            <form onSubmit={handleAddLink} className="space-y-4">
              <input type="text" placeholder="Page Name" value={pageName} onChange={(e) => setPageName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500" required autoFocus />
              <input type="url" placeholder="Facebook URL" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500" required />
              <input type="text" placeholder="Task Type" value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500" />
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg">Save Link</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Submit to Global Directory Modal */}
      {showGlobalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowGlobalModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-2 text-orange-400 flex items-center gap-2"><Globe size={24}/> Community Submission</h2>
            <p className="text-zinc-400 text-xs mb-4">Share a sweeps page with the network. If rating Verified or Scam, you MUST provide a screenshot/chat log link.</p>
            <form onSubmit={handleAddGlobalPage} className="space-y-4">
              <input type="text" placeholder="Facebook Group / Page Name" value={pageName} onChange={(e) => setPageName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-orange-500" required />
              <input type="url" placeholder="Facebook URL" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-orange-500" required />
              <input type="text" placeholder="Task Type (e.g., Daily Freeplay, Trivia)" value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-orange-500" />
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400 font-semibold">Community Rating</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-orange-500">
                  <option value="Unrated">⚪ Unrated / Pending</option>
                  <option value="Trusted">🟡 Trusted (Good Rep)</option>
                  <option value="Verified">🟢 Verified (I have cashed out)</option>
                  <option value="Scam">🔴 Scam / Fraud (Fake/No Pay)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400 font-semibold">Proof Link (Imgur, Drive, Lightshot)</label>
                <input type="url" placeholder="https://imgur.com/..." value={proofLink} onChange={(e) => setProofLink(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-orange-500" required={rating === 'Verified' || rating === 'Scam'} />
                {(rating === 'Verified' || rating === 'Scam') && <p className="text-xs text-red-400">* Proof link is required for this rating.</p>}
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg">Submit to Directory</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Clone to Profile Modal */}
      {showCloneModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowCloneModal({isOpen: false, pageData: null})} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-4 text-sky-400">Save to Profile</h2>
            <p className="text-zinc-400 text-sm mb-4">Adding <strong className="text-gray-200">"{showCloneModal.pageData?.pageName}"</strong> to your daily tasks.</p>
            
            <form onSubmit={handleCloneToProfile} className="space-y-4">
              <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-gray-200 focus:border-sky-500" required>
                <option value="" disabled>Select a Profile</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2"><Download size={18}/> Confirm Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}