import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

export const Test = () => {
    return (
        <TransitionSeries>
            <TransitionSeries.Sequence durationInFrames={40}>
                <div style={{ backgroundColor: "#0b84f3", height: "100%", width: "100%" }}>
                    <text style={{ color: "#ffffff", fontSize: "100px" }}>A</text>
                </div>
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition
                presentation={slide({ direction: "from-top" })}
                timing={linearTiming({ durationInFrames: 30 })}
            />
            <TransitionSeries.Sequence durationInFrames={60}>
                <div style={{ backgroundColor: "pink", height: "100%", width: "100%" }}>
                    <text style={{ color: "#ffffff", fontSize: "100px" }}>B</text>
                </div>
            </TransitionSeries.Sequence>
        </TransitionSeries>
    );
};