import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const TypingIndicator: React.FC = () => {
    const frame = useCurrentFrame();
    // Add a size scaling factor to adjust overall size
    const sizeFactor = 1.2; // Default is 1.0, increase or decrease to scale everything

    // Animation for dots in left-to-middle-to-right sequence
    const getAnimationStyle = (dotIndex: number) => {
        // Create a wave animation that goes from left to right through middle
        const animationCycle = 30; // Reduced from 60 to make animation 2x speed
        const dotDelay = 10; // Reduced from 20 to make animation 2x speed

        // Re-map the dotIndex to create left -> middle -> right pattern (0->0, 1->1, 2->2)
        // We're keeping the same order but timing the animation differently

        // Calculate the position in the animation cycle for this dot
        const adjustedFrame = (frame - dotIndex * dotDelay) % animationCycle;

        // Active duration for each dot
        const activeDuration = 12; // Reduced from 25 to make animation 2x speed
        const dotActive = adjustedFrame >= 0 && adjustedFrame < activeDuration;

        // Calculate scale and opacity for active dots
        const scale = dotActive
            ? interpolate(
                adjustedFrame,
                [0, activeDuration / 2, activeDuration],
                [0.8, 1.2, 0.8],
                {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                }
            )
            : 0.8;

        const opacity = dotActive
            ? interpolate(
                adjustedFrame,
                [0, activeDuration / 2, activeDuration],
                [0.3, 1, 0.3],
                {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                }
            )
            : 0.3;

        return {
            opacity,
            transform: `scale(${scale})`,
        };
    };

    return (
        <div className="flex justify-start w-full">
            <div
                className="bg-[#e8e9eb] text-gray-800 rounded-full px-6 py-5"
                style={{
                    position: 'relative',
                    maxWidth: `${150 * sizeFactor}px`,
                    padding: `${32 * sizeFactor}px ${40 * sizeFactor}px`
                }}
            >
                <div className={`flex space-x-2`}>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: `${16 * sizeFactor}px`,
                                height: `${16 * sizeFactor}px`,
                                borderRadius: '50%',
                                backgroundColor: '#888',
                                ...getAnimationStyle(i),
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
