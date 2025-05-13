import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  font-family: "Inter", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
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
`;

const Headline = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
`;

const Subheadline = styled.p`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 24px;
  width: 40%;
  margin: 0 auto;
`;

const CTAButton = styled.button`
  background: #a3ffb3;
  color: #222;
  border: none;
  border-radius: 6px;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: background 0.2s;
  &:hover {
    background: #7be88e;
  }
`;

type SpeechBubbleProps = {
  top: string;
  left?: string;
  right?: string;
  color?: string;
};

const SpeechBubble = styled.div<SpeechBubbleProps>`
  position: absolute;
  top: ${({ top }: { top: string }) => top};
  left: ${({ left }: { left?: string }) => left || "auto"};
  right: ${({ right }: { right?: string }) => right || "auto"};
  background: ${({ color }: { color?: string }) => color || "#fff"};
  color: #222;
  border-radius: 18px;
  padding: 10px 18px;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #222;
  min-width: 120px;
  max-width: 220px;
  z-index: 2;
`;

const PracticalSection = styled.section`
  background: #f5f6fa;
  padding: 48px 0 64px 0;
  text-align: center;
`;

const PracticalTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #222;
`;

const PracticalDesc = styled.p`
  color: #444;
  font-size: 1.1rem;
  margin-bottom: 36px;
`;

const CardsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
`;

const Card = styled.div`
  background: #e6eaff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  width: 320px;
  padding: 32px 24px 28px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CardImage = styled.div`
  width: 70px;
  height: 70px;
  background: #fff;
  border-radius: 50%;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const CardDesc = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 18px;
`;

const CardTag = styled.div`
  background: #4e2b8f;
  color: #fff;
  border-radius: 6px;
  padding: 5px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const CardSuitable = styled.div`
  font-size: 0.98rem;
  color: #222;
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
  background: #fff;
  padding: 56px 140px 48px 140px;
`;

const FeaturesTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #222;
  text-align: left;
`;

const FeaturesContent = styled.div`
  display: flex;
  gap: 48px;
  max-width: 1100px;
  width: 100%;
  justify-content: flex-start;
`;

const FeaturesTabs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 320px;
`;

const FeatureTab = styled.button<{ selected: boolean }>`
  background: ${({ selected }) => (selected ? "#e6ffe6" : "#f5f6fa")};
  border: 2px solid ${({ selected }) => (selected ? "#4e2b8f" : "#e0e0e0")};
  color: #222;
  border-radius: 10px;
  padding: 6px 18px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ selected }) =>
    selected ? "0 2px 8px rgba(76, 34, 143, 0.08)" : "none"};
  transition: background 0.2s, border 0.2s;
`;

const FeatureDesc = styled.div`
  font-size: 0.8rem;
  color: #555;
  font-weight: 400;
`;

const FeatureImageBox = styled.div`
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #4e2b8f;
  font-weight: 700;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
`;

const FeaturesFooter = styled.div`
  margin-top: 32px;
  font-size: 1.2rem;
  color: #222;
  font-weight: 600;
`;

const PlatformSection = styled.section`
  background: #f5f6fa;
  padding: 56px 0 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlatformTitle = styled.h2`
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #222;
  text-align: left;
  width: 100%;
  max-width: 1100px;
`;

const PlatformCardsRow = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  width: 100%;
  max-width: 1100px;
  margin-bottom: 48px;
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
`;

const PlatformIcon = styled.div`
  width: 56px;
  height: 56px;
  background: #e6eaff;
  border-radius: 12px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const PlatformCardTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const PlatformCardDesc = styled.p`
  font-size: 1rem;
  color: #333;
`;

const AssembleSection = styled.section`
  background: #fff;
  padding: 56px 0 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AssembleTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #222;
  text-align: center;
`;

const AssembleSubtitle = styled.p`
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 36px;
  text-align: center;
`;

const AssembleLayout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 48px;
  width: 100%;
  max-width: 1100px;
`;

const AssembleColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
`;

const AssembleMascot = styled.div`
  width: 260px;
  height: 260px;
  background: #f5f6fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 700;
  color: #4e2b8f;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  margin: 0 24px;
  text-align: center;
  padding: 24px;
`;

const AssembleCard = styled.div`
  background: #f5f6fa;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 22px 20px 18px 20px;
  min-width: 220px;
`;

const AssembleCardTitle = styled.div`
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const AssembleCardSubtitle = styled.div`
  color: #3bbf6c;
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 7px;
`;

const AssembleCardDesc = styled.div`
  color: #444;
  font-size: 0.97rem;
`;

const AppOverloadSection = styled.section`
  background: #f5f6fa;
  padding: 56px 0 48px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
`;

const AppOverloadTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #23244a;
  margin-bottom: 10px;
`;

const AppOverloadSub = styled.p`
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 36px;
  max-width: 700px;
`;

const AppOverloadToolsTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #23244a;
  margin-bottom: 24px;
`;

const AppOverloadCardsRow = styled.div`
  display: flex;
  gap: 24px;
  width: 100%;
  flex-wrap: wrap;
`;

const AppOverloadCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  width: 200px;
  min-width: 180px;
  padding: 24px 16px 18px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AppOverloadIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #e6eaff;
  border-radius: 12px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
`;

const AppOverloadCardTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #23244a;
`;

const AppOverloadCardSub = styled.div`
  font-size: 0.97rem;
  color: #888;
  margin-bottom: 2px;
`;

const AppOverloadCardReplace = styled.div`
  font-size: 0.97rem;
  color: #23244a;
  font-weight: 500;
`;

const IntegrationsSection = styled.section`
  background: #f5f6fa;
  padding: 56px 0 48px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
`;

const IntegrationsTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #23244a;
  margin-bottom: 10px;
`;

const IntegrationsSub = styled.p`
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 36px;
  max-width: 700px;
`;

const IntegrationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 100px);
  grid-template-rows: repeat(4, 100px);
  gap: 28px;
  justify-content: start;
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
  width: 100px;
  height: 100px;
  text-align: center;
  padding: 20px;
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
  font-size: 1rem;
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
    <Container>
      <Header>
        <Logo>kifor</Logo>
        <LoginButton onClick={() => navigate("/admin")}>
          Login/Sign up
        </LoginButton>
      </Header>
      <HeroSection>
        <SpeechBubble top="38px" left="60px">
          Welcome to the salon, how can I help you?
        </SpeechBubble>
        <SpeechBubble top="130px" left="220px" color="#a1a9ff">
          Book a 1:1 meeting with our senior dietitian
        </SpeechBubble>
        <SpeechBubble top="260px" left="90px" color="#ceffaf">
          Our Summer Sale is now live!
        </SpeechBubble>
        <SpeechBubble top="380px" left="180px">
          Your spin class is booked for 8am tomorrow.
        </SpeechBubble>
        <SpeechBubble top="60px" right="80px" color="#ceffaf">
          Should I repeat your order?
        </SpeechBubble>
        <SpeechBubble top="200px" right="200px">
          How would you like to pay today?
        </SpeechBubble>
        <SpeechBubble top="360px" right="120px" color="#a1a9ff">
          Drop us your contact details for more info.
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
        <CTAButton onClick={() => navigate("/admin")}>
          LAUNCH YOUR FREE AGENT
        </CTAButton>
      </HeroSection>
      <PracticalSection>
        <PracticalTitle>Practical AI for your business</PracticalTitle>
        <PracticalDesc>
          Customized intelligent support designed to meet the specific needs of
          different business models, helping you work smarter, not harder.
        </PracticalDesc>
        <CardsRow>
          <Card>
            <CardTitle>Solopreneurs</CardTitle>
            <CardDesc>
              The power of a full team powered by AI, without traditional hiring
              costs.
            </CardDesc>
            <img
              src="assets/landing-asset/business/solo.png"
              alt="Solopreneurs"
            />
            <CardTag>SUITABLE FOR</CardTag>
            <CardSuitable>
              Creators, Freelancers, Coaches & Consultants
            </CardSuitable>
          </Card>
          <Card>
            <CardTitle>E-Commerce</CardTitle>
            <CardDesc>
              Your intelligent storefront guides customers, answers queries, and
              closes sales—all automatically.
            </CardDesc>
            <img
              src="assets/landing-asset/business/commerce.png"
              alt="Solopreneurs"
            />
            <CardTag>SUITABLE FOR</CardTag>
            <CardSuitable>
              E-commerce, D2C brands & Influencer storefronts
            </CardSuitable>
          </Card>
          <Card>
            <CardTitle>Service Providers</CardTitle>
            <CardDesc>
              Your AI front desk handles bookings, captures leads, and nurtures
              client relationships 24/7.
            </CardDesc>
            <img
              src="assets/landing-asset/business/service.png"
              alt="Solopreneurs"
            />
            <CardTag>SUITABLE FOR</CardTag>
            <CardSuitable>
              Hospitality, Wellness, Legal & Home Services
            </CardSuitable>
          </Card>
        </CardsRow>
      </PracticalSection>
      <FeaturesSection>
        <FeaturesTitle>Everything you need, in One Agent</FeaturesTitle>
        <FeaturesContent>
          <FeaturesTabs>
            {features.map((feature) => (
              <FeatureTab
                key={feature.key}
                selected={selectedFeature === feature.key}
                onClick={() => setSelectedFeature(feature.key)}
              >
                {feature.label}
                <FeatureDesc>{feature.desc}</FeatureDesc>
              </FeatureTab>
            ))}
          </FeaturesTabs>
          <FeatureImageBox>
            {/* Placeholder for feature image */}
            <img src={selected?.image} alt={selected?.label} />
          </FeatureImageBox>
        </FeaturesContent>
        <FeaturesFooter>
          All through 1 ongoing, intelligent conversation.
        </FeaturesFooter>
      </FeaturesSection>
      <PlatformSection>
        <PlatformTitle>Sell on any Platform</PlatformTitle>
        <PlatformCardsRow>
          <PlatformCard>
            <PlatformIcon>🌐</PlatformIcon>
            <PlatformCardTitle>Link-in-Bio</PlatformCardTitle>
            <PlatformCardDesc>
              Add your assistant to your social links – it's as smart,
              interactive & all-around as your presence in a storefront.
            </PlatformCardDesc>
          </PlatformCard>
          <PlatformCard>
            <PlatformIcon>💻</PlatformIcon>
            <PlatformCardTitle>Website</PlatformCardTitle>
            <PlatformCardDesc>
              Install our AI Agent directly into your site for seamless customer
              interactions.
            </PlatformCardDesc>
          </PlatformCard>
          <PlatformCard>
            <PlatformIcon>🧠</PlatformIcon>
            <PlatformCardTitle>ChatGPT</PlatformCardTitle>
            <PlatformCardDesc>
              Transform the popular AI platform into your personalized sales
              channel.
            </PlatformCardDesc>
          </PlatformCard>
        </PlatformCardsRow>
        <AssembleTitle>Assemble Your Agent : Your AI, Your Way</AssembleTitle>
        <AssembleSubtitle>
          Train Kifor to talk, think, and sell like you or anyone you want, no
          coding needed.
        </AssembleSubtitle>
        <AssembleLayout>
          <AssembleColumn>
            <AssembleCard>
              <AssembleCardTitle>Brain</AssembleCardTitle>
              <AssembleCardSubtitle>Smart Beyond Limits</AssembleCardSubtitle>
              <AssembleCardDesc>
                Smartly serve your Agent with data, knowledge, and rules using
                our tools.
              </AssembleCardDesc>
            </AssembleCard>
            <AssembleCard>
              <AssembleCardTitle>Interface</AssembleCardTitle>
              <AssembleCardSubtitle>Extending your Brand</AssembleCardSubtitle>
              <AssembleCardDesc>
                Customize chat themes, branding, controls and channels.
                Integrate with your favorite services.
              </AssembleCardDesc>
            </AssembleCard>
          </AssembleColumn>
          <AssembleMascot>
            {/* Mascot/image placeholder */}
            <span role="img" aria-label="mascot">
              🤖
            </span>
          </AssembleMascot>
          <AssembleColumn>
            <AssembleCard>
              <AssembleCardTitle>Voice</AssembleCardTitle>
              <AssembleCardSubtitle>
                Selling like you would
              </AssembleCardSubtitle>
              <AssembleCardDesc>
                Upload custom voice or choose from our library. Your agent
                speaks your way.
              </AssembleCardDesc>
            </AssembleCard>
            <AssembleCard>
              <AssembleCardTitle>Payments</AssembleCardTitle>
              <AssembleCardSubtitle>In-Chat Checkout</AssembleCardSubtitle>
              <AssembleCardDesc>
                Seamless transactions in conversation. Integrates with Stripe,
                Razorpay, UPI, USD/USDT.
              </AssembleCardDesc>
            </AssembleCard>
          </AssembleColumn>
        </AssembleLayout>
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
            <AppOverloadIcon>🌐</AppOverloadIcon>
            <AppOverloadCardTitle>WEBSITE BUILDERS</AppOverloadCardTitle>
            <AppOverloadCardSub>Replaces</AppOverloadCardSub>
            <AppOverloadCardReplace>Wix & Wordpress</AppOverloadCardReplace>
          </AppOverloadCard>
          <AppOverloadCard>
            <AppOverloadIcon>🗓️</AppOverloadIcon>
            <AppOverloadCardTitle>SCHEDULING APPS</AppOverloadCardTitle>
            <AppOverloadCardSub>Replaces</AppOverloadCardSub>
            <AppOverloadCardReplace>Calendly & Cal</AppOverloadCardReplace>
          </AppOverloadCard>
          <AppOverloadCard>
            <AppOverloadIcon>🤖</AppOverloadIcon>
            <AppOverloadCardTitle>CHATBOTS</AppOverloadCardTitle>
            <AppOverloadCardSub>Replaces</AppOverloadCardSub>
            <AppOverloadCardReplace>Tawk.to & Tidio</AppOverloadCardReplace>
          </AppOverloadCard>
          <AppOverloadCard>
            <AppOverloadIcon>👥</AppOverloadIcon>
            <AppOverloadCardTitle>CRMs</AppOverloadCardTitle>
            <AppOverloadCardSub>Replaces</AppOverloadCardSub>
            <AppOverloadCardReplace>Hubspot</AppOverloadCardReplace>
          </AppOverloadCard>
          <AppOverloadCard>
            <AppOverloadIcon>🔗</AppOverloadIcon>
            <AppOverloadCardTitle>LINK-IN-BIO TOOLS</AppOverloadCardTitle>
            <AppOverloadCardSub>Replaces</AppOverloadCardSub>
            <AppOverloadCardReplace>Linktree & Hopp</AppOverloadCardReplace>
          </AppOverloadCard>
        </AppOverloadCardsRow>
      </AppOverloadSection>
      <IntegrationsSection>
        <IntegrationsTitle>Extensive Integrations via MCP</IntegrationsTitle>
        <IntegrationsSub>
          Convert any API into a feature packed selling machine. Make your
          agents powerful by integrating 200+ apps using Model Context Protocol
          (MCP).
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
                Experience the future of sales: an AI-powered agent that adapts
                to your business needs, engages customers, and drives growth
                continuously.
              </FooterSub>
            </div>
            <FooterCTA>LAUNCH YOUR FREE AGENT</FooterCTA>
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
  );
};

export default Home;
