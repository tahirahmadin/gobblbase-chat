import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Linkedin, Menu, X } from "lucide-react";
import styled from "styled-components";

interface BotNotFoundProps {
  theme: {
    isDark: boolean;
    mainDarkColor: string;
    mainLightColor: string;
    highlightColor: string;
  };
}
const Container = styled.div`
  font-family: "DM Sans", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  overflow-x: hidden;
  width: 100%;
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
    background: #CDCDCD;
    border: 1px solid #7d7d7d;
    color: #7D7D7D;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #CDCDCD;
    border: 1px solid #7d7d7d;
  }
`;
const CTAButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #6aff97;
  padding: 1.43vh 1.2vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  color: black;
  width: 100%;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  &::before {
    content: "";
    position: absolute;
    top: 4px;
    right: -4px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
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
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 20vh 3vw 12vh 3vw;
  font-family: lato, sans-serif;
  @media (max-width: 600px) {
    padding: 18vh 0vw 6vh 0vw;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .heading-top {
  }
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
    padding: 3vh 10vw;
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
    align-items: center;
    background: #0a0a0a;
    justify-content: space-between;
    padding: 6vh 3vw 0 3vw;
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
    padding: 0;
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
    padding: 0;
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

export default function BotNotFound({ theme }: BotNotFoundProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
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
          <div className="w-[80%] flex flex-col items-center text-center md:flex-row md:text-start min-h-[60vh] md:min-h-[50vh] bg-[#FFFEB2] border border-black">
            <div className="left-content p-8 md:px-8 md:w-[60%] flex flex-col justify-center">
              <div className="text-sm text-gray-800 space-y-6">
                <h1 className="main-font font-bold text-[22px] md:text-[26px] leading-[1.5] whitespace-nowrap">
                  Oops! The AI-mployee <br  className="block md:hidden"/> is off-duty.
                </h1>
                <p className="para-font text-[14px] md:text-[16px] font-[500]">
                  The agent you're looking for might be taking a break, or this link may have expired.
                </p>
                <div className="relative w-fit z-10 mx-auto md:mx-0">
                  <CTAButton onClick={() => navigate("/admin")}>
                      CREATE NEW AGENT
                      <ChevronRight size={20} className="ml-2" />
                  </CTAButton>
                </div>
              </div>
            </div>
            <div className="right-img md:w-[40%] flex items-center mt-auto">
              <img
                src="/assets/page-not-found-goobl.svg"
                height={"100%"}
                width={"100%"}
                alt=""
              />
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
                        <h1 className="[@media(max-width:800px)]:hidden">
                          Follow us
                        </h1>
                        <SocialIcon href="" title="X">
                          <img src="/assets/icons/prime_twitter.svg" alt="" />
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
                        
                        <div className="hidden [@media(min-width:800px)]:flex privacy-links whitespace-nowrap flex flex-col sm:flex-row sm:gap-6 lg:gap-12">
                          <button onClick={() => navigate("/privacy")} className="para-font text-[15px]">Privacy Policy</button>
                          <button onClick={() => navigate("/terms-condition")} className="para-font text-[15xpx]">Terms of Use</button>
                        </div>
                      </FooterLogo>
                    </FooterRight>
                    <div style={{
                      padding: "2vh 3vw 4vh 3vw",
                    }} className="[@media(max-width:800px)]:flex hidden flex flex-row justify-between whitespace-nowrap bg-[#0A0A0A] w-full ">
                          <button onClick={() => navigate("/privacy")} className="para-font text-[15px]">Privacy Policy</button>
                          <button onClick={() => navigate("/terms-condition")} className="para-font text-[15xpx]">Terms of Use</button>
                    </div>
                  </FooterUpper>
                  <FooterBelow>
                    <img
                      src="/assets/landing-asset/assemble/footer-card-1.jpg"
                      alt="Kifor Mascot"
                      width={"100%"}
                    />
                    <span className="footer-card-2">
                      <img
                        src="/assets/landing-asset/assemble/footer-card-2.jpg"
                        alt="Kifor Mascot"
                        className="mascot-img"
                      />
                    </span>
                    <span className="footer-card-3">
                      <img
                        src="/assets/landing-asset/assemble/footer-card-3.jpg"
                        alt="Kifor Mascot"
                        className="mascot-img"
                      />
                    </span>
                    <span className="footer-card-4">
                      <img
                        src="/assets/landing-asset/assemble/footer-card-4.jpg"
                        alt="Kifor Mascot"
                        className="mascot-img"
                      />
                    </span>
                    <span className="footer-card-5">
                      <img
                        src="/assets/landing-asset/assemble/footer-card-5.jpg"
                        alt="Kifor Mascot"
                        className="mascot-img"
                      />
                    </span>
                    <span className="footer-card-6">
                      <img
                        src="/assets/landing-asset/assemble/footer-card-6.jpg"
                        alt="Kifor Mascot"
                        className="mascot-img"
                      />
                    </span>
                    <span className="footer-card-7">
                      <img
                        src="/assets/landing-asset/assemble/footer-card-7.jpg"
                        alt="Kifor Mascot"
                        className="mascot-img"
                      />
                    </span>
                    <span className="footer-card-8">
                      <img
                        src="/assets/landing-asset/assemble/footer-card-8.jpg"
                        alt="Kifor Mascot"
                        className="mascot-img"
                      />
                    </span>
                  </FooterBelow>
                </FooterSection>
              </footer>
      {/* <div
          className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
          style={{
            backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
            color: theme.isDark ? "white" : "black",
          }}
        >
          <div className="mb-8">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{
                backgroundColor: theme.mainDarkColor,
                border: `2px solid ${theme.isDark ? "white" : "black"}`,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Bot
                className="w-12 h-12"
                style={{ color: theme.isDark ? "black" : "white" }}
              />
            </div>
          </div>
          <h1 className="main-font text-3xl font-bold mb-6">Agent not found</h1>
          <p className="para-font text-xl max-w-sm mx-auto mb-12">
            The agent you're looking for doesn't exist. Would you like to create
            your own?
          </p>
          <Link
            to="/"
            className="para-font px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: theme.mainDarkColor,
              color: !theme.isDark ? "black" : "white",
              border: `2px solid ${theme.isDark ? "white" : "black"}`,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            Create Your Agent
          </Link>
        </div> */}
    </Container>
  );
}
