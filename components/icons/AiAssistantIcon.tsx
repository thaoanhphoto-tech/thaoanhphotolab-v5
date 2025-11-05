import React from 'react';

export const AiAssistantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {/* Stylized face profile */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 18s-3.09-2.917-3.09-6.5C12.16 7.917 14.25 6 15.25 6" />
        {/* Hair */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.25 6s-2 1-2 4s2 4 2 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.25 8s-1.5 1-1.5 3s1.5 3 1.5 3" />
        {/* AI sparkle element */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9l.5-1.5L20 7l-1.5-.5L18 5l-.5 1.5L16 7l1.5.5L18 9z" />
    </svg>
);