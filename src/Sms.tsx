import { AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { Background } from "./components/background";
import { Bubble } from "./components/bubble";
import conversation from "../public/conversations/conv-test.json"; // Import JSON file

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

const translateAnimation = (index: number, progress: number) => {
  const transformValue = `translateY(${(1 - progress) * index * -40}px)`; // Dynamically stack items with 40px spacing
  console.log(`Index: ${index}, Progress: ${progress}, Transform: ${transformValue}`);
  return {
    transform: transformValue,
    opacity: progress, // Fade in as it moves
  };
};

const isDebugMode = false; // Set to true for debug mode, false for production

export const Sms: React.FC<z.infer<typeof myCompSchema3>> = ({ titleText }) => {
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
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            alignItems: "flex-start",
            backgroundColor: isDebugMode ? "red" : "transparent", // Red background in debug mode
          }}
        >
          {items2.map((item, index) => (
            <Sequence
              from={index * 15}
              key={index}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                padding: "0 30px",
              }}
            >
              <div
                style={{
                  ...translateAnimation(index, 1),
                  transition: "transform 0.5s ease, opacity 0.5s ease",
                }}
              >
                <Bubble message={item.message} isSender={item.isSender} />
              </div>
            </Sequence>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};