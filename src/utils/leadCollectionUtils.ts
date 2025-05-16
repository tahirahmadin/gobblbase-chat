
import { 
    detectCountryCode, 
    validatePhone, 
    createInternationalPhone 
  } from "./phoneUtils";
  import { toast } from "react-hot-toast";
  import { saveCustomerLead } from "../lib/serverActions";
  
  // Lead collection stages
  export enum LeadCollectionStage {
    NOT_COLLECTING = "not_collecting",
    COLLECTING_NAME = "collecting_name",
    COLLECTING_EMAIL = "collecting_email",
    COLLECTING_PHONE = "collecting_phone",
    COLLECTING_MESSAGE = "collecting_message",
    COMPLETE = "complete"
  }
  
  // Lead data interface
  export interface LeadData {
    name: string;
    email: string;
    phone: string;
    message: string;
  }
  
  /**
   * Extracts just the name from various name responses
   * Examples:
   * "John" → "John"
   * "My name is John" → "John"
   * "I am John" → "John"
   * "John Smith" → "John Smith"
   * "I'm John Smith" → "John Smith"
   */
  export const extractName = (userResponse: string): string => {
    // Clean up the user response
    const cleanResponse = userResponse.trim();
    
    // Common patterns for name responses
    const patterns = [
      // These are ordered from most specific to most general
      /^my name is (.*?)$/i,             // "my name is John"
      /^name is (.*?)$/i,                // "name is John"
      /^i am (.*?)$/i,                   // "I am John"
      /^i'm (.*?)$/i,                    // "I'm John"
      /^this is (.*?)$/i,                // "This is John"
      /^(.*?) is my name$/i,             // "John is my name"
      /^(.*?) here$/i,                   // "John here"
      /^you can call me (.*?)$/i,        // "You can call me John"
      /^call me (.*?)$/i,                // "Call me John"
      /^it's (.*?)$/i,                   // "It's John"
      /^it is (.*?)$/i                   // "It is John"
    ];
    
    // Try each pattern to extract the name
    for (const pattern of patterns) {
      const match = cleanResponse.match(pattern);
      if (match && match[1]) {
        return capitalizeFirstLetter(match[1].trim());
      }
    }
    
    // If no patterns match, assume the entire response is the name
    // Just ensure proper capitalization for formality
    return capitalizeFirstLetter(cleanResponse);
  };
  
  /**
   * Capitalizes the first letter of each word in a string
   */
  export const capitalizeFirstLetter = (string: string): string => {
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Email validation function
  export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Function to start lead collection
  export const startLeadCollection = (
    setMessages: any,
    setLeadCollectionStage: any,
    scrollToBottom: any
  ) => {
    // Add a message asking for the name
    const nameRequestMsg = {
      id: Date.now().toString(),
      content: "I'd be happy to connect you with our team. Could you please tell me your name?",
      timestamp: new Date(),
      sender: "agent",
    };
    
    // Important: First set the stage, THEN add the message
    setLeadCollectionStage(LeadCollectionStage.COLLECTING_NAME);
    
    setTimeout(() => {
      setMessages((prevMessages: any) => [...prevMessages, nameRequestMsg]);
      
      // Make sure to scroll down after adding the message
      setTimeout(() => {
        if (scrollToBottom) scrollToBottom();
      }, 100);
    }, 100);
  };
  
  // Function to handle lead collection responses
  export const handleLeadCollectionResponse = async (
    userMessage: string,
    leadCollectionStage: LeadCollectionStage,
    setLeadCollectionStage: (stage: LeadCollectionStage) => void,
    leadData: LeadData,
    setLeadData: (data: LeadData) => void,
    setMessages: any,
    agentId: string,
    scrollToBottom: () => void
  ): Promise<boolean> => {
    let botResponse = "";
    let updatedLeadData = { ...leadData };
    let isHandled = true;
    let countryCode = "+91"; // Default to India
    
    switch (leadCollectionStage) {
      case LeadCollectionStage.COLLECTING_NAME:
        if (userMessage.trim().length > 0) {
          // Extract just the name from the user's response
          const extractedName = extractName(userMessage.trim());
          updatedLeadData.name = extractedName;
          
          botResponse = `Thanks, ${extractedName}! Could you please share your email address?`;
          
          // Update data before adding response
          setLeadData(updatedLeadData);
          
          // Add bot response after a small delay to ensure state is updated
          setTimeout(() => {
            const emailRequestMsg = {
              id: Date.now().toString(),
              content: botResponse,
              timestamp: new Date(),
              sender: "agent",
            };
            
            setMessages((prevMessages: any) => [...prevMessages, emailRequestMsg]);
            // Move to next stage
            setLeadCollectionStage(LeadCollectionStage.COLLECTING_EMAIL);
            
            // Scroll to bottom
            setTimeout(() => scrollToBottom(), 100);
          }, 50);
        } else {
          botResponse = "I need your name to continue. Please enter your name.";
          setTimeout(() => {
            const retryMsg = {
              id: Date.now().toString(),
              content: botResponse,
              timestamp: new Date(),
              sender: "agent",
            };
            setMessages((prevMessages: any) => [...prevMessages, retryMsg]);
            setTimeout(() => scrollToBottom(), 100);
          }, 50);
        }
        break;
        
      case LeadCollectionStage.COLLECTING_EMAIL:
        if (validateEmail(userMessage.trim())) {
          updatedLeadData.email = userMessage.trim();
          botResponse = "Great! Now, could you share your phone number? (This is optional, you can type 'skip' to continue without providing a phone number)";
          
          // Update data
          setLeadData(updatedLeadData);
          
          // Add response after a small delay
          setTimeout(() => {
            const phoneRequestMsg = {
              id: Date.now().toString(),
              content: botResponse,
              timestamp: new Date(),
              sender: "agent",
            };
            
            setMessages((prevMessages: any) => [...prevMessages, phoneRequestMsg]);
            // Move to next stage
            setLeadCollectionStage(LeadCollectionStage.COLLECTING_PHONE);
            
            // Scroll to bottom
            setTimeout(() => scrollToBottom(), 100);
          }, 50);
        } else {
          botResponse = "That doesn't look like a valid email address. Please enter a valid email format (example@domain.com).";
          setTimeout(() => {
            const retryMsg = {
              id: Date.now().toString(),
              content: botResponse,
              timestamp: new Date(),
              sender: "agent",
            };
            setMessages((prevMessages: any) => [...prevMessages, retryMsg]);
            setTimeout(() => scrollToBottom(), 100);
          }, 50);
        }
        break;
        
      case LeadCollectionStage.COLLECTING_PHONE:
        if (userMessage.trim().toLowerCase() === 'skip') {
          botResponse = "No problem! How can we help you today? Please share your message or inquiry.";
          
          // Add bot response
          setTimeout(() => {
            const messageRequestMsg = {
              id: Date.now().toString(),
              content: botResponse,
              timestamp: new Date(),
              sender: "agent",
            };
            
            setMessages((prevMessages: any) => [...prevMessages, messageRequestMsg]);
            // Move to next stage
            setLeadCollectionStage(LeadCollectionStage.COLLECTING_MESSAGE);
            
            // Scroll to bottom
            setTimeout(() => scrollToBottom(), 100);
          }, 50);
        } else {
          // Detect country code from input
          const detectedCode = detectCountryCode(userMessage, countryCode);
          countryCode = detectedCode; // update country code
          
          // Validate phone
          const phoneValidation = validatePhone(userMessage, detectedCode);
          
          if (phoneValidation.isValid) {
            updatedLeadData.phone = createInternationalPhone(userMessage, detectedCode);
            botResponse = "Thanks! What can we help you with today? Please share your message or inquiry.";
            
            // Update lead data
            setLeadData(updatedLeadData);
            
            // Add bot response
            setTimeout(() => {
              const messageRequestMsg = {
                id: Date.now().toString(),
                content: botResponse,
                timestamp: new Date(),
                sender: "agent",
              };
              
              setMessages((prevMessages: any) => [...prevMessages, messageRequestMsg]);
              // Move to next stage
              setLeadCollectionStage(LeadCollectionStage.COLLECTING_MESSAGE);
              
              // Scroll to bottom
              setTimeout(() => scrollToBottom(), 100);
            }, 50);
          } else {
            botResponse = `${phoneValidation.errorMessage}. Please try again or type 'skip' to continue without providing a phone number.`;
            setTimeout(() => {
              const retryMsg = {
                id: Date.now().toString(),
                content: botResponse,
                timestamp: new Date(),
                sender: "agent",
              };
              setMessages((prevMessages: any) => [...prevMessages, retryMsg]);
              setTimeout(() => scrollToBottom(), 100);
            }, 50);
          }
        }
        break;
        
      case LeadCollectionStage.COLLECTING_MESSAGE:
        if (userMessage.trim().length > 0) {
          updatedLeadData.message = userMessage.trim();
          
          // Format the summary of collected information
          const summary = `Thank you for providing your information. Here's what I've collected:
          
  Name: ${updatedLeadData.name}
  Email: ${updatedLeadData.email}
  ${updatedLeadData.phone ? `Phone: ${updatedLeadData.phone}` : 'Phone: Not provided'}
  Message: ${updatedLeadData.message}
  
  I've sent this information to our team, and someone will be in touch with you soon!`;
          
          // Update lead data
          setLeadData(updatedLeadData);
          
          // Submit the lead data
          try {
            const response = await saveCustomerLead(agentId || "", {
              name: updatedLeadData.name,
              email: updatedLeadData.email,
              phone: updatedLeadData.phone || "",
              queryMessage: updatedLeadData.message,
              createdAt: new Date().toISOString(),
            });
  
            if (response.error) {
              throw new Error(response.result || "Failed to submit information");
            }
            
            // Add success message
            setTimeout(() => {
              const summaryMsg = {
                id: Date.now().toString(),
                content: summary,
                timestamp: new Date(),
                sender: "agent",
              };
              
              setMessages((prevMessages: any) => [...prevMessages, summaryMsg]);
              // Complete lead collection
              setLeadCollectionStage(LeadCollectionStage.COMPLETE);
              
              // Show success toast
              toast.success("Information submitted successfully!");
              
              // Scroll to bottom
              setTimeout(() => scrollToBottom(), 100);
            }, 50);
          } catch (err) {
            console.error("Error submitting lead:", err);
            setTimeout(() => {
              const errorMsg = {
                id: Date.now().toString(),
                content: "I apologize, but there was an error submitting your information. Could you please try again later or contact us directly?",
                timestamp: new Date(),
                sender: "agent",
              };
              setMessages((prevMessages: any) => [...prevMessages, errorMsg]);
              
              // End lead collection despite error
              setLeadCollectionStage(LeadCollectionStage.COMPLETE);
              
              // Show error toast
              toast.error("Failed to submit information");
              
              // Scroll to bottom
              setTimeout(() => scrollToBottom(), 100);
            }, 50);
          }
        } else {
          botResponse = "Please provide a message so we know how to help you.";
          setTimeout(() => {
            const retryMsg = {
              id: Date.now().toString(),
              content: botResponse,
              timestamp: new Date(),
              sender: "agent",
            };
            setMessages((prevMessages: any) => [...prevMessages, retryMsg]);
            setTimeout(() => scrollToBottom(), 100);
          }, 50);
        }
        break;
        
      default:
        isHandled = false;
        break;
    }
    
    return isHandled;
  };
  
  // Helper function to check if we're in lead collection mode
  export const isInLeadCollectionMode = (stage: LeadCollectionStage): boolean => {
    return stage !== LeadCollectionStage.NOT_COLLECTING && 
           stage !== LeadCollectionStage.COMPLETE;
  };