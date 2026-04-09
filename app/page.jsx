// Code snippet to add localStorage persistence for chat messages
import { useEffect, useState } from 'react';

const ChatComponent = () => {
    const [messages, setMessages] = useState([]);

    // Load messages from localStorage when component mounts
    useEffect(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    // Your existing chat message handling code goes here

    return (
        <div>
            {/* Render chat messages */}
            {messages.map((message, index) => (<p key={index}>{message}</p>))}
        </div>
    );
};

export default ChatComponent;
