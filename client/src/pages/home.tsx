import { Link } from "wouter";
import GradientButton from "@/components/gradient-button";
import GlassCard from "@/components/glass-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-start rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-end rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-6">
            Universal Tip Platform
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Send tips instantly to service workers. Secure, fast, and friction-free digital tipping with QR codes.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/u/demo">
              <GradientButton className="px-8 py-4 text-lg font-semibold">
                Try Demo
              </GradientButton>
            </Link>
            <Link href="/styleguide">
              <button className="px-8 py-4 text-lg glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200">
                Style Guide
              </button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-3">For Workers</h3>
            <p className="text-text-secondary mb-4">
              Create your personalized tip page, track earnings, and optimize conversion rates.
            </p>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• QR code generation</li>
              <li>• Real-time analytics</li>
              <li>• Multiple payment methods</li>
              <li>• Earnings dashboard</li>
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-3">For Customers</h3>
            <p className="text-text-secondary mb-4">
              Tip your favorite service workers instantly with just a scan or tap.
            </p>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Instant payments</li>
              <li>• Secure transactions</li>
              <li>• No app downloads</li>
              <li>• Leave reviews</li>
            </ul>
          </GlassCard>
        </div>

        <div className="text-center">
          <p className="text-text-secondary">
            Built with premium dark glass aesthetics and optimized for mobile-first experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
