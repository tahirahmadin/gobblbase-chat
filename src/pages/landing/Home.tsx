import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ChevronRight, File, Menu, X, Linkedin } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Container = styled.div`
  font-family: "DM Sans", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  overflow-x: hidden;
`;

const Navbar = styled.nav<{ $scrolled: boolean }>`
    top; 1px;
    z-index: 111111;
    position: absolute;
    width: 100%;
    `;
const Header = styled.header`
  padding: 2vh 2vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // border-bottom: 1px solid #e5e7eb;
  @media (max-width: 600px) {
    padding: 3vh 6vw;
  }
`;

const Logo = styled.div`
  cursor: pointer;
  display: flex;
  align-items: end;
  gap: 29px;
`;

const NavLinks = styled.div`
  // display: flex;
  align-items: center;
  gap: 24px;
`;

const NavLink = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: "DM Sans", sans-serif;
  transition: background-color 0.2s;
  &:hover {
    background-color: #f5f5f5;
    color: black;
  }
`;

const LoginButton = styled.button`
  position: relative;
  background: #6aff97;
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
const BlackBackground = styled.span`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  position: relative;
  z-index: 10;
  @media (max-width: 600px) {
    padding: 1vh 0 1vh 0;
  }
  span {
    width: fit-content;
    font-size: clamp(1.1rem, 4vw, 1.4rem);
    font-family: "Lato", sans-serif;
    font-weight: 600;
    height: 100%;
    padding: 1.5vh 2vw;
    background: black;
    color: white;
    border-radius: 40px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      left: -2px;
      bottom: 0px;
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-bottom: 20px solid black;
    }
    &::after {
      content: "";
      position: absolute;
      bottom: 0px;
      width: 0;
      height: 0;
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-bottom: 20px solid black;
      left: -2px;
      bottom: 0px;
    }
  }
`;
const WhiteBackground = styled.span`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 60%;
  position: relative;
  z-index: 10;
  @media (max-width: 700px) {
    width: 80%;
  }
  @media (max-width: 400px) {
    width: 95%;
  }

  span {
    font-family: "DM Sans", sans-serif;
    font-size: 1rem;
    font-weight: 400;
    background: white;
    border: 1px solid black;
    width: fit-content;
    height: 100%;
    width: 100%;
    color: black;
    padding: 4vh 2vw;
    border-radius: 60px;
    @media (max-width: 600px) {
      border-radius: 30px;
      padding: 2vh 2vw 2vh 6vw;
    }
    &::before {
      content: "";
      position: absolute;
      transform: translate(-0.4rem, -0.05rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
      border-bottom: 24px solid white;
      z-index: 0;
      @media (max-width: 600px) {
        transform: translate(0.5rem, -0.05rem);
        border-left: 28px solid transparent;
        border-right: 28px solid transparent;
        border-bottom: 28px solid white;
      }
    }
    &::after {
      content: "";
      position: absolute;
      transform: translate(-0.25rem, 0rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 40px solid transparent;
      border-right: 40px solid transparent;
      border-bottom: 40px solid black;
      z-index: -4;
      @media (max-width: 600px) {
        transform: translate(0.65rem, 0);
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 30px solid black;
      }
    }
  }
`;
const HeroSection = styled.section`
  background: #000000;
  color: #fff;
  position: relative;
  min-height: 540px;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 18vh 6vw 6vh 8vw;
  font-family: lato, sans-serif;
  @media (max-width: 768px) {
    padding: 18vh 3vw 6vh 3vw;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .left-side {
    .headline {
      font-size: clamp(1.2rem, 4vw, 1.8rem);
      @media (max-width: 600px) {
        img {
          width: 120px;
        }
      }
    }
  }
`;

const Headline = styled.h1`
  font-size: clamp(1.3rem, 4vw, 2rem);
  font-weight: 700;
  color: #aeb8ff;
  white-space: nowrap;
`;

const Subheadline = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4vh 4vw 4vh 4vw;
  margin-right: 6vw;
  @media (max-width: 1024px) {
    align-items: center;
    padding: 0 2vw;
    margin-top: 2vh;
    margin-right: 0;
  }
`;
const buttonData = [
  {
    id: 0,
    label: "Answer Queries",
    defaultBubbleImg: "/assets/landing-asset/assemble/btn-bg-bubble.svg",
    activeBubbleImg: "/assets/landing-asset/assemble/pink-btn-bubble.svg",
    textColor: "#FF8FFF",
    brainPart: "/assets/landing-asset/Brains/pink-brain-part.svg",
    style: { top: "19.9%", left: "31.2%", width: "24.6%", height: "12.8%" },
  },
  {
    id: 1,
    label: "Book Meetings",
    defaultBubbleImg: "/assets/landing-asset/assemble/btn-bg-bubble.svg",
    activeBubbleImg: "/assets/landing-asset/assemble/green-btn-bubble.svg",
    textColor: "#CDFF6A",
    brainPart: "/assets/landing-asset/Brains/green-brain-part.svg",
    style: { top: "20%", right: "18.6%", width: "24.6%", height: "12.8%" },
  },
  {
    id: 3,
    label: "Sell Products",
    defaultBubbleImg: "/assets/landing-asset/assemble/btn-bg-bubble.svg",
    activeBubbleImg: "/assets/landing-asset/assemble/purple-btn-bubble.svg",
    textColor: "#766AFF",
    brainPart: "/assets/landing-asset/Brains/purple-brain-part.svg",
    style: { top: "19.29%", left: "40.75%", width: "18.2%", height: "13%" },
  },
  {
    id: 4,
    label: "Collect Leads",
    defaultBubbleImg: "/assets/landing-asset/assemble/btn-bg-bubble.svg",
    activeBubbleImg: "/assets/landing-asset/assemble/cyan-btn-bubble.svg",
    textColor: "#6AFFF0",
    brainPart: "/assets/landing-asset/Brains/cyan-brain-part.svg",
    style: { top: "23.2%", left: "31.7%", width: "18.2%", height: "17.2%" },
  },
  {
    id: 5,
    label: "Offer Services",
    defaultBubbleImg: "/assets/landing-asset/assemble/btn-bg-bubble.svg",
    activeBubbleImg: "/assets/landing-asset/assemble/orange-btn-bubble.svg",
    textColor: "#FF9D5C",
    brainPart: "/assets/landing-asset/Brains/orange-brain-part.svg",
    style: { top: "15.3%", left: "38%", width: "24%", height: "10%" },
  },
  {
    id: 6,
    label: "Collect Payments",
    defaultBubbleImg: "/assets/landing-asset/assemble/btn-bg-bubble.svg",
    activeBubbleImg: "/assets/landing-asset/assemble/red-btn-bubble.svg",
    textColor: "#FF6363",
    brainPart: "/assets/landing-asset/Brains/red-brain-part.svg",
    style: { top: "23.2%", right: "31.7%", width: "18.5%", height: "17.2%" },
  },
];
const CTAButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #6aff97;
  padding: 1.43vh 1.2vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  color: black;
  width: 100%;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
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

const PracticalSection = styled.section`
  background: #aeb8ff;
  text-align: left;
  paading-top: 64px;
  padding: 5vh 2vw 5vh 2vw;
  border: 1px solid #000000;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (max-width: 600px) {
    gap: 0;
  }
`;

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-top: 6vh;
  height: 600px;
  background: #d5fff2;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    padding: 3vh 0 5vh 0;
    gap: 24px;
    height: auto;
    border: 1px solid #000000;
  }
`;

const PracticalCard = styled.div`
  background: #d5fff2;
  border: 1px solid #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6vh 2vw 4vh 2vw;
  overflow: hidden;
  width: 100%;
  height: 100%;
  @media (max-width: 800px) {
    padding: 0vh 3vw 0vh 3vw;
    border: none;
  }
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

const FeaturesSection = styled.article`
  text-align: left;
  padding: 6vh 2vw 5vh 2vw;
  height: 100%;
  background: #ffd2ba;
  border: 1px solid #000000;
  @media (max-width: 900px) {
    padding: 2vh 3vw 2vh 3vw;
    flex-direction: column;
  }
`;

const FeaturesRow = styled.div`
  margin-top: 6vh;
  display: flex;
  gap: 4vw;
  width: 100%;
  min-height: 380px;
  background: #ffd2ba;
  @media (max-width: 900px) {
    flex-direction: column;
    min-height: 500px;
    margin-top: 0vh;
  }
  @media (max-width: 600px) {
    min-height: 400px;
  }
`;

const FeaturesLeft = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  @media (max-width: 900px) {
    width: 100%;
    height: 50%;
  }
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  position: relative;
  @media (max-width: 900px) {
    width: 100%;
    gap: 24px;
  }
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const FeatureListLabelBox = styled.div`
  display: flex;
  align-items: center;
  z-index: 2;
  position: relative;
`;
const FeatureListItem = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  // background: ${({ selected }) => (selected ? "#6AFF97" : "#fff")};
  background: #ffd2ba;
  cursor: pointer;
  width: 100%;
  position: relative;
  z-index: 20;
  @media (max-width: 900px) {
    min-height: 44px;
    flex-direction: row-reverse
    align-items: start;
  }
`;

const FeatureListLabel = styled.div`
  color: #444;
  font-size: clamp(0.8rem, 4vw, 1rem);
  font-weight: 800;
  text-align: left;
  border-radius: 900px;
  width: calc(100%);
  height: 100%;
  padding: 2vh 2vw;
  position: relative;
  border: 1px solid black;
  @media (max-width: 768px) {
    width: 90%;
    margin: 0 auto;
    border: 1px solid #000000;
    padding: 2vh 5vw 2vh 2vw;
  }
`;

const FeatureListH1 = styled.h2`
  font-family: "DM Sans", sans-serif;
  font-size: clamp(15px, 4vw, 16px);
  font-weight: 600;
  color: #000000;
  text-align: right;
  white-space: nowrap;
`;
const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  border: 1px solid #000000;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  z-index: 1;
  @media (max-width: 900px) {
    width: 48px;
    height: 48px;
  }
  @media (max-width: 400px) {
    width: 38px;
    height: 38px;
  }
`;

const FeatureListDesc = styled.div`
  font-family: "DM Sans", sans-serif;
  font-size: 1rem;
  color: #222;
  font-weight: 400;
  text-align: right;
  white-space: nowrap;
  @media (max-width: 900px) {
    white-space: wrap;
  }
`;

const FeaturesRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;
  @media (max-width: 900px) {
    width: 100%;
    height: 50%;
  }
  @media (max-width: 600px) {
    width: 100%;
  }
`;
const FeatureImageBoxContainer = styled.div`
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  display: none;
  width: 100%;
  height: 100%;
  @media (max-width: 900px) {
    width: 100%;
    display: flex
  }

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
 `;
const FeatureImageBox = styled.div`
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  display: flex;
  width: 100%;
  height: 100%;
  @media (max-width: 900px) {
    width: 100%;
    display: none;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

// Add icons for each feature (use emoji or SVG placeholder for now)
const FeatureIcons = [
  "/assets/icons/black-message-icon.svg",
  "/assets/icons/black-buy-icon.svg", // Sell Products
  "/assets/icons/black-calendar-icon.svg", // Book Appointments
  "/assets/icons/black-profile-icon.svg", // Capture Leads
  "/assets/icons/black-creditcard-icon.svg", // Accept Payments
  "/assets/icons/black-popup-icon.svg", // Send Confirmations
  "/assets/icons/black-link-icon.svg", // Integrates MCP Servers
];

const selectedFeatureIcons = [
  "/assets/icons/message-icon.svg",
  "/assets/icons/buy-icon.svg", // Sell Products
  "/assets/icons/calendar-icon.svg", // Book Appointments
  "/assets/icons/profile-icon.svg", // Capture Leads
  "/assets/icons/creditcard-icon.svg", // Accept Payments
  "/assets/icons/popup-icon.svg", // Send Confirmations
  "/assets/icons/link-icon.svg", // Integrates MCP Servers
];

const PlatformSection = styled.section`
  text-align: left;
  height: 100%;
  width: 100%;
  background: #fffcc8;
  border: 1px solid #000000;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  position: relative;
  @media (max-width: 900px) {
    padding: 4vh 6vw 0 8vw;
    flex-direction: column;
    border-bottom: none;
  }
  @media (max-width: 500px) {
    padding: 4vh 0vw 0 0vw;
  }
`;
const PlatformLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 6vh 0vw 0 2vw;
  @media (max-width: 900px) {
    width: 100%;
    padding: 0vh 4vw;
    align-items: center;
    text-align: center;
  }
`;
const PlatformCardsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
  padding: 0 4vw 0 0;
  min-height: 500px;
  height: 100%;
  width: fit-content;
  margin-left: auto;
  @media (max-width: 900px) {
    padding: 0 0vw 4vh 0vw;
  }
`;

const PlatformCard = styled.div`
  margin-left: auto;
  gap: 24px;
  width: 80%;
  position: relative;
  z-index: 10;
  @media (max-width: 800px) {
    width: 100%;
  }
  span {
    display: flex;
    align-items: center;
    gap: 20px;
    background: white;
    width: 100%;
    border: 1px solid black;
    height: 100%;
    color: black;
    padding: 2vh 2vw;
    border-radius: 80px;
    text-align: left;
    @media (max-width: 600px) {
      border-radius: 40px;
      align-items: end;
      flex-direction: row-reverse;
      justify-content: start;
      padding: 2vh 5vw 2vh 2vw;
    }
    &::before {
      content: "";
      position: absolute;
      transform: translate(-0.8rem, -0.05rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
      border-bottom: 24px solid white;
      z-index: 0;
      @media (max-width: 600px) {
        transform: translate(0.5rem, -0.05rem);
        border-left: 28px solid transparent;
        border-right: 28px solid transparent;
        border-bottom: 28px solid white;
      }
    }
    &::after {
      content: "";
      position: absolute;
      transform: translate(-0.65rem, 0rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 40px solid transparent;
      border-right: 40px solid transparent;
      border-bottom: 40px solid black;
      z-index: -10;
      @media (max-width: 600px) {
        transform: translate(0.65rem, 0);
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 30px solid black;
      }
    }
  }
`;

const PlatformIcon = styled.div`
  width: fit-content;
  height: fit-content;
`;

const PlatformCardTitle = styled.h3`
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 700;
`;

const PlatformCardDesc = styled.p`
  font-family: "DM Sans", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: #212121;
  padding: 0 4vw 0 00;
  @media (max-width: 900px) {
    padding: 0;
  }
`;

const AssembleSection = styled.section`
  background: #f5f6fa;
  border: 2px solid #000000;
`;

const AssembleGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: center;
  width: 100%;
  height: 100%;
  @media (max-width: 900px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;
const AssembleCard = styled.div`
  padding: 0.5vh 6px;
  img {
    border: 3px solid black;
    object-fit: obtain;
  }
`;

const BuildAgentSection = styled.section`
  text-align: left;
  height: 100%;
  background: #fde5ff;
  border: 1px solid #000000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 900px) {
    gap: 20px;
    flex-direction: column;
  }
  .upper {
    padding: 8vh 2vw 5vh 2vw;
    display: flex;
    flex-direction: column;
    gap: 24px;
    @media (max-width: 600px) {
      padding: 8vh 4vw 5vh 2vw;
    }
  }
  .below-section {
    border-top: 1px solid black;
    .card-container {
      margin-top: 3rem;
      display: grid;
      grid-auto-flow: row;
      justify-content: center; /* Center the first row */
      grid-template-columns: repeat(auto-fit, minmax(320px, max-content));
      column-gap: 24px;
      row-gap: 60px;
      padding: 8vh 2vw;
      width: 100%;
      @media (max-width: 400px) {
        grid-template-columns: repeat(auto-fit, minmax(100%, max-content));
      }
      .your-ai-card {
        background: #fff;
        border-radius: 0;
        min-height: 70px;
        width: 320px;
        position: relative;
        border: 1px solid black;
        display: flex;
        flex-direction: column;
        padding: 0;
        @media (max-width: 400px) {
          width: 100%;
        }
        @media (max-width: 400px) {
          width: 100%;
        }
        .top-heading {
          position: absolute;
          top: -30px;
          left: 12px;
          width: fit-content;
          .green-card-title {
            width: 100%;
            position: relative;
            z-index: 10;
            position: relative;
            span {
              min-width: 200px;
              background: #9affdc;
              display: flex;
              width: 100%;
              align-items: center;
              min-height: 50px;
              font-size: clamp(1rem, 4vw, 1.2rem);
              height: 100%;
              text-align: left;
              border: 1px solid black;
              border-radius: 40px;
              h2 {
                font-size: clamp(1.1rem, 4vw, 1.4rem);
                font-family: "Lato", sans-serif;
                font-weight: 800;
                padding-left: 1.5rem;
              }
              &::before {
                content: "";
                position: absolute;
                transform: translate(0.5rem, -0.05rem);
                width: 0;
                height: 0;
                right: 0;
                bottom: 0;
                z-index: 0;
                border-left: 24px solid transparent;
                border-right: 24px solid transparent;
                border-bottom: 24px solid #9affdc;
                @media (max-width: 600px) {
                  transform: translate(0.5rem, -0.05rem);
                  border-left: 28px solid transparent;
                  border-right: 28px solid transparent;
                  border-bottom: 28px solid #9affdc;
                }
              }
              &::after {
                content: "";
                position: absolute;
                transform: translate(0.65rem, 0rem);
                bottom: 0px;
                right: 0;
                width: 0;
                height: 0;
                border-left: 40px solid transparent;
                border-right: 40px solid transparent;
                border-bottom: 40px solid black;
                z-index: -4;

                @media (max-width: 600px) {
                  transform: translate(0.65rem, 0);
                  border-left: 30px solid transparent;
                  border-right: 30px solid transparent;
                  border-bottom: 30px solid black;
                }
              }
            }
          }
        }

        .card-heading {
          background: #fde5ff;
          width: 100%;
          padding: 4vh 2vw 2vh 2vw;
          height: fit-content;
          h1 {
            font-family: "Lato", sans-serif;
            font-weight: 700;
            font-size: clamp(0.9rem, 4vw, 1.2rem);
            @media (max-width: 600px) {
              text-align: right;
            }
          }
        }
        .content {
          border-top: 1px solid black;
          width: 100%;
          padding: 2vh 2vw 6vh 2vw;
        }
      }
    }
  }
`;
const AppOverloadSection = styled.section`
  text-align: left;
  height: 100%;
  background: #e3f6ff;
  border: 1px solid #000000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 900px) {
    padding: 2vh 2vw 5vh 2vw;
    gap: 20px;
    flex-direction: column;
  }
`;
const AppOverloadUpper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  position: relative;
  z-index: 10;
  padding: 8vh 2vw 5vh 2vw;
  @media (max-width: 600px) {
    padding: 0 4vw 2vh 2vw;
  }
`;
const AppOverloadLower = styled.div`
  background: #fff;
  @media (max-width: 900px) {
    background: #e3f6ff;
  }
`;
const AppOverloadCardsRow = styled.div`
  display: grid;
  grid-auto-flow: row;
  justify-content: center; /* Center the first row */
  grid-template-columns: repeat(auto-fit, minmax(200px, max-content));
  gap: 12px;
  padding: 1vh 1vw;
  width: 100%;
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(190px, max-content));
  }
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, max-content));
  }
  @media (max-width: 1100px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, max-content));
  }
  @media (max-width: 450px) {
    gap: 8px;
    grid-template-columns: repeat(auto-fit, minmax(250px, max-content));
  }
`;

const AppOverloadCard = styled.div`
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  width: 220px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  border: 1px solid #000000;
  position: relative;
  @media (max-width: 1400px) {
    width: 200px;
    height: 190px;
  }
  @media (max-width: 1200px) {
    width: 180px;
  }
  @media (max-width: 1100px) {
    width: 180px;
  }
  @media (max-width: 450px) {
    width: 250px;
  }
`;
const AppOverloadCardTop = styled.div`
  width: 100%;
  height: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid black;
  padding-top: 2vh;
`;

const AppOverloadCardTitle = styled.div`
  white-space: nowrap;
  font-size: clamp(12px, 4vw, 16px);
  font-family: "DM Sans", sans-serif;
  font-weight: 700;
  color: #000;
  text-align: center;
`;

const AppOverloadIcon = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #018ac5;
  margin-bottom: 0;
  background-color: white;
  border-radius: 50%;
  margin-top: -20px;
  .icon-img {
    height: 40px;
  }
  @media (max-width: 700px) {
    width: 48px;
    height: 48px;
    .icon-img {
      height: 35px;
    }
  }
`;

const AppOverloadCardBottom = styled.div`
  background: #fff;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 60%;
  padding-bottom: 2vh;
  justify-content: end;
`;

const AppOverloadCardSub = styled.div`
  font-size: 0.97rem;
  font-family: "DM Sans", sans-serif;
  color: #000;
  font-weight: 400;
`;

const AppOverloadCardReplace = styled.div`
  font-size: 1.08rem;
  font-family: "DM Sans", sans-serif;
  color: #000;
  font-weight: 500;
`;

const IntegrationsSection = styled.section`
  background: #cbd1ff;
  text-align: left;
  height: 100%;
  border: 1px solid #000000;
  display: flex;
  padding: 8vh 2vw 5vh 2vw;
  flex-direction: column;
  gap: 8px;
  @media (max-width: 900px) {
    padding: 2vh 2vw 5vh 2vw;
    flex-direction: column;
  }
  @media (max-width: 600px) {
    padding: 0 4vw 2vh 2vw;
  }
`;

const IntegrationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 22px;
  place-items: center;
  width: 100%;
  padding: 2vh 2vw 6vh 2vw;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 0vh 2vw 4vh 2vw;
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
  border: 1px solid black;
  width: 120px;
  height: 120px;
  text-align: center;
  padding: 15px;
  @media (max-width: 900px) {
    font-size: 1.5rem;
    border-radius: 14px;
    padding: 12px;
    width: 100px;
    height: 100px;
  }
  @media (max-width: 600px) {
    border-radius: 12px;
    width: 80px;
    height: 80px;
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
  color: #fff;
  position: relative;
  overflow: hidden;
  height: 100%;
`;

const FooterUpper = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 6px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  height: 100%;
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
`;

const FooterLeft = styled.div`
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  padding: 10vh 3vw;
  width: 70%;
  @media (max-width: 800px) {
    width: 100%;
    padding: 3vh 3vw;
    text-align: center;
  }
`;

const FooterHeadline = styled.h2`
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 8px;
  font-family: "Lato", sans-serif;
`;

const FooterSub = styled.p`
  font-family: "DM Sans", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: #e6eaff;
  margin-bottom: 8px;
`;

const FooterRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  width: 30%;
  gap: 6px;
  position: relative;
  @media (max-width: 800px) {
    width: 100%;
    flex-direction: row;
    background: #0a0a0a;
    justify-content: space-between;
    padding: 1vh 3vw;
  }
`;

const FooterSocial = styled.div`
  background: #434eb1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1.08rem;
  width: 100%;
  padding: 4vh 3vw;
  @media (max-width: 800px) {
    width: fit-content;
    gap: 0;
    background: #0a0a0a;
  }
`;

const SocialIcon = styled.a`
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
const FooterLogo = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  position: relative;
  gap: 12px;
  font-size: 1.08rem;
  width: 100%;
  padding: 2vh 3vw 4vh 3vw;
  background: #0a0a0a;
  height: 100%;
  @media (max-width: 800px) {
    width: fit-content;
    padding: 3vh 3vw;
  }
`;
const FooterBelow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  place-items: center;
  column-gap: 8px;
  row-gap: 12px;
  margin: 6px 4px;

  @media (max-width: 1500px) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    .footer-card-6,
    .footer-card-7,
    .footer-card-8 {
      display: none;
    }
  }
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    .footer-card-5 {
      display: none;
    }
  }
  @media (max-width: 750px) {
    grid-template-columns: 1fr 1fr 1fr;
    .footer-card-4 {
      display: none;
    }
  }
  @media (max-width: 550px) {
    grid-template-columns: 1fr 1fr;
    .footer-card-3 {
      display: none;
    }
  }
`;

const Home = () => {
  const [selectedBrains, setSelectedBrains] = useState([0]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [selectedFeature, setSelectedFeature] = useState(features[0].key);
  // Track if user manually selected a feature
  const [userSelected, setUserSelected] = useState(false);

  const selected = features.find((f) => f.key === selectedFeature);
  const navigate = useNavigate();

  // Auto-advance feature section every 3 seconds
  useEffect(() => {
    if (userSelected) {
      // If user manually selected, reset flag and skip this interval
      setUserSelected(false);
      return;
    }
    const currentIdx = features.findIndex((f) => f.key === selectedFeature);
    const nextIdx = (currentIdx + 1) % features.length;
    const timer = setTimeout(() => {
      setSelectedFeature(features[nextIdx].key);
    }, 3000);
    return () => clearTimeout(timer);
  }, [selectedFeature, userSelected]);

  const handleSelectBrain = (index: number) => {
    if (index === 0) return;
    if (selectedBrains.includes(index)) {
      setSelectedBrains(selectedBrains.filter((i) => i !== index));
    } else {
      setSelectedBrains([...selectedBrains, index].sort((a, b) => a - b));
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Clean up when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <Helmet>
        <title>Sayy.ai – One AI Agent to Run Your Whole Business</title>
        <meta
          name="description"
          content="Replace Shopify, Calendly, and CRMs with a single AI agent. Sayy handles sales, bookings, support, and payments—all in one simple dashboard."
        />
        <meta
          name="keywords"
          content="AI agent, business automation, sales automation, customer support, booking system, CRM, Shopify alternative"
        />
        <meta
          property="og:title"
          content="Sayy.ai | AI Agent Builder – One AI Agent to Run Your Whole Business"
        />
        <meta
          property="og:description"
          content="Sayy replaces 10+ business apps with a single AI agent. Sell, support, and grow—all from one dashboard."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sayy.ai" />
        <meta
          property="og:image"
          content="https://gobbl-restaurant-bucket.s3.ap-south-1.amazonaws.com/banner.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Sayy.ai | AI Agent Builder – One AI Agent to Run Your Business"
        />
        <meta
          name="twitter:description"
          content="Your AI-powered assistant for sales, support, payments, and more."
        />
        <meta
          name="twitter:image"
          content="https://gobbl-restaurant-bucket.s3.ap-south-1.amazonaws.com/banner.jpg"
        />
        <link rel="canonical" href="https://sayy.ai" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Sayy.ai",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Sayy.ai is an AI-powered business automation platform that replaces multiple business tools with a single intelligent agent.",
          })}
        </script>
      </Helmet>
      <Container>
        <header>
          <Navbar $scrolled={scrolled}>
            <Header
              style={{
                background: menuOpen ? "#140065" : "transparent",
              }}
            >
              <Logo>
                <span onClick={() => navigate("/")}>
                  <img
                    src="/assets/Sayy AI Logo.svg"
                    alt="Sayy.ai Logo - AI Business Automation Platform"
                    width={80}
                  />
                </span>
                <NavLink
                  className="hidden [@media(min-width:601px)]:flex"
                  onClick={() => navigate("/pricing")}
                >
                  PRICING
                </NavLink>
              </Logo>
              <NavLinks className="">
                <div className="relative z-10 hidden [@media(min-width:601px)]:flex">
                  <LoginButton onClick={() => navigate("/admin")}>
                    Login/Sign up
                  </LoginButton>
                </div>
                <div className="relative z-10 hidden [@media(max-width:601px)]:block">
                  {!menuOpen ? (
                    <LoginButton
                      onClick={() => setMenuOpen(!menuOpen)}
                      style={{ minWidth: "fit-content" }}
                    >
                      <Menu />
                    </LoginButton>
                  ) : (
                    <LoginButton
                      onClick={() => setMenuOpen(!menuOpen)}
                      style={{ minWidth: "fit-content" }}
                    >
                      <X />
                    </LoginButton>
                  )}
                </div>
                {menuOpen && (
                  <div className=" hidden [@media(max-width:601px)]:flex w-full h-[100vh] flex flex-col gap-12 py-8 absolute right-0 mt-4 w-48 bg-black shadow-lg">
                    <NavLink
                      style={{
                        borderBottom: "1px solid #fff",
                        width: "80%",
                        borderRadius: "0px",
                        margin: "0 auto",
                        padding: "2vh 2vw",
                      }}
                      className=""
                      onClick={() => navigate("/pricing")}
                    >
                      PRICING
                    </NavLink>
                    <div
                      className="relative z-10"
                      style={{
                        width: "80%",
                        borderRadius: "0px",
                        margin: "0 auto",
                      }}
                    >
                      <LoginButton
                        style={{ width: "100%" }}
                        onClick={() => navigate("/admin")}
                      >
                        Login/Sign up
                      </LoginButton>
                    </div>
                  </div>
                )}
              </NavLinks>
            </Header>
          </Navbar>
        </header>

        <main>
          <section
            className="practial-section relative w-full"
            aria-label="Hero Section"
          >
            <HeroSection>
              <div className="box-img absolute -top-20 -right-4 sm:top-0 sm:right-0 ">
                <img
                  src="/assets/landing-asset/assemble/blue-dots.png"
                  alt="Decorative blue dots pattern"
                />
              </div>
              <div className="box-img absolute top-0 left-0 hidden md:block">
                <img
                  src="/assets/landing-asset/assemble/small-blue-dots.png"
                  alt="Decorative small blue dots pattern"
                />
              </div>
              <article className="left-side w-[100%] lg:w-[fit-content] z-10">
                <div className="headline flex gap-4 flex-col items-center lg:flex-row">
                    <img
                      src="/assets/landing-asset/assemble/homepage-logo.svg"
                      alt="Sayy.ai Homepage Logo"
                      className=""
                    />
                    <span className="flex flex-col items-end justify-end md:mt-8">
                      <Headline>to your new Employee</Headline>
                      <img
                        src="/assets/landing-asset/assemble/underline.png"
                        alt="Decorative underline"
                      />
                    </span>
                </div>
                <Subheadline>
                  <div className="headline-para mt-4 mb-10 lg:mt-0 lg:mb-8 w-[100%] text-center lg:text-start">
                    <p className="para-font text-[1rem]">
                      Your practical AI Co-Pilot for business growth. <br /> Handle
                      sales, support, and scheduling—all in one place.
                    </p>
                  </div>
                  <div className="w-fit flex flex-col">
                    <span className="heading flex items-center">
                      <p className="text-[#AEB8FF]">Select their tasks</p>
                      <ChevronRight
                        size={16}
                        className="ml-2 mt-1 stroke-4 stroke-grey-400"
                      />
                    </span>

                    <div className="btns grid grid-cols-2 gap-x-4 gap-y-8 mt-4 place-items-center">
                      {buttonData.map((btn, id) => {
                        const isSelected = selectedBrains.includes(id);
                        return (
                          <button
                            key={id}
                            className="relative inline-block"
                            onClick={() => handleSelectBrain(id)}
                            aria-label={`Select ${btn.label} feature`}
                            role="button"
                          >
                            <img
                              src={
                                isSelected
                                  ? btn.activeBubbleImg
                                  : btn.defaultBubbleImg
                              }
                              alt={`${btn.label} feature button`}
                              className="block w-fit h-[40px] sm:h-[50px]"
                            />
                            <div
                              className={`para-font absolute top-2 sm:top-3 left-2 xs:left-4 whitespace-nowrap flex items-center justify-center text-center px-2 text-[14px] sm:text-[16px] md:text-[14px] lg:text-[16px] transition-all duration-200`}
                              style={{
                                color: isSelected ? btn.textColor : "#fff",
                                fontWeight: isSelected ? "600" : "400",
                              }}
                            >
                              {btn.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative z-10 mt-12">
                      <CTAButton onClick={() => navigate("/admin")}>
                        LAUNCH MY FREE AI-MPLOYEE
                        <ChevronRight size={20} className="ml-2" />
                      </CTAButton>
                    </div>
                  </div>
                </Subheadline>
              </article>
              <article className="right-side lg:block w-[80%] lg:w-[40%] z-10 lg:mt-16 ">
                <div className="relative">
                  <span className="relative">
                    <img
                      src="/assets/landing-asset/assemble/hero-mascot.png"
                      alt="Sayy.ai AI Assistant Mascot"
                    />
                    {buttonData.map((part, index) => (
                      <div
                        key={part.id}
                        style={{
                          position: "absolute",
                          top: part.style.top,
                          left: part.style.left,
                          right: part.style.right,
                          width: part.style.width,
                          height: part.style.height,
                        }}
                        className={`transition-opacity duration-300 ${
                          selectedBrains.includes(index)
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <img
                          src={part.brainPart}
                          alt={`${part.label} brain part visualization`}
                          className="w-fit h-full"
                        />
                      </div>
                    ))}
                  </span>
                  <div
                    style={{
                      background:
                        "linear-gradient(0deg,rgba(0, 0, 0, 1) 16%, rgba(0, 0, 0, 0) 100%)",
                      backgroundRepeat: "no-repeat",
                      height: "30%",
                      width: "100%",
                    }}
                    className="absolute bottom-5"
                  ></div>
                </div>
              </article>
            </HeroSection>
          </section>

          <section
            className="practical-section relative w-full bg-[#ECECEC] px-[2vw] md:lg:px-[4vw] lg:px-[6vw] py-[6vh]"
            aria-label="About Section"
          >
            <PracticalSection>
              <BlackBackground>
                <span className="card-1 relative z-10 w-full h-fit">
                  <h1 className="px-3">Sayy? What's that?</h1>
                </span>
              </BlackBackground>
              <WhiteBackground
                style={{ width: "80%", marginLeft: "auto", marginRight: "0" }}
              >
                <span className="para-font mt-4 font-[400] text-[1rem]">
                  Imagine an AI that does the work of an entire team: selling
                  your services, supporting customers, capturing leads, and
                  managing operations – all through simple, intelligent
                  conversations, 24 hours a day. No coding skills needed.
                </span>
              </WhiteBackground>
            </PracticalSection>
            <CardsRow>
              {/* card 1 */}
              <PracticalCard>
                <BlackBackground>
                  <span className="card-1 relative z-10 w-full h-fit">
                    <h1 className="px-3">Who is Sayy AI for?</h1>
                  </span>
                </BlackBackground>
                {/* for mobile */}
                <div className="hidden w-full max-[800px]:flex w-full justify-center mb-6">
                  <WhiteBackground
                    style={{ margin: "0 2vw", width: "100%" }}
                    className=""
                  >
                    <span style={{ padding: "2vh 2vw", width: "100%" }}>
                      <h3 className="para-font text-[16px] font-[800] text-center z-10 relative">
                        Solopreneurs, E-Commerce & Service Providers
                      </h3>
                    </span>
                  </WhiteBackground>
                </div>
                <div className="practical-card-content max-w-[350px]">
                  <div className="hidden min-[801px]:flex w-full flex-col gap-2 justify-center">
                    <WhiteBackground
                      style={{
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: "95%",
                          padding: "1.2vh 2vw ",
                          marginRight: "20px",
                        }}
                      >
                        <h1 className="main-font text-[20px] lg:text-[24px] font-[800]">
                          Solopreneurs
                        </h1>
                      </span>
                    </WhiteBackground>
                    <WhiteBackground
                      style={{
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: "95%",
                          padding: "1.2vh 2vw ",
                          marginRight: "20px",
                        }}
                      >
                        <h3 className="para-font text-[0.9rem] font-[400]">
                          The power of a full team working for you, without
                          traditional hiring costs.
                        </h3>
                      </span>
                    </WhiteBackground>
                  </div>

                  <div className="for-card bg-[#fff] mt-2 w-full px-[6px] py-[6px] rounded-[10px] border border-black [@media(max-width:600px)]:max-w-[320px]">
                    {/* for mobile */}
                    <div className="mob-upper-content hidden max-[800px]:flex w-full flex-col gap-2 text-center py-2 px-2">
                      <h1 className="main-font text-[20px] font-[800]">
                        Solopreneurs
                      </h1>
                      <p className="para-font text-[0.9rem] font-[400]">
                        The power of a full team working for you, without
                        traditional hiring costs.
                      </p>
                    </div>
                    <img
                      src="/assets/landing-asset/assemble/who-card-1.png"
                      alt="Solopreneurs using Sayy.ai - Creators, Freelancers, Coaches & Consultants"
                      width={"100%"}
                    />
                    <div className="content bg-[#FFFEB2] w-full border border-black mt-[6px] px-4 py-1">
                      <p className="text-center para-font text-[14px] font-[500]">
                        Creators, Freelancers, <br /> Coaches & Consultants
                      </p>
                    </div>
                  </div>
                </div>
              </PracticalCard>

              {/* card 2 */}
              <PracticalCard style={{ justifyContent: "center" }}>
                <div className="practical-card-content max-w-[350px]">
                  <div className="hidden min-[801px]:flex w-full flex-col gap-2 justify-center">
                    <WhiteBackground
                      style={{
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: "95%",
                          padding: "1.2vh 2vw ",
                          marginRight: "20px",
                        }}
                      >
                        <h1 className="main-font text-[20px] lg:text-[24px] font-[800]">
                          E-Commerce
                        </h1>
                      </span>
                    </WhiteBackground>
                    <WhiteBackground
                      style={{
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: "95%",
                          padding: "1.2vh 2vw ",
                          marginRight: "20px",
                        }}
                      >
                        <h3 className="para-font text-[0.9rem] font-[400]">
                          Your intelligent storefront guiding customers and
                          closing sales 24x7.
                        </h3>
                      </span>
                    </WhiteBackground>
                  </div>
                  <div className="for-card bg-[#fff] mt-2 w-full px-[6px] py-[6px] rounded-[10px] border border-black [@media(max-width:600px)]:max-w-[320px]">
                    <div className="mob-upper-content hidden max-[800px]:flex w-full flex-col gap-2 text-center py-2 px-2">
                      <h1 className="main-font text-[20px] font-[800]">
                        E-Commerce
                      </h1>
                      <p className="para-font text-[0.9rem] font-[400]">
                        Your intelligent storefront guiding customers and
                        closing sales 24x7.
                      </p>
                    </div>
                    <img
                      src="/assets/landing-asset/assemble/who-card-2.png"
                      alt="E-commerce businesses using Sayy.ai - Online stores and D2C brands"
                      width={"100%"}
                    />
                    <div className="content bg-[#FFFEB2] w-full border border-black mt-[6px] px-4 py-1">
                      <p className="text-center para-font text-[14px] font-[500]">
                        E-commerce, D2C brands <br /> & Influencer storefronts
                      </p>
                    </div>
                  </div>
                </div>
              </PracticalCard>

              {/* card 3 */}
              <PracticalCard>
                <div className="practical-card-content max-w-[350px]">
                  <div className="hidden min-[801px]:flex w-full flex-col gap-2 justify-center">
                    <WhiteBackground
                      style={{
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: "95%",
                          padding: "1.2vh 2vw ",
                          marginRight: "20px",
                        }}
                      >
                        <h1 className="main-font text-[20px] lg:text-[24px] font-[800]">
                          Service Providers
                        </h1>
                      </span>
                    </WhiteBackground>
                    <WhiteBackground
                      style={{
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: "95%",
                          padding: "1.2vh 2vw ",
                          marginRight: "20px",
                        }}
                      >
                        <h3 className="para-font text-[0.9rem] font-[400]">
                          Your AI front desk handling bookings, leads, and
                          nurturing client relationships..
                        </h3>
                      </span>
                    </WhiteBackground>
                  </div>
                  <div className="for-card bg-[#fff] mt-2 w-full px-[6px] py-[6px] rounded-[10px] border border-black [@media(max-width:600px)]:max-w-[320px]">
                    <div className="mob-upper-content hidden max-[800px]:flex w-full flex-col gap-2 text-center py-2 px-2">
                      <h1 className="main-font text-[20px] font-[800]">
                        Service Providers
                      </h1>
                      <p className="para-font text-[0.9rem] font-[400]">
                        Your AI front desk handling bookings, leads, and
                        nurturing client relationships.
                      </p>
                    </div>
                    <img
                      src="/assets/landing-asset/assemble/who-card-3.png"
                      alt="Service providers using Sayy.ai - Hospitality, Wellness, Legal & Home Services"
                      width={"100%"}
                    />
                    <div className="content bg-[#FFFEB2] w-full border border-black mt-[6px] px-4 py-1">
                      <p className="text-center para-font text-[14px] font-[500]">
                        Hospitality, Wellness, <br /> Legal & Home Services
                      </p>
                    </div>
                  </div>
                </div>
              </PracticalCard>
            </CardsRow>
          </section>

          <section
            className="practial-section relative w-full bg-[#ECECEC] px-[2vw] md:lg:px-[4vw] lg:px-[6vw] py-[6vh] max-[900px]:pb-0"
            aria-label="Platforms Section"
          >
            <PlatformSection>
              <PlatformLeft className="left-side">
                <BlackBackground>
                  <span className="card-1 relative z-10 w-full h-fit">
                    <h1 className="px-3">Where all can I use my AI-mployee?</h1>
                  </span>
                </BlackBackground>
                <PlatformCardsRow className="">
                  <PlatformCard className="">
                    <span className="">
                      <PlatformIcon className="w-[20%]">
                        <img
                          src="assets/landing-asset/platform/social.png"
                          alt="Social Media Integration Icon"
                          className="object-contain w-20 sm:w-22"
                        />
                      </PlatformIcon>
                      <div className="flex flex-col w-[80%] px-4">
                        <PlatformCardTitle>Link-in-Bio</PlatformCardTitle>
                        <PlatformCardDesc>
                          Add your assistant to your social links — like a
                          smart, interactive AI storefront.
                        </PlatformCardDesc>
                      </div>
                    </span>
                  </PlatformCard>
                  <PlatformCard className="">
                    <span>
                      <PlatformIcon className="w-[20%]">
                        <img
                          src="assets/landing-asset/platform/website.png"
                          alt="Website Integration Icon"
                          className="object-contain w-20 sm:w-22"
                        />
                      </PlatformIcon>
                      <div className="flex flex-col w-[80%] px-4">
                        <PlatformCardTitle>Website</PlatformCardTitle>
                        <PlatformCardDesc>
                          Install our AI Agent directly onto your site for
                          seamless customer interactions
                        </PlatformCardDesc>
                      </div>
                    </span>
                  </PlatformCard>
                  <PlatformCard className="">
                    <span>
                      <PlatformIcon className="w-[20%]">
                        <img
                          src="assets/landing-asset/platform/chatgpt.png"
                          alt="ChatGPT Integration Icon"
                          className="object-contain w-20 sm:w-22"
                        />
                      </PlatformIcon>
                      <div className="flex flex-col w-[80%] px-4">
                        <PlatformCardTitle>ChatGpt</PlatformCardTitle>
                        <PlatformCardDesc>
                          Transform the popular AI platform into your
                          personalized sales channel
                        </PlatformCardDesc>
                      </div>
                    </span>
                  </PlatformCard>
                </PlatformCardsRow>
              </PlatformLeft>
              <AssembleSection className="max-[900px]:hidden">
                <AssembleGrid>
                  <AssembleCard>
                    <img
                      src="/assets/landing-asset/assemble/use-my-ai-1.png"
                      alt="Sayy.ai AI Assistant on Social Media"
                      className="mascot-img"
                      width={250}
                    />
                  </AssembleCard>
                  <AssembleCard>
                    <img
                      src="/assets/landing-asset/assemble/use-my-ai-2.png"
                      alt="Sayy.ai AI Assistant on Website"
                      className="mascot-img"
                      width={220}
                    />
                  </AssembleCard>
                  <AssembleCard>
                    <img
                      src="/assets/landing-asset/assemble/use-my-ai-3.png"
                      alt="Sayy.ai AI Assistant on ChatGPT"
                      className=""
                      width={250}
                    />
                  </AssembleCard>
                </AssembleGrid>
              </AssembleSection>
            </PlatformSection>
          </section>
          {/* in mobile Phone  */}
          <AssembleSection className="min-[901px]:hidden  max-[900px]:mb-[6vh]">
            <AssembleGrid>
              <AssembleCard>
                <img
                  src="/assets/landing-asset/assemble/use-my-ai-1.png"
                  alt="Sayy.ai AI Assistant on Social Media"
                  className="mascot-img"
                />
              </AssembleCard>
              <AssembleCard className="hidden sm:flex">
                <img
                  src="/assets/landing-asset/assemble/use-my-ai-2.png"
                  alt="Sayy.ai AI Assistant on Website"
                  className="mascot-img"
                />
              </AssembleCard>
              <AssembleCard>
                <img
                  src="/assets/landing-asset/assemble/use-my-ai-3.png"
                  alt="Sayy.ai AI Assistant on ChatGPT"
                  className=""
                />
              </AssembleCard>
            </AssembleGrid>
          </AssembleSection>

          <section
            className="practial-section relative w-full bg-[#ECECEC] px-[2vw] md:lg:px-[4vw] lg:px-[6vw] pb-[6vh]"
            aria-label="Build Agent Section"
          >
            <BuildAgentSection>
              <article className="upper">
                <BlackBackground>
                  <span className="card-1 relative z-10 w-full h-fit">
                    <h1 className="px-3">So, how do I build my AI-mployee?</h1>
                  </span>
                </BlackBackground>
                <WhiteBackground className="ml-auto mr-1">
                  <span className="card-2 ml-auto w-full h-fit">
                    Train your AI-mployee's intelligence and personality to
                    talk, think, and sell like you. No code needed.
                  </span>
                </WhiteBackground>
              </article>

              <article className="below-section h-[100%] bg-[#FDCDFF] relative w-full">
                <div className="tab w-[103%] sm:w-[90%] mx-auto flex items-center justify-between px-2 py-1 bg-[#FDCDFF] border border-black rounded-full absolute -top-7 left-1/2 transform -translate-x-1/2">
                  <h1 className="main-font font-[800] text-[18px]">
                    Your AI, Your Way
                  </h1>
                  <div className="icons flex items-center gap-1">
                    <span className="bg-[#fff] p-1 sm:p-2 m-auto rounded-full border border-black">
                      <img
                        src="/assets/icons/file-icon.svg"
                        width={20}
                        alt="File upload icon"
                      />
                    </span>
                    <span className="bg-[#fff] p-1 sm:p-2 m-auto rounded-full border border-black">
                      <File size={24}></File>
                    </span>
                  </div>
                </div>
                <div className="card-container mt-4">
                  <div className="your-ai-card">
                    <div className="top-heading relative z-10">
                      <div className="green-card-title">
                        <span>
                          <h2 className="relative z-10">Brain</h2>
                        </span>
                      </div>
                    </div>
                    <div className="card-heading">
                      <h1 className="">Smart beyond limits</h1>
                    </div>
                    <div className="content">
                      <div className="img">
                        <object
                          type="image/svg+xml"
                          data="https://shopify-gobbl-images-bucket.s3.ap-south-1.amazonaws.com/web+anim-1+%40sdevc.svg"
                          className="w-[150px] xs:w-[200px] h-auto"
                          aria-label="Brain feature animation"
                          role="img"
                        ></object>
                      </div>
                      <p className="para-font mt-4 font-[400] text-[1rem]">
                        Smarten up your Agent's brain with files, catalogs,
                        social links and all information related to your
                        business.
                      </p>
                    </div>
                  </div>
                  <div className="your-ai-card">
                    <div className="top-heading relative z-10">
                      <div className="green-card-title">
                        <span>
                          <h2 className="z-10 relative">Voice</h2>
                        </span>
                      </div>
                    </div>
                    <div className="card-heading">
                      <h1 className="">Selling like you would</h1>
                    </div>
                    <div className="content">
                      <div className="img">
                        <object
                          type="image/svg+xml"
                          data="https://shopify-gobbl-images-bucket.s3.ap-south-1.amazonaws.com/web+anim-3+%40sdevc.svg"
                          className="w-[150px] xs:w-[200px] h-auto"
                          aria-label="Voice feature animation"
                          role="img"
                        ></object>
                      </div>
                      <p className="para-font mt-4 font-[400] text-[1rem]">
                        Craft a conversational style that reflects your brand's
                        personality, from professional to playful.
                      </p>
                    </div>
                  </div>
                  <div className="your-ai-card">
                    <div className="top-heading relative z-10">
                      <div className="green-card-title">
                        <span>
                          <h2 className="z-10 relative">Appearance</h2>
                        </span>
                      </div>
                    </div>
                    <div className="card-heading">
                      <h1 className="">Your brand's extension</h1>
                    </div>
                    <div className="content">
                      <div className="img">
                        <object
                          type="image/svg+xml"
                          data="https://shopify-gobbl-images-bucket.s3.ap-south-1.amazonaws.com/web+anim-2%40sdevc.svg"
                          className="w-[150px] xs:w-[200px] h-auto"
                          aria-label="Appearance feature animation"
                          role="img"
                        ></object>
                      </div>
                      <p className="para-font mt-4 font-[400] text-[1rem]">
                        Customize chat themes, colors, and interactions to
                        create a seamless, on-brand user experience.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </BuildAgentSection>
          </section>

          <section
            className="practial-section w-full bg-[#ECECEC] px-[2vw] md:lg:px-[4vw] lg:px-[6vw]"
            aria-label="App Overload Section"
          >
            <AppOverloadSection>
              <AppOverloadUpper>
                <BlackBackground>
                  <span className="card-1 relative z-10 w-full h-fit">
                    <h1 className="px-3">
                      Can I really run my entire business from One app?
                    </h1>
                  </span>
                </BlackBackground>
                <WhiteBackground className="ml-auto">
                  <span className="card-2 ml-auto w-full h-fit">
                    One word - SAYY YES! We are reimagining common business
                    tools under one umbrella. It's time to stop switching tabs.
                    <h1 className="font-[700]">Goodbye, App Overload!</h1>
                  </span>
                </WhiteBackground>
                <BlackBackground>
                  <span className="relative z-10 w-full h-fit">
                    <h1 className="px-3">Replacing what tools?</h1>
                  </span>
                </BlackBackground>
              </AppOverloadUpper>

              <AppOverloadLower>
                <AppOverloadCardsRow>
                  <AppOverloadCard>
                    <AppOverloadCardTop style={{ background: "#C8EEFF" }}>
                      <AppOverloadCardTitle>
                        WEBSITE BUILDERS
                      </AppOverloadCardTitle>
                      <AppOverloadIcon>
                        <img
                          src="/assets/landing-asset/goodbye/web.png"
                          alt="Website Builder Integration Icon"
                          className="icon-img"
                        />
                      </AppOverloadIcon>
                    </AppOverloadCardTop>
                    <AppOverloadCardBottom>
                      <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                      <AppOverloadCardReplace>
                        Wix & Wordpress
                      </AppOverloadCardReplace>
                    </AppOverloadCardBottom>
                  </AppOverloadCard>

                  <AppOverloadCard>
                    <AppOverloadCardTop style={{ background: "#94DFFF" }}>
                      <AppOverloadCardTitle>
                        SCHEDULING APPS
                      </AppOverloadCardTitle>
                      <AppOverloadIcon>
                        <img
                          src="/assets/landing-asset/goodbye/calender.png"
                          alt="Calendar Integration Icon"
                          className="icon-img"
                        />
                      </AppOverloadIcon>
                    </AppOverloadCardTop>
                    <AppOverloadCardBottom>
                      <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                      <AppOverloadCardReplace>
                        Calendly & Cal
                      </AppOverloadCardReplace>
                    </AppOverloadCardBottom>
                  </AppOverloadCard>

                  <AppOverloadCard>
                    <AppOverloadCardTop style={{ background: "#c8eeff" }}>
                      <AppOverloadCardTitle>CHATBOTS</AppOverloadCardTitle>
                      <AppOverloadIcon>
                        <img
                          src="/assets/landing-asset/goodbye/chatbot.png"
                          alt="Chatbot Integration Icon"
                          className="icon-img"
                        />
                      </AppOverloadIcon>
                    </AppOverloadCardTop>
                    <AppOverloadCardBottom>
                      <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                      <AppOverloadCardReplace>
                        Tawk.to & Tidio
                      </AppOverloadCardReplace>
                    </AppOverloadCardBottom>
                  </AppOverloadCard>

                  <AppOverloadCard>
                    <AppOverloadCardTop style={{ background: "#94dfff" }}>
                      <AppOverloadCardTitle>CRMs</AppOverloadCardTitle>
                      <AppOverloadIcon>
                        <img
                          src="/assets/landing-asset/goodbye/group.png"
                          alt="CRM Integration Icon"
                          className="icon-img"
                        />
                      </AppOverloadIcon>
                    </AppOverloadCardTop>
                    <AppOverloadCardBottom>
                      <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                      <AppOverloadCardReplace>Hubspot</AppOverloadCardReplace>
                    </AppOverloadCardBottom>
                  </AppOverloadCard>

                  <AppOverloadCard style={{ background: "#c8eeff" }}>
                    <AppOverloadCardTop>
                      <AppOverloadCardTitle>
                        LINK-IN-BIO TOOLS
                      </AppOverloadCardTitle>
                      <AppOverloadIcon>
                        <img
                          src="/assets/landing-asset/goodbye/link.png"
                          alt="Link-in-Bio Integration Icon"
                          className="icon-img"
                        />
                      </AppOverloadIcon>
                    </AppOverloadCardTop>
                    <AppOverloadCardBottom>
                      <AppOverloadCardSub>Replaces</AppOverloadCardSub>
                      <AppOverloadCardReplace>
                        Linktree & Hopp
                      </AppOverloadCardReplace>
                    </AppOverloadCardBottom>
                  </AppOverloadCard>
                </AppOverloadCardsRow>
              </AppOverloadLower>
            </AppOverloadSection>
          </section>

          <section
            className="practial-section w-full bg-[#ECECEC] px-[2vw] md:lg:px-[4vw] lg:px-[6vw] pt-[6vh] pb-[8vh] lg:pb-[12vh]"
            aria-label="Integrations Section"
          >
            <IntegrationsSection>
              <BlackBackground>
                <span className="">
                  <h1 className="px-3">Extensive Integrations via MCP</h1>
                </span>
              </BlackBackground>
              <WhiteBackground className="ml-auto">
                <span className="">
                  Convert any API into a feature packed selling machine. Make
                  your agents powerful by integrating 200+ apps using Model
                  Context Protocol (MCP).
                </span>
              </WhiteBackground>
              <IntegrationsGrid>
                {integrationsGrid.map(({ name, src }, idx) => (
                  <IntegrationBox key={idx}>
                    <img src={src} alt={`${name} integration logo`} />
                  </IntegrationBox>
                ))}
              </IntegrationsGrid>
            </IntegrationsSection>
          </section>
        </main>

        <footer className="practial-section w-full bg-[#ECECEC] border border-[#000000] [@media(max-width:800px)]:px-0 px-1 [@media(max-width:800px)]:py-0 py-1">
          <FooterSection>
            <FooterUpper>
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
                <div className="relative z-10 mt-2 pr-4 [@media(max-width:800px)]:mx-auto">
                  <CTAButton onClick={() => navigate("/admin")}>
                    LAUNCH YOUR FREE AGENT
                    <ChevronRight size={20} className="ml-2" />
                  </CTAButton>
                </div>
              </FooterLeft>
              <FooterRight>
                <FooterSocial>
                  <h1 className="[@media(max-width:800px)]:hidden">
                    Follow us
                  </h1>
                  <SocialIcon href="" title="X">
                    <img src="/assets/icons/prime_twitter.png" alt="" />
                  </SocialIcon>
                  <SocialIcon title="LinkedIn">
                    <Linkedin strokeWidth="2px" />
                  </SocialIcon>
                </FooterSocial>
                <FooterLogo className="logo">
                  <img
                    src="/assets/landing-asset/assemble/footer-logo.svg"
                    alt="footer logo"
                    className="[@media(max-width:800px)]:hidden"
                  />
                  <p className="hidden [@media(max-width:800px)]:block">
                    © 2025 Sayy AI
                  </p>
                </FooterLogo>
              </FooterRight>
            </FooterUpper>
            <FooterBelow>
              <img
                src="/assets/landing-asset/assemble/footer-card-1.png"
                alt="Kifor Mascot"
                width={"100%"}
              />
              <span className="footer-card-2">
                <img
                  src="/assets/landing-asset/assemble/footer-card-2.png"
                  alt="Kifor Mascot"
                  className="mascot-img"
                />
              </span>
              <span className="footer-card-3">
                <img
                  src="/assets/landing-asset/assemble/footer-card-3.png"
                  alt="Kifor Mascot"
                  className="mascot-img"
                />
              </span>
              <span className="footer-card-4">
                <img
                  src="/assets/landing-asset/assemble/footer-card-4.png"
                  alt="Kifor Mascot"
                  className="mascot-img"
                />
              </span>
              <span className="footer-card-5">
                <img
                  src="/assets/landing-asset/assemble/footer-card-5.png"
                  alt="Kifor Mascot"
                  className="mascot-img"
                />
              </span>
              <span className="footer-card-6">
                <img
                  src="/assets/landing-asset/assemble/footer-card-6.png"
                  alt="Kifor Mascot"
                  className="mascot-img"
                />
              </span>
              <span className="footer-card-7">
                <img
                  src="/assets/landing-asset/assemble/footer-card-7.png"
                  alt="Kifor Mascot"
                  className="mascot-img"
                />
              </span>
              <span className="footer-card-8">
                <img
                  src="/assets/landing-asset/assemble/footer-card-8.png"
                  alt="Kifor Mascot"
                  className="mascot-img"
                />
              </span>
            </FooterBelow>
          </FooterSection>
        </footer>
      </Container>
    </>
  );
};

export default Home;
