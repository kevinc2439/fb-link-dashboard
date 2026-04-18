"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([]);
  const [pageName, setPageName] = useState("");
  const [fbUrl, setFbUrl] = useState("");
  const [taskType, setTaskType] = useState("");

  // Fetch links from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "fbLinks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLinks(linksData);
    });
    return () => unsubscribe();
  }, []);

  // Save a new link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName || !fbUrl) return;

    await addDoc(collection(db, "fbLinks"), {
      pageName,
      fbUrl,
      taskType: taskType || "Freeplay",
      createdAt: new Date(),
    });

    setPageName("");
    setFbUrl("");
    setTaskType("");
  };

  // Delete a link
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "fbLinks", id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Daily Task Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Manage your promotional pages and quick links.</p>
        </header>

        {/* Add New Link Form */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg shadow-black/50">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Add New Page</h2>
          <form onSubmit={handleAddLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Page Name (e.g., SpinPals FB)"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
              />
              <input
                type="url"
                placeholder="Facebook URL"
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Task Type (e.g., Daily Login)"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 md:col-span-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} /> Add to Dashboard
            </button>
          </form>
        </section>

        {/* Links Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-300">Your Saved Pages</h2>
          {links.length === 0 ? (
            <p className="text-slate-500 italic">No links added yet. Start building your database above!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {links.map((link) => (
                <div key={link.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-cyan-500 transition-colors group relative flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-100">{link.pageName}</h3>
                      <button onClick={() => handleDelete(link.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <span className="inline-block bg-slate-900 text-cyan-400 text-xs px-2 py-1 rounded-md mb-4 border border-slate-700">
                      {link.taskType}
                    </span>
                  </div>
                  <a
                    href={link.fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Go to Page <ExternalLink size={16} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}