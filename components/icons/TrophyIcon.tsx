import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3 3 0 0012 9.75 3 3 0 007.5 14.25v4.5m4.5-9.75v-3.75a3 3 0 10-6 0v3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18.75h18" />
  </svg>
);