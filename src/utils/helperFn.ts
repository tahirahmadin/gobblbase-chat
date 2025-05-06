import { BotConfig } from "../types";

export const calculateSmartnessLevel = (botData: BotConfig | null): number => {
  if (!botData) return 0;

  let totalPercentage = 0;

  // Query files - 20%
  if (botData.isQueryable) {
    totalPercentage += 20;
  }

  // Website link - 10%
  if (botData.socials?.link) {
    totalPercentage += 10;
  }

  // Smarten Form - 20%
  if (botData.smartenUpAnswers) {
    const filledAnswers = botData.smartenUpAnswers.filter(
      (answer: string) => answer.trim() !== ""
    ).length;
    totalPercentage += (filledAnswers / 4) * 20; // 20% divided by 4 answers
  }

  // Voice setup - 10%
  if (botData.personalityType?.name) {
    totalPercentage += 10;
  }

  // Cues - 10%
  if (botData.prompts && botData.prompts.length > 0) {
    totalPercentage += 10;
  }

  // Welcome message - 5%
  if (botData.welcomeMessage && botData.welcomeMessage.trim() !== "") {
    totalPercentage += 5;
  }

  // Social Handles - 2% per handle
  if (botData.socials) {
    const socialPlatforms = [
      "instagram",
      "tiktok",
      "twitter",
      "facebook",
      "youtube",
      "linkedin",
      "snapchat",
    ] as const;
    const filledSocials = socialPlatforms.filter(
      (platform) => botData.socials[platform]?.trim() !== ""
    ).length;
    totalPercentage += filledSocials * 2;
  }

  // Bio - 5%
  if (botData.bio && botData.bio.trim() !== "") {
    totalPercentage += 5;
  }

  // Promotional Banner - 10%
  if (botData.promotionalBanner && botData.isPromoBannerEnabled) {
    totalPercentage += 10;
  }

  return Math.round(totalPercentage);
};
