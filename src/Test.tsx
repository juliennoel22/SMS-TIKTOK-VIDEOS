import { AbsoluteFill, Audio, staticFile } from 'remotion';
export const Test = () => {
    return (
        <AbsoluteFill>
            <Audio src={staticFile('/sfx/imessage-send.mp3')} />
        </AbsoluteFill>
    );
};