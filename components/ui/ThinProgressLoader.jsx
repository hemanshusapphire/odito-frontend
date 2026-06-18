import React, { useEffect, useRef } from 'react';

const ThinProgressLoader = ({ progress, isVisible }) => {
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div className="w-full h-[3px] bg-gray-800/50 rounded-full overflow-hidden">
      <div
        ref={progressBarRef}
        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
      </div>
    </div>
  );
};

export default ThinProgressLoader;
