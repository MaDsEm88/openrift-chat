//components/ui/spotlight.tsx
import React from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export const Spotlight = ({ className, fill }: SpotlightProps) => {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[120%] w-[200%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
      style={{ maxWidth: '100vw', overflow: 'hidden' }}
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="2500"
          ry="400"
          transform="matrix(-0.622377 -0.768943 -0.368943 0.622377 2831.88 2691.09)"
          fill="url(#spotlightGradient)"
        ></ellipse>
      </g>
      <defs>
        <radialGradient id="spotlightGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill || "white"} stopOpacity="0.15"/>
          <stop offset="70%" stopColor={fill || "white"} stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#161719" stopOpacity="0"/>
        </radialGradient>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feGaussianBlur
            stdDeviation="200"
            result="effect1_foregroundBlur_1065_8"
          ></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
};