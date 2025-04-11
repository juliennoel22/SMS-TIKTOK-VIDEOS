import React from 'react';
import crochet1 from '../../public/images/crochet.svg';
import crochet2 from '../../public/images/crochet.svg';

export const Bubble: React.FC<{ message: string; isSender: boolean }> = ({ message, isSender }) => {
    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} w-full 
        bg-green- 500
        `}>
            <div
                className={`relative rounded-[40px] px-8 py-5 text-5xl text-left ${isSender
                    ? 'text-white'
                    : 'text-gray-800'
                    }`}
                style={{
                    position: 'relative',
                    maxWidth: '750px',
                    background: isSender
                        ? 'linear-gradient(to bottom, #4facff, #0c83fa)'
                        : '#e8e9eb',
                    fontFamily: 'SF Pro Display, sans-serif', // Apply the sansFrancisco font
                    fontWeight: 500,
                }}
            >
                {message}
            </div>
            {/* <img
                src={isSender ? crochet1 : crochet2}
                alt=""
                className={`scale-5 absolute top-[-174px] ${isSender ? 'right-[-359px]' : 'left-auto right-160'}`}
                style={{ transform: !isSender ? 'scaleX(-1)' : 'none' }}
            /> */}
        </div>
    );
};