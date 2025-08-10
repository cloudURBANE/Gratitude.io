import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, QrCode, BarChart3, Settings, ArrowRight } from "lucide-react";

export default function WelcomeDashboard() {
  const { user } = useAuth();

  const nextSteps = [
    {
      title: "Create Your Tip Profile",
      description: "Set up your professional tip page with payment methods",
      icon: DollarSign,
      action: () => window.location.href = '/profile-setup',
      button: "Create Profile"
    },
    {
      title: "Generate QR Code", 
      description: "Get your QR code for instant tip collection",
      icon: QrCode,
      action: () => window.location.href = '/qr',
      button: "Get QR Code"
    },
    {
      title: "View Analytics",
      description: "Track your earnings and optimize your tips",
      icon: BarChart3,
      action: () => window.location.href = '/analytics',
      button: "View Stats"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to TipVault, {(user as any)?.firstName || 'Friend'}! 🎉
          </h1>
          <p className="text-xl text-gray-300">
            You're all set! Let's get your tip page earning money.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">$0</h3>
              <p className="text-gray-400">Total Tips</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6 text-center">
              <QrCode className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-gray-400">QR Scans</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-teal-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-gray-400">Customers</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Get Started in 3 Steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg">
                          <StepIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{step.title}</CardTitle>
                          <span className="text-sm text-purple-400">Step {index + 1}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 mb-4">{step.description}</p>
                      <Button 
                        onClick={step.action}
                        className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                      >
                        {step.button}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white font-medium">{(user as any)?.email || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Plan</p>
                  <p className="text-white font-medium capitalize">{(user as any)?.plan || 'Free'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Member Since</p>
                  <p className="text-white font-medium">
                    {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'Today'}
                  </p>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/settings'}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Account Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}