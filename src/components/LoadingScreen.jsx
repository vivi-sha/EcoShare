import React from 'react';

const LoadingScreen = ({ message = "Waking up servers..." }) => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-logo">🌿</div>
                <div className="loading-text text-gradient">EcoShare</div>
                <div className="loading-bar-container">
                    <div className="loading-bar-fill"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
