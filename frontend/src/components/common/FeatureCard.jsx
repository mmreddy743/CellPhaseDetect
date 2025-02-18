// src/components/common/FeatureCard.jsx
import React from 'react';

const FeatureCard = ({ icon: Icon, title, description }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-red-700 rounded-md p-3">
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-500">{description}</p>
        </div>
    );
};

export default FeatureCard;