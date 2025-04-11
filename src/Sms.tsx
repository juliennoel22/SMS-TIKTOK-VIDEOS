import { AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { Background } from "./components/background";
import { Bubble } from "./components/bubble";
import conversation from "../public/conversations/conv-test.json"; // Import JSON file
import { useCurrentFrame, interpolate } from "remotion";
import reference from "../public/Stock/references/test-reference-imessage.png"; // Import image

export const myCompSchema3 = z.object({
  titleText: z.string(),
});

const items = [
  { message: 'Julien', isSender: true },
  { message: 'CEO', isSender: false },
  { message: 'Callisthénie', isSender: true },
  { message: 'Callisthénie 2', isSender: true },
  { message: 'test message méga long de fou on va voir ce que ca fonne si j\'aicris ca ', isSender: false },
  { message: 'test', isSender: false },
  { message: 'test', isSender: false },
  { message: 'test', isSender: false },
];

const items2 = conversation.messages.map((msg) => ({
  message: msg.text,
  isSender: msg.sender === "user",
}));

const messageDuration = 60; // Duration for each message animation

const translateAndFadeAnimation = (index: number, frame: number) => {
  const progress = interpolate(frame, [index * messageDuration, index * messageDuration + 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const transformValue = `translateY(${(1 - progress) * 40}px)`; // Slide in from 40px below
  return {
    transform: transformValue,
    opacity: progress, // Fade in as it slides
  };
};

const isDebugMode = false; // Set to true for debug mode, false for production

export const Sms: React.FC<z.infer<typeof myCompSchema3>> = ({ titleText }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>

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
          {items2.map((item, index) => {
            const isSameSender =
              index > 0 && items2[index].isSender === items2[index - 1].isSender;
            const gap = isSameSender ? "30px" : "3px"; // Smaller gap for same sender, larger for different senders

            return (
              <Sequence
                from={index * messageDuration}
                key={index}
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
                    transition: "transform 0.5s ease, opacity 0.5s ease",
                  }}
                >
                  <Bubble message={item.message} isSender={item.isSender} />
                </div>
              </Sequence>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* <AbsoluteFill>
        <Sequence name="Image reférence">
          <img
            src={reference}
            alt="background"
            style={{
              width: "100%",
              // height: "100%",
              position: "absolute",
              opacity: 0.0,
              zIndex: 9999, // Ultra high z-index
            }}
          />
        </Sequence>
      </AbsoluteFill> */}
    </AbsoluteFill>
  );
};