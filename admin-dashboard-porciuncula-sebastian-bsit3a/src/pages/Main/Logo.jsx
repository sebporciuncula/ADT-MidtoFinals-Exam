// Logo.js
import React from 'react';

const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="50"
      height="50"
      fill="#2196F3"
    >
      {/* Circle with a simple 'M' in the middle */}
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" fill="#2196F3" />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="30"
        fontFamily="Arial, sans-serif"
        fill="#fff"
      >
        M
      </text>
    </svg>
  );
};

export default Logo;
