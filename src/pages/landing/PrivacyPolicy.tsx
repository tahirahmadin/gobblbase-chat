import { ChevronRight, Linkedin, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  font-family: "DM Sans", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  overflow-x: hidden;
`;

const UpgradeButton = styled.button`
  position: relative;
  background: #fffc45;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #fffc45;
  }
  @media (max-width: 600px) {
    min-width: 100px;
  }
  &:disabled {
    background: rgba(255, 252, 69, 0.82);
    color: #b0b0b0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: rgba(255, 252, 69, 0.74);
  }
`;
const Navbar = styled.nav`
    top; 1px;
    z-index: 111111;
    position: fixed;
    width: 100%;
    background: #000000;
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

const WhiteBackground = styled.span`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 60%;
  position: relative;
  z-index: 10;
  width: fit-content;

  span {
    font-family: "DM Sans", sans-serif;
    font-size: clamp(9px, 4vw, 16px);
    font-weight: 600;
    background: white;
    border: 1px solid black;
    width: fit-content;
    height: 100%;
    width: 100%;
    color: black;
    padding: 1vh 2vw;
    border-radius: 60px;
    @media (max-width: 600px) {
      border-radius: 30px;
      padding: 1vh 10vw 1vh 8vw;
    }
    &::before {
      content: "";
      position: absolute;
      transform: translate(-0.4rem, -0.05rem);
      bottom: 0px;
      left: 0;
      width: 0;
      height: 0;
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
      border-bottom: 24px solid white;
      z-index: 0;
      @media (max-width: 600px) {
        transform: translate(-0.5rem, -0.05rem);
        border-left: 28px solid transparent;
        border-right: 28px solid transparent;
        border-bottom: 28px solid white;
      }
    }
    &::after {
      content: "";
      position: absolute;
      transform: translate(-0.5rem, 0rem);
      bottom: 0px;
      left: 0;
      width: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 30px solid black;
      z-index: -4;
      @media (max-width: 600px) {
        transform: translate(-0.65rem, 0);
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 30px solid black;
      }
    }
  }
`;
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
// hero pricing section
const HeroSection = styled.section`
  color: #fff;
  position: relative;
  min-height: 540px;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 12vh 3vw 6vh 3vw;
  font-family: lato, sans-serif;
  @media (max-width: 600px) {
    padding: 18vh 3vw 6vh 3vw;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .heading-top {
  }
`;
const PurpleSection = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid #000;
  width: 100%;
`;
const PurpleHeading = styled.h1`
  background: #d4deff;
  border-bottom: 1px solid #000;
  padding: 1vh 2vw;
  color: black;
  font-weight: 600;
  font-family: "Lato", sans-serif;
  font-size: clamp(16px, 4vw, 18px);
`;
const PurpleContent = styled.div`
  background: #eaefff;
  padding: 2vh 2vw;
  font-family: "DM Sans", sans-serif;
  font-size: clamp(14px, 4vw, 16px);
  font-weight: 400;
  color: black;
`;

// Footer styling
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 20px;
  font-size: 1.08rem;
  width: 100%;
  padding: 2vh 3vw 2vh 3vw;
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

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  return (
    <Container>
      <Navbar>
        <Header
          style={{
            background: menuOpen ? "#140065" : "transparent",
          }}
        >
          <Logo>
            <span onClick={() => navigate("/")}>
              <img src="/assets/Sayy AI Logo.svg" alt="logo" width={80} />
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

      <section className="practial-section w-full bg-[#fff] [@media(max-width:800px)]:px-0 px-1 [@media(max-width:800px)]:py-0 py-1">
        <HeroSection className="">
          <div className="flex flex-col [@media(min-width:601px)]:flex-row items-center justify-between w-full gap-4 mb-8">
            <div className="heading-content text-black w-full px-4 sm:px-0 [@media(max-width:600px)]:flex [@media(max-width:600px)]:flex-col [@media(max-width:600px)]:items-center [@media(max-width:600px)]:text-center ">
              <div className="flex [@media(max-width:600px)]:items-center [@media(max-width:600px)]:flex-col gap-2 items-end justify-between ">
                <WhiteBackground>
                  <span>
                    <h2 className="main-font relative z-10 font-[800] text-[1.2rem]">
                      Plans & Pricing
                    </h2>
                  </span>
                </WhiteBackground>
                <p className="para-font text-[14px] md:text-[1rem] font-[500]">
                  Effective Date: June 3, 2025
                </p>
              </div>
              <p className="para-font text-[14px] md:text-[1rem] font-[500] mt-8 [@media(min-width:601px)]:w-[50%]">
                Gobbl, Inc. (“Sayy,” “we,” “our,” or “us”) provides an
                AI-powered platform for building and running agents connected to
                third-party services. This Privacy Policy describes how we
                collect, use, store, and protect your information.
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full gap-10">
            <PurpleSection>
              <PurpleHeading>1. Company Details</PurpleHeading>
              <PurpleContent>
                <ul className="list-[inherit] ml-6">
                  <li>Company: Gobbl, Inc.</li>
                  <li>Entity Type: Delaware C-Corporation</li>
                  <li>EIN: 38-4345866</li>
                  <li>Contact: https://sayy.ai/privacy</li>
                  <li>Phone: +1 (619) 404-4599</li>
                </ul>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>2. Scope of Policy</PurpleHeading>
              <PurpleContent>
                <h2>This Policy applies to:</h2>
                <ul className="list-[inherit] ml-6">
                  <li>
                    Visitors to{" "}
                    <a href="https://sayy.ai" target="_blank">
                      https://sayy.ai
                    </a>{" "}
                  </li>
                  <li>Registered Sayy users</li>
                  <li>People interacting with Sayy-powered agents</li>
                  <li>
                    It does not cover third-party platforms you connect with
                    (e.g., Shopify, Gmail). Those have their own privacy
                    policies.
                  </li>
                </ul>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>3. Data We Collect</PurpleHeading>
              <PurpleContent>
                <div className="scrollbar-custom w-[100%] min-w-full overflow-x-scroll md:overflow-hidden">
                  <table className="w-1/2 min-w-[500px] border-separate border-spacing-y-2 ">
                    <thead className="sticky top-0 z-5 text-left ">
                      <tr className="para-font text-[18px]">
                        <th className="px-4 py-1 font-[500]">CATEGORY</th>
                        <th className="px-4 py-1 font-[500]">EXAMPLES</th>
                        <th className="px-4 py-1 font-[500]">SOURCE</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-left">
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1  font-[500]">Account Data</td>
                        <td className="px-4 py-1 font-[500]">
                          Name, email, password hash
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Provided by user
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1  font-[500]">Agent Content</td>
                        <td className="px-4 py-1 font-[500]">
                          Prompts, instructions, files, conversations
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Created by user
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1  font-[500]">Usage Data</td>
                        <td className="px-4 py-1 font-[500]">
                          IP address, browser, timestamps, actions
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Collected automatically
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1  font-[500]">
                          Integration Data
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          API tokens, webhook events
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Through app connections
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1  font-[500]">
                          Payment Metadata
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Plan type, billing history
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          From Stripe or Razorpay
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1  font-[500]">
                          AI Model Inputs
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Text sent to LLMs
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Routed to model providers
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>4. Why We Use It</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>We use your data to:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Operate and maintain the Sayy platform</li>
                    <li>Execute AI agent tasks using third-party models</li>
                    <li>Secure and optimize features</li>
                    <li>Provide billing and support</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h2>We do not sell or rent your personal data.</h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>5. AI Model Providers</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    When you use Sayy agents, your prompts may be routed to
                    third-party large language models (LLMs) or models hosted
                    directly by Sayy.
                  </h2>
                </div>
                <div className="mt-4">
                  <h2>We currently use:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>OpenAI (e.g., GPT-4, GPT-4o, GPT-3.5)</li>
                    <li>
                      Meta LLaMA Models (e.g., LLaMA 2, LLaMA 3) hosted on
                      Sayy-controlled infrastructure
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h2>How this works:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>
                      Your input (prompt, query, chat) is sent securely to the
                      selected model.
                    </li>
                    <li>
                      The model returns a response, which may be used to execute
                      actions via Sayy agents.
                    </li>
                    <li>
                      Inputs and outputs may be logged for traceability,
                      debugging, and quality assurance.
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h2>Retention Notes:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>
                      OpenAI may retain data briefly per OpenAI API policies.
                    </li>
                    <li>
                      Meta LLaMA models run on Sayy infrastructure and do not
                      transmit data externally.
                    </li>
                  </ul>
                </div>
                <div className="my-4">
                  <h2>
                    Sayy does not use your data to train AI models unless you
                    explicitly opt in.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>6. Legal Bases (GDPR / UK GDPR)</PurpleHeading>
              <PurpleContent>
                <div className="mb-4">
                  <h2>Legal grounds include:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Contractual necessity</li>
                    <li>Legitimate interest (feature security, improvement)</li>
                    <li>Consent (cookies, integrations)</li>
                    <li>Legal obligation</li>
                  </ul>
                </div>
              </PurpleContent>
            </PurpleSection>
          </div>
        </HeroSection>
      </section>

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
                <h1 className="[@media(max-width:800px)]:hidden">Follow us</h1>
                <SocialIcon href="" title="X">
                  <img src="/assets/icons/prime_twitter.png" alt="" />
                </SocialIcon>
                <SocialIcon title="LinkedIn">
                  <Linkedin strokeWidth="2px" />
                </SocialIcon>
              </FooterSocial>
              <FooterLogo className="logo">
                <div className="">
                  <img
                    src="/assets/landing-asset/assemble/footer-logo.svg"
                    alt="footer logo"
                    className="[@media(max-width:800px)]:hidden"
                  />
                  <p className="hidden [@media(max-width:800px)]:block">
                    © 2025 Sayy AI
                  </p>
                </div>

                <div className="privacy-links flex gap-12">
                  <button
                    onClick={() => navigate("/privacy")}
                    className="para-font text-[15px]"
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => navigate("/terms-condition")}
                    className="para-font text-[15xpx]"
                  >
                    Terms of Use
                  </button>
                </div>
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
  );
};

export default PrivacyPolicy;
