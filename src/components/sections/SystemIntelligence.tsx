import { Brain, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';

export function SystemIntelligence() {
  return (
    <section id="intelligence" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              <span>Machine Learning Core</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Intelligence beyond simple Chatbots
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              The Control Tower utilizes advanced contextual understanding to ensure no patient risk goes unnoticed. It bridges the gap between automated AI responses and clinical human judgment.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <MessageSquare className="w-6 h-6 text-sky-500 mb-3" />
                <h4 className="font-semibold text-slate-800">Sentiment Detection</h4>
                <p className="text-sm text-slate-500 mt-1">Understands urgency, pain levels, and emotional distress from raw text.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldAlert className="w-6 h-6 text-sky-500 mb-3" />
                <h4 className="font-semibold text-slate-800">Risk Scoring</h4>
                <p className="text-sm text-slate-500 mt-1">Cross-references symptoms against patient history to assign threat levels.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <Brain className="w-6 h-6 text-sky-500 mb-3" />
                <h4 className="font-semibold text-slate-800">Context Awareness</h4>
                <p className="text-sm text-slate-500 mt-1">Remembers past consultations and medications to provide informed answers.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <Cpu className="w-6 h-6 text-sky-500 mb-3" />
                <h4 className="font-semibold text-slate-800">AI + Clinical Sync</h4>
                <p className="text-sm text-slate-500 mt-1">Seamless handoff to doctors; AI halts completely during human takeover.</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
              
              <div className="relative z-10 font-mono text-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-slate-500 text-xs">Risk_Engine_Evaluation.js</span>
                </div>
                
                <div className="space-y-4 text-slate-300">
                  <p><span className="text-sky-400">Incoming Message:</span> "I have severe cramps since yesterday night."</p>
                  <p className="text-slate-500 break-words opacity-50">----------------------------------------</p>
                  <p>{`> Executing Pipeline...`}</p>
                  <p>{`> Keyword_Extraction:`} <span className="text-amber-400">["severe", "cramps", "yesterday"]</span></p>
                  <p>{`> Sentiment_Analysis:`} <span className="text-rose-400">Distressed (0.84)</span></p>
                  <p>{`> History_Check:`} <span className="text-green-400">Week 32, high-BP recorded</span></p>
                  <p className="text-slate-500 break-words opacity-50">----------------------------------------</p>
                  <p className="text-white mt-4 flex items-center gap-2">
                    {`>> System Action: `}
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/50">THREAD_CLASSIFIED_RED</span>
                  </p>
                  <p className="text-white flex items-center gap-2">
                    {`>> Routing: `}
                    <span className="text-sky-400">Assigned_to_Doctor_On_Call</span>
                  </p>
                  <p className="text-white flex items-center gap-2 animate-pulse">
                    {`>> SLA Timer: `}
                    <span className="text-yellow-400">STARTED (05:00 limit)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
