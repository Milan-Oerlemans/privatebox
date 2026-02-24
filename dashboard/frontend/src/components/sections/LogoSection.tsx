import React from 'react';

import { Section } from '../Section';
import logo from '../../assets/logo.svg';

export const LogoSection: React.FC = () => {
  return (
    <Section className="bg-white">
      <div className="w-full h-full flex items-center justify-center p-8">
        <img 
          src={logo} 
          alt="Company Logo" 
          className="max-w-[80%] max-h-[80%] object-contain" 
        />
      </div>
    </Section>
  );
};
