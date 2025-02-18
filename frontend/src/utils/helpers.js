// src/utils/helpers.js
// File handling utilities
export const validateImageFile = (file) => {
    if (!file) return false;

    const validTypes = ['image/tiff', 'image/tif'];
    return validTypes.includes(file.type);
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Data formatting utilities
export const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

export const formatNumber = (value) => {
    return new Intl.NumberFormat().format(value);
};

// Date formatting
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};

// Analysis helpers
export const calculateMetrics = (data) => {
    return {
        totalCells: data.length,
        averageSize: data.reduce((acc, cell) => acc + cell.size, 0) / data.length,
        density: data.length / data.area,
        viability: data.filter(cell => cell.viable).length / data.length
    };
};

// Error handling
export const handleError = (error) => {
    console.error('Error:', error);
    return {
        message: error.message || 'An unexpected error occurred',
        code: error.code || 'UNKNOWN_ERROR'
    };
};