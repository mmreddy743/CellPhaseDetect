// src/components/sections/Features.jsx
import React from 'react';
import { BarChart2, Users, LineChart } from 'lucide-react';  // Fixed import
import FeatureCard from '../common/FeatureCard';

const Features = () => {
    const features = [
        {
            icon: BarChart2,
            title: 'Multi-Channel Processing',
            description: 'Handle multiple fluorescence channels with advanced Z-stack processing capabilities'
        },
        {
            icon: Users,
            title: 'Automated Analysis',
            description: 'Intelligent segmentation and measurement of cellular features'
        },
        {
            icon: BarChart2,
            title: 'Quantitative Results',
            description: 'Comprehensive measurements and visualizations for analysis'
        }
    ];

    return (
        <section id="features" className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base text-red-700 font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold text-gray-900 sm:text-4xl">
                        Advanced Analysis Capabilities
                    </p>
                </div>
                <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;