import React, { useState } from 'react';
import { LogIn, GraduationCap, Shield, UserCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('cu_last_identifier') || '';
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const justRegisteredUid = localStorage.getItem('cu_just_registered');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      setError('Please enter your Chandigarh University UID or College Email, and Password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(cleanId, cleanPass);
      localStorage.removeItem('cu_just_registered');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Check your UID/Email and Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 p-8 text-white text-center relative">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-red-100">
            <span className="text-red-700 font-black text-xl tracking-tight">CU</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            CU OPPORTUNITY HUB
          </h1>
          <p className="text-xs text-red-100 mt-1">
            Chandigarh University • Academic & Placement Opportunity Tracker
          </p>
          <div className="mt-3 inline-block px-3 py-0.5 rounded-full bg-red-900/60 text-[11px] text-red-200 border border-red-700 font-mono">
            uims.cuchd.in • Student & Faculty Portal
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {justRegisteredUid && !error && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                Academic profile for <strong>{justRegisteredUid}</strong> saved successfully! Enter your password to sign in.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student UID or Official Email
              </label>
              <input
                type="text"
                placeholder="e.g. 25BIT10180 or 25bit10180@cuchd.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Enter your Chandigarh University Roll Number / UID or college email
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Enter your account password
                </span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-700 hover:bg-red-800 active:bg-red-900 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating with CU Portal...' : 'Sign In to Opportunity Hub'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Practical Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Quick Examination & Demonstration Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('25BIT10180', 'student123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-red-700">
                  <GraduationCap className="w-3.5 h-3.5" /> Student
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">25BIT10180</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('faculty.cse@cuchd.in', 'faculty123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                  <UserCheck className="w-3.5 h-3.5" /> Faculty
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">faculty.cse</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@cuchd.in', 'admin123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">admin@cu</div>
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-600">
              New student at Chandigarh University?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-red-700 hover:underline cursor-pointer"
              >
                Create Academic Profile
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
