import { Check, ChevronRight, Linkedin, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getPlans } from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";
import { toast } from "react-hot-toast";

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
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
    color: #7d7d7d;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
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
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
    color: #7d7d7d;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
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
const PurpleBackground = styled.span`
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
    font-family: "DM Sans", sans-serif;
    font-size: clamp(9px, 4vw, 16px);
    font-weight: 600;
    height: 100%;
    border: 1px solid black;
    padding: 1.5vh 2vw;
    background: #aeb8ff;
    color: black;
    border-radius: 40px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      transform: translate(0.5rem, 0.01rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 24px solid transparent;
      border-right: 24px solid transparent;
      border-bottom: 24px solid #aeb8ff;
      z-index: 0;
    }
    &::after {
      content: "";
      position: absolute;
      transform: translate(0.62rem, 0.044rem);
      bottom: 0px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 30px solid black;
      z-index: -4;
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
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
    color: #7d7d7d;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
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

interface PlanData {
  id: string;
  name: string;
  price: number;
  totalPrice: number;
  currency: string;
  recurrence: string;
  credits: number;
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  type: string;
}

const Pricing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { activeTeamId } = useAdminStore();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlain, setSelectedPlain] = useState<string>("");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const fetchPlans = async () => {
    try {
      const response = await getPlans(activeTeamId || "null");

      setPlans(response as PlanData[]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [activeTeamId]);

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

  const getPlanDisplayName = (name: string): string => {
    return name.replace("(YEARLY)", "");
  };

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
              <WhiteBackground>
                <span style={{ width: "fit-content", padding: "1vh 2vw" }}>
                  <h2 className="main-font relative z-10 font-[800] text-[1.2rem]">
                    Plans & Pricing
                  </h2>
                </span>
              </WhiteBackground>
              <p className="para-font text-[1rem] font-[500] mt-4 [@media(min-width:601px)]:w-[70%]">
                Maximize your business potential with Sayy - everything <br />{" "}
                you need to grow your business, the AI way.
              </p>
            </div>

            {/* btns in mobile  */}
            {!loading && (
              <div className="btns hidden [@media(max-width:600px)]:flex gap-2 py-4">
                {plans.map((plan) => {
                  const displayName = getPlanDisplayName(plan.name);
                  return (
                    <button
                      key={plan.id}
                      onClick={() => {
                        const el = document.getElementById(`plan-${plan.id}`);
                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }
                        setSelectedPlain(plan.id);
                      }}
                      className="para-font bg-[#C1CFFF] min-w-[60px] px-2 py-1 rounded-md border border-black text-black text-[14px] font-bold"
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* line in mob  */}
            <div className="line hidden [@media(max-width:600px)]:block h-[2px] bg-black w-full"></div>

            <div className="flex items-center rounded-full border shadow-[inset_0_4px_4px_0_rgba(0,0,0,0.4)] [@media(max-width:600px)]:my-6 ">
              <button
                className={`px-4 py-1 rounded-full w-[100px] font-semibold focus:outline-none transition-colors duration-200 ${
                  billing === "monthly"
                    ? "bg-blue-600 text-white border-2 border-black"
                    : "bg-transparent text-[#656565] border-[none]"
                }`}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-1 w-[100px] rounded-full font-[400] focus:outline-none transition-colors duration-200 ${
                  billing === "yearly"
                    ? "bg-blue-600 text-white border-2 border-black"
                    : "bg-transparent text-[#656565] border-[none]"
                }`}
                onClick={() => setBilling("yearly")}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* plains card  */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
              {plans
                .filter((plan) =>
                  billing === "monthly"
                    ? plan.recurrence === "monthly"
                    : plan.recurrence === "yearly"
                )

                .map((plan) => {
                  const isCurrent = plan.isCurrentPlan;
                  const displayName = getPlanDisplayName(plan.name);

                  // Extract "Everything in ..." pill and features
                  const pillFeature = plan.features.find((f) =>
                    f.startsWith("Everything in")
                  );
                  const features = plan.features.filter(
                    (f) => !f.startsWith("Everything in")
                  );

                  return (
                    <div
                      id={`plan-${plan.id}`}
                      key={plan.id}
                      className="flex flex-col items-center border bg-[#D4DEFF] border-black px-6 pb-8 min-h-[600px] relative"
                    >
                      {/* Header */}
                      <div className="w-full flex flex-col items-center mt-2 py-2 mb-2 ">
                        <PurpleBackground>
                          <span
                            style={{
                              width: "80%",
                              padding: "1vh 2vw",
                              margin: "0 auto",
                            }}
                          >
                            <h1 className="relative z-10 text-center">
                              {" "}
                              {displayName}
                            </h1>
                          </span>
                        </PurpleBackground>
                      </div>

                      {/* Price */}
                      <div className="para-font text-[1rem] font-bold text-black">
                        ${plan.price}
                      </div>
                      <div className="text-gray-600 mb-4 text-base">
                        per month
                      </div>

                      {/* Upgrade Button */}
                      <div className="relative z-10">
                        <UpgradeButton
                          onClick={() => navigate("/admin")}
                          className={`w-full font-bold uppercase mb-4  bg-gray-300 text-black cursor-default
                        `}
                        >
                          Get Started
                        </UpgradeButton>
                      </div>

                      {/* Divider */}
                      <div className="w-full bg-[#AEB8FF] my-2 h-[3px]"></div>

                      {/* Pill - separated and with extra margin */}
                      {pillFeature && (
                        <div className=" w-full flex justify-center mb-4">
                          <span className="flex items-center whitespace-nowrap gap-1 bg-[#EAEFFF] rounded-full px-6 py-1 text-base font-medium text-black shadow-lg border border-gray-200">
                            Everything in
                            <span className="font-bold ml-1 text-sm">
                              {pillFeature.match(/in\s+(\w+)/)?.[1]}
                            </span>
                            <span className="text-lg font-bold text-vl-600 ml-1">
                              +
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Features */}
                      <div className="w-full flex flex-col gap-2 mt-2">
                        {features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="bg-white border-text-md text-black rounded-full p-[2px] border border-[#000000]">
                              <Check size={18} style={{ strokeWidth: "4px" }} />
                            </span>
                            <span className="text-base text-black text-sm leading-tight">
                              <h3 className="para-font text-[16px]">
                                {feature}
                              </h3>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </HeroSection>
      </section>

      {/* footer  */}
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
            <div
              style={{
                padding: "2vh 3vw 4vh 3vw",
              }}
              className="[@media(max-width:800px)]:flex hidden flex flex-row justify-between whitespace-nowrap bg-[#0A0A0A] w-full "
            >
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
    </Container>
  );
};

export default Pricing;
