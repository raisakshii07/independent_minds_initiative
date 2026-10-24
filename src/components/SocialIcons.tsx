import React from 'react';

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/voiceofindependentminds',
  youtube: 'https://youtube.com/@independentmindsintitiative?si=KI1qKEagouIZYRx8',
  whatsapp: 'https://whatsapp.com/channel/0029VbEecer0lwglLOTOtp1v',
};

interface IconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function InstagramIcon({ className = '', size = 18, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function YouTubeIcon({ className = '', size = 18, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = '', size = 18, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M12.031 2C6.516 2 2.031 6.484 2.031 12c0 1.808.484 3.513 1.328 5.016L2 22l5.141-1.328A9.972 9.972 0 0 0 12.03 22c5.516 0 10-4.484 10-10s-4.484-10-10-10zm5.836 14.195c-.242.68-1.211 1.258-1.992 1.422-.531.117-1.226.211-3.555-.758-2.984-1.242-4.914-4.281-5.062-4.484-.141-.195-1.219-1.625-1.219-3.102 0-1.477.773-2.203 1.047-2.5.281-.297.609-.375.812-.375.203 0 .406.008.578.016.188.008.438-.07.688.531.25.602.859 2.094.938 2.25.078.156.125.344.031.547-.094.195-.141.312-.281.484-.141.164-.297.367-.422.492-.141.141-.289.297-.125.578.164.281.727 1.195 1.562 1.938 1.07.961 1.969 1.258 2.25 1.406.281.141.445.125.609-.062.164-.195.703-.82.891-1.102.188-.281.375-.234.625-.141.25.094 1.578.742 1.852.875.273.133.453.195.516.312.062.117.062.68-.18 1.36z" />
    </svg>
  );
}
