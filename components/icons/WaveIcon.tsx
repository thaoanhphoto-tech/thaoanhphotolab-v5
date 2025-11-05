import React from 'react';

export const WaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8Q8 4, 12 8 T 20 8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12Q8 8, 12 12 T 20 12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16Q8 12, 12 16 T 20 16" />
    </svg>
);