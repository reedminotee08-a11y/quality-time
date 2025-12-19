import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // رسالة خطأ أكثر تفصيلاً حسب نوع الخطأ
      if (error.message.includes('Invalid login credentials')) {
        setError('بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
      } else {
        setError('حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
    } else {
      // تسجيل ناجح - الانتقال إلى لوحة التحكم
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050b18] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-navy-soft rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 border-2 border-gold/40 rounded-sm mb-8 shadow-[0_0_30px_rgba(197,160,89,0.2)] bg-black/50 backdrop-blur-xl">
            <span className="text-4xl font-serif font-black text-gold">QT</span>
          </div>
          <h1 className="text-4xl font-serif font-black text-white tracking-tight">الدخول الآمن</h1>
          <p className="text-gray-500 mt-4 font-medium">لوحة التحكم الإدارية لـ Quality Time</p>
        </div>

        <div className="luxury-widget p-10 rounded-sm shadow-2xl relative">
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 text-sm text-center rounded-sm font-bold animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-3 text-right">
              <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 text-white pr-12 pl-4 py-4 rounded-sm outline-none focus:border-gold transition-all shadow-inner"
                  placeholder="admin@qualitytime.dz"
                />
              </div>
            </div>

            <div className="space-y-3 text-right">
              <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  required 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 text-white pr-12 pl-12 py-4 rounded-sm outline-none focus:border-gold transition-all shadow-inner"
                  placeholder="••••••••"
                />
                <Button 
                  type="button"
                  variant="icon"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="py-5 text-lg"
            >
              تسجيل الدخول
            </Button>
          </form>
        </div>
        
        <p className="text-center text-gray-600 mt-12 text-[10px] font-black uppercase tracking-[0.4em]">
          End-to-End Encryption • Quality Time DZ
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;