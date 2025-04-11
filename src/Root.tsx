import "./index.css";
import { Composition } from "remotion";
import { Sms, myCompSchema3 } from "./Sms";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
      id="Sms"
      component={Sms}
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