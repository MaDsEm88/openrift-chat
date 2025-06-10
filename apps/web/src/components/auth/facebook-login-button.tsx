import { useState } from "react";
import { client } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";


interface FacebookLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function FacebookLoginButton({ onSuccess, onError }: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      await client.signIn.social({
        provider: "facebook",
        callbackURL: "/account",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Facebook login error:", error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleFacebookLogin}
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
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Continue with Facebook
        </div>
      )}
    </Button>
  );
}
