import React, { useState } from 'react';
import { I } from '../data/illustrations';

const ILL_IMAGES = {
  desktop: '/assets/ill-desktop.jpg',
  laptop: '/assets/ill-laptop.jpg',
  mouse: '/assets/ill-mouse.jpg',
  keyboard: '/assets/ill-keyboard.jpg',
  shop: '/assets/ill-shop.jpg'
};

export default function Illustration({ name, className = 'ill-img', alt = '' }) {
  const [hasError, setHasError] = useState(false);
  const svgContent = I[name] || '';

  if (ILL_IMAGES[name] && !hasError) {
    return (
      <img
        src={ILL_IMAGES[name]}
        alt={alt || name}
        className={className}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  if (!svgContent) return null;

  return (
    <svg
      viewBox="0 0 120 90"
      role="img"
      aria-label={alt || name}
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
