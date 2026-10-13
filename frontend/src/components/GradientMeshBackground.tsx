import React, { useEffect, useRef } from 'react';

export const GradientMeshBackground: React.FC = () => {
  const meshRef = useRef<HTMLDivElement>(null);

  // Performance optimization: Pause or reduce animation when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!meshRef.current) return;
      if (document.hidden) {
        meshRef.current.style.display = 'none';
      } else {
        meshRef.current.style.display = 'block';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div ref={meshRef} className="gradient-mesh" aria-hidden="true">
      <div className="gradient-mesh-orb1" />
      <div className="gradient-mesh-orb2" />
      <div className="gradient-mesh-orb3" />
    </div>
  );
};
