/**
 * Feature flags for unverified claims and unconfirmed product features.
 * All flags remain FALSE until authentic owner verification or official documentation is provided.
 * Code for all flagged features is preserved in the repository.
 */
export const FLAGS = {
  /** Testimonial cards in SocialProof section */
  SHOW_TESTIMONIALS: true,

  /** 5-star rating stars and "500+ Happy Families" badge in Hero and SocialProof */
  SHOW_500_FAMILIES_BADGE: false,

  /** "Rated 4.8/5 by 3,500+ families" claim in AppShowcase */
  SHOW_3500_FAMILIES_LINE: false,

  /** "40+ Lab Quality Tests" claims in SocialProof counters and MarqueeTicker */
  SHOW_40_TESTS_CLAIM: false,

  /** "FSSAI Licensed" claim until 14-digit registration number is provided */
  SHOW_FSSAI_CLAIM: false,

  /** "100% money-back guarantee" in TrialOffer */
  SHOW_MONEY_BACK_GUARANTEE: false,

  /** Mobile App Download button in Hero and entire AppShowcase section */
  SHOW_APP_FEATURES: false,
} as const;
