export interface TestimonialItem {
  quote: string;
  name: string;
  location: string;
  tag: string;
  initials: string;
  rating: number;
}

export const TESTIMONIALS: readonly TestimonialItem[] = [
  {
    quote:
      "The milk tastes exactly like what we used to get from our ancestral village. Natural sweetness, thick malai layer, and my kids drink it warm every morning without chocolate powder!",
    name: "Priya Sharma",
    location: "Shankar Nagar",
    tag: "Subscribed 8 Mos",
    initials: "PS",
    rating: 5,
  },
  {
    quote:
      "Been using PuretyFarm for 6 months now. Doorstep punctuality before 6:45 AM and zero plastic packaging makes the freshness unmatched anywhere in Raipur.",
    name: "Rajesh Tiwari",
    location: "VIP Road",
    tag: "Daily Morning",
    initials: "RT",
    rating: 5,
  },
  {
    quote:
      "As a pediatrician, I am cautious about hormones and oxytocin in dairy. PuretyFarm's 100% Desi Gir A2 milk is gentle on my kids' digestion. The chilled glass bottle delivery is genuinely gold standard.",
    name: "Dr. Anita Verma",
    location: "Civil Lines",
    tag: "Doctor & Mother",
    initials: "AV",
    rating: 5,
  },
  {
    quote:
      "We collect the thick cream on weekends to make homemade Desi Ghee. The golden granular Danedar texture and sacred aroma take you back 30 years. Truly unadulterated Gir cow purity.",
    name: "Vikramaditya Singh",
    location: "Samta Colony",
    tag: "Ghee Connoisseur",
    initials: "VS",
    rating: 5,
  },
  {
    quote:
      "Switching from plastic pouch milk to PuretyFarm eliminated our morning heaviness. It boils cleanly with zero synthetic residue or burnt smell. The customer care on WhatsApp is also wonderfully responsive.",
    name: "Sunita Dewangan",
    location: "Devendra Nagar",
    tag: "Family of 5",
    initials: "SD",
    rating: 5,
  },
  {
    quote:
      "Punctual morning delivery before 10:00 AM without fail. In peak summer, the milk arrives properly chilled at 4°C in temperature-controlled bags. Top notch consistency and transparent billing.",
    name: "CA Manish Agrawal",
    location: "Pandri",
    tag: "Daily Subscriber",
    initials: "MA",
    rating: 5,
  },
  {
    quote:
      "We tested their milk with our home lactometer and boiling test out of curiosity — zero added water, zero starch. Pure, thick, naturally fragrant Gir cow milk as promised.",
    name: "Meenakshi Dubey",
    location: "Tatibandh",
    tag: "Verified Resident",
    initials: "MD",
    rating: 5,
  },
  {
    quote:
      "My morning protein shakes taste 10x richer with this milk. No bloating or gut discomfort at all. You can genuinely feel the nutritional vitality of grass-fed cows.",
    name: "Rohan Kothari",
    location: "Mowa",
    tag: "Fitness Enthusiast",
    initials: "RK",
    rating: 5,
  },
  {
    quote:
      "My elderly parents have sensitive stomachs and could never tolerate regular commercial milk. PuretyFarm A2 has been so light and easy on them. Essential daily nutrition for our whole family.",
    name: "Kavita Chawla",
    location: "Sadar Bazar",
    tag: "3 Generations",
    initials: "KC",
    rating: 5,
  },
  {
    quote:
      "The sealed sterilized glass bottles feel premium and eco-friendly. No plastic leaching, crisp 4°C chill, and delivered quietly while Raipur is still asleep.",
    name: "Amitabh Baghel",
    location: "Kamal Vihar",
    tag: "Early Adopter",
    initials: "AB",
    rating: 5,
  },
] as const;
