import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Background } from "./components/background";
import { Bubble } from "./components/bubble";
import { TypingIndicator } from "./components/TypingIndicator";
import conversation from "../public/conversations/conversation-1751025199000.json"; // Import JSON file
import { useCurrentFrame, interpolate } from "remotion";
// import reference from "../public/Stock/references/test-reference-imessage.png"; // Import image
import reference from "../public/Stock/references/input bar full.png"; // Import image
import { TypingInput } from "./components/TypingInput";

export const myCompSchema3 = z.object({
  titleText: z.string(),
  userGender: z.enum(["male", "female"]).default("male"),
  botGender: z.enum(["male", "female"]).default("male"),
  run: z.boolean().default(true), // Ajout du paramètre run
});

const items2 = conversation.messages.map((msg) => ({
  message: msg.text,
  isSender: msg.sender === "user",
}));

export const messageDuration = 60; // Duration for each message animation
export const initialDelay = 120; // 2-second delay before showing any messages (30fps × 2s)
const transitionBuffer = 10; // Buffer frames to prevent animation overlapping

// Consistent typing speed parameters
const framesPerChar = 3; // How many frames each character takes to type (lower = faster typing)
const typingDelayFrames = 2; // Delay between key presses (in frames)
const typingIndicatorDuration = 30; // Duration to show typing indicator before message appears

const darkTheme = true; // Toggle dark theme
const showTypingInputBar = true; // Toggle typing/message input bar visibility

const enableAudioGeneration = false; // Toggle to enable/disable audio generation


// Calculate which message is currently appearing based on frame
const getCurrentMessageIndex = (frame: number) => {
  const adjustedFrame = frame - initialDelay; // Adjust for initial delay
  if (adjustedFrame < 0) return -1; // Before any messages appear
  return Math.min(Math.floor(adjustedFrame / messageDuration), items2.length - 1);
};

// Calculate how long a message will take to type based on its length
const calculateTypingDuration = (messageLength: number) => {
  return messageLength * framesPerChar;
};

// Improve the animation function to prevent flickering
const translateAndFadeAnimation = (index: number, frame: number, isTypingIndicator: boolean = false) => {
  const adjustedFrame = frame - initialDelay; // Adjust for initial delay
  const transitionDuration = 8; // Increased for smoother transitions
  const pushUpDelay = 3;
  const pushUpDuration = 12; // Increased for smoother pushing
  const pushUpAmount = isTypingIndicator ? 0 : 22; // Smaller push-up for typing indicator

  const currentMessageIndex = getCurrentMessageIndex(frame);

  // Smoother progress calculation with cubic bezier easing
  const progress = interpolate(
    adjustedFrame, // Use adjusted frame
    isTypingIndicator
      ? [index * messageDuration - typingIndicatorDuration, index * messageDuration]
      : [index * messageDuration, index * messageDuration + transitionDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => {
        // Cubic bezier easing to make animations smoother
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
    }
  );

  // Apply smoother offset animation
  let yOffset = (1 - progress) * 40;

  // Improve push-up animation to prevent flickering
  if ((index < currentMessageIndex || isTypingIndicator) && currentMessageIndex >= 0) {
    const pushUpStart = (currentMessageIndex * messageDuration) + pushUpDelay;
    const pushUpEnd = pushUpStart + pushUpDuration;

    const pushUpProgress = interpolate(
      adjustedFrame, // Use adjusted frame for consistent timing
      [pushUpStart, pushUpEnd],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (t) => Math.sin((t * Math.PI) / 2), // Sine easing for smoother movement
      }
    );

    yOffset -= pushUpProgress * pushUpAmount;
  }

  // Round transform values to prevent subpixel rendering issues that cause flickering
  const transformValue = `translateY(${Math.round(yOffset)}px)`;

  return {
    transform: transformValue,
    opacity: progress,
    willChange: 'transform, opacity', // Hint for browser optimization
  };
};

const isDebugMode = true; // Set to true for debug mode, false for production

// Fonction utilitaire pour obtenir le chemin audio simple
function getAudioPath(sender: "user" | "bot", gender: "male" | "female", idx: number) {
  // Utilise le chemin direct sans paramètre anti-cache
  return `/audio/audio_${sender}_${idx}.wav`;
}


export const Sms: React.FC<
  z.infer<typeof myCompSchema3>
> = ({ titleText, userGender = "male", botGender = "male", run = true }) => {
  const frame = useCurrentFrame();
  const [typingText, setTypingText] = useState<string>("");
  const prevTypingLengthRef = useRef<number>(0);
  const prevFrameRef = useRef<number>(-1);
  const clearedTextFrameRef = useRef<number>(-1); // Track when we last cleared the text

  // Calculate current message index
  const currentMessageIndex = getCurrentMessageIndex(frame);

  // Calculate message send/receive sounds
  const messageSounds = React.useMemo(() => {
    const sounds: { src: string; frame: number; type: string }[] = [];

    // Add message send/receive sounds
    items2.forEach((message, index) => {
      const audioFile = message.isSender
        ? staticFile("sfx/imessage-send.mp3")
        : staticFile("sfx/imessage-recieve.mp3");

      sounds.push({
        src: audioFile,
        frame: index * messageDuration + initialDelay, // Add initial delay
        type: "message"
      });
    });

    return sounds;
  }, []);

  // Calculate all typing sounds in advance
  const typingSounds = React.useMemo(() => {
    if (!showTypingInputBar) return []; // No typing sounds if input bar is hidden
    const sounds: { src: string; frame: number; type: string }[] = [];

    // Process each message that needs typing animation
    for (let i = 0; i < items2.length - 1; i++) {
      // Only process if the next message is from the user (which needs typing)
      if (items2[i + 1].isSender) {
        const message = items2[i + 1].message;
        const messageStartFrame = (i + 1) * messageDuration + initialDelay; // Add initial delay

        // Calculate typing duration based on message length
        const typingDurationFrames = calculateTypingDuration(message.length);
        const typingStartFrame = messageStartFrame - typingDurationFrames - 5; // Start with enough time to finish typing

        // Add a sound for each character with delay
        for (let charIndex = 0; charIndex < message.length; charIndex++) {
          const isSpace = message[charIndex] === ' ';
          const charFrame = typingStartFrame + (charIndex * framesPerChar);

          sounds.push({
            src: isSpace
              ? staticFile("sfx/spacebar_typing_sfx.mp3")
              : staticFile("sfx/letter_typing_sfx.mp3"),
            frame: Math.floor(charFrame),
            type: "typing"
          });
        }
      }
    }

    return sounds;
  }, [showTypingInputBar]);

  // Génère la liste des chemins audio pour chaque message
  const allAudioPaths = conversation.messages.map((msg, idx) => {
    // Utilise la fonction getAudioPath qui pointe vers les .wav
    return getAudioPath(msg.sender as "user" | "bot", msg.sender === "bot" ? botGender : userGender, idx);
  });

  // Ajoute les sons générés (gTTS -> WAV) pour chaque message (user et bot) uniquement si run et enableAudioGeneration sont true
  const voiceAudios = React.useMemo(() => {
    if (!run || !enableAudioGeneration) return []; // Check enableAudioGeneration
    const audios: { src: string; frame: number }[] = [];
    items2.forEach((item, idx) => {
      audios.push({
        src: allAudioPaths[idx], // Utilise les chemins .wav
        frame: idx * messageDuration + initialDelay,
      });
    });
    return audios;
    // Les dépendances sont correctes, allAudioPaths est recalculé si besoin
  }, [userGender, botGender, run, enableAudioGeneration, allAudioPaths]);

  // Combined sounds (both message and typing)
  const allSounds = [...messageSounds, ...typingSounds];

  // Calculate if typing indicator should be shown
  const shouldShowTypingIndicator = () => {
    for (let i = 0; i < items2.length; i++) {
      // Only show typing for non-user (bot) messages
      if (!items2[i].isSender) {
        // Calculate when this message will appear
        const messageStartFrame = i * messageDuration + initialDelay; // Add initial delay
        // Show typing indicator before the message appears
        const typingStartFrame = messageStartFrame - typingIndicatorDuration;

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

  const handleSendMessage = (message: string) => {
    // Add the new message to the conversation
    items2.push({ message, isSender: true });
  };

  // Determine if we should be typing a message
  useEffect(() => {
    // Skip if frame hasn't changed to prevent unnecessary processing
    if (frame === prevFrameRef.current) return;
    prevFrameRef.current = frame;

    const messageToType = (currentMessageIndex < items2.length - 1 && items2[currentMessageIndex + 1].isSender)
      ? items2[currentMessageIndex + 1].message
      : "";

    if (messageToType) {
      // Calculate typing timing based on fixed frames per character
      const messageStartFrame = (currentMessageIndex + 1) * messageDuration + initialDelay; // Add initial delay
      const typingDurationFrames = calculateTypingDuration(messageToType.length);
      const typingStartFrame = messageStartFrame - typingDurationFrames - 5; // Start with enough time to finish typing
      const typingEndFrame = messageStartFrame - 5; // End typing 5 frames before message appears

      if (frame >= typingStartFrame && frame < typingEndFrame) {
        // Only start typing if we've moved past any previous clear operation
        if (frame > clearedTextFrameRef.current + 5) {
          // Calculate how much of the message to show based on elapsed frames
          const elapsedFrames = frame - typingStartFrame;
          const charactersToShow = Math.floor(elapsedFrames / framesPerChar);
          const newText = messageToType.substring(0, charactersToShow);

          // Update refs and state
          prevTypingLengthRef.current = charactersToShow;

          // Only update the typing text if it's actually changed
          if (typingText !== newText) {
            setTypingText(newText);
          }
        }
      } else if (frame >= typingEndFrame && typingText !== "") {
        // Only clear once and remember when we did it
        prevTypingLengthRef.current = 0;
        clearedTextFrameRef.current = frame;
        setTypingText("");
      }
    } else if (typingText !== "") {
      // If there's no message to type but we still have text, clear it
      setTypingText("");
      clearedTextFrameRef.current = frame;
    }
  }, [frame, currentMessageIndex, typingText]);

  // Improved memoization to prevent re-renders
  const memoizedTypingInput = React.useMemo(() => (
    <TypingInput
      onSend={handleSendMessage}
      darkTheme={darkTheme}
      typingText={typingText}
      isTyping={typingText.length > 0}
      emptyState={typingText === ""}
    />
  ), [typingText, darkTheme, handleSendMessage]); // Include handleSendMessage in dependency array

  return (
    <AbsoluteFill>
      {/* Add hook as static text */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          right: "50%",
          width: "100%",
          transform: "translate(-50%, -50%)", // Center the container
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0px", // Space between rectangles
          zIndex: 1000,
          // backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
        }}
      >
        {conversation.hook.match(/.{1,30}(?:\s|$)|\S+/g)?.map((line, index) => (
          <div
            key={index}
            style={{
              fontSize: "68px",
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "rgba(0, 0, 0, 1)", // Black background
              borderRadius: "20px", // Rounded corners
              padding: "2px 35px", // Padding inside the rectangle
              textAlign: "center",
              display: "inline-block", // Shrink to fit content
            }}
          >
            {line}
          </div>
        ))}
      </div>
      {/* Play ALL audio files at their precalculated frames */}
      {allSounds.map((audio, index) => (
        <Sequence key={`audio-${index}-${audio.frame}`} from={audio.frame} durationInFrames={10}>
          <Audio
            src={audio.src}
            volume={audio.type === "typing" ? 0.4 : 1}
          />
        </Sequence>
      ))}
      {/* Ajoute les audios gTTS -> WAV pour tous les messages si activé */}
      {voiceAudios.map((audio, idx) => (
        <Sequence key={`voice-audio-${idx}`} from={audio.frame} durationInFrames={100}>
          {/* Ajoute crossOrigin pour éviter les soucis CORS en dev */}
          <Audio src={audio.src} volume={1} crossOrigin="anonymous" />
        </Sequence>
      ))}

      {/* Apply consistent styling to prevent layout shifts */}
      <AbsoluteFill style={{ willChange: 'contents' }}>
        <Sequence name="Image reférence">
          <img
            src={reference}
            alt="background"
            style={{
              width: "100%",
              position: "absolute",
              bottom: 0,
              opacity: 0.0,
              zIndex: 9999, // Ultra high z-index
            }}
          />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill>
        <Sequence from={0}>
          <Background darkTheme={darkTheme} />
        </Sequence>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: darkTheme ? "#000" : "transparent", // Adjust background for dark theme
          paddingBottom: "0px", // Remove extra padding to align with input
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingBottom: "100px", // Adjust bottom margin to raise the sequence
          }}
        >
          {/* Messages with typing indicator placed dynamically */}
          {items2.map((item, index) => {
            const isNextSenderSame =
              index < items2.length - 1 && items2[index].isSender === items2[index + 1].isSender;

            // Only consider next message "from same sender" if it's already visible
            // based on the current frame
            const isNextMessageVisible = frame >= (index + 1) * messageDuration;
            const shouldHideCrochet = isNextSenderSame && isNextMessageVisible;

            const gap = isNextSenderSame ? "3px" : "30px"; // Smaller gap for same sender, larger for different senders

            // Get message component
            const messageComponent = (
              <Sequence
                from={index * messageDuration + initialDelay} // Add initial delay
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
                  }}
                >
                  <Bubble
                    message={item.message}
                    isSender={item.isSender}
                    darkTheme={darkTheme}
                    isNextMessageFromSameSender={shouldHideCrochet}
                  />
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
                    <TypingIndicator darkTheme={darkTheme} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {showTypingInputBar && (
          <div
            style={{
              position: "relative",
              bottom: '50px',
              width: "100%",
              padding: "0 24px",
            }}
          >
            {memoizedTypingInput}
          </div>
        )}
      </AbsoluteFill>

      {/* CTA displayed at the end of the video */}
      <Sequence from={items2.length * messageDuration + initialDelay - 60}>
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            right: "50%",
            width: "100%",
            transform: "translate(-50%, -50%)", // Center the container
            padding: "0 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0px", // Space between rectangles
            zIndex: 1000,
            // backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
          }}
        >
          {conversation.CTA.match(/.{1,25}(?:\s|$)|\S+/g)?.map((line, index) => (
            <div
              key={index}
              style={{
                fontSize: "68px",
                fontWeight: "bold",
                color: "#fff",
                backgroundColor: "rgba(255, 0, 0, 1)", // Black background
                borderRadius: "20px", // Rounded corners
                padding: "2px 35px", // Padding inside the rectangle
                textAlign: "center",
                display: "inline-block", // Shrink to fit content
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};