import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [imageLoadErrors, setImageLoadErrors] = useState({});

    // For debugging - log when component mounts
    useEffect(() => {
        console.log('ImageSlider mounted');
    }, []);

    // Sample images array - IMPORTANT: Update these paths to match your project structure
    const images = [
        {
            // Using relative paths from the public directory
            src: './images/Screenshot 2025-02-11 112556.png',
            alt: 'Cell Analysis Example 1',
            caption: 'Cell segmentation results'
        },
        {
            src: './images/Screenshot 2025-02-11 112606.png',
            alt: 'Cell Analysis Example 2',
            caption: 'Cell segmentation results'
        },
        {
            src: './images/Screenshot 2025-02-11 112617.png',
            alt: 'Cell Analysis Example 3',
            caption: 'Z-stack visualization'
        },
        {
            // Using relative paths from the public directory
            src: './images/Screenshot 2025-02-11 112626.png',
            alt: 'Cell Analysis Example 4',
            caption: 'Cell segmentation results'
        },
        {
            src: './images/Screenshot 2025-02-11 112830.png',
            alt: 'Cell Analysis Example 5',
            caption: 'Cell segmentation results'
        },
        {
            src: './images/Screenshot 2025-02-11 112840.png',
            alt: 'Cell Analysis Example 6',
            caption: 'Cell segmentation results'
        },
        {
            // Using relative paths from the public directory
            src: './images/Screenshot 2025-02-11 112848.png',
            alt: 'Cell Analysis Example 7',
            caption: 'Cell segmentation results'
        },
        {
            src: './images/Screenshot 2025-02-11 112857.png',
            alt: 'Cell Analysis Example 8',
            caption: 'Cell segmentation results'
        }
    ];

    const handleImageError = (index) => {
        setImageLoadErrors(prev => ({
            ...prev,
            [index]: true
        }));
        console.error(`Failed to load image at index ${index}: ${images[index].src}`);
    };

    const nextSlide = () => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const prevSlide = () => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setCurrentIndex((prevIndex) =>
                prevIndex === 0 ? images.length - 1 : prevIndex - 1
            );
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentIndex]);

    // Auto-advance slides (only if we have more than one image)
    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    // If no images, show a message
    if (images.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 text-center">
                <p className="text-red-500">No images available to display</p>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Debug info - remove in production */}
            <div className="mb-2 text-sm text-gray-500">
                <p>Current index: {currentIndex}</p>
                <p>Total images: {images.length}</p>
                <p>Current image path: {images[currentIndex].src}</p>
            </div>

            {/* Main slider container */}
            <div className="relative h-96 overflow-hidden rounded-lg shadow-lg bg-gray-100">
                {/* Images container */}
                <div
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 relative">
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(index)}
                                style={{
                                    opacity: imageLoadErrors[index] ? 0.3 : 1
                                }}
                            />
                            {imageLoadErrors[index] && (
                                <div className="absolute inset-0 flex items-center justify-center text-red-500">
                                    Image failed to load
                                </div>
                            )}
                            {/* Caption */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                                <p className="text-sm md:text-base">{image.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation buttons - only show if we have more than one image */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                            disabled={isTransitioning}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                            disabled={isTransitioning}
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Dots indicator */}
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageSlider;