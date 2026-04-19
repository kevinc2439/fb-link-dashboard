import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-400 font-mono selection:bg-blue-500/30">
      
      {/* HEADER / NAVIGATION */}
      <header className="border-b border-slate-800 bg-[#0f1115] px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="text-2xl font-black tracking-tighter italic text-white">
          APEX <span className="text-blue-500">HUB</span>
        </div>
        <nav className="space-x-6 text-sm hidden md:block">
          <a href="#how-it-works" className="hover:text-blue-400 transition-colors">OPERATIONS</a>
          <a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a>
          <a href="#about" className="hover:text-blue-400 transition-colors">ABOUT</a>
        </nav>
        <Link 
          href="/" 
          className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-sm text-sm border border-slate-600 transition-all"
        >
          SYSTEM LOGIN
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="py-24 px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-block px-3 py-1 mb-6 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs tracking-widest rounded-sm">
          SYSTEM TELEMETRY: REIMAGINED
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase">
          The Central <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600">
            Nervous System
          </span>
          <br /> For Data Operations.
        </h1>
        <p className="max-w-2xl text-lg text-slate-500 mb-10">
          Apex Hub bridges the gap between mobile accessibility and desktop data analysis. 
          Automate data lifecycle management with real-time Firestore synchronization and cross-platform scraping.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all uppercase"
          >
            Initialize Dashboard
          </Link>
          <a 
            href="#how-it-works" 
            className="bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 px-8 py-4 rounded-sm font-bold transition-all uppercase"
          >
            View Specs
          </a>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-8 bg-[#0d0f12] border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 uppercase tracking-tight border-l-4 border-blue-500 pl-4">
            Operational Protocol // How it Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#121418] p-8 border border-slate-800 rounded-sm hover:border-blue-500/50 transition-colors">
              <div className="text-blue-500 text-4xl mb-4 font-black">01.</div>
              <h3 className="text-xl font-bold text-white mb-3">Intercept</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                The secure Android accessibility service runs silently, listening for targeted intent filters, URLs, and specific UI interactions across social platforms.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-[#121418] p-8 border border-slate-800 rounded-sm hover:border-blue-500/50 transition-colors">
              <div className="text-blue-500 text-4xl mb-4 font-black">02.</div>
              <h3 className="text-xl font-bold text-white mb-3">Transmit</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Captured metadata is instantly packaged and securely piped via Firebase to the cloud, maintaining strict private operator sovereignty over the payload.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-[#121418] p-8 border border-slate-800 rounded-sm hover:border-orange-500/50 transition-colors">
              <div className="text-orange-500 text-4xl mb-4 font-black">03.</div>
              <h3 className="text-xl font-bold text-white mb-3">Analyze</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                The Next.js dashboard processes the incoming telemetry. Operators can manage sessions, trigger Chrome Extension downloads, and execute downstream commands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12 uppercase tracking-tight border-l-4 border-blue-500 pl-4">
          Intel // F.A.Q.
        </h2>
        <div className="space-y-4">
          {/* FAQ Item */}
          <div className="bg-[#121418] border border-slate-800 p-6 rounded-sm">
            <h4 className="text-lg font-bold text-white mb-2">How does the accessibility service capture data?</h4>
            <p className="text-slate-500 text-sm">
              Once enabled on the host device, the Android app reads the screen hierarchy for specific target nodes (like specific links or profile IDs) and securely transmits that data without requiring manual copy-pasting.
            </p>
          </div>
          {/* FAQ Item */}
          <div className="bg-[#121418] border border-slate-800 p-6 rounded-sm">
            <h4 className="text-lg font-bold text-white mb-2">Where is the captured data stored?</h4>
            <p className="text-slate-500 text-sm">
              All telemetry is routed directly to a private Firestore database. Apex Hub utilizes a strict "Private Operator" model, meaning no external third-party servers hold the data lifecycle.
            </p>
          </div>
          {/* FAQ Item */}
          <div className="bg-[#121418] border border-slate-800 p-6 rounded-sm">
            <h4 className="text-lg font-bold text-white mb-2">How do I install the Operator Chrome Extension?</h4>
            <p className="text-slate-500 text-sm">
              After logging into the main dashboard, navigate to the Operations panel. Download the compiled `.zip` file, open Chrome Extensions in Developer Mode, and select "Load Unpacked".
            </p>
          </div>
          {/* FAQ Item */}
          <div className="bg-[#121418] border border-slate-800 p-6 rounded-sm">
            <h4 className="text-lg font-bold text-white mb-2">Can the scraper be targeted to new platforms?</h4>
            <p className="text-slate-500 text-sm">
              Yes. The core architecture allows for custom scraping logic to be injected, making it adaptable to new social networks, CRM interfaces, or custom web portals.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT / CONTACT SECTION */}
      <section id="about" className="py-24 px-8 bg-[#0d0f12] border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight">
            Command Center
          </h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">
            Apex Hub is maintained and operated by Apex Innovative Solutions, LLC. We specialize in custom technical services, automated data extraction, and high-performance network solutions.
          </p>
          
          <div className="inline-block bg-[#121418] border border-slate-700 p-8 rounded-sm text-left">
            <div className="mb-4 pb-4 border-b border-slate-800 text-center">
              <div className="text-white font-bold text-xl uppercase tracking-widest">Apex Innovative Solutions, LLC</div>
              <div className="text-slate-500 text-sm mt-1">Sumner, Georgia</div>
            </div>
            
            <div className="space-y-4 text-sm mt-6">
              <div className="flex items-center">
                <span className="text-blue-500 w-24 font-bold">STATUS:</span>
                <span className="text-emerald-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  SYSTEMS ONLINE
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 w-24 font-bold">SUPPORT:</span>
                <a href="mailto:admin@apexinnovativesolutions.com" className="text-white hover:text-blue-400 underline decoration-slate-600 underline-offset-4 transition-colors">
                  admin@apexinnovativesolutions.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050505] py-8 text-center border-t border-slate-900">
        <p className="text-slate-700 text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} Apex Innovative Solutions, LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}