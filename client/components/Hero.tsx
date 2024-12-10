import React from 'react';

interface HeroProps {
  className?: string;  
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  return (
    <div className={className}>
      <h1>Welcome to the Event</h1>
    </div>
  );
};

export default Hero;
