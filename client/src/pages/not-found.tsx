import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md mx-4 bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-300 mb-6">
            The page you're looking for doesn't exist.
          </p>

          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
