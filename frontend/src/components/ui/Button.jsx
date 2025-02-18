// src/components/ui/Button.jsx
import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    onClick,
    type = 'button'
}) => {
    const baseStyles = "rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-red-700 text-white hover:bg-red-800 focus:ring-red-500",
        secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-red-500"
    };

    const sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;