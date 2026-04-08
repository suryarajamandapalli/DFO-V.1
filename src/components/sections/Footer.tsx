import { Stethoscope, Globe, ShieldCheck, Heart } from 'lucide-react';


export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-24 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-50 rounded-full blur-[100px] -mr-48 -mb-48 opacity-50" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-slate-900 p-2.5 rounded-lg text-white">
                <Stethoscope className="w-5 h-5 flex-shrink-0" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">DFO CLINIC.</span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-[1.8] mb-8">
              Clinical-grade intelligence and operational control for modern parenthood care platforms. Empowering clinicians with 10x capacity.
            </p>
            <div className="flex items-center gap-4">
               {/* Social links removed to avoid icon errors in current lucide version */}
            </div>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8">Platform OS</h4>
              <ul className="space-y-4">
                {['Control Tower', 'Risk Engine', 'SLA Analytics', 'Clinical Triage'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8">Resources</h4>
              <ul className="space-y-4">
                {['Documentation', 'HIPAA Compliance', 'Security Protocol', 'System Status'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8">Global Ops</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-500">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-semibold">USA Headquarters</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-semibold">Verified Clinical Hub</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <p>© {new Date().getFullYear()} DFO CLINIC OS. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Internal Ops</a>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            Certified Clinical Intelligence <Heart className="w-3 h-3 text-rose-500 ml-1 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
