import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // استعادة بيانات تسجيل الدخول المحفوظة
  useEffect(() => {
    const savedEmail = localStorage.getItem('admin_email');
    const savedRemember = localStorage.getItem('admin_remember');
    
    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // تحقق من صحة بيانات الإدخال
    if (!email || !password) {
      setError('جميع الحقول مطلوبة');
      setLoading(false);
      return;
    }

    // تحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      setLoading(false);
      return;
    }

    // محاولة تسجيل الدخول
    const { error: signInError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (signInError) {
      // رسالة خطأ أكثر تفصيلاً حسب نوع الخطأ
      if (signInError.message.includes('Invalid login credentials')) {
        setError('بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('يرجى تأكيد بريدك الإلكتروني أولاً');
      } else if (signInError.message.includes('Too many requests')) {
        setError('لقد قمت بمحاولات كثيرة. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.');
      } else {
        setError('حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
    } else {
      // حفظ تفضيلات المستخدم إذا طلب ذلك
      if (rememberMe) {
        localStorage.setItem('admin_email', email);
        localStorage.setItem('admin_remember', 'true');
      } else {
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_remember');
      }
      
      // تسجيل ناجح - الانتقال إلى لوحة التحكم
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#05070d] flex items-center justify-center p-4">

      {/* Container */}
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner mb-4">
            <Shield className="text-yellow-500" size={36} />
          </div>

          <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">
            تسجيل الدخول
          </h1>
          <p className="text-gray-400 text-sm font-light">لوحة التحكم الإدارية</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 text-sm text-center rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white pr-12 pl-4 py-3 rounded-lg outline-none focus:border-yellow-500 transition"
              placeholder="admin@example.com"
              dir="ltr"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white pr-12 pl-12 py-3 rounded-lg outline-none focus:border-yellow-500 transition"
              placeholder="••••••••"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer text-gray-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-yellow-500"
            />
            تذكرني
          </label>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 transition text-black font-semibold shadow-lg"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          {new Date().getFullYear()} © Quality Time DZ
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;