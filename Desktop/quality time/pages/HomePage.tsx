
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock } from 'lucide-react';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Quality Time DZ",
    "description": "ساعات فاخرة بتصميم أصيل وجودة عالمية وبأسعار اقتصادية.",
    "url": "https://qualitytime-dz.com",
    "image": "https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "DZ",
      "addressRegion": "Algeria"
    },
    "priceRange": "$$",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Luxury Watches",
      "itemListElement": [
        { "@type": "Product", "name": "Men Luxury Watches" },
        { "@type": "Product", "name": "Women Luxury Watches" }
      ]
    }
  };

  return (
    <>
      {/* SEO & META */}
      <Helmet>
        <title>Quality Time DZ | ساعات فاخرة جزائرية</title>

        <meta
          name="description"
          content="متجر ساعات فاخرة جزائري يقدم ساعات بتصميم أصيل وجودة عالمية بأسعار اقتصادية."
        />
        <meta
          name="keywords"
          content="ساعات فاخرة, ساعات رجالية, ساعات نسائية, هدايا, luxury watches, ساعات جزائرية"
        />

        {/* OPEN GRAPH */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Quality Time DZ | ساعات فاخرة جزائرية" />
        <meta property="og:description" content="ساعات بتصميم أصيل وجودة عالمية بأسعار اقتصادية" />
        <meta property="og:image" content="https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png" />
        <meta property="og:locale" content="ar_AR" />
        <meta property="og:url" content="https://qualitytime-dz.com" />

        {/* TWITTER */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Quality Time DZ | ساعات فاخرة" />
        <meta name="twitter:description" content="ساعات فاخرة بتصميم جزائري أصيل وجودة عالمية" />
        <meta name="twitter:image" content="https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png" />

        {/* STRUCTURED DATA */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* UI */}

      <main className="min-h-screen relative overflow-hidden">
        {/* Full Page Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/Black%20Color%20.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay Layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.05)_0%,transparent_70%)]"></div>
          
          {/* Animated Particles Effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] h-[1px] bg-[#c5a059] rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: Math.random() * 0.5 + 0.1,
                  boxShadow: '0 0 20px 2px #c5a059'
                }}
              />
            ))}
          </div>
          
        </div>

        {/* Floating Watch Elements */}
        <div className="absolute top-1/4 left-10 opacity-30 animate-float-slow">
          <Clock size={120} className="text-[#c5a059] drop-shadow-[0_0_40px_rgba(197,160,89,0.8)] animate-pulse" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-35 animate-float-slower">
          <Clock size={100} className="text-[#c5a059] rotate-45 drop-shadow-[0_0_35px_rgba(197,160,89,0.7)] animate-pulse" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-25 animate-float">
          <div className="w-24 h-24 border-4 border-[#c5a059]/60 rounded-full shadow-[0_0_30px_rgba(197,160,89,0.5)] animate-pulse"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 opacity-30 animate-float-slow">
          <Clock size={80} className="text-[#c5a059] -rotate-12 drop-shadow-[0_0_30px_rgba(197,160,89,0.7)] animate-pulse" />
        </div>

        {/* Main Content */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 md:px-6 py-12">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center">
              
              
              

              {/* Main Heading with Glow Effect */}
              <div className="relative mb-8">
                <div className="absolute -inset-8 bg-gradient-to-r from-[#c5a059]/20 via-transparent to-[#c5a059]/20 blur-3xl rounded-full"></div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight relative">
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-400">
                      ساعات فاخرة
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#c5a059] to-transparent opacity-30 blur-xl"></span>
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] via-[#e6c98c] to-[#c5a059] animate-gradient">
                    بأسلوب جزائري
                  </span>
                </h1>
                
              </div>

              {/* Description with Creative Layout */}
              <div className="max-w-3xl mx-auto mb-12 relative">
                {/* Decorative Quotes */}
                <div className="absolute -left-4 top-0 text-4xl text-[#c5a059]/30">"</div>
                <div className="absolute -right-4 bottom-0 text-4xl text-[#c5a059]/30">"</div>
                
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-white/10">
                  اكتشف ساعات تجمع بين <span className="text-[#c5a059] font-semibold">التصميم العصري</span> والجودة العالية والسعر المناسب.
                  لأن <span className="text-[#c5a059] font-semibold">الوقت يجب أن يكون فاخراً</span>.
                </p>
              </div>

              

              {/* CTA Buttons with Creative Layout */}
              <div className="flex flex-col sm:flex-row gap-6 mb-20 relative max-w-2xl mx-auto">
                {/* Decorative Background */}
                <div className="absolute -inset-8 bg-gradient-to-r from-[#c5a059]/10 via-transparent to-[#c5a059]/10 blur-2xl rounded-3xl"></div>
                
                <Link to="/products" className="relative group flex-1">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#c5a059] via-[#d4b67d] to-[#c5a059] rounded-2xl blur opacity-30 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full relative bg-gradient-to-r from-[#c5a059] to-[#d4b67d] border-none transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-[#c5a059]/40"
                  >
                    <span className="flex items-center justify-center gap-3 text-lg">
                      <span className="relative">
                        اكتشف المجموعة
                        <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-white transition-all duration-300"></span>
                      </span>
                      <ArrowLeft className="mr-2 transition-transform group-hover:-translate-x-2" />
                    </span>
                  </Button>
                </Link>

                <a
                  href="https://www.tiktok.com/@equality_time"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group flex-1"
                >
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full backdrop-blur-xl bg-black/40 border border-white/30 hover:border-[#c5a059]/50 transition-all duration-300 group-hover:scale-[1.02]"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      تابعنا على تيك توك
                    </span>
                  </Button>
                </a>
              </div>



            </div>
          </div>
        </section>

        {/* Custom Animations CSS */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
            25% { transform: translateY(-15px) rotate(3deg) scale(1.05); }
            50% { transform: translateY(-25px) rotate(-2deg) scale(1.1); }
            75% { transform: translateY(-10px) rotate(1deg) scale(1.05); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
            33% { transform: translateY(-35px) rotate(-8deg) scale(1.08); }
            66% { transform: translateY(-20px) rotate(5deg) scale(1.05); }
          }
          @keyframes float-slower {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-30px) scale(1.1); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          .animate-float-slow {
            animation: float-slow 12s ease-in-out infinite;
          }
          .animate-float-slower {
            animation: float-slower 15s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s ease infinite;
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
        `}</style>
      </main>

    </>
  );
};

export default HomePage;
