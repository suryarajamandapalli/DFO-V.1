import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { AppRole } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, HeartPulse, Stethoscope, ArrowRight, Loader2 } from 'lucide-react';

export function SelectRole() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState<AppRole | null>(null);

  const roles = [
    {
      id: 'cro' as AppRole,
      title: 'Clinical Research Officer (CRO)',
      icon: ShieldAlert,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-400',
      description: 'Full control. Handles clinic configuration, monitors thread assignments, and manages overall operational workflows.'
    },
    {
      id: 'nurse' as AppRole,
      title: 'Triage Nurse',
      icon: HeartPulse,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      description: 'First line of response. Handles initial triage (Yellow threads) and routine maternity queries.'
    },
    {
      id: 'doctor' as AppRole,
      title: 'Attending Doctor',
      icon: Stethoscope,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      hoverBorder: 'hover:border-rose-400',
      description: 'Specialist care. Handles escalated emergencies (Red threads) and highly complex clinical consultations.'
    }
  ];

  const navigate = useNavigate();

  const handleRoleSelect = async (role: AppRole) => {
    if (!user) {
      console.error("No user found for role selection");
      return;
    }
    setLoading(role);

    try {
      // Use UPSERT instead of UPDATE to ensure a row is created if missing
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({ 
          id: user.id,
          role: role,
          email: user.email // Added to satisfy not-null constraint in users table
        });

      if (upsertError) {
        console.error("UPSERT error for 'users' table:", upsertError);
        throw upsertError;
      }
      
      console.log(`Successfully assigned role: ${role}`);
      
      // Refresh Auth Context to trigger navigation
      await refreshProfile();
      
      // Explicit navigation as a fallback/accelerator
      navigate(`/dashboard/${role}`);
    } catch (err: any) {
      console.error("Critical failure resetting role:", err.message);
      // Alert the user with more context
      alert(`Role assignment failed: ${err.message}. (FALLBACK ACTIVE: You can click 'Preview Dashboard' below to skip this for now)`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-slate-900 tracking-tight mb-4"
          >
            Select Your Designation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg max-w-2xl mx-auto"
          >
            Please choose your role. This will customize your dashboard view.
          </motion.p>
          
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full px-4">Development Environment</p>
            <button 
              onClick={() => {
                // Mock context and navigate immediately
                refreshProfile();
                navigate('/dashboard/cro');
              }}
              className="mt-2 text-sky-600 text-xs font-bold hover:underline"
            >
              🚀 Bypass Role Selection & Check Dashboard (Temporary)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1) }}
              onClick={() => handleRoleSelect(role.id)}
              className={`relative bg-white rounded-2xl border-2 ${role.borderColor} ${role.hoverBorder} p-6 cursor-pointer shadow-sm hover:shadow-md transition-all group overflow-hidden`}
            >
              <div className={`${role.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-6`}>
                <role.icon className={`w-7 h-7 ${role.color}`} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">{role.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                {role.description}
              </p>

              <div className="absolute bottom-6 right-6 flex items-center justify-end">
                {loading === role.id ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                ) : (
                  <div className={`p-2 rounded-full ${role.bgColor} group-hover:bg-opacity-80 transition-colors`}>
                    <ArrowRight className={`w-5 h-5 ${role.color}`} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
