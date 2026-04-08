import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect them to the app logic
  if (user) {
    return <Navigate to="/select-role" replace />;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 1. Sign up to Auth with direct redirect to onboarding
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/select-role`, // Take them directly to role selection after confirmation
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Resilient Profile Creation: UPSERT by email if it exists, otherwise by ID
      // This handles cases where a user was deleted but their profile row remained.
      const { error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: authData.user.id,
            email: email, 
            full_name: fullName,
            created_at: new Date().toISOString(),
          }
        ], { onConflict: 'email' }); // Focus on email uniqueness to reclaim orphaned rows
        
      if (profileError) {
        console.warn('Non-blocking profile sync warning:', profileError.message);
      }
    }
    
    setLoading(false);

    // If session is null, email confirmation is required
    if (!authData.session) {
      setSuccess(true);
    } else {
      navigate('/select-role');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-sky-600 mb-6">
          <div className="bg-sky-100 p-3 rounded-xl border border-sky-200">
            <Stethoscope className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Create Clinical Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Join the JanmaSethu Digital Front Office
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Account created, Please check your email inbox to verify your account.</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm transition-colors"
                  placeholder="Dr. Sarah Johnson"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm transition-colors"
                  placeholder="sarah@clinic.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm transition-colors"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full bg-sky-500 hover:bg-sky-600 py-3 rounded-xl shadow-lg shadow-sky-500/20"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-sky-600 hover:text-sky-500 border-b border-transparent hover:border-sky-500 transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
