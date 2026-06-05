// Add this to your Layout.jsx or create a new ChatLayout.jsx
import React, { useState, useEffect } from 'react';
import ChatWidget from '../Dashboard/ChatWidget';

const ChatLayout = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (isChatOpen) {
        if (window.innerWidth >= 1024) {
          setChatWidth(450);
        } else if (window.innerWidth >= 768) {
          setChatWidth(350);
        } else {
          setChatWidth(0);
        }
      } else {
        setChatWidth(0);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isChatOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content that shifts when chat opens */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ marginRight: `${chatWidth}px` }}
      >
        {children}
      </div>
      
      {/* Chat Widget that pushes content */}
      <ChatWidget 
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        isPushingContent={true}
      />
    </div>
  );
};

export default ChatLayout;