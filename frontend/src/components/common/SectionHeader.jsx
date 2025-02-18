// src/components/common/SectionHeader.jsx
import React from 'react';

const SectionHeader = ({ title, subtitle }) => {
    return (
        <div className="text-center mb-12">
            <h2 className="text-base text-red-700 font-semibold tracking-wide uppercase">{title}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold text-gray-900 sm:text-4xl">
                {subtitle}
            </p>
        </div>
    );
};

export default SectionHeader;