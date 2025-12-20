
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050b18] text-white py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-8">
          
          {/* الشعار - Logo Section */}
          <div className="flex flex-col items-center gap-4 group cursor-default">
            <span className="text-2xl font-serif font-bold tracking-[0.2em] text-white">
              QUALITY <span className="text-[#c5a059]">TIME</span>
            </span>
          </div>

                    
          {/* حقوق النشر - Copyright */}
          <div className="text-center">
            <p className="text-gray-600 text-[9px] uppercase tracking-[0.3em] font-bold">
              © {currentYear} Quality Time Luxury Watches. All Rights Reserved. | by : abdou / insta : 0.ab._.dou.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
