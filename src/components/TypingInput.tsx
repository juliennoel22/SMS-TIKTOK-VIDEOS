import React, { useState } from "react";

export const TypingInput: React.FC<{ onSend: (message: string) => void; darkTheme: boolean }> = ({
    onSend,
    darkTheme,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSendClick = () => {
        if (inputValue.trim()) {
            setIsTyping(true);
            let typedMessage = "";
            const letters = inputValue.split("");
            let index = 0;

            const typingInterval = setInterval(() => {
                if (index < letters.length) {
                    typedMessage += letters[index];
                    setInputValue(typedMessage); // Animate typing in the input field
                    index++;
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                    onSend(typedMessage); // Send the fully typed message
                    setInputValue(""); // Clear the input field
                }
            }, 100); // Adjust typing speed here
        }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "30px 45px", // Multiplied by 3
                backgroundColor: darkTheme ? "#222" : "#f5f5f5",
                borderTop: `3px solid ${darkTheme ? "#444" : "#ddd"}`, // Multiplied by 3
            }}
        >
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={isTyping} // Disable input while typing animation is active
                placeholder="Type a message..."
                style={{
                    flex: 1,
                    padding: "24px 36px", // Multiplied by 3
                    borderRadius: "45px", // Multiplied by 3
                    border: `3px solid ${darkTheme ? "#444" : "#ccc"}`, // Multiplied by 3
                    backgroundColor: darkTheme ? "#333" : "#fff",
                    color: darkTheme ? "#fff" : "#000",
                    outline: "none",
                    fontSize: "42px", // Multiplied by 3
                }}
            />
            <button
                onClick={handleSendClick}
                disabled={!inputValue.trim() || isTyping} // Disable button while typing animation is active
                style={{
                    marginLeft: "24px", // Multiplied by 3
                    padding: "24px 48px", // Multiplied by 3
                    borderRadius: "45px", // Multiplied by 3
                    border: "none",
                    backgroundColor: inputValue.trim() ? "#4facff" : "#ccc",
                    color: "#fff",
                    cursor: inputValue.trim() ? "pointer" : "not-allowed",
                    fontSize: "42px", // Multiplied by 3
                    transition: "background-color 0.3s",
                }}
            >
                Send
            </button>
        </div>
    );
};
