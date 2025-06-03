import React from 'react';

interface ClickableMessageTextProps {
  content: string;
  theme: {
    isDark: boolean;
    mainDarkColor: string;
    mainLightColor: string;
    highlightColor: string;
  };
  onFeatureClick: (featureText: string) => void;
  isLoading?: boolean;
}

const ClickableMessageText: React.FC<ClickableMessageTextProps> = ({
  content,
  theme,
  onFeatureClick,
  isLoading = false
}) => {
  const clickableFeatures = [
    "booking appointments",
    "browsing our products", 
    "contacting us"
  ];

  const handleFeatureClick = (feature: string) => {
    if (!isLoading) {
      onFeatureClick(`I need help with ${feature}`);
    }
  };

  const renderTextWithBubbles = (text: string) => {
    let result = text;
    let parts: (string | JSX.Element)[] = [text];

    clickableFeatures.forEach((feature, index) => {
      const newParts: (string | JSX.Element)[] = [];
      
      parts.forEach((part, partIndex) => {
        if (typeof part === 'string') {
          const segments = part.split(feature);
          
          for (let i = 0; i < segments.length; i++) {
            if (i > 0) {
              newParts.push(
                <span
                  key={`${index}-${partIndex}-${i}`}
                  onClick={() => handleFeatureClick(feature)}
                  className="feature-bubble-inline"
                  style={{
                    background: `linear-gradient(135deg, ${theme.mainLightColor}, ${theme.mainDarkColor})`,
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-block',
                    margin: '0 2px',
                    fontSize: '0.9em',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.7 : 1,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    border: 'none',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  {feature}
                </span>
              );
            }
            
            if (segments[i]) {
              newParts.push(segments[i]);
            }
          }
        } else {
          newParts.push(part);
        }
      });
      
      parts = newParts;
    });

    return parts;
  };

  return (
    <span>
      {renderTextWithBubbles(content)}
    </span>
  );
};

// Demo component
const ClickableMessageDemo = () => {
  const [clickedFeature, setClickedFeature] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const demoTheme = {
    isDark: false,
    mainDarkColor: '#EFC715',
    mainLightColor: '#5155CD',
    highlightColor: '#000000'
  };

  const handleFeatureClick = (featureText: string) => {
    setClickedFeature(featureText);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const sampleMessages = [
    "I'm here to help with booking appointments, browsing our products, and answering questions about our knowledge base.",
    "I can help you with booking appointments.",
    "Feel free to ask about booking appointments or browsing our products!"
  ];

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      <h2 className="text-lg font-bold text-center">Clickable Message Text Demo</h2>
      
      {sampleMessages.map((message, index) => (
        <div key={index} className="bg-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Sample Message {index + 1}:</div>
          <ClickableMessageText
            content={message}
            theme={demoTheme}
            onFeatureClick={handleFeatureClick}
            isLoading={isLoading}
          />
        </div>
      ))}
      
      {clickedFeature && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>You clicked:</strong> {clickedFeature}
          </p>
          {isLoading && (
            <p className="text-xs text-blue-600 mt-1">Processing...</p>
          )}
        </div>
      )}
      
      <div className="mt-4 bg-gray-800 text-white p-3 rounded-lg">
        <div className="text-sm text-gray-300 mb-2">Dark Theme:</div>
        <ClickableMessageText
          content="I'm here to help with booking appointments, browsing our products, and contacting us."
          theme={{
            ...demoTheme,
            isDark: true,
            mainDarkColor: '#FFD700',
            mainLightColor: '#6366F1'
          }}
          onFeatureClick={(text) => console.log('Dark theme click:', text)}
        />
      </div>
    </div>
  );
};

export default ClickableMessageDemo;