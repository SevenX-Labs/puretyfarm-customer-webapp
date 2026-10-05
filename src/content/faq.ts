import {
  FiMapPin,
  FiShield,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa6";
import { IconType } from "react-icons";

export interface FaqBadge {
  label: string;
  icon: IconType;
  bg: string;
  border: string;
  text: string;
}

export interface FaqItem {
  num: string;
  question: string;
  answer: string;
  badge: FaqBadge;
  closedNum: {
    bg: string;
    text: string;
  };
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    num: "01",
    question: "What is A2 milk and how is it different?",
    answer:
      "A2 milk comes from indigenous Gir cows that naturally produce only the A2 beta-casein protein. Unlike regular milk (which contains A1 protein), A2 milk is easier to digest, reduces bloating, and is closer to the milk our ancestors consumed.",
    badge: {
      label: "Gentle on Stomach",
      icon: FaLeaf,
      bg: "bg-[#EBF3E7]",
      border: "border-[#D5E4D0]",
      text: "text-[#3D6832]",
    },
    closedNum: {
      bg: "bg-[#F5ECE1]",
      text: "text-[#5C2818]",
    },
  },
  {
    num: "02",
    question: "What areas in Raipur do you deliver to?",
    answer:
      "We currently deliver across Shankar Nagar, Samta Colony, VIP Road, Telibandha, Civil Lines, Devendra Nagar, and surrounding areas. Check our app for real-time service area coverage.",
    badge: {
      label: "Raipur & Nearby",
      icon: FiMapPin,
      bg: "bg-[#FCEEE2]",
      border: "border-[#F4DAC4]",
      text: "text-[#8D4926]",
    },
    closedNum: {
      bg: "bg-[#FCEEE2]",
      text: "text-[#8D4926]",
    },
  },
  {
    num: "03",
    question: "How does the 7-day trial work?",
    answer:
      "Simply download our app or contact us via WhatsApp. We start delivering 1 litre of fresh A2 milk daily for 7 days. No advance payment required. Pay only after your trial if you love it.",
    badge: {
      label: "Risk Free",
      icon: FiShield,
      bg: "bg-[#EEF5EB]",
      border: "border-[#D6E6D1]",
      text: "text-[#416E37]",
    },
    closedNum: {
      bg: "bg-[#F7EFE4]",
      text: "text-[#7C5029]",
    },
  },
  {
    num: "04",
    question: "What time is milk delivered?",
    answer:
      "We deliver before 10:00 AM every morning (dispatches begin as early as 5:30 AM). You can track your delivery partner live on the app with real-time route updates.",
    badge: {
      label: "Before 7:00 AM",
      icon: FiClock,
      bg: "bg-[#F4EDF9]",
      border: "border-[#E5D3F0]",
      text: "text-[#694282]",
    },
    closedNum: {
      bg: "bg-[#EBF3EA]",
      text: "text-[#3F683A]",
    },
  },
  {
    num: "05",
    question: "Can I pause or cancel my subscription?",
    answer:
      "Yes! You can pause deliveries anytime through the app — for a day, a week, or longer. There are zero cancellation charges.",
    badge: {
      label: "Flexible",
      icon: FiRefreshCw,
      bg: "bg-[#EAF3FB]",
      border: "border-[#D0E3F4]",
      text: "text-[#285D83]",
    },
    closedNum: {
      bg: "bg-[#FAECEB]",
      text: "text-[#8C3A38]",
    },
  },
];
