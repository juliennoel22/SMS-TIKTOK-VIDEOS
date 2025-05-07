import React, { useRef, useEffect, useState } from 'react';
import crochet1 from '../../public/images/crochet.png';
import crochet2 from '../../public/images/crochet2.png';
import crochet2_white_mode from '../../public/images/crochet2_white_mode.png';

export const Bubble: React.FC<{
    message: string;
    isSender: boolean;
    darkTheme: boolean;
    isNextMessageFromSameSender?: boolean;
}> = ({
    message,
    isSender,
    darkTheme,
    isNextMessageFromSameSender = false, // Default to false (show crochet)
}) => {
        const bubbleRef = useRef<HTMLDivElement>(null);
        const [bubbleHeight, setBubbleHeight] = useState(0);

        useEffect(() => {
            if (bubbleRef.current) {
                setBubbleHeight(bubbleRef.current.offsetHeight);
            }
        }, [message]); // Recalculate when message changes

        return (
            <div
                className={`flex ${isSender ? "justify-end" : "justify-start"} w-full`}
                style={{
                    position: 'relative',
                }}
            >
                {!isNextMessageFromSameSender && (
                    <img
                        src={isSender
                            ? crochet1
                            : darkTheme
                                ? crochet2
                                : crochet2_white_mode}
                        alt=""
                        style={{
                            position: "absolute",
                            top: bubbleHeight > -10 ? `${bubbleHeight - 40}px` : "45px",
                            left: isSender ? "auto" : "-5px",
                            right: isSender ? "-8px" : "auto",
                            width: "50px",
                            height: "50px",
                            transform: isSender ? "none" : "scaleX(-1)", // Flip the image if not sender
                        }}
                    />
                )}
                <div
                    ref={bubbleRef}
                    className={`relative rounded-[40px] px-8 py-5 text-5xl text-left ${isSender
                        ? "text-white"
                        : darkTheme
                            ? "text-gray-300"
                            : "text-gray-800"
                        }`}
                    style={{
                        position: "relative",
                        maxWidth: "750px",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        background: isSender
                            ? "#0c83fa"
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