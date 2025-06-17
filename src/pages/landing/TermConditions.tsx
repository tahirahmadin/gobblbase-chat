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
const TermConditions = () => {
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
                      Terms of Use for Sayy
                    </h2>
                  </span>
                </WhiteBackground>
                <p className="para-font text-[14px] md:text-[1rem] font-[500]">
                  Effective Date: June 3, 2025
                </p>
              </div>
              <p className="para-font text-[14px] md:text-[1rem] font-[500] mt-8 [@media(min-width:601px)]:w-[50%]">
                These Terms of Use ("Terms") govern your access to and use of
                Sayy.ai ("Sayy," "we," "our," or "us"), operated by Gobbl, Inc.,
                a Delaware C-Corporation. By using Sayy, you agree to these
                Terms. If you do not agree, please discontinue use.
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full gap-10">
            <PurpleSection>
              <PurpleHeading>1. Eligibility</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    You must be at least 13 years old to use Sayy. If you're
                    using Sayy on behalf of an organization, you represent that
                    you have authority to bind that organization.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>2. Account Registration</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    You must provide accurate information and maintain the
                    security of your account credentials.{" "}
                  </h2>
                  <h2>
                    You are responsible for all activity under your account.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>3. Use of Services</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    You may use Sayy to create and run AI-powered agents for
                    lawful purposes. You may not:
                  </h2>
                  <ul className="list-[inherit] ml-6">
                    <li>Use Sayy to break the law or infringe rights</li>
                    <li>Attempt to access unauthorized systems</li>
                    <li>Scrape, reverse engineer, or disrupt our platform</li>
                    <li>
                      Use Sayy to generate or distribute harmful, deceptive, or
                      unlawful content
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h2>
                    We reserve the right to suspend accounts that violate these
                    rules.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>4. Intellectual Property</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    Sayy and all related content (excluding user content) are
                    the property of Gobbl, Inc. You may not use our trademarks
                    or content without permission.
                  </h2>
                  <h2>
                    You retain ownership of content you create using Sayy but
                    grant us a non-exclusive license to host and process it as
                    needed to operate the service.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>5. Payments</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    Some Sayy features require payment. By subscribing, you
                    agree to our pricing terms. All billing is handled by our
                    partners (e.g., Stripe, Razorpay).
                  </h2>
                  <h2>
                    We reserve the right to change pricing at any time with
                    prior notice.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>6. Third-Party Services</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    You may connect Sayy to external services (e.g., Google,
                    Shopify). We are not responsible for those services or how
                    they handle your data.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>7. AI Model Usage</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    Prompts sent to Sayy agents may be processed by third-party
                    AI models (e.g., OpenAI, Meta LLaMA) as disclosed in our
                    Privacy Policy. You are responsible for
                  </h2>
                  <h2>content submitted to or generated by AI.</h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>8. Termination</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    You may stop using Sayy at any time. We may suspend or
                    terminate your access if you violate these Terms or for
                    operational reasons.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>9. Disclaimers</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    Sayy is provided "as-is" without warranties. We do not
                    guarantee uninterrupted service or perfect accuracy from AI
                    responses.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>10. Limitation of Liability</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    To the fullest extent permitted by law, Gobbl, Inc. shall not be liable for indirect, incidental, or consequential damages from your use of Sayy.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>11. Governing Law</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                   These Terms are governed by the laws of the State of Delaware, USA. Disputes must be resolved in Delaware courts.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>12. Changes to Terms</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    We may update these Terms from time to time. Continued use of Sayy after updates means you accept the revised Terms.
                  </h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            <PurpleSection>
              <PurpleHeading>13. Contact</PurpleHeading>
              <PurpleContent>
                <div className="">
                  <h2>
                    Questions? Reach us at: <a href="https://sayy.ai/terms">https://sayy.ai/terms</a> 
                  </h2>
                  <h2>Phone: <a href="">+1 (619) 404-4599</a></h2>
                </div>
              </PurpleContent>
            </PurpleSection>

            {/* orange small footer  */}
            <div className="bg-[#FFD2BA] text-black w-full border border-black px-2 py-8 text-center">
              <h1 className="para-font font-[500] text-[16px]">
                By using Sayy, you agree to these Terms of Use.
              </h1>
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

export default TermConditions;
