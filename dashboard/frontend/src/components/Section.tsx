import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ children, id, className = '' }) => {
  return (
    <section 
      id={id}
      className={`w-screen h-screen snap-start shrink-0 flex items-center justify-center overflow-hidden relative ${className}`}
    >
      {children}
    </section>
  );
};
