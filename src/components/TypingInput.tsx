import React, { useState, useRef, useEffect, memo } from "react";
import micro from "../../public/images/micro.png";
import arrow_up from "../../public/images/arrow_up.png";

interface TypingInputProps {
    onSend: (message: string) => void;
    darkTheme: boolean;
    typingText?: string; // New prop to receive the text being typed
    isTyping?: boolean;  // New prop to indicate if typing is in progress
    emptyState?: boolean; // New prop to explicitly track empty state
}

export const TypingInput = memo(({
    onSend,
    darkTheme,
    typingText = "",
    isTyping = false,
    emptyState = false
}: TypingInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const textMeasureRef = useRef<HTMLSpanElement>(null);
    const prevTypingTextRef = useRef<string>("");

    // If typing is in progress, use the provided typing text
    const displayValue = isTyping ? typingText : inputValue;

    // Update cursor position when text changes
    useEffect(() => {
        if (isTyping && typingText !== prevTypingTextRef.current && textMeasureRef.current) {
            prevTypingTextRef.current = typingText;
            textMeasureRef.current.textContent = typingText;
            setCursorPosition(textMeasureRef.current.offsetWidth);
        }
    }, [typingText, isTyping]);

    // Stabilize the placeholder rendering when empty
    const stableEmptyClass = emptyState && !isTyping ? "stable-empty" : "";

    const handleSend = () => {
        if (displayValue.trim()) {
            onSend(displayValue);
            setInputValue("");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only update internal state if not in automatic typing mode
        if (!isTyping) {
            setInputValue(e.target.value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isTyping) {
            handleSend();
        }
    };

    return (
        <div
            style={{
                display: "flex",
                padding: `32px 24px`,
                backgroundColor: darkTheme ? "#000" : "#ffffff",
                gap: `32px`,
                position: "relative",
                bottom: `32px`,
                width: "100%",
                boxSizing: "border-box",
                paddingBottom: `40px`, // Added space at the bottom
            }}
        >
            <div
                id="plus_button"
                style={{
                    borderRadius: "50%",
                    backgroundColor: darkTheme ? "#1f1f21" : "#ccc",
                    width: `80px`,
                    height: `80px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: `64px`,
                    color: darkTheme ? "#aaaaaa" : "#666",
                    paddingBottom: `4px`,
                }}
            >
                <p style={{ margin: 0 }}>+</p>
            </div>

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: `200px`,
                    border: `2px solid ${darkTheme ? "#444" : "#ccc"}`,
                    backgroundColor: darkTheme ? "#000" : "#fff",
                    padding: `10px 32px`,
                    paddingRight: `12px`,
                }}
            >
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={displayValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        placeholder="iMessage"
                        className={stableEmptyClass}
                        style={{
                            width: '100%',
                            border: "none",
                            outline: "none",
                            backgroundColor: "transparent",
                            color: darkTheme ? "#fff" : "#000",
                            fontSize: `36px`,
                        }}
                    />

                    {/* Hidden element to measure text width */}
                    <span
                        ref={textMeasureRef}
                        style={{
                            visibility: 'hidden',
                            position: 'absolute',
                            fontSize: '36px',
                            fontFamily: 'inherit',
                            whiteSpace: 'pre',
                            top: 0,
                            left: 0,
                        }}
                    />

                    {isTyping && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                left: `${cursorPosition}px`, // Use calculated position
                                width: '3px',
                                height: '36px',
                                backgroundColor: '#4facff', // Blue cursor
                                animation: 'blink 1s step-end infinite',
                            }}
                        />
                    )}
                    <style>
                        {`
                        @keyframes blink {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0; }
                        }
                        .stable-empty::placeholder {
                            opacity: 1 !important;
                        }
                        `}
                    </style>
                </div>

                {/* Send button (shown when typing with content) */}
                {(isTyping && displayValue.trim()) && (
                    <button
                        onClick={handleSend}
                        style={{
                            marginLeft: `20px`,
                            padding: `12px`,
                            border: "none",
                            width: `60px`,
                            height: `60px`,
                            borderRadius: `50%`,
                            backgroundColor: "#4facff",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: `32px`,
                            transition: "background-color 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src={arrow_up}
                            alt="Send"
                            style={{
                                width: "100%",
                                height: "100%",
                                filter: "invert(1)",
                            }}
                        />
                    </button>
                )}

                {/* Microphone button (shown when not typing or when no content) */}
                {(!isTyping || !displayValue.trim()) && (
                    <button
                        style={{
                            marginLeft: `20px`,
                            padding: `12px`,
                            border: "none",
                            width: `60px`,
                            height: `60px`,
                            // borderRadius: `50%`,
                            // backgroundColor: darkTheme ? "#1f1f21" : "#eaeaea",
                            cursor: "pointer",
                            fontSize: `32px`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src={micro}
                            alt="Microphone"
                            style={{
                                width: "80%",
                                height: "100%",
                                filter: darkTheme ? "invert(0.7)" : "invert(0.3)",
                            }}
                        />
                    </button>
                )}
            </div>
        </div>
    );
});
