import React from 'react';

export default function MiniLoader({ size = '20px' }) {
    return (
        <div style={{
            display: 'inline-block',
            width: size,
            height: size,
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderTop: '2px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
