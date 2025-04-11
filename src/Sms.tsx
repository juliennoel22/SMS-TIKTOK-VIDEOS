import { AbsoluteFill, Sequence } from "remotion";
import React from "react";
import { z } from "zod";
import { Background } from "./components/background";
import { Bubble } from "./components/bubble";
import { TypingIndicator } from "./components/TypingIndicator";
import conversation from "../public/conversations/conv-test.json"; // Import JSON file
import { useCurrentFrame, interpolate } from "remotion";
import reference from "../public/Stock/references/test-reference-imessage.png"; // Import image

export const myCompSchema3 = z.object({
  titleText: z.string(),
});

const items2 = conversation.messages.map((msg) => ({
  message: msg.text,
  isSender: msg.sender === "user",
}));

const messageDuration = 60; // Duration for each message animation

// Calculate which message is currently appearing based on frame
const getCurrentMessageIndex = (frame: number) => {
  return Math.min(Math.floor(frame / messageDuration), items2.length - 1);
};

const translateAndFadeAnimation = (index: number, frame: number) => {
  // Calculate how many frames the transition should take (0.5s at 30fps = 15 frames)
  const transitionDuration = 5;
  const pushUpDelay = 3; // Frames to wait after bubble appears before pushing up previous bubbles
  const pushUpDuration = 8; // How long the push-up animation takes
  const pushUpAmount = 22; // How far to push up in pixels

  // Get current appearing message
  const currentMessageIndex = getCurrentMessageIndex(frame);

  // Calculate progress with ease effect instead of instant appearance
  const progress = interpolate(
    frame,
    [index * messageDuration, index * messageDuration + transitionDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => {
        // This implements an ease timing function similar to CSS ease
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
    }
  );

  // Base transform - slide in from below
  let yOffset = (1 - progress) * 40;

  // Add push-up effect for bubbles above the current message
  if (index < currentMessageIndex) {
    // Calculate when push-up should start (after current bubble has appeared)
    const pushUpStart = currentMessageIndex * messageDuration + pushUpDelay;
    const pushUpEnd = pushUpStart + pushUpDuration;

    // Calculate push-up progress
    const pushUpProgress = interpolate(
      frame,
      [pushUpStart, pushUpEnd],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (t) => Math.sin((t * Math.PI) / 2), // Smooth start
      }
    );

    // Apply the push-up effect
    yOffset -= pushUpProgress * pushUpAmount;
  }

  const transformValue = `translateY(${yOffset}px)`;

  return {
    transform: transformValue,
    opacity: progress, // Fade in as it slides
  };
};

const isDebugMode = false; // Set to true for debug mode, false for production

export const Sms: React.FC<z.infer<typeof myCompSchema3>> = ({ titleText }) => {
  const frame = useCurrentFrame();

  // Calculate current message index
  const currentMessageIndex = getCurrentMessageIndex(frame);

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
      {/* <AbsoluteFill>
        <Sequence name="Image reférence">
          <img
            src={reference}
            alt="background"
            style={{
              width: "100%",
              position: "absolute",
              opacity: 0,
              zIndex: 9999, // Ultra high z-index
            }}
          />
        </Sequence>
      </AbsoluteFill> */}
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
                name = {`message-${index+1}`}
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