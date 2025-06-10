import { useState } from "react";
import { client } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";


interface InstagramLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function InstagramLoginButton({ onSuccess, onError }: InstagramLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramLogin = async () => {
    setIsLoading(true);
    try {
      await client.signIn.social({
        provider: "instagram",
        callbackURL: "/account",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Instagram login error:", error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleInstagramLogin}
      disabled={isLoading}
      className="w-full flex cursor-pointer items-center justify-center gap-2 h-12 font-manrope_1 text-black dark:text-white md:text-black/60 md:dark-text-white/60 hover:text-black dark:hover-text-white dark:text-white/80 text-base border-black/20 dark:border-white/20 shadow-md shadow-black/10 dark:shadow-white/10 transition-colors duration-200"
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Signing in...
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Continue with Instagram
        </div>
      )}
    </Button>
  );
}
