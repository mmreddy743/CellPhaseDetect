// src/components/ui/Card.jsx
import React from 'react';

const Card = ({
    children,
    className = '',
    hoverable = false
}) => {
    return (
        <div className={`
      bg-white rounded-lg shadow-sm 
      ${hoverable ? 'hover:shadow-md transition-shadow' : ''} 
      ${className}
    `}>
            {children}
        </div>
    );
};

export default Card;
