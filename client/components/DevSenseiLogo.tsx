import React from "react";

interface DevSenseiLogoProps {
  size?: number;
  className?: string;
}

export function DevSenseiLogo({ size = 36, className = "" }: DevSenseiLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left bracket < */}
      <polyline 
        points="12,10 4,18 12,26" 
        stroke="#d4d4d8" 
        strokeWidth="3" 
        strokeLinecap="square" 
        strokeLinejoin="miter" 
      />
      {/* Right bracket > */}
      <polyline 
        points="24,10 32,18 24,26" 
        stroke="#d4d4d8" 
        strokeWidth="3" 
        strokeLinecap="square" 
        strokeLinejoin="miter" 
      />
      
      {/* Geometric Flame (red) */}
      {/* Left small flame */}
      <polygon points="13,16 17,24 9,24" fill="#dc2626" />
      {/* Right small flame */}
      <polygon points="23,15 27,24 19,24" fill="#dc2626" />
      {/* Center tall flame (drawn last so it overlaps the side flames) */}
      <polygon points="18,10 23,24 13,24" fill="#dc2626" />
    </svg>
  );
}
