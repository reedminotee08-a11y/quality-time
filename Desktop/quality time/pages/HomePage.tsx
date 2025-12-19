
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  return (
    <div className="bg-[#050b18] min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 md:pt-20">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://mayiosolklryjbxxfohi.supabase.co/storage/v1/object/public/logo/Black%20Color%20.jpg" 
            alt="Quality Time Dz Luxury Watches Background" 
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050b18]/70 via-[#050b18]/50 to-[#050b18]/90" />
        </div>
        
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#c5a059]/5 rounded-full blur-[80px] md:blur-[120px]" />
        
        {/* Main Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Brand Tagline */}
            <h2 className="text-[#c5a059] text-xs md:text-sm font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] mb-3 md:mb-4">
              quality time dz
            </h2>
            
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-black leading-tight mb-4 md:mb-6">
              quality <br className="block sm:hidden" />
              <span className="text-gold-polished">time</span>
            </h1>
            
            {/* Description */}
            <p className="text-gray-300 text-sm md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              ساعات فاخرة بتصميم جزائري أصيل وجودة عالمية، بأسعار اقتصادية تناسب الجميع. 
              استمتع بالأناقة والتميز في كل لحظة.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-2 sm:px-0">
              <Link to="/products" className="w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto group hover:scale-[1.02] transition-transform duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    اكتشف المجموعة
                    <ArrowLeft 
                      size={20} 
                      className="group-hover:-translate-x-1 transition-transform duration-300" 
                    />
                  </span>
                </Button>
              </Link>
              
              <a 
                href="https://www.tiktok.com/@equality_time" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                className="w-full sm:w-auto"
              >
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full sm:w-auto hover:scale-[1.02] transition-transform duration-300"
                >
                  تابعنا على تيك توك
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-gray-400">مرر لأسفل</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#c5a059] to-transparent animate-bounce" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
