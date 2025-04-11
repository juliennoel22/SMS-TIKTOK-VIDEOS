import "./index.css";
import { Composition } from "remotion";
import { Sms, myCompSchema3 } from "./Sms";
import { Test } from "./Test";
import conversation from "../public/conversations/conv1.json"; // Import conversation data

// Calculate total duration based on the number of messages and messageDuration
const messageDuration = 80; // Match the value in Sms.tsx
const typingDuration = 80; // Match the value in Sms.tsx
const totalMessages = conversation.messages.length;
const totalDuration = totalMessages * messageDuration + typingDuration;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Sms"
        component={Sms}
        durationInFrames={totalDuration} // Dynamically calculated duration
        fps={30}
        width={1080}
        height={1920}
        schema={myCompSchema3}
        defaultProps={{
          titleText: "Welcome to Remotion",
        }}
      />
      <Composition
        id="Test"
        component={Test}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={myCompSchema3}
        defaultProps={{
          titleText: "Welcome to Remotion",
        }}
      />
    </>
  );
};