import { Link } from "wouter";
import { motion } from "framer-motion";
import { QrCode, TrendingUp, DollarSign, Users, Zap, Shield, ArrowRight, Star, Crown, Sparkles } from "lucide-react";
import GradientButton from "@/components/gradient-button";
import GlassCard from "@/components/glass-card";

export default function Home() {
  // Custom SVG for viral money-focused hero
  const MoneyFlowSVG = () => (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <defs>
        <linearGradient id="moneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
        </linearGradient>
        <filter id="moneyGlow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="sparkle">
          <feGaussianBlur stdDeviation="2" result="softGlow"/>
          <feMerge> 
            <feMergeNode in="softGlow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Animated money background */}
      <g opacity="0.7">
        <circle cx="120" cy="120" r="60" fill="url(#glowGrad)">
          <animateTransform attributeName="transform" type="translate" values="0,0; 20,10; 0,0" dur="6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="680" cy="400" r="45" fill="url(#glowGrad)">
          <animateTransform attributeName="transform" type="translate" values="0,0; -15,20; 0,0" dur="8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="650" cy="100" r="35" fill="url(#glowGrad)">
          <animateTransform attributeName="transform" type="translate" values="0,0; 10,-15; 0,0" dur="7s" repeatCount="indefinite"/>
        </circle>
      </g>
      
      {/* Flying money bills with animation */}
      <g>
        <g transform="rotate(-12 200 200)">
          <rect x="170" y="170" width="90" height="50" rx="6" fill="url(#moneyGrad)" filter="url(#moneyGlow)" />
          <text x="215" y="200" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">$50</text>
          <animateTransform attributeName="transform" type="rotate" values="-12 200 200; -8 200 200; -12 200 200" dur="4s" repeatCount="indefinite"/>
        </g>
        
        <g transform="rotate(8 500 140)">
          <rect x="470" y="115" width="90" height="50" rx="6" fill="url(#moneyGrad)" filter="url(#moneyGlow)" />
          <text x="515" y="145" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">$25</text>
          <animateTransform attributeName="transform" type="rotate" values="8 500 140; 12 500 140; 8 500 140" dur="5s" repeatCount="indefinite"/>
        </g>
        
        <g transform="rotate(-6 580 320)">
          <rect x="550" y="295" width="90" height="50" rx="6" fill="url(#moneyGrad)" filter="url(#moneyGlow)" />
          <text x="595" y="325" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">$100</text>
          <animateTransform attributeName="transform" type="rotate" values="-6 580 320; -2 580 320; -6 580 320" dur="6s" repeatCount="indefinite"/>
        </g>
      </g>
      
      {/* Central phone with QR code */}
      <g transform="translate(400, 300)">
        <rect x="-60" y="-100" width="120" height="200" rx="25" fill="#1F2937" stroke="url(#moneyGrad)" strokeWidth="3" />
        <rect x="-50" y="-85" width="100" height="150" rx="12" fill="#111827" />
        
        {/* QR Code */}
        <rect x="-30" y="-60" width="60" height="60" rx="4" fill="white" />
        <g fill="#111827">
          <rect x="-25" y="-55" width="8" height="8" />
          <rect x="-10" y="-55" width="8" height="8" />
          <rect x="5" y="-55" width="8" height="8" />
          <rect x="20" y="-55" width="8" height="8" />
          <rect x="-25" y="-40" width="8" height="8" />
          <rect x="5" y="-40" width="8" height="8" />
          <rect x="-10" y="-25" width="8" height="8" />
          <rect x="20" y="-25" width="8" height="8" />
          <rect x="-25" y="-10" width="8" height="8" />
          <rect x="5" y="-10" width="8" height="8" />
        </g>
        
        {/* App interface */}
        <text x="0" y="10" textAnchor="middle" fill="url(#moneyGrad)" fontSize="14" fontWeight="bold">TipVault</text>
        <rect x="-35" y="25" width="70" height="12" rx="6" fill="url(#moneyGrad)" />
        <rect x="-25" y="45" width="50" height="8" rx="4" fill="#34D399" />
        <rect x="-20" y="60" width="40" height="8" rx="4" fill="#6EE7B7" />
      </g>
      
      {/* Money flow arrows */}
      <g stroke="url(#moneyGrad)" strokeWidth="4" fill="none" opacity="0.8">
        <defs>
          <marker id="moneyArrow" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto">
            <polygon points="0 0, 12 4, 0 8" fill="url(#moneyGrad)" />
          </marker>
        </defs>
        <path d="M 260 190 Q 320 220 340 260" markerEnd="url(#moneyArrow)">
          <animate attributeName="stroke-dasharray" values="0,100; 100,0; 0,100" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M 540 160 Q 480 200 460 260" markerEnd="url(#moneyArrow)">
          <animate attributeName="stroke-dasharray" values="0,100; 100,0; 0,100" dur="4s" repeatCount="indefinite"/>
        </path>
        <path d="M 570 340 Q 520 320 460 300" markerEnd="url(#moneyArrow)">
          <animate attributeName="stroke-dasharray" values="0,100; 100,0; 0,100" dur="5s" repeatCount="indefinite"/>
        </path>
      </g>
      
      {/* Sparkles and dollar signs */}
      <g fill="url(#moneyGrad)" filter="url(#sparkle)">
        <text x="150" y="350" fontSize="28" fontWeight="bold" opacity="0.8">$</text>
        <text x="600" y="280" fontSize="24" fontWeight="bold" opacity="0.7">$</text>
        <text x="100" y="480" fontSize="20" fontWeight="bold" opacity="0.6">$</text>
        <text x="700" y="200" fontSize="26" fontWeight="bold" opacity="0.9">$</text>
        <text x="50" y="250" fontSize="22" fontWeight="bold" opacity="0.5">$</text>
        <text x="750" y="450" fontSize="18" fontWeight="bold" opacity="0.7">$</text>
        
        <g>
          <animateTransform attributeName="transform" type="scale" values="1; 1.2; 1" dur="2s" repeatCount="indefinite"/>
          <polygon points="200,80 205,90 215,90 207,97 210,107 200,100 190,107 193,97 185,90 195,90" opacity="0.8"/>
        </g>
        <g>
          <animateTransform attributeName="transform" type="scale" values="1; 1.3; 1" dur="2.5s" repeatCount="indefinite"/>
          <polygon points="550,50 555,60 565,60 557,67 560,77 550,70 540,77 543,67 535,60 545,60" opacity="0.7"/>
        </g>
        <g>
          <animateTransform attributeName="transform" type="scale" values="1; 1.1; 1" dur="3s" repeatCount="indefinite"/>
          <polygon points="650,500 655,510 665,510 657,517 660,527 650,520 640,527 643,517 635,510 645,510" opacity="0.9"/>
        </g>
      </g>
      
      {/* Success checkmarks */}
      <g>
        <circle cx="150" cy="420" r="15" fill="#10B981" filter="url(#moneyGlow)" />
        <path d="M 142 420 L 147 425 L 158 414" stroke="white" strokeWidth="3" fill="none" />
        <circle cx="620" cy="120" r="15" fill="#10B981" filter="url(#moneyGlow)" />
        <path d="M 612 120 L 617 125 L 628 114" stroke="white" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-green-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-emerald-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '-4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                {/* Viral Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-full text-yellow-300 font-bold mb-8"
                >
                  <Crown className="w-5 h-5" />
                  #1 VIRAL TIP PLATFORM
                  <Star className="w-5 h-5 fill-current animate-pulse" />
                </motion.div>

                {/* Main Headline - New Viral Name */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent leading-tight">
                    TipVault
                  </h1>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="relative"
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Turn Every Service Into 
                      <span className="text-green-400 animate-pulse"> MONEY</span>
                    </h2>
                    <div className="absolute -top-2 -right-4">
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                    </div>
                  </motion.div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xl text-gray-300 mb-8 max-w-2xl lg:max-w-none leading-relaxed"
                >
                  The groundbreaking platform that's making service workers <span className="text-green-400 font-bold">300% more money</span>. 
                  One QR code. Unlimited earnings. Zero hassle.
                </motion.p>

                {/* Explosive Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="grid grid-cols-3 gap-6 mb-10"
                >
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-400 mb-1">$2.8M+</div>
                    <div className="text-sm text-gray-400 font-medium">Tips Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-400 mb-1">67K+</div>
                    <div className="text-sm text-gray-400 font-medium">Workers Earning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-400 mb-1">300%</div>
                    <div className="text-sm text-gray-400 font-medium">Income Boost</div>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Link href="/u/demo" className="group">
                    <button className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-xl hover:shadow-2xl hover:shadow-green-500/30 transition-all transform hover:scale-105 group-hover:from-green-400 group-hover:to-emerald-500">
                      <DollarSign className="w-6 h-6" />
                      START EARNING NOW
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </Link>
                  <Link href="/u/demo" className="group">
                    <button className="flex items-center gap-3 px-10 py-5 border-2 border-green-500/60 bg-green-500/10 text-green-300 rounded-xl font-black text-xl hover:bg-green-500/20 transition-all group-hover:border-green-400">
                      <QrCode className="w-6 h-6" />
                      SEE LIVE DEMO
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative"
              >
                <div className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm border border-green-500/20">
                  <MoneyFlowSVG />
                </div>
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm animate-bounce">
                  LIVE EARNINGS!
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black text-white mb-6">
                Why Everyone's Going <span className="text-green-400">VIRAL</span> With TipVault
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join the money revolution that's transforming how service workers earn
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <GlassCard className="p-8 h-full bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Instant Money</h3>
                  <p className="text-gray-300 mb-6">
                    Tips hit your account in seconds, not days. Real money, real fast.
                  </p>
                  <ul className="text-green-300 space-y-2 font-medium">
                    <li>• Stripe instant transfers</li>
                    <li>• Venmo/CashApp integration</li>
                    <li>• Zero processing delays</li>
                    <li>• 24/7 availability</li>
                  </ul>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <GlassCard className="p-8 h-full bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">300% More Tips</h3>
                  <p className="text-gray-300 mb-6">
                    Our AI optimization increases your tips by an average of 300%.
                  </p>
                  <ul className="text-green-300 space-y-2 font-medium">
                    <li>• Smart tip suggestions</li>
                    <li>• Psychology-based pricing</li>
                    <li>• A/B tested flows</li>
                    <li>• Review integration boost</li>
                  </ul>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <GlassCard className="p-8 h-full bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Bank-Level Security</h3>
                  <p className="text-gray-300 mb-6">
                    Enterprise security that protects every dollar you earn.
                  </p>
                  <ul className="text-green-300 space-y-2 font-medium">
                    <li>• SSL encryption</li>
                    <li>• PCI compliance</li>
                    <li>• Fraud protection</li>
                    <li>• GDPR compliant</li>
                  </ul>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-3xl p-12"
            >
              <h2 className="text-5xl font-black text-white mb-6">
                Ready to <span className="text-green-400">3X Your Income</span>?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join 67,000+ workers already earning more with TipVault
              </p>
              <Link href="/u/demo">
                <button className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-2xl hover:shadow-2xl hover:shadow-green-500/40 transition-all transform hover:scale-105">
                  START YOUR MONEY VAULT
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
