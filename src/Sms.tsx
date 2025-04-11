import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Background } from "./components/background";
import { Bubble } from "./components/bubble";
import { TypingIndicator } from "./components/TypingIndicator";
import conversation from "../public/conversations/conv1.json"; // Import JSON file
import { useCurrentFrame, interpolate } from "remotion";
import reference from "../public/Stock/references/test-reference-imessage.png"; // Import image

export const myCompSchema3 = z.object({
  titleText: z.string(),
});

const items2 = conversation.messages.map((msg) => ({
  message: msg.text,
  isSender: msg.sender === "user",
}));

const messageDuration = 80; // Duration for each message animation
const typingDuration = 80;

// Calculate which message is currently appearing based on frame
const getCurrentMessageIndex = (frame: number) => {
  return Math.min(Math.floor(frame / messageDuration), items2.length - 1);
};

const translateAndFadeAnimation = (index: number, frame: number, isTypingIndicator: boolean = false) => {
  const transitionDuration = 5;
  const pushUpDelay = 3;
  const pushUpDuration = 8;
  const pushUpAmount = isTypingIndicator ? 0 : 22; // Smaller push-up for typing indicator

  const currentMessageIndex = getCurrentMessageIndex(frame);

  const progress = interpolate(
    frame,
    isTypingIndicator
      ? [index * messageDuration - typingDuration, index * messageDuration]
      : [index * messageDuration, index * messageDuration + transitionDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    }
  );

  let yOffset = (1 - progress) * 40;

  if (index < currentMessageIndex || isTypingIndicator) {
    const pushUpStart = currentMessageIndex * messageDuration + pushUpDelay;
    const pushUpEnd = pushUpStart + pushUpDuration;

    const pushUpProgress = interpolate(
      frame,
      [pushUpStart, pushUpEnd],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (t) => Math.sin((t * Math.PI) / 2),
      }
    );

    yOffset -= pushUpProgress * pushUpAmount;
  }

  const transformValue = `translateY(${yOffset}px)`;

  return {
    transform: transformValue,
    opacity: progress,
  };
};

const isDebugMode = false; // Set to true for debug mode, false for production

export const Sms: React.FC<z.infer<typeof myCompSchema3>> = ({ titleText }) => {
  const frame = useCurrentFrame();
  const [audioQueue, setAudioQueue] = useState<{ src: string; frame: number }[]>([]);

  // Calculate current message index
  const currentMessageIndex = getCurrentMessageIndex(frame);

  // Queue the appropriate audio when a new bubble appears
  useEffect(() => {
    if (currentMessageIndex >= 0 && currentMessageIndex < items2.length) {
      const currentMessage = items2[currentMessageIndex];
      const audioFile = currentMessage.isSender
        ? staticFile("sfx/imessage-send.mp3")
        : staticFile("sfx/imessage-recieve.mp3");

      setAudioQueue((prevQueue) => [
        ...prevQueue,
        { src: audioFile, frame: currentMessageIndex * messageDuration },
      ]);
    }
  }, [currentMessageIndex]);

  // Calculate if typing indicator should be shown
  const typingDuration = 30; // Duration to show typing indicator before message appears
  const shouldShowTypingIndicator = () => {
    for (let i = 0; i < items2.length; i++) {
      // Only show typing for non-user (bot) messages
      if (!items2[i].isSender) {
        // Calculate when this message will appear
        const messageStartFrame = i * messageDuration;
        // Show typing indicator before the message appears
        const typingStartFrame = messageStartFrame - typingDuration;

        // Check if current frame is within typing indicator window
        if (frame >= typingStartFrame && frame < messageStartFrame) {
          return i; // Return the index of the upcoming message
        }
      }
    }
    return -1; // No typing indicator should be shown
  };

  const upcomingMessageIndex = shouldShowTypingIndicator();
  const showTypingIndicator = upcomingMessageIndex !== -1;

  return (
    <AbsoluteFill>
      {/* Play queued audio files at the correct frame */}
      {audioQueue.map((audio, index) => (
        <Sequence key={`audio-${index}`} from={audio.frame}>
          <Audio src={audio.src} />
        </Sequence>
      ))}

      <AbsoluteFill>
        <Sequence name="Image reférence">
          <img
            src={reference}
            alt="background"
            style={{
              width: "100%",
              position: "absolute",
              opacity: 0.0,
              zIndex: 9999, // Ultra high z-index
            }}
          />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill>
        <Sequence from={0}>
          <Background />
        </Sequence>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: isDebugMode ? "green" : "transparent", // Green background in debug mode
          paddingBottom: "150px", // Adjust bottom margin to raise the sequence
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            backgroundColor: isDebugMode ? "red" : "transparent", // Red background in debug mode
          }}
        >
          {/* Messages with typing indicator placed dynamically */}
          {items2.map((item, index) => {
            const isNextSenderSame =
              index < items2.length - 1 && items2[index].isSender === items2[index + 1].isSender;
            const gap = isNextSenderSame ? "3px" : "30px"; // Smaller gap for same sender, larger for different senders

            // Get message component
            const messageComponent = (
              <Sequence
                from={index * messageDuration}
                key={`message-${index}`}
                name={`message-${index + 1}`}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  padding: `0 20px ${gap} 20px`, // Apply dynamic gap
                }}
              >
                <div
                  style={{
                    ...translateAndFadeAnimation(index, frame),
                    backgroundColor: isDebugMode ? "yellow" : "transparent", // Yellow background in debug mode
                  }}
                >
                  <Bubble message={item.message} isSender={item.isSender} />
                </div>
              </Sequence>
            );

            // Decide if typing indicator should appear after this message
            const showTypingAfterThisMessage =
              showTypingIndicator &&
              index === upcomingMessageIndex - 1;

            return (
              <React.Fragment key={`fragment-${index}`}>
                {messageComponent}

                {/* Show typing indicator after this message if it's the last visible message before a bot message */}
                {showTypingAfterThisMessage && (
                  <div
                    style={{
                      ...translateAndFadeAnimation(upcomingMessageIndex, frame, true),
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      padding: "0 20px 3px 20px",
                      marginBottom: "10px",
                    }}
                  >
                    <TypingIndicator />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};