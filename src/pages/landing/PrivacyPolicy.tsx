import { ChevronRight, Linkedin, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  font-family: "DM Sans", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  overflow-x: hidden;
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
                     Privacy Policy
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

            <PurpleSection>
              <PurpleHeading>7. Who We Share Data With</PurpleHeading>
              <PurpleContent>
                <div className="scrollbar-custom w-[100%] min-w-full overflow-x-scroll md:overflow-hidden">
                  <table className="w-1/2 min-w-[500px] border-separate border-spacing-y-2 ">
                    <thead className="sticky top-0 z-5 text-left ">
                      <tr className="para-font text-[18px]">
                        <th className="px-4 py-1 font-[500]">PROVIDER</th>
                        <th className="px-4 py-1 font-[500]">PURPOSE</th>
                        <th className="px-4 py-1 font-[500]">REGION</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-left">
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">AWS</td>
                        <td className="px-4 py-1 font-[500]">
                          Hosting, storage, backups
                        </td>
                        <td className="px-4 py-1 font-[500]">us-east-1</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Amazon SES</td>
                        <td className="px-4 py-1 font-[500]">
                          Transactional email
                        </td>
                        <td className="px-4 py-1 font-[500]">us-east-1</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">
                          Stripe / Razorpay
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Payment processing
                        </td>
                        <td className="px-4 py-1 font-[500]">Global</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">OpenAI</td>
                        <td className="px-4 py-1 font-[500]">
                          AI model processing (GPT)
                        </td>
                        <td className="px-4 py-1 font-[500]">USA</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Meta (LLaMA)</td>
                        <td className="px-4 py-1 font-[500]">
                          LLM inference (Sayy-hosted)
                        </td>
                        <td className="px-4 py-1 font-[500]">USA (private)</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">AWS CloudTrail</td>
                        <td className="px-4 py-1 font-[500]">
                          Usage and audit logs
                        </td>
                        <td className="px-4 py-1 font-[500]">us-east-1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>8. International Transfers</PurpleHeading>
              <PurpleContent>
                <div className="mb-4">
                  <h2>We comply with global data transfer laws using:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Standard Contractual Clauses (SCCs)</li>
                    <li>Adequacy mechanisms</li>
                    <li>Encrypted transmission & storage</li>
                  </ul>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>9. Data Retention</PurpleHeading>
              <PurpleContent>
                <div className="scrollbar-custom w-[100%] min-w-full overflow-x-scroll md:overflow-hidden">
                  <table className="w-1/2 min-w-[500px] border-separate border-spacing-y-2 ">
                    <thead className="sticky top-0 z-5 text-left ">
                      <tr className="para-font text-[18px]">
                        <th className="px-4 py-1 font-[500]">DATA TYPE</th>
                        <th className="px-4 py-1 font-[500]">DURATION</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-left">
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Account Data</td>
                        <td className="px-4 py-1 font-[500]">
                          Active + 30 days post-deletion
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">
                          Backup Snapshots
                        </td>
                        <td className="px-4 py-1 font-[500]">30 days</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Logs</td>
                        <td className="px-4 py-1 font-[500]">12 months</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">
                          Payment Records
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          7 years (legal requirement)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>10. Your Rights</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>You may:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Access, correct, or delete data</li>
                    <li>Export your data (portability). </li>
                    <li>Restrict or object to processing</li>
                    <li>Withdraw consent at any time </li>
                    <li>
                      Submit requests via
                      <a target="_blank" href="https://sayy.ai/privacy">
                        https://sayy.ai/privacy
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h2>We do not sell or rent your personal data.</h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>11. Cookies</PurpleHeading>
              <PurpleContent>
                <div className="scrollbar-custom w-[100%] min-w-full overflow-x-scroll md:overflow-hidden">
                  <table className="w-1/2 min-w-[500px] border-separate border-spacing-y-2 ">
                    <thead className="sticky top-0 z-5 text-left ">
                      <tr className="para-font text-[18px]">
                        <th className="px-4 py-1 font-[500]">TYPE</th>
                        <th className="px-4 py-1 font-[500]">PURPOSE</th>
                        <th className="px-4 py-1 font-[500]">LIFESPAN</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-left">
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Essential</td>
                        <td className="px-4 py-1 font-[500]">Login/session</td>
                        <td className="px-4 py-1 font-[500]">Session</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Preferences</td>
                        <td className="px-4 py-1 font-[500]">UI settings</td>
                        <td className="px-4 py-1 font-[500]">365 days</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Analytics</td>
                        <td className="px-4 py-1 font-[500]">Usage tracking</td>
                        <td className="px-4 py-1 font-[500]">12 months</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Marketing</td>
                        <td className="px-4 py-1 font-[500]">Not used</td>
                        <td className="px-4 py-1 font-[500]">N/A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>12. Security</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <ul className="list-[inherit] ml-6">
                    <li>TLS encryption in transit</li>
                    <li>AES-256 encryption at rest</li>
                    <li>IAM and MFA-based access control</li>
                    <li>CloudTrail + real-time auditing</li>
                    <li>Quarterly penetration testing</li>
                  </ul>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>13. Children</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    Sayy is not intended for children under age 13. We do not
                    knowingly collect data from minors.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>14. Changes</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>If we make significant updates, we will:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>
                      Post them on
                      <a href="https://sayy.ai/privacy">
                        https://sayy.ai/privacy
                      </a>
                    </li>
                    <li>Provide 7 days' notice for material changes</li>
                  </ul>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>15. Contact Us</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    Privacy inquiries:{" "}
                    <a href="https://sayy.ai/privacy">
                      https://sayy.ai/privacy
                    </a>
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            {/* Appendix A – Cookie Notice */}
            <article className="flex flex-col w-full">
              <h1
                style={{
                  fontSize: "clamp(16px, 4vw, 18px)",
                }}
                className="text-black pt-[4vh] pb-2 font-[600] main-font"
              >
                Appendix A – Cookie Notice
              </h1>
              <div
                style={{
                  fontSize: "clamp(14px, 4vw, 16px)",
                }}
                className="pb-[2vh] para-font font-[400] text-black"
              >
                {/* table  */}
                <div className="scrollbar-custom w-[100%] min-w-full overflow-x-scroll md:overflow-hidden">
                  <table className="w-[70%] min-w-[500px] border-separate border-spacing-y-2 ">
                    <thead className="sticky top-0 z-5 text-left bg-[#FFD2BA] ">
                      <tr className="para-font text-[18px] ">
                        <th className="px-4 py-1 font-[500] border border-black border-r-0">
                          COOKIE TYPE
                        </th>
                        <th className="px-4 py-1 font-[500] border border-black border-x-0">
                          PURPOSE
                        </th>
                        <th className="px-4 py-1 font-[500] border border-black border-x-0">
                          LIFESPAN
                        </th>
                        <th className="px-4 py-1 font-[500] border border-black border-l-0">
                          OPT-OUT AVAILABLE
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-left bg-[#EAEFFF]">
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Essential</td>
                        <td className="px-4 py-1 font-[500]">Login/session</td>
                        <td className="px-4 py-1 font-[500]">Session</td>
                        <td className="px-4 py-1 font-[500]">No</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Preferences</td>
                        <td className="px-4 py-1 font-[500]">UI settings</td>
                        <td className="px-4 py-1 font-[500]">365 days</td>
                        <td className="px-4 py-1 font-[500]">Yes</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Analytics</td>
                        <td className="px-4 py-1 font-[500]">Feature usage</td>
                        <td className="px-4 py-1 font-[500]">12 months</td>
                        <td className="px-4 py-1 font-[500]">Yes</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Marketing</td>
                        <td className="px-4 py-1 font-[500]">Not used</td>
                        <td className="px-4 py-1 font-[500]">N/A</td>
                        <td className="px-4 py-1 font-[500]">N/A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* Appendix B – Sub-Processors */}
            <article className="flex flex-col w-full">
              <h1
                style={{
                  fontSize: "clamp(16px, 4vw, 18px)",
                }}
                className="text-black pb-2 font-[600] main-font"
              >
                Appendix B – Sub-Processors
              </h1>
              <div
                style={{
                  fontSize: "clamp(14px, 4vw, 16px)",
                }}
                className="pb-[2vh] para-font font-[400] text-black"
              >
                {/* table  */}
                <div className="scrollbar-custom w-[100%] min-w-full overflow-x-scroll md:overflow-hidden">
                  <table className="w-[70%] min-w-[500px] border-separate border-spacing-y-2 ">
                    <thead className="sticky top-0 z-5 text-left bg-[#FFD2BA] ">
                      <tr className="para-font text-[18px] ">
                        <th className="px-4 py-1 font-[500] border border-black border-r-0">
                          Sub-Processor
                        </th>
                        <th className="px-4 py-1 font-[500] border border-black border-x-0">
                          PURPOSE
                        </th>
                        <th className="px-4 py-1 font-[500] border border-black border-x-0">
                          REGION
                        </th>
                        <th className="px-4 py-1 font-[500] border border-black border-l-0">
                          Data Handled
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-left bg-[#EAEFFF]">
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">AWS</td>
                        <td className="px-4 py-1 font-[500]">
                          Hosting, storage, logging
                        </td>
                        <td className="px-4 py-1 font-[500]">us-east-1</td>
                        <td className="px-4 py-1 font-[500]">
                          All platform data
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Amazon SES</td>
                        <td className="px-4 py-1 font-[500]">Email delivery</td>
                        <td className="px-4 py-1 font-[500]">us-east-1</td>
                        <td className="px-4 py-1 font-[500]">Email metadata</td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">
                          Stripe / Razorpay
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Payment processing
                        </td>
                        <td className="px-4 py-1 font-[500]">Global</td>
                        <td className="px-4 py-1 font-[500]">
                          Billing-related metadata
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]"> 
                        <td className="px-4 py-1 font-[500]">OpenAI</td>
                        <td className="px-4 py-1 font-[500]">
                          GPT model API (LLM)
                        </td>
                        <td className="px-4 py-1 font-[500]">USA</td>
                        <td className="px-4 py-1 font-[500]">
                          Prompts and completions
                        </td>
                      </tr>
                      <tr className="para-font text-[15px]">
                        <td className="px-4 py-1 font-[500]">Meta (LLaMA)</td>
                        <td className="px-4 py-1 font-[500]">
                          On-device model inference
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          USA (Sayy infra)
                        </td>
                        <td className="px-4 py-1 font-[500]">
                          Prompts only (no output sharing)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* Appendix C – Data Processing Addendum (DPA) */}
            <article className="flex flex-col w-full">
              <h1
                style={{
                  fontSize: "clamp(16px, 4vw, 18px)",
                }}
                className="text-black pb-2 font-[600] main-font"
              >
                Appendix C – Data Processing Addendum (DPA)
              </h1>
              <div
                style={{
                  fontSize: "clamp(14px, 4vw, 16px)",
                }}
                className="pb-[2vh] para-font font-[400] text-black flex flex-col gap-4"
              >
                <div className="mt-4">
                  <h2>Sayy acts as a Data Processor for customer data.</h2>
                </div>
                <div className="">
                  <h2>Highlights:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Follows instructions from Data Controller (you)</li>
                    <li>Notifies of breaches within 72 hours </li>
                    <li>Deletes data within 30 days of account closure</li>
                    <li>Sub-processors listed in Appendix B</li>
                    <li>
                      One audit permitted per year with 30 days’ notice (cost
                      borne by customer)
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h2>SCCs used for international transfers as required</h2>
                </div>
              </div>
            </article>

            {/* Appendix D – California Privacy Notice (CCPA / CPRA) */}
            <article className="flex flex-col w-full">
              <h1
                style={{
                  fontSize: "clamp(16px, 4vw, 18px)",
                }}
                className="text-black pb-2 font-[600] main-font"
              >
                Appendix D – California Privacy Notice (CCPA / CPRA)
              </h1>
              <div
                style={{
                  fontSize: "clamp(14px, 4vw, 16px)",
                }}
                className="pb-[2vh] para-font font-[400] text-black flex flex-col gap-4"
              >
                <div className="">
                  <h2>California residents have the right to:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Know what personal data is collected</li>
                    <li>Request access, correction, or deletion</li>
                    <li>Opt out of sale/sharing (Sayy does neither)</li>
                    <li>
                      Limit sensitive information use (we don’t collect it)
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h2>
                    Submit requests at{" "}
                    <a href="https://sayy.ai/privacy">
                      https://sayy.ai/privacy
                    </a>{" "}
                  </h2>
                </div>
              </div>
            </article>

            {/* Appendix E – AI Processing Notice */}
            <article className="flex flex-col w-full">
              <h1
                style={{
                  fontSize: "clamp(16px, 4vw, 18px)",
                }}
                className="text-black pb-2 font-[600] main-font"
              >
                Appendix E – AI Processing Notice
              </h1>
              <div
                style={{
                  fontSize: "clamp(14px, 4vw, 16px)",
                }}
                className="pb-[2vh] para-font font-[400] text-black flex flex-col gap-4"
              >
                <div className="mt-4">
                  <h2>Sayy integrates LLMs as part of its services.</h2>
                </div>
                <div className="">
                  <h2>Model Providers:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>OpenAI GPT Models via API</li>
                    <li>Meta LLaMA Models hosted internally by Sayy</li>
                  </ul>
                </div>
                <div className="">
                  <h2>Input Handling:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Inputs (prompts) are routed securely to models</li>
                    <li>Outputs are optionally logged for QA/debugging</li>
                    <li>OpenAI may retain transient logs (per their policy)</li>
                    <li>Meta models run isolated and do not share data externally</li>
                  </ul>
                </div>
                <div className="">
                  <h2>What We Don’t Do:</h2>
                  <ul className="list-[inherit] ml-6">
                    <li>No prompts are used to train any model unless you explicitly opt in</li>
                    <li>We do not sell or monetize your inputs or outputs</li>
                  </ul>
                </div>
                 <div className="">
                  <h2>LLaMA inferences stay 100% within Sayy’s environment</h2>
                </div>
              </div>
            </article>


            {/* orange small footer  */}
            <div className="bg-[#FFD2BA] text-black w-full border border-black px-2 py-8 text-center">
              <h1 className="para-font font-[500] text-[16px]">Thank you for trusting Sayy.ai. We are committed to protecting your data and providing a secure, transparent AI experience.</h1>
            </div>
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
