// components/auth/github-login-button.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SocialIcon } from "@/components/social-icons";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearch } from "@tanstack/react-router";

interface GithubLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onClick?: () => void;
}

export const GithubLoginButton = ({ onSuccess, onError, onClick }: GithubLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearch({ strict: false });

  const handleGithubAuth = async () => {
    try {
      setIsLoading(true);
      onClick?.();

      // Get the base URL dynamically
      const baseUrl = window.location.origin;

      // Get callback URL from searchParams or use default
      const callbackPath = (searchParams as any)?.callbackUrl || "/";

      // Construct the redirect URL properly
      const redirectUrl = callbackPath.startsWith("http")
        ? callbackPath
        : `${baseUrl}${callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`}`;

      // Detect browser
      const userAgent = navigator.userAgent.toLowerCase();
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      const isFirefox = userAgent.indexOf("firefox") > -1;

      // For Safari and Firefox, use direct fetch approach
      if (isSafari || isFirefox) {
        try {
          const { data, error } = await fetch("/api/auth/sign-in/social", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: "github",
              callbackURL: redirectUrl,
              errorCallbackURL: `${baseUrl}/login?error=unable_to_create_user`,
            }),
          }).then((res) => res.json());

          if (data?.url) {
            // Use full page navigation for redirect to ensure cookies are properly handled
            window.location.href = data.url;
            return;
          }

          if (error) {
            throw new Error(`Auth request failed: ${error.message || "Unknown error"}`);
          }
        } catch (fetchError) {
          console.warn("Browser-specific auth method failed:", fetchError);

          // Fallback to direct URL approach
          const url = new URL("/api/auth/signin/github", baseUrl);
          url.searchParams.set("callbackUrl", redirectUrl);
          window.location.href = url.toString();
          return;
        }
      } else {
        // Chrome and other browsers use the library method
        await signIn.social({
          provider: "github",
          callbackURL: redirectUrl,
          errorCallbackURL: `${baseUrl}/login?error=unable_to_create_user`,
          fetchOptions: {
            onSuccess: () => {
              // Use full page navigation rather than router.push to ensure fresh page load and proper cookie handling
              window.location.href = redirectUrl;
              onSuccess?.();
            },
            onError: (ctx) => {
              console.error("Auth error details:", ctx.error);
              router.navigate({
                to: "/login",
                search: { error: "unable_to_create_user" }
              });
              onError?.(ctx.error);
            },
          },
        });
      }
    } catch (error) {
      console.error("GitHub authentication error:", error);
      onError?.(error instanceof Error ? error : new Error("Authentication failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full h-12 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group bg-[#2b2a30] text-white/80 border border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
      onClick={handleGithubAuth}
      disabled={isLoading}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <SocialIcon href="#" platform="github" />
      )}
      <span className="text-sm font-medium">
        {isLoading ? "Signing In..." : "Continue with GitHub"}
      </span>
    </Button>
  );
};