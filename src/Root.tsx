import "./index.css";
import { Composition } from "remotion";
import { Sms, myCompSchema3, messageDuration, initialDelay } from "./Sms";
import { Test } from "./Test";
import conversation from "../public/conversations/conversation-main.json"; // Import conversation data

// Updated: 1751054295575
const typingDuration = 80; // Match the value in Sms.tsx
const totalMessages = conversation.messages.length;
// Utilise les valeurs importées pour la durée totale
// const totalDuration = totalMessages * messageDuration + typingDuration + 30 / 2 * totalMessages + initialDelay * 2;
const totalDuration = totalMessages * messageDuration + initialDelay - messageDuration/2 + 30;

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
          userGender: "male", // ou "female"
          botGender: conversation.gender === "female" ? "female" : "male",
          run: true, // Added the required 'run' property
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