import React from 'react';
import crochet1 from '../../public/images/crochet.svg';
import crochet2 from '../../public/images/crochet.svg';

export const Bubble: React.FC<{ message: string; isSender: boolean; darkTheme: boolean }> = ({
    message,
    isSender,
    darkTheme,
}) => {
    return (
        <div
            className={`flex ${isSender ? "justify-end" : "justify-start"} w-full`}
        >
            <div
                className={`relative rounded-[40px] px-8 py-5 text-5xl text-left ${isSender
                    ? "text-white"
                    : darkTheme
                        ? "text-gray-300"
                        : "text-gray-800"
                    }`}
                style={{
                    position: "relative",
                    maxWidth: "750px",
                    background: isSender
                        ? darkTheme
                            ? "#0c83fa" // Uniform background for sender in dark theme
                            : "linear-gradient(to bottom, #4facff, #0c83fa)"
                        : darkTheme
                            ? "#222"
                            : "#e8e9eb",
                    fontFamily: "SF Pro Display, sans-serif",
                    fontWeight: 500,
                }}
            >
                {message}
            </div>
        </div>
    );
};