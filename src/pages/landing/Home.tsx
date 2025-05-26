import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Calendar,
  MessageCircle,
  ShoppingCart,
  Camera,
  CreditCard,
  Plug,
  X,
} from "lucide-react";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
  body {
    font-family: 'DM Sans', sans-serif;
  }
`;

const Container = styled.div`
  font-family: "DM Sans", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  overflow-x: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px 18px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
`;

const Logo = styled.div`
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: -1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavLink = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const LoginButton = styled.button`
  background: #fff;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 1rem;
  cursor: pointer;
`;

const HeroSection = styled.section`
  background: linear-gradient(90deg, #4e2b8f 0%, #3b82f6 100%);
  color: #fff;
  padding: 90px 0 90px 0;
  text-align: center;
  position: relative;
  min-height: 540px;
  @media (max-width: 1200px) {
    padding: 70px 0 70px 0;
    min-height: 480px;
  }
  @media (max-width: 900px) {
    padding: 60px 0 60px 0;
    min-height: 400px;
  }
  @media (max-width: 600px) {
    padding: 36px 0 36px 0;
    min-height: 320px;
  }
`;

const Headline = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  @media (max-width: 1200px) {
    font-size: 2.2rem;
  }
  @media (max-width: 900px) {
    font-size: 1.8rem;
  }
  @media (max-width: 600px) {
    font-size: 1.3rem;
  }
`;

const Subheadline = styled.p`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 24px;
  width: 40%;
  margin: 0 auto;

  @media (max-width: 900px) {
    width: 70%;
    font-size: 0.95rem;
  }
  @media (max-width: 600px) {
    width: 95%;
    font-size: 0.9rem;
  }
`;

const CTAButton = styled.button`
  position: relative;
  background: #6AFF97;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  color: black;
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #6aff97;
  }
  @media (max-width: 600px) {
    min-width: 100px;
  }
  &:disabled {
    background: #d6ffe0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;
type SpeechBubbleProps = {
  top: string;
  left?: string;
  right?: string;
  color?: string;
  bgurl?: string;
};

const SpeechBubble = styled.div<SpeechBubbleProps>`
  position: absolute;
  top: ${({ top }: { top: string }) => top};
  left: ${({ left }: { left?: string }) => left || "auto"};
  right: ${({ right }: { right?: string }) => right || "auto"};
  // background: ${({ bgurl }: { bgurl?: string }) =>
    bgurl ? `url(${bgurl})` : "#fff"};
  background-repeat: no-repeat;
  background-size: contain;
  color: #222;
  border-radius: 18px;
  font-size: clamp(10px, 4vw, 14px);
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  // border: 2px solid #222;
  width: fit-cotnent;
  z-index: 2;
  display: grid;
  place-items: center;
  font-family: itim;
  fonmt-weight: 1000;
  @media (max-width: 1200px) {
    font-size: 0.95rem;
  }
  @media (max-width: 900px) {
    display: none;
  }
  @media (max-width: 600px) {
    font-size: 0.8rem;
    min-width: 70px;
    max-width: 120px;
    padding: 5px 7px;
    display: none;
  }                                       
`;

const PracticalSection = styled.section`
  background: #f5f6fa;
  padding: 64px 0 64px 0;
  text-align: left;
  max-width: 1100px;
  margin: 0 auto;
  @media (max-width: 900px) {
    padding: 32px 32px 32px 32px;
    max-width: 800px;
  }
  @media (max-width: 600px) {
    padding: 18px 10px 24px 10px;
    max-width: 500px;
  }
`;

const PracticalTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  text-align: left;

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const PracticalDesc = styled.p`
  color: #444;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 36px;
  text-align: left;
  width: 50%;
  @media (max-width: 900px) {
    max-width: 800px;
    width: 80%;
  }
  @media (max-width: 600px) {
    margin-bottom: 18px;
    width: 100%;
  }
`;

const CardsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
  @media (max-width: 900px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 4px;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
`;

const PracticalCard = styled.div`
  background: #e6eaff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 320px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  overflow: hidden;
  @media (max-width: 900px) {
    width: 230px;
  }
  @media (max-width: 600px) {
    width: 90vw;
    min-width: 0;
  }
`;

const PracticalCardContent = styled.div`
  padding: 28px 24px 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;

  background: #e6eaff;
  width: 100%;
  @media (max-width: 900px) {
    padding: 10px 12px 10px 12px;
  }
`;

const PracticalCardTitle = styled.h3`
  font-size: 1.18rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #23244a;
  text-align: center;
  @media (max-width: 900px) {
    font-size: 1rem;
  }
  @media (max-width: 600px) {
    font-size: 1.4rem;
  }
`;

const PracticalCardDesc = styled.p`
  font-size: 0.98rem;
  color: #333;
  margin-bottom: 18px;
  text-align: center;
  @media (max-width: 900px) {
    font-size: 0.85rem;
  }
`;

const PracticalCardImage = styled.img`
  width: 180px;
  height: auto;
  @media (max-width: 900px) {
    width: 120px;
  }
  @media (max-width: 900px) {
    width: 90px;
  }
`;

const PracticalCardBar = styled.div`
  width: 100%;
  background: #4e2b8f;
  color: #fff;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 8px 0 8px 0;
`;

const PracticalCardBottom = styled.div`
  width: 100%;
  background: #fff;
  color: #23244a;
  text-align: center;
  font-size: 0.98rem;
  padding: 11px 20px 11px 20px;
  font-weight: 500;
  border-radius: 0 0 18px 18px;
`;

const features = [
  {
    key: "smart-recommendations",
    label: "SMART RECOMMENDATIONS",
    desc: "Eliminate endless scrolling and drop-offs",
    image: "assets/landing-asset/smart/smart.png",
  },
  {
    key: "sell-products",
    label: "SELL PRODUCTS",
    desc: "Transform recommendations into sales",
    image: "assets/landing-asset/smart/sell.png",
  },
  {
    key: "book-appointments",
    label: "BOOK APPOINTMENTS",
    desc: "Instantly schedule and manage meetings",
    image: "assets/landing-asset/smart/book.png",
  },
  {
    key: "capture-leads",
    label: "CAPTURE LEADS",
    desc: "Collect & qualify potential customer info",
    image: "assets/landing-asset/smart/capture.png",
  },
  {
    key: "accept-payments",
    label: "ACCEPT IN-CHAT PAYMENTS",
    desc: "Secure payment without the hassle",
    image: "assets/landing-asset/smart/accept.png",
  },
  {
    key: "send-confirmations",
    label: "SEND CONFIRMATIONS",
    desc: "Automate receipts and booking confirmations",
    image: "assets/landing-asset/smart/send.png",
  },
  {
    key: "integrates-mcp",
    label: "INTEGRATES MCP SERVERS",
    desc: "Connect any API in 2 clicks: agent talks with MCP",
    image: "assets/landing-asset/smart/integrate.png",
  },
];

const FeaturesSection = styled.section`
  padding: 64px 0 64px 0;
  text-align: left;
  max-width: 1100px;
  margin: 0 auto;
  @media (max-width: 900px) {
    padding: 32px 32px 32px 32px;
    max-width: 800px;
  }
  @media (max-width: 600px) {
    padding: 18px 18px 18px 18px;
    max-width: 90vw;
  }
`;

const FeaturesTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  text-align: left;
  margin-bottom: 36px;
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const FeaturesRow = styled.div`
  display: flex;
  width: 100%;
  min-height: 380px;
  gap: 16px;
  @media (max-width: 900px) {
    flex-direction: column;
    min-height: unset;
  }
`;

const FeaturesLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  @media (max-width: 900px) {
    width: 100%;
    align-items: center;
    margin-bottom: 24px;
  }
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const FeatureListItem = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  background: ${({ selected }) => (selected ? "#e6ffe6" : "#fff")};
  border: 2px solid ${({ selected }) => (selected ? "#4e2b8f" : "#e0e0e0")};
  border-radius: 12px;
  box-shadow: ${({ selected }) =>
    selected ? "0 2px 8px rgba(76, 34, 143, 0.08)" : "none"};
  padding: 0 0 0 0;
  min-height: 56px;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
  width: 100%;
  @media (max-width: 900px) {
    min-height: 44px;
  }
`;

const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  background: #23244a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 18px 0 12px;
  flex-shrink: 0;
`;

const FeatureListText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 8px 0;
`;

const FeatureListLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #23244a;
`;

const FeatureListDesc = styled.div`
  font-size: 0.82rem;
  color: #222;
  font-weight: 400;
  text-align: left;
`;

const FeaturesRight = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  @media (max-width: 900px) {
    width: 100%;
    margin-top: 18px;
  }
`;

const FeatureImageBox = styled.div`
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  @media (max-width: 900px) {
    width: 90vw;
    height: 220px;
  }
  @media (max-width: 600px) {
    width: 95vw;
    height: 180px;
    border-radius: 10px;
  }
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const FeaturesFooter = styled.div`
  margin-top: 32px;
  font-size: 1.6rem;
  color: #2a3057;
  text-align: center;
  font-weight: 600;
  @media (max-width: 600px) {
    font-size: 0.95rem;
    margin-top: 16px;
  }
`;

// Add icons for each feature (use emoji or SVG placeholder for now)
const featureIcons = [
  <MessageCircle />, // Smart Recommendations
  <ShoppingCart />, // Sell Products
  <Calendar />, // Book Appointments
  <Camera />, // Capture Leads
  <CreditCard />, // Accept Payments
  <Mail />, // Send Confirmations
  <Plug />, // Integrates MCP Servers
];

const PlatformSection = styled.section`
  padding: 64px 0 64px 0;
  text-align: left;
  max-width: 1100px;
  margin: 0 auto;
  @media (max-width: 900px) {
    padding: 32px 32px 32px 32px;
    max-width: 800px;
  }
  @media (max-width: 600px) {
    padding: 18px 18px 18px 18px;
    max-width: 90vw;
  }
`;

const PlatformTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  text-align: left;
  margin-bottom: 36px;
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const PlatformCardsRow = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  width: 100%;
  max-width: 1100px;
  margin-bottom: 48px;
  @media (max-width: 900px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 14px;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
`;

const PlatformCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  width: 300px;
  padding: 32px 24px 28px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 5px solid #d8ddff;
  @media (max-width: 900px) {
    padding: 18px 12px 18px 12px;
  }
  @media (max-width: 600px) {
    padding: 8px 8px 8px 8px;
    width: 100%;
  }
`;

const PlatformIcon = styled.div`
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const PlatformCardTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const PlatformCardDesc = styled.p`
  font-size: 0.9rem;
  font-weight: 500;
  color: #212121;
  @media (max-width: 900px) {
    font-size: 0.8rem;
  }
  @media (max-width: 600px) {
    font-size: 0.7rem;
  }
`;

const AssembleSection = styled.section`
  background: #f5f6fa;
  padding: 64px 0 64px 0;
  text-align: left;
  max-width: 1100px;
  margin: 0 auto;
  @media (max-width: 900px) {
    padding: 32px 32px 32px 32px;
    max-width: 800px;
  }
  @media (max-width: 600px) {
    padding: 18px 18px 18px 18px;
    max-width: 90vw;
  }
`;

const AssembleTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #23244a;
  text-align: center;
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const AssembleSubtitle = styled.p`
  font-size: 1rem;
  color: #444;
  margin-bottom: 36px;
  text-align: center;
  font-weight: 500;
`;

const AssembleGrid = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 32px;
  width: 100%;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 18px;
  }
`;

const AssembleCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  @media (max-width: 900px) {
    flex-direction: row;
    gap: 18px;
    justify-content: center;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
`;

const AssembleCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 270px;
  min-width: 240px;
  max-width: 270px;
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) {
    min-width: 180px;
    max-width: 220px;
    width: 100%;
  }
  @media (max-width: 600px) {
    min-width: 0;
    max-width: 95vw;
    width: 95vw;
  }
`;

const AssembleCardTop = styled.div`
  background: #dfffea;
  padding: 22px 20px 10px 20px;
  text-align: left;
`;

const AssembleCardTitle = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: #23244a;
  margin-bottom: 2px;
`;

const AssembleCardSubtitle = styled.div`
  color: #23244a;
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0;
`;

const AssembleCardBottom = styled.div`
  background: #fff;
  padding: 18px 20px 18px 20px;
  text-align: left;
  color: #23244a;
  font-size: 1.01rem;
  font-weight: 400;
  border-radius: 0 0 16px 16px;
`;

const AssembleMascotBox = styled.div`
  background: #ededed;
  border-radius: 18px;
  border: 6px solid #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 320px;
  min-height: 320px;
  max-width: 400px;
  max-height: 400px;
  margin: 0 24px;
  overflow: hidden;
  @media (max-width: 900px) {
    min-width: 220px;
    min-height: 220px;
    max-width: 240px;
    max-height: 240px;
    margin: 0 0 18px 0;
  }
  @media (max-width: 600px) {
    min-width: 120px;
    min-height: 120px;
    max-width: 140px;
    max-height: 140px;
    margin: 0 0 10px 0;
  }
`;

const AssembleMascotText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  color: #b0b0b0;
  font-family: "DM Mono", "Menlo", "Monaco", "Consolas", monospace;
  font-size: 1.01rem;
  line-height: 1.3;
  padding: 24px 18px 18px 24px;
  white-space: pre-line;
  pointer-events: none;
  @media (max-width: 900px) {
    font-size: 0.85rem;
    padding: 12px 8px 8px 12px;
  }
  @media (max-width: 600px) {
    font-size: 0.7rem;
    padding: 6px 4px 4px 6px;
  }
`;

const AssembleMascotImg = styled.img`
  position: relative;
  z-index: 2;
  width: 80%;
  height: auto;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.1));
`;

const AppOverloadSection = styled.section`
  background: #f5f6fa;
  padding: 64px 24px;
  text-align: center;
  max-width: 1100px;
  margin: 0 auto;
  @media (max-width: 1200px) {
    padding: 48px 20px;
  }
  @media (max-width: 900px) {
    padding: 32px 32px 32px 32px;
    max-width: 800px;
  }
  @media (max-width: 600px) {
    padding: 18px 18px 18px 18px;
    max-width: 90vw;
  }
`;

const AppOverloadTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #23244a;
  text-align: left;
  margin-bottom: 5px;
  @media (max-width: 900px) {
    font-size: 1.5rem;
  }
  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const AppOverloadSub = styled.p`
  font-size: 1rem;
  color: #212121;
  font-weight: 500;
  margin-bottom: 36px;
  max-width: 700px;
  text-align: left;
  @media (max-width: 900px) {
    font-size: 0.95rem;
    margin-bottom: 24px;
  }
  @media (max-width: 600px) {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
`;

const AppOverloadToolsTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #23244a;
  margin-bottom: 24px;
  text-align: left;
  @media (max-width: 900px) {
    font-size: 1.1rem;
    margin-bottom: 20px;
  }
  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: 16px;
  }
`;

const AppOverloadCardsRow = styled.div`
  display: flex;
  gap: 24px;
  width: 100%;
  flex-wrap: wrap;
  justify-content: flex-start;
  @media (max-width: 1200px) {
    gap: 20px;
  }
  @media (max-width: 900px) {
    gap: 16px;
  }
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const AppOverloadCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  width: calc(20% - 20px);
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  @media (max-width: 1200px) {
    width: calc(25% - 15px);
  }
  @media (max-width: 900px) {
    width: calc(33.33% - 11px);
    min-width: 160px;
  }
  @media (max-width: 600px) {
    width: calc(50% - 6px);
    min-width: 0;
  }
`;

const AppOverloadCardTop = styled.div`
  background: #e6eaff;
  width: 100%;
  padding: 18px 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AppOverloadCardTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #23244a;
  text-align: center;
  margin-bottom: 5px;
`;

const AppOverloadIcon = styled.div`
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #23244a;
  margin-bottom: 0;
  background-color: white;
  border-radius: 50%;
`;

const AppOverloadCardBottom = styled.div`
  background: #fff;
  width: 100%;
  text-align: center;
  padding: 18px 0 10px 0;
`;

const AppOverloadCardSub = styled.div`
  font-size: 0.97rem;
  color: #888;
  margin-bottom: 2px;
`;

const AppOverloadCardReplace = styled.div`
  font-size: 1.08rem;
  color: #23244a;
  font-weight: 700;
`;

const IntegrationsSection = styled.section`
  background: #f5f6fa;
  padding: 64px 24px;
  text-align: center;
  max-width: 1100px;
  margin: 0 auto;
  @media (max-width: 1200px) {
    padding: 48px 20px;
  }
  @media (max-width: 900px) {
    padding: 32px 32px 32px 32px;
    max-width: 800px;
  }
  @media (max-width: 600px) {
    padding: 24px 12px;
  }
`;

const IntegrationsTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #23244a;
  margin-bottom: 5px;
  text-align: left;
  @media (max-width: 900px) {
    font-size: 1.6rem;
  }
  @media (max-width: 600px) {
    font-size: 1.3rem;
  }
`;

const IntegrationsSub = styled.p`
  font-size: 1rem;
  color: #212121;
  font-weight: 500;
  margin-bottom: 36px;
  max-width: 700px;
  text-align: left;
  @media (max-width: 900px) {
    font-size: 0.95rem;
    margin-bottom: 24px;
  }
  @media (max-width: 600px) {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
`;

const IntegrationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 28px;
  justify-content: flex-start;
  width: 100%;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
`;

const IntegrationBox = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.1rem;
  font-weight: 600;
  color: #23244a;
  width: 100%;
  aspect-ratio: 1;
  text-align: center;
  padding: 15px;
  @media (max-width: 1200px) {
    font-size: 1.8rem;
    border-radius: 16px;
  }
  @media (max-width: 900px) {
    font-size: 1.5rem;
    border-radius: 14px;
    padding: 12px;
    width: 120px;
    height: 120px;
  }
  @media (max-width: 600px) {
    font-size: 1.2rem;
    border-radius: 12px;
    padding: 10px;
    width: 100px;
    height: 100px;
  }
  img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
  }
`;

const integrationsGrid = [
  {
    name: "AWS",
    src: "assets/landing-asset/Icons/AWS.svg",
  },
  {
    name: "Microsoft",
    src: "assets/landing-asset/Icons/Microsoft.svg",
  },
  {
    name: "GCal",
    src: "assets/landing-asset/Icons/GCal.svg",
  },
  {
    name: "Gmail",
    src: "assets/landing-asset/Icons/Gmail.svg",
  },
  {
    name: "GDrive",
    src: "assets/landing-asset/Icons/GDrive.svg",
  },
  {
    name: "GSheets",
    src: "assets/landing-asset/Icons/GSheets.svg",
  },
  {
    name: "Mongo",
    src: "assets/landing-asset/Icons/Mongo.svg",
  },
  {
    name: "Woo",
    src: "assets/landing-asset/Icons/Woo.svg",
  },
  {
    name: "X",
    src: "assets/landing-asset/Icons/X.svg",
  },
  {
    name: "Discord",
    src: "assets/landing-asset/Icons/Discord.svg",
  },
  {
    name: "Telegram",
    src: "assets/landing-asset/Icons/Telegram.svg",
  },
  {
    name: "Slack",
    src: "assets/landing-asset/Icons/Slack.svg",
  },
  {
    name: "Trello",
    src: "assets/landing-asset/Icons/Trello.svg",
  },
  {
    name: "Docs",
    src: "assets/landing-asset/Icons/GsheetsSimple.svg",
  },
  {
    name: "Twilio",
    src: "assets/landing-asset/Icons/Twilio.svg",
  },
  {
    name: "MySQL",
    src: "assets/landing-asset/Icons/Twilio.svg",
  },
  {
    name: "GitHub",
    src: "assets/landing-asset/Icons/Github.svg",
  },
  {
    name: "Notion",
    src: "/assets/landing-asset/Icons/Notion.svg",
  },
  {
    name: "HubSpot",
    src: "assets/landing-asset/Icons/Hubspot.svg",
  },

  {
    name: "Stripe",
    src: "assets/landing-asset/Icons/Stripe.svg",
  },
  {
    name: "Airtable",
    src: "assets/landing-asset/Icons/Airtable.svg",
  },
  {
    name: "GraphQL",
    src: "assets/landing-asset/Icons/Graphql.svg",
  },
  {
    name: "Postgres",
    src: "assets/landing-asset/Icons/Postgres.svg",
  },
  {
    name: "And",
    src: "assets/landing-asset/Icons/And.svg",
  },
];

const FooterSection = styled.footer`
  background: linear-gradient(90deg, #4e2b8f 0%, #3b82f6 100%);
  color: #fff;
  padding: 64px 0 0 0;
  position: relative;
  min-height: 320px;
  overflow: hidden;
  padding-bottom: 20px;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 0 32px;
  position: relative;
  z-index: 2;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }
`;

const FooterLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  max-width: 520px;
`;

const FooterHeadline = styled.h2`
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const FooterSub = styled.p`
  font-size: 0.85rem;
  font-weight: 500;
  color: #e6eaff;
  margin-bottom: 8px;
`;

const FooterCTA = styled.button`
  background: #a3ffb3;
  color: #222;
  border: none;
  border-radius: 6px;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: background 0.2s;
  &:hover {
    background: #7be88e;
  }
`;

const FooterSocial = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.08rem;
`;

const SocialIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fff;
  color: #23244a;
  border-radius: 8px;
  font-size: 1.3rem;
  margin-left: 6px;
`;

const FooterRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  min-width: 320px;
  position: relative;
  @media (max-width: 900px) {
    align-items: center;
  }
`;

const FooterCopyright = styled.div`
  color: #e6eaff;
  font-size: 1rem;
  margin-bottom: 12px;
  z-index: 2;
`;

const FooterMascot = styled.div`
  position: absolute;
  right: -40px;
  bottom: -30px;
  width: 260px;
  height: 180px;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  font-size: 7rem;
`;

const Home = () => {
  const [selectedFeature, setSelectedFeature] = useState(features[0].key);

  const selected = features.find((f) => f.key === selectedFeature);
  const navigate = useNavigate();

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <Logo>
            <span onClick={() => navigate("/")}>kifor</span>
            <NavLink onClick={() => navigate("/pricing")}>Pricing</NavLink>
          </Logo>
          <NavLinks>
            <LoginButton onClick={() => navigate("/admin")}>
              Login/Sign up
            </LoginButton>
          </NavLinks>
        </Header>

        <HeroSection>
          <SpeechBubble top="10%" left="3%">
            <div className="relative inline-block">
              <img
                src="/assets/landing-asset/speechBubbles/welcome-text.png"
                alt="bubble"
                className="block w-full h-auto"
              />
              <div className="absolute top-2 flex items-center justify-center text-center px-3 text-[16px] font-[1000]">
                Welcome to the salon, how can I help you?
              </div>
            </div>
          </SpeechBubble>
          <SpeechBubble top="32%" left="10%">
            <div className="relative inline-block">
              <img
                src="/assets/landing-asset/speechBubbles/our-summer-sale.png"
                alt="bubble"
                className="block w-full h-auto"
              />
              <div className="absolute top-4 flex items-center justify-center text-center px-3 text-[16px] font-[1000]">
                Our Summer Sale is now live!
              </div>
            </div>
          </SpeechBubble>
          <SpeechBubble top="53%" left="2%">
            <div className="relative inline-block">
              <img
                src="/assets/landing-asset/speechBubbles/meeting-with-our.png"
                alt="bubble"
                className="block w-full h-auto"
              />
              <div className="absolute -top-0 flex items-center justify-center text-center p-3 font-[1000]">
                Book a 1:1 meeting with our senior dietitian
              </div>
            </div>
          </SpeechBubble>
          <SpeechBubble top="75%" left="12%">
            <div className="relative inline-block">
              <img
                src="/assets/landing-asset/speechBubbles/your-spin-class.png"
                alt="bubble"
                className="block w-full h-auto"
              />
              <div className="absolute top-1 flex items-center  justify-center text-center  py-3 px-8  text-[15px] font-[1000]">
                Your spin class is booked for 8am tomorrow.
              </div>
            </div>
          </SpeechBubble>
          <SpeechBubble top="10%" right="3%" color="#ceffaf">
            <div className="relative inline-block">
              <img
                src="/assets/landing-asset/speechBubbles/should-i-repeat.png"
                alt="bubble"
                className="block w-full h-auto"
              />
              <div className="absolute top-0 flex items-center  justify-center text-center  py-3 px-8  text-sm font-[1000]">
                Should I repeat your order?
              </div>
            </div>
          </SpeechBubble>
          <SpeechBubble top="40%" right="8%">
            <div className="relative inline-block">
              <img
                src="/assets/landing-asset/speechBubbles/how-would-you.png"
                alt="bubble"
                className="block w-full h-auto"
              />
              <div className="absolute top-2 flex items-center  justify-center text-center  py-3 px-8  text-sm font-[1000]">
                How would you like to pay today?
              </div>
            </div>
          </SpeechBubble>
          <SpeechBubble top="65%" right="3%" color="#a1a9ff">
            <div className="relative inline-block">
              <img
                src="/assets/landing-asset/speechBubbles/drop-us-your-contact.png"
                alt="bubble"
                className="block w-full h-auto"
              />
              <div className="absolute top-2 flex items-center  justify-center text-center  py-3 px-8  text-sm font-[1000]">
                Drop us your contact details for more info.
              </div>
            </div>
          </SpeechBubble>
          <Headline>
            The first AI-in-1 Employee
            <br />
            designed to Sell
          </Headline>
          <Subheadline>
            Sell products, book appointments, reply to customers, and take
            payments — all through conversation.
            <br />
            No Coding Required.
          </Subheadline>
           <div className="flex justify-center relative z-10 mt-8">
            <CTAButton onClick={() => navigate("/admin")}>
              LAUNCH YOUR FREE AGENT
            </CTAButton>
          </div>
        </HeroSection>
        <PracticalSection>
          <PracticalTitle>Practical AI for your business</PracticalTitle>
          <PracticalDesc>
            Customized intelligent support designed to meet the specific needs
            of different business models, helping you work smarter, not harder.
          </PracticalDesc>
          <CardsRow>
            <PracticalCard>
              <PracticalCardContent>
                <PracticalCardTitle>Solopreneurs</PracticalCardTitle>
                <PracticalCardDesc>
                  The power of a full team <br />
                  powered by AI, without <br />
                  traditional hiring costs.
                </PracticalCardDesc>
                <img
                  src="assets/landing-asset/business/solo.png"
                  alt="Solopreneurs"
                  style={{ width: "100%" }}
                />
              </PracticalCardContent>
              <div style={{ width: "100%" }}>
                <PracticalCardBar>SUITABLE FOR</PracticalCardBar>
                <PracticalCardBottom>
                  Creators, Freelancers, <br />
                  Coaches & Consultants
                </PracticalCardBottom>
              </div>
            </PracticalCard>
            <PracticalCard>
              <PracticalCardContent>
                <PracticalCardTitle>E-Commerce</PracticalCardTitle>
                <PracticalCardDesc>
                  Your intelligent storefront guides <br />
                  customers, answers queries, and
                  <br /> closes sales—all automatically.
                </PracticalCardDesc>
                <PracticalCardImage
                  src="assets/landing-asset/business/commerce.png"
                  alt="E-Commerce"
                />
              </PracticalCardContent>
              <div style={{ width: "100%" }}>
                <PracticalCardBar>SUITABLE FOR</PracticalCardBar>
                <PracticalCardBottom>
                  E-commerce, D2C brands <br />& Influencer storefronts
                </PracticalCardBottom>
              </div>
            </PracticalCard>
            <PracticalCard>
              <PracticalCardContent>
                <PracticalCardTitle>Service Providers</PracticalCardTitle>
                <PracticalCardDesc>
                  Your AI front desk handles
                  <br /> bookings, captures leads, and <br />
                  nurtures client relationships 24/7.
                </PracticalCardDesc>
                <PracticalCardImage
                  src="assets/landing-asset/business/service.png"
                  alt="Service Providers"
                />
              </PracticalCardContent>
              <div style={{ width: "100%" }}>
                <PracticalCardBar>SUITABLE FOR</PracticalCardBar>
                <PracticalCardBottom>
                  Hospitality, Wellness, <br />
                  Legal & Home Services
                </PracticalCardBottom>
              </div>
            </PracticalCard>
          </CardsRow>
        </PracticalSection>
        <div style={{ background: "#ffffff" }}>
          <FeaturesSection>
            <FeaturesTitle>Everything you need, in One Agent</FeaturesTitle>
            <FeaturesRow>
              <FeaturesLeft>
                <FeaturesList>
                  {features.map((feature, idx) => (
                    <FeatureListItem
                      key={feature.key}
                      selected={selectedFeature === feature.key}
                      onClick={() => setSelectedFeature(feature.key)}
                    >
                      <FeatureIcon>{featureIcons[idx]}</FeatureIcon>
                      <FeatureListText>
                        <FeatureListLabel>{feature.label}</FeatureListLabel>
                        <FeatureListDesc>{feature.desc}</FeatureListDesc>
                      </FeatureListText>
                    </FeatureListItem>
                  ))}
                </FeaturesList>
              </FeaturesLeft>
              <FeaturesRight>
                <FeatureImageBox>
                  <img src={selected?.image} alt={selected?.label} />
                </FeatureImageBox>
              </FeaturesRight>
            </FeaturesRow>
            <FeaturesFooter>
              All through 1 ongoing, intelligent conversation.
            </FeaturesFooter>
          </FeaturesSection>
        </div>
        <PlatformSection>
          <PlatformTitle>Sell on any Platform</PlatformTitle>
          <PlatformCardsRow>
            <PlatformCard>
              <PlatformCardTitle>Link-in-Bio</PlatformCardTitle>
              <PlatformIcon>
                <img
                  src="assets/landing-asset/platform/social.png"
                  alt="Link-in-Bio"
                  style={{ height: 70 }}
                />
              </PlatformIcon>

              <PlatformCardDesc>
                Add your assistant to your <br />
                social links — like a smart,
                <br /> interactive AI storefront.
              </PlatformCardDesc>
            </PlatformCard>
            <PlatformCard>
              <PlatformCardTitle>Website</PlatformCardTitle>
              <PlatformIcon>
                <img
                  src="assets/landing-asset/platform/website.png"
                  alt="Website"
                  style={{ height: 70 }}
                />
              </PlatformIcon>

              <PlatformCardDesc>
                Install our AI Agent directly <br />
                into your site for seamless
                <br /> customer interactions.
              </PlatformCardDesc>
            </PlatformCard>
            <PlatformCard>
              <PlatformCardTitle>ChatGPT</PlatformCardTitle>
              <PlatformIcon>
                <img
                  src="assets/landing-asset/platform/chatgpt.png"
                  alt="ChatGPT"
                  style={{ height: 70 }}
                />
              </PlatformIcon>

              <PlatformCardDesc>
                Transform the popular AI <br />
                platform into your personalized <br />
                sales channel.
              </PlatformCardDesc>
            </PlatformCard>
          </PlatformCardsRow>
          <AssembleSection>
            <AssembleTitle>
              Assemble Your Agent : Your AI, Your Way
            </AssembleTitle>
            <AssembleSubtitle>
              Train Kifor to talk, think, and sell like you or anyone you want,
              no coding needed.
            </AssembleSubtitle>
            <AssembleGrid>
              <AssembleCol>
                <AssembleCard>
                  <AssembleCardTop>
                    <AssembleCardTitle>Brain</AssembleCardTitle>
                    <AssembleCardSubtitle>
                      Smart Beyond Limits
                    </AssembleCardSubtitle>
                  </AssembleCardTop>
                  <AssembleCardBottom>
                    Smarten up your Agent with files, catalogs, social links and
                    data
                  </AssembleCardBottom>
                </AssembleCard>
                <AssembleCard>
                  <AssembleCardTop>
                    <AssembleCardTitle>Interface</AssembleCardTitle>
                    <AssembleCardSubtitle>
                      Extending your Brand
                    </AssembleCardSubtitle>
                  </AssembleCardTop>
                  <AssembleCardBottom>
                    Customize chat themes, colors, and interactions to create a
                    seamless, on-brand user experience.
                  </AssembleCardBottom>
                </AssembleCard>
              </AssembleCol>
              <AssembleMascotBox>
                <AssembleMascotText>
                  {`welcoming. pleasing personality. uploading summer catalog. ready. accept credit and debit cards. use my brand colours. offer free shipping above $40. direct users to our sale section. offer 10-15% discount to any students. book 1:1 sessions. announce my next workshop. send confirmations via email with my branding. link users out to my instagram and twitter accounts. talk about our global sustainable mission.`}
                </AssembleMascotText>
                <AssembleMascotImg
                  src="/assets/landing-asset/assemble/gramophone.png"
                  alt="mascot"
                />
              </AssembleMascotBox>
              <AssembleCol>
                <AssembleCard>
                  <AssembleCardTop style={{ background: "#e6f3ff" }}>
                    <AssembleCardTitle>Voice</AssembleCardTitle>
                    <AssembleCardSubtitle>
                      Selling like you would
                    </AssembleCardSubtitle>
                  </AssembleCardTop>
                  <AssembleCardBottom>
                    Craft a conversational style that reflects your brand's
                    personality, from professional to playful.
                  </AssembleCardBottom>
                </AssembleCard>
                <AssembleCard>
                  <AssembleCardTop style={{ background: "#e6f3ff" }}>
                    <AssembleCardTitle>Payments</AssembleCardTitle>
                    <AssembleCardSubtitle>
                      In-Chat Checkout
                    </AssembleCardSubtitle>
                  </AssembleCardTop>
                  <AssembleCardBottom>
                    Seamless transactions through 15+ payment methods, including
                    Stablecoins (USDC/USDT)
                  </AssembleCardBottom>
                </AssembleCard>
              </AssembleCol>
            </AssembleGrid>
          </AssembleSection>
        </PlatformSection>

        <AppOverloadSection>
          <AppOverloadTitle>Goodbye, App Overload</AppOverloadTitle>
          <AppOverloadSub>
            Running a business shouldn't be a juggling act. Kifor's AI Agent
            replaces your entire tech stack, delivering comprehensive business
            management in a single, intelligent interface.
          </AppOverloadSub>
          <AppOverloadToolsTitle>Replace 10+ Tools</AppOverloadToolsTitle>
          <AppOverloadCardsRow>
            <AppOverloadCard>
              <AppOverloadCardTop>
                <AppOverloadCardTitle>WEBSITE BUILDERS</AppOverloadCardTitle>
                <AppOverloadIcon>
                  <img
                    src="/assets/landing-asset/goodbye/web.png"
                    alt="Website Builders"
                    style={{
                      height: 40,
                    }}
                  />
                </AppOverloadIcon>
              </AppOverloadCardTop>
              <AppOverloadCardBottom>
                <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                <AppOverloadCardReplace>Wix & Wordpress</AppOverloadCardReplace>
              </AppOverloadCardBottom>
            </AppOverloadCard>
            <AppOverloadCard>
              <AppOverloadCardTop>
                <AppOverloadCardTitle>SCHEDULING APPS</AppOverloadCardTitle>
                <AppOverloadIcon>
                  <img
                    src="/assets/landing-asset/goodbye/calender.png"
                    alt="Scheduling Apps"
                    style={{ height: 40 }}
                  />
                </AppOverloadIcon>
              </AppOverloadCardTop>
              <AppOverloadCardBottom>
                <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                <AppOverloadCardReplace>Calendly & Cal</AppOverloadCardReplace>
              </AppOverloadCardBottom>
            </AppOverloadCard>
            <AppOverloadCard>
              <AppOverloadCardTop>
                <AppOverloadCardTitle>CHATBOTS</AppOverloadCardTitle>
                <AppOverloadIcon>
                  <img
                    src="/assets/landing-asset/goodbye/chatbot.png"
                    alt="Chatbots"
                    style={{ height: 40 }}
                  />
                </AppOverloadIcon>
              </AppOverloadCardTop>
              <AppOverloadCardBottom>
                <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                <AppOverloadCardReplace>Tawk.to & Tidio</AppOverloadCardReplace>
              </AppOverloadCardBottom>
            </AppOverloadCard>
            <AppOverloadCard>
              <AppOverloadCardTop>
                <AppOverloadCardTitle>CRMs</AppOverloadCardTitle>
                <AppOverloadIcon>
                  <img
                    src="/assets/landing-asset/goodbye/group.png"
                    alt="CRMs"
                    style={{ height: 40 }}
                  />
                </AppOverloadIcon>
              </AppOverloadCardTop>
              <AppOverloadCardBottom>
                <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                <AppOverloadCardReplace>Hubspot</AppOverloadCardReplace>
              </AppOverloadCardBottom>
            </AppOverloadCard>
            <AppOverloadCard>
              <AppOverloadCardTop>
                <AppOverloadCardTitle>LINK-IN-BIO TOOLS</AppOverloadCardTitle>
                <AppOverloadIcon>
                  <img
                    src="/assets/landing-asset/goodbye/link.png"
                    alt="Link-in-Bio Tools"
                    style={{ height: 40 }}
                  />
                </AppOverloadIcon>
              </AppOverloadCardTop>
              <AppOverloadCardBottom>
                <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                <AppOverloadCardReplace>Linktree & Hopp</AppOverloadCardReplace>
              </AppOverloadCardBottom>
            </AppOverloadCard>
          </AppOverloadCardsRow>
        </AppOverloadSection>
        <IntegrationsSection>
          <IntegrationsTitle>Extensive Integrations via MCP</IntegrationsTitle>
          <IntegrationsSub>
            Convert any API into a feature packed selling machine. Make your
            agents powerful by integrating 200+ apps using Model Context
            Protocol (MCP).
          </IntegrationsSub>
          <IntegrationsGrid>
            {integrationsGrid.map(({ name, src }, idx) => (
              <IntegrationBox key={idx}>
                <img src={src} alt={name} />
              </IntegrationBox>
            ))}
          </IntegrationsGrid>
        </IntegrationsSection>
        <FooterSection>
          <FooterContent>
            <FooterLeft>
              <div>
                <FooterHeadline>
                  Your new AI-ployee is here (& free) !
                </FooterHeadline>
                <FooterSub>
                  Experience the future of sales: an AI-powered agent that
                  adapts to your business needs, engages customers, and drives
                  growth continuously.
                </FooterSub>
              </div>
              <CTAButton onClick={() => navigate("/admin")}>
                LAUNCH YOUR FREE AGENT
              </CTAButton>

              <FooterSocial>
                Follow us
                <SocialIcon title="X">X</SocialIcon>
                <SocialIcon title="LinkedIn">in</SocialIcon>
              </FooterSocial>
            </FooterLeft>
            <FooterRight>
              <FooterCopyright>© 2025 Kifor AI</FooterCopyright>
            </FooterRight>
            <div>
              <FooterMascot>
                {/* Mascot/image placeholder */}
                <img
                  src="/assets/landing-asset/half-gobbl.png"
                  alt="mascot"
                  style={{ marginBottom: 10, width: 800 }}
                />
              </FooterMascot>
            </div>
          </FooterContent>
        </FooterSection>
      </Container>
    </>
  );
};

export default Home;
