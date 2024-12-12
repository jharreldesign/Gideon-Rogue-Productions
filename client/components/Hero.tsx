import React from 'react';
import Image from 'next/image';

import style from '../styles/Hero.module.css'; // Import the CSS module

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  return (
    <div className={`${className} ${style.heroContainer}`}>
      <div className={style.heroImageContainer}>
        <Image
          src="/images/header-image.jpg" // Image from the public folder
          alt="Hero Image"
          layout="fill" // Ensures the image covers the entire container
          objectFit="cover" // Makes the image fill the container without distorting
          className={style.heroImage}
        />
      </div>
    </div>
  );
};

export default Hero;
