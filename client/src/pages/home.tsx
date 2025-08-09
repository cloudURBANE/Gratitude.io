import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Heart, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-xl">TipVault</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/business" className="text-gray-600 hover:text-gray-900 transition-colors">
              For Business
            </Link>
          </div>
          
          <Link href="/u/demo">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Demo
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-16"
        >
          {/* Hero Section */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Modern Tipping
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                A beautiful, professional platform that makes tipping effortless for customers and more rewarding for service workers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/u/demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  <Zap size={20} className="mr-2" />
                  See It in Action
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8">
                  Start Free Today
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 rounded-2xl p-8"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">300%</div>
                <div className="text-gray-600">Average tip increase</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600">Customer satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">10k+</div>
                <div className="text-gray-600">Happy service workers</div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Zap size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Instant & Secure</h3>
              <p className="text-gray-600 leading-relaxed">
                One-tap tipping with bank-level security. Customers love the speed, workers love the reliability.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <Heart size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Customer-First</h3>
              <p className="text-gray-600 leading-relaxed">
                Elegant design that customers enjoy using. Smart suggestions that feel helpful, never pushy.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                <Shield size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Fair & Transparent</h3>
              <p className="text-gray-600 leading-relaxed">
                Clear pricing, no hidden fees. Workers keep more of what they earn with our low 2.9% processing fee.
              </p>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">
                  1
                </div>
                <h4 className="font-semibold text-gray-900">Create Your Page</h4>
                <p className="text-gray-600">
                  Set up a beautiful tip page in under 2 minutes. Add your photo, role, and payment methods.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">
                  2
                </div>
                <h4 className="font-semibold text-gray-900">Share Your QR Code</h4>
                <p className="text-gray-600">
                  Display your QR code at your workplace or share your link. Customers scan and tip instantly.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">
                  3
                </div>
                <h4 className="font-semibold text-gray-900">Earn More Tips</h4>
                <p className="text-gray-600">
                  Watch your earnings grow with smart optimization and delighted customers who tip more often.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white space-y-6"
          >
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-blue-100 text-lg max-w-md mx-auto">
              Join thousands of service workers already earning more with TipVault.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                  Start Free Today
                </Button>
              </Link>
              
              <Link href="/u/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                  Try Demo First
                </Button>
              </Link>
            </div>
            
            <p className="text-blue-200 text-sm">
              No setup fees • Cancel anytime • 2.9% processing fee
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}