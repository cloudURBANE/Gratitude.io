import { Link } from "wouter";
import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";
import TipPreset from "@/components/tip-preset";
import PaymentMethod from "@/components/payment-method";

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">TipLink Style Guide</h1>
          <p className="text-text-secondary">Design tokens and component library for the premium dark glass aesthetic.</p>
        </div>

        {/* Color Palette */}
        <GlassCard className="rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2 bg-dark-bg border border-glass-border"></div>
              <p className="text-sm text-text-primary font-medium">Dark BG</p>
              <p className="text-xs text-text-secondary">#0B0B0F</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2 border border-glass-border glass-card"></div>
              <p className="text-sm text-text-primary font-medium">Glass</p>
              <p className="text-xs text-text-secondary">rgba(255,255,255,0.06)</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2 bg-gradient-to-r from-accent-start to-accent-end"></div>
              <p className="text-sm text-text-primary font-medium">Accent</p>
              <p className="text-xs text-text-secondary">#7C3AED → #22D3EE</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2 bg-text-primary"></div>
              <p className="text-sm text-text-primary font-medium">Text Primary</p>
              <p className="text-xs text-text-secondary">#ECECEC</p>
            </div>
          </div>
        </GlassCard>

        {/* Typography */}
        <GlassCard className="rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-text-primary">Heading 1 - 32px Bold</h1>
              <p className="text-sm text-text-secondary">Inter, 32px, 700 weight, 1.4 line-height</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">Heading 2 - 24px Semibold</h2>
              <p className="text-sm text-text-secondary">Inter, 24px, 600 weight, 1.4 line-height</p>
            </div>
            <div>
              <p className="text-lg text-text-primary">Body Large - 18px Regular</p>
              <p className="text-sm text-text-secondary">Inter, 18px, 400 weight, 1.5 line-height</p>
            </div>
            <div>
              <p className="text-base text-text-secondary">Body - 16px Regular</p>
              <p className="text-sm text-text-secondary">Inter, 16px, 400 weight, 1.5 line-height</p>
            </div>
          </div>
        </GlassCard>

        {/* Components */}
        <GlassCard className="rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Components</h2>
          
          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-primary mb-4">Buttons</h3>
            <div className="space-y-4">
              <div>
                <GradientButton className="py-3 px-6">Primary Button</GradientButton>
                <p className="text-sm text-text-secondary mt-1">Gradient background with glow animation</p>
              </div>
              <div>
                <button className="glass-card hover:bg-glass-border py-3 px-6 rounded-xl text-text-primary">Glass Button</button>
                <p className="text-sm text-text-secondary mt-1">Glass background with hover state</p>
              </div>
              <div>
                <button className="py-3 px-6 text-text-secondary hover:text-text-primary transition-colors">Text Button</button>
                <p className="text-sm text-text-secondary mt-1">Simple text with hover effect</p>
              </div>
            </div>
          </div>

          {/* Form Elements */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-primary mb-4">Form Elements</h3>
            <div className="space-y-4">
              <div>
                <input type="text" className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" placeholder="Input field" />
              </div>
              <div>
                <textarea className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20 resize-none" rows={3} placeholder="Textarea"></textarea>
              </div>
            </div>
          </div>

          {/* Tip Components */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-primary mb-4">Tip Components</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <TipPreset amount={5} label="Quick tip" isSelected={false} onSelect={() => {}} />
              <TipPreset amount={12} label="Great service" isSelected={true} onSelect={() => {}} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PaymentMethod
                method="venmo"
                title="Venmo"
                subtitle="@demo-user"
                icon="venmo"
                isSelected={false}
                onSelect={() => {}}
              />
              <PaymentMethod
                method="stripe"
                title="Card"
                subtitle="Instant payment"
                icon="card"
                isSelected={true}
                onSelect={() => {}}
              />
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="rounded-xl p-4">
                <h4 className="font-medium text-text-primary mb-2">Glass Card</h4>
                <p className="text-text-secondary text-sm">Standard glass morphism card with backdrop blur and border.</p>
              </GlassCard>
              <GlassCard className="rounded-xl p-4 hover:border-accent-start transition-all duration-200 cursor-pointer">
                <h4 className="font-medium text-text-primary mb-2">Interactive Card</h4>
                <p className="text-text-secondary text-sm">Glass card with hover effects and accent border.</p>
              </GlassCard>
            </div>
          </div>
        </GlassCard>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/">
            <button className="text-accent-start hover:text-accent-end transition-colors focus-visible">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
