import React from 'react';
import crochet1 from '../../public/images/crochet.svg';
import crochet2 from '../../public/images/crochet.svg';

export const Bubble: React.FC<{ message: string; isSender: boolean }> = ({ message, isSender }) => {
    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} w-full 
        bg-green- 500
        `}>
            <div
                className={`relative rounded-4xl px-6 py-4 text-5xl ${isSender
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                    }`}
                style={{ position: 'relative', maxWidth: '750px'  }}
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