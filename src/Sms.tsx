import { Sequence } from "remotion";
import { z } from "zod";
import { Background } from "./components/background";

export const myCompSchema3 = z.object({
  titleText: z.string(),
});

export const Sms: React.FC<z.infer<typeof myCompSchema3>> = ({ titleText }) => {
  return (
    <Sequence from={0}>
      <Background />
    </Sequence>
  );
};
