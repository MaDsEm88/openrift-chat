// src/hooks/use-mobile.ts
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize state to false for SSR, will be updated on client.
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // This effect runs only on the client.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler to update state based on media query
    const handleMediaChange = () => {
      setIsMobile(mql.matches);
    };

    // Set initial state on client mount
    handleMediaChange();

    // Listen for changes
    mql.addEventListener("change", handleMediaChange);

    // Cleanup listener on unmount
    return () => {
      mql.removeEventListener("change", handleMediaChange);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return isMobile;
}
