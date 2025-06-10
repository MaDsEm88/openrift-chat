// components/auth/login-form.tsx
import { useState, useEffect } from 'react';
import { useSearch, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { GithubLoginButton } from "@/components/auth/github-login-button";
import { Spotlight } from "@/components/ui/spotlight";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-client";
import { cn } from "@/lib/utils";


interface LoginFormProps {
  callbackUrl?: string;
}

// Glassmorphic card background component
const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const search = useSearch({ strict: false }) as { error?: string };
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentImageLoaded, setCurrentImageLoaded] = useState(false);

   // Track when the image is loaded
  useEffect(() => {
    setCurrentImageLoaded(false);
    const img = new Image();
    img.src = "/rift-logo.png";
    img.onload = () => setCurrentImageLoaded(true);
    img.onerror = () => {
      console.warn("Failed to load MiloSignin.png image");
      setCurrentImageLoaded(true);
    };
  }, []);


  // Check for error in URL params
  useEffect(() => {
    if (search?.error) {
      let message = "Authentication failed. Please try again.";
      
      switch (search.error) {
        case 'auth_failed':
          message = "Authentication failed. Please try again.";
          break;
        case 'unable_to_create_user':
          message = "Unable to create user account. Please try again.";
          break;
        case 'callback_error':
          message = "There was an error during authentication. Please try again.";
          break;
        case 'access_denied':
          message = "Access was denied. Please try again.";
          break;
        default:
          message = "An unexpected error occurred. Please try again.";
      }
      
      setErrorMessage(message);
      toast.error("Authentication Failed", {
        description: message,
      });

      // Clear the error from URL after showing it
      setTimeout(() => {
        router.navigate({
          to: "/",
          search: {},
          replace: true
        });
      }, 100);
    }
  }, [search?.error, router]);

  // Handle successful authentication
  useEffect(() => {
    if (session?.user && !sessionLoading && isAuthenticating) {
      console.log('Authentication successful, user:', session.user);
      setErrorMessage("");
      setIsAuthenticating(false);
      
      toast.success("Welcome!", {
        description: `Signed in as ${session.user.name || session.user.email}`,
      });

      // Navigate to callback URL or dashboard
      const redirectUrl = callbackUrl !== "/" ? callbackUrl : "/dashboard";
      router.navigate({
        to: redirectUrl,
        replace: true
      });
    }
  }, [session, sessionLoading, isAuthenticating, callbackUrl, router]);

  const handleAuthStart = () => {
    console.log('Authentication starting...');
    setIsAuthenticating(true);
    setErrorMessage("");
  };

  const handleAuthSuccess = () => {
    console.log('Authentication process completed');
    // Don't set isAuthenticating to false here - let the session effect handle it
  };

  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error);
    setIsAuthenticating(false);
    
    const message = error.message || "An unknown error occurred during authentication.";
    setErrorMessage(message);
    
    toast.error("Authentication Failed", {
      description: message,
    });
  };

  // Don't show the form if user is already authenticated
  if (session?.user && !sessionLoading) {
    return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#1b1c1e] to-[#161719] overflow-hidden">
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full p-8">
          <div className="w-full max-w-sm p-8 text-center">
            <p className="text-white mb-4">
              You are already signed in as {session.user.name || session.user.email}
            </p>
            <Button 
              onClick={() => router.navigate({ to: "/dashboard" })}
              className="w-full bg-white text-gray-900 hover:bg-gray-100"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="relative w-full h-fit bg-[#161719] antialiased md:items-center md:justify-center overflow-hidden">
          <Spotlight
        className="-top-20 left-20 md:-top-20 md:left-30"
        fill="white"
      />
 
     
     

      

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full p-8">
        <div className="w-full max-w-md p-8 space-y-6">
          <div className="flex items-center justify-center mb-2">
            {currentImageLoaded ? (
              <img
                src="/rift-logo.png"
                alt="Milo Logo"
                className="w-40 h-40 object-cover opacity-80"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-700 animate-pulse rounded-full" />
            )}
          </div>

        {/* Login Form */}
        <div className="w-full max-w-sm p-2">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r dark:from-white  via-gray-300  to-gray-400 py-4 font-manrope_1">Welcome Back</h2>
              <p className="text-sm text-[#7e7b76] font-manrope_1 max-w-full mx-auto lg:mx-0">
              Sign in to continue to your account
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="w-full p-3 bg-red-500/10 rounded-lg border border-red-500/20 mb-4">
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Authentication Status */}
            {isAuthenticating && (
              <div className="w-full p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-4">
                <p className="text-blue-300 text-sm">
                  Authenticating... Please wait.
                </p>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-4">
              {/* Google Login Button with custom styling */}
              <div className="w-full">
                <GoogleLoginButton
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                  onClick={handleAuthStart}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
               
              </div>

              {/* GitHub Login Button with custom styling */}
              <div className="w-full">
                <GithubLoginButton
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                  onClick={handleAuthStart}
                />
              </div>
            </div>

          

            {/* Session Loading */}
            {sessionLoading && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Checking authentication status...
                </p>
              </div>
            )}
          </div>
        </div>

       </div>
      </div>
    </div>
  );
}