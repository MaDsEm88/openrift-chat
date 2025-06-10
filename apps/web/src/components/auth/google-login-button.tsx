// src/components/auth/google-login-button.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SocialIcon } from "@/components/social-icons";
import LoadingSpinner from "@/components/loading-spinner";
import { client } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

interface GoogleLoginButtonProps {
  mode?: "login" | "connect";
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onClick?: () => void;
  errorCallbackURL?: string;
}

export const GoogleLoginButton = ({
  mode = "login",
  onSuccess,
  onError,
  onClick,
}: GoogleLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      onClick?.();

      console.log("🚀 Starting Google authentication...");

      // Get the base URL dynamically
      const baseUrl = window.location.origin;
      
      // Use root as default callback to handle auth state
      const callbackURL = `${baseUrl}/`;
      const errorCallbackURL = `${baseUrl}/?error=auth_failed`;

      console.log("📍 Auth URLs:", { callbackURL, errorCallbackURL });

      // Use the better-auth signIn method with proper error handling
      const result = await client.signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL,
      });

      console.log("✅ Google auth initiated:", result);

      // Don't redirect immediately - let the OAuth flow handle it
      // The callback will redirect back to your app
      
      onSuccess?.();
    } catch (error) {
      console.error("❌ Google authentication error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      // Show toast error
      toast.error("Authentication Failed", {
        description: errorMessage,
      });

      // Navigate to error state
      router.navigate({
        to: "/",
        search: { error: "auth_failed" },
        replace: true
      });

      onError?.(error instanceof Error ? error : new Error("Authentication failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = mode === "login" ? "Sign in with Google" : "Connect Google Calendar";

  return (
    <div className="relative group">
      {/* Gradient border background */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/60 via-transparent to-orange-400/60 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full h-full bg-[#2b2a30] rounded-xl" />
      </div>
      
      {/* Static subtle border gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/20 via-transparent to-orange-400/20 p-[1px]">
        <div className="w-full h-full bg-[#2b2a30] rounded-xl" />
      </div>

      <button
        className="relative w-full h-12 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden bg-[#2b2a30] text-white/80 border-0 hover:bg-white/5 backdrop-blur-sm z-10"
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        {/* Inner shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <SocialIcon href="#" platform="google" />
        )}
        <span className="text-sm font-medium relative z-10">
          {isLoading ? "Signing in..." : buttonText}
        </span>
      </button>
    </div>
  );
};