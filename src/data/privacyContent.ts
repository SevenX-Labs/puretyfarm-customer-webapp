export interface LegalSubItem {
  id?: string;
  label?: string;
  title?: string;
  content: string;
}

export interface LegalSubsection {
  title?: string;
  description?: string;
  items?: LegalSubItem[];
  paragraphs?: string[];
}

export interface LegalCallout {
  type: 'info' | 'warning' | 'highlight' | 'danger' | 'security' | 'contact';
  title: string;
  text: string;
}

export interface LegalSection {
  id: string;
  number: number;
  title: string;
  badge?: string;
  intro?: string;
  paragraphs?: string[];
  subsections?: LegalSubsection[];
  callout?: LegalCallout;
}

export interface LegalDocument {
  title: string;
  documentType: string;
  entityName: string;
  registeredOffice: string;
  officialEmail: string;
  effectiveDate: string;
  jurisdiction: string;
  preamble: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY_DATA: LegalDocument = {
  "title": "Privacy Policy",
  "documentType": "Official Privacy & Data Protection Policy",
  "entityName": "PURETYFARM",
  "registeredOffice": "Kumhari Chowk, Dhamdha Road, Durg, Chhattisgarh – 490042",
  "officialEmail": "care@puretyfarm.in",
  "effectiveDate": "Last Updated: January 2025",
  "jurisdiction": "Durg, Chhattisgarh, India",
  "preamble": "This Privacy Policy (“Policy”) describes the policies and procedures on the collection, use, disclosure and protection of your information when you use our website located at Puretyfarm, or the Puretyfarm mobile application (collectively, “Platform”) made available by PURETYFARM (“Puretyfarm”, “Company”, “we”, “us” and “our”), a company established under the laws of India having its registered office at Kumhari Chowk – Durg,Chhattisgarh – 490042.The terms “you” and “your” refer to the user of the Platform. The term “Services” refers to any services offered by Puretyfarm whether on the Platform or otherwise.Please read this Policy before using the Platform or submitting any personal information to Puretyfarm. This Policy is part of and incorporated within, and is to be read along with, the Terms of Use.",
  "sections": [
    {
      "id": "section-1",
      "number": 1,
      "title": "YOUR CONSENT",
      "paragraphs": [
        "By using the Platform and the Services, you agree and consent to the collection, transfer, use, storage, disclosure and sharing of your information as described and collected by us in accordance with this Policy. If you do not agree with the Policy, please do not use or access the Platform."
      ],
      "subsections": [],
      "badge": "User Consent"
    },
    {
      "id": "section-2",
      "number": 2,
      "title": "POLICY CHANGES",
      "paragraphs": [
        "We may occasionally update this Policy and such changes will be posted on this page. If we make any significant changes to this Policy, we will endeavour to provide you with reasonable notice of such changes, such as via a prominent notice on the Platform or to your email address on record and where required by applicable law, we will obtain your consent. To the extent permitted under the applicable law, your continued use of our Services after we publish or send a notice about our changes to this Policy shall constitute your consent to the updated Policy."
      ],
      "subsections": [],
      "badge": "Policy Updates"
    },
    {
      "id": "section-3",
      "number": 3,
      "title": "LINKS TO OTHER WEBSITES",
      "paragraphs": [
        "The Platform may contain links to other websites. Any personal information about you collected whilst visiting such websites is not governed by this Policy. Puretyfarm shall not be responsible for and has no control over the practices and content of any website accessed using the links contained on the Platform. This Policy shall not apply to any information you may disclose to any of our service providers/service personnel which we do not require you to disclose to us or any of our service providers under this Policy."
      ],
      "subsections": [],
      "badge": "External Links"
    },
    {
      "id": "section-4",
      "number": 4,
      "title": "INFORMATION WE COLLECT FROM YOU",
      "paragraphs": [
        "We will collect and process the following information about you:"
      ],
      "subsections": [
        {
          "title": "Information you give us",
          "items": [
            {
              "label": "(a)",
              "content": "Create or update your Puretyfarm account, which may from time to time include your name, email, phone number, login name and password, address, payment or banking information, date of birth and profile picture."
            },
            {
              "label": "(b)",
              "content": "Provide content to us, which may include reviews, ordering details and history, favorite vendors, special merchant requests, contact information of people you refer to us and other information you provide on the Platform (“Your Content”)."
            },
            {
              "label": "(c)",
              "content": "Use our Services, we may collect and store information about you to process your requests and automatically complete forms for future transactions, including (but not limited to) your phone number, address, email, billing information and credit or payment card information."
            },
            {
              "label": "(d)",
              "content": "Correspond with Puretyfarm for customer support;"
            },
            {
              "label": "(e)",
              "content": "Participate in the interactive services offered by the Platform such as discussion boards, competitions, promotions or surveys, other social media functions or make payments etc., or"
            },
            {
              "label": "(f)",
              "content": "Enable features that require Puretyfarm 's access to your address book or calendar;"
            },
            {
              "label": "(g)",
              "content": "Report problems for troubleshooting."
            },
            {
              "label": "(h)",
              "content": "If you sign up to use our Services as a delivery partner, we may at our sole discretion and at such time if it is feasible for Puretyfarm, collect location details, copies of government identification documents and other personal details (including but not limited to KYC, background verification), call and SMS details."
            }
          ],
          "description": "This includes information submitted when you:"
        },
        {
          "title": "Information we collect about you",
          "items": [
            {
              "label": "(a)",
              "content": "When you communicate with us (via email, phone, through the Platform or otherwise), we may maintain a record of your communication"
            },
            {
              "label": "(b)",
              "content": "Location information: Depending on the Services that you use, and your app settings or device permissions, we may collect your real time information, or approximate location information as determined through data such as GPS, IP address;"
            },
            {
              "label": "(c)",
              "content": "Usage and Preference Information: We collect information as to how you interact with our Services, preferences expressed and settings chosen. Platform includes the Puretyfarm advertising services (“Ad Services”), which may collect user activity and browsing history within the Platform and across third-party sites and online services, including those sites and services that include our ad pixels (“Pixels”), widgets, plug-ins, buttons, or related services or through the use of cookies. Our Ad Services collect browsing information including without limitation your Internet protocol (IP) address and location, your login information, browser type and version, date and time stamp, user agent, Puretyfarm cookie ID (if applicable), time zone setting, browser plug-in types and versions, operating system and platform, and other information about user activities on the Platform, as well as on third party sites and services that have embedded our Pixels, widgets, plug-ins, buttons, or related services;"
            },
            {
              "label": "(d)",
              "content": "Transaction Information: We collect transaction details related to your use of our Services, and information about your activity on the Services, including the full Uniform Resource Locators (URL), the type of Services you requested or provided, comments, domain names, search results selected, number of clicks, information and pages viewed and searched for, the order of those pages, the length of your visit to our Services, the date and time you used the Services, amount charged, details regarding application of promotional code, methods used to browse away from the page and any phone number used to call our customer service number and other related transaction details;"
            },
            {
              "label": "(e)",
              "content": "Device Information: We may collect information about the devices you use to access our Services, including the hardware models, operating systems and versions, software, file names and versions, preferred languages, unique device identifiers, advertising identifiers, serial numbers, device motion information and mobile network information. Analytics companies/Vendors may use mobile device IDs to track your usage of the Platform;"
            },
            {
              "label": "(f)",
              "content": "Stored information and files: Puretyfarm mobile application (Puretyfarm app) may also access metadata and other information associated with other files stored on your mobile device. This may include, for example, photographs, audio and video clips, personal contacts and address book information. If you permit the Puretyfarm app to access the address book on your device, we may collect names and contact information from your address book to facilitate social interactions through our services and for other purposes described in this Policy or at the time of consent or collection. If you permit the Puretyfarm app to access the calendar on your device, we collect calendar information such as event title and description, your response (Yes, No, Maybe), date and time, location and number of attendees."
            },
            {
              "label": "(g)",
              "content": "If you are a customer or a delivery partner, we will, additionally, record your calls with us made from the device used to provide Services, related call details, SMS details location and address details."
            }
          ],
          "description": "With regard to each of your visits to the Platform, we will automatically collect and analyse the following demographic and other information:"
        },
        {
          "title": "Information we receive from other sources",
          "items": [
            {
              "label": "(a)",
              "content": "We may receive information about you from third parties, such as other users, partners (including ad partners, analytics providers, search information providers), or our affiliated entities or if you use any of the other websites/apps we operate or the other Services we provide. Users of our Ad Services and other third-parties may share information with us such as the cookie ID, device ID, or demographic or interest data, and information about content viewed or actions taken on a third-party website, online services or apps. For example, users of our Ad Services may also be able to share customer list information (e.g., email or phone number) with us to create customized audience segments for their ad campaigns."
            },
            {
              "label": "(b)",
              "content": "When you sign in to Platform with your SNS account (provided such facility is facilitated by us), or otherwise connect to your SNS account with the Services, you consent to our collection, storage, and use, in accordance with this Policy, of the information that you make available to us through the social media interface. This could include, without limitation, any information that you have made public through your social media account, information that the social media service shares with us, or information that is disclosed during the sign-in process. Please see your social media provider’s privacy policy and help center for more information about how they share information when you choose to connect your account."
            },
            {
              "label": "(c)",
              "content": "If you are a customer or a delivery partner, we may, additionally, receive feedback and ratings from other users."
            }
          ]
        }
      ],
      "badge": "Data We Collect"
    },
    {
      "id": "section-5",
      "number": 5,
      "title": "COOKIES",
      "paragraphs": [
        "Our Platform and third parties with whom we partner, may use cookies, pixel tags, web beacons, mobile device IDs, “flash cookies” and similar files or technologies to collect and store information with respect to your use of the Services and third-party websites.Cookies are small files that are stored on your browser or device by websites, apps, online media and advertisements.",
        "A pixel tag (also called a web beacon or clear GIF) is a tiny graphics with a unique identifier, embedded invisibly on a webpage (or an online ad or email), and is used to count or track things like activity on a webpage or ad impressions or clicks, as well as to access cookies stored on users’ computers. We use pixel tags to measure the popularity of our various pages, features and services. We may also include web beacons in email messages or newsletters to determine whether the message has been opened and for other analytics.To modify your cookie settings, please visit your browser’s settings. By using our Services with your browser settings to accept cookies, you are consenting to our use of cookies in the manner described in this section.We may also allow third parties to provide audience measurement and analytics services for us, to serve advertisements on our behalf across the Internet, and to track and report on the performance of those advertisements. These entities may use cookies, web beacons, SDKs and other technologies to identify your device when you visit the Platform and use our Services, as well as when you visit other online sites and services.Please see our Cookie Policy for more information regarding the use of cookies and other technologies described in this section, including regarding your choices relating to such technologies."
      ],
      "subsections": [
        {
          "title": "Purposes of Cookies & Technologies",
          "description": "We use cookies and similar technologies for purposes such as:",
          "items": [
            {
              "label": "(a)",
              "content": "Authenticating users;"
            },
            {
              "label": "(b)",
              "content": "Remembering user preferences and settings;"
            },
            {
              "label": "(c)",
              "content": "Determining the popularity of content;"
            },
            {
              "label": "(d)",
              "content": "Delivering and measuring the effectiveness of advertising campaigns;"
            },
            {
              "label": "(e)",
              "content": "Analysing site traffic and trends, and generally understanding the online behaviours and interests of people who interact with our services."
            }
          ]
        }
      ],
      "badge": "Cookies & Pixels"
    },
    {
      "id": "section-6",
      "number": 6,
      "title": "USES OF YOUR INFORMATION",
      "paragraphs": [
        "We may combine the informationthat we receive from third parties with the information you give to us and information we collect about you for the purposes set out above. Further, we may anonymize and/or de-identify information collected from you through the Services or via other means, including via the use of third-party web analytic tools. As a result, our use and disclosure of aggregated and/or de-identified information is not restricted by this Policy, and it may be used and disclosed to others without limitation.We analyse the log files of our Platform that may contain Internet Protocol (IP) addresses, browser type and language, Internet service provider (ISP), referring, app crashes, page viewed and exit websites and applications, operating system, date/time stamp, and clickstream data. This helps us to administer the website, to learn about user behavior on the site, to improve our product and services, and to gather demographic information about our user base as a whole."
      ],
      "subsections": [
        {
          "title": "Purposes of Processing",
          "description": "We use the information we collect for the following essential purposes:",
          "items": [
            {
              "label": "(a)",
              "content": "To provide, personalise, maintain and improve our products and services, such as to enable deliveries and other services, enable features to personalise your Puretyfarm account;"
            },
            {
              "label": "(b)",
              "content": "To carry out our obligations arising from any contracts entered into between you and us and to provide you with the relevant information and services;"
            },
            {
              "label": "(c)",
              "content": "To administer and enhance the security of our Platform and for internal operations, including troubleshooting, data analysis, testing, research, statistical and survey purposes;"
            },
            {
              "label": "(d)",
              "content": "To provide you with information about services we consider similar to those that you are already using, or have enquired about, or may interest you. If you are a registered user, we will contact you by electronic means (email or SMS or telephone) with information about these services;"
            },
            {
              "label": "(e)",
              "content": "To understand our users (what they do on our Services, what features they like, how they use them, etc.), improve the content and features of our Services (such as by personalizing content to your interests), process and complete your transactions, make special offers, provide customer support, process and respond to your queries;"
            },
            {
              "label": "(f)",
              "content": "To generate and review reports and data about, and to conduct research on, our user base and Service usage patterns;"
            },
            {
              "label": "(g)",
              "content": "To allow you to participate in interactive features of our Services, if any; or"
            },
            {
              "label": "(h)",
              "content": "To measure or understand the effectiveness of advertising we serve to you and others, and to deliver relevant advertising to you."
            },
            {
              "label": "(i)",
              "content": "If you are a delivery partner, to track the progress of delivery or status of the order placed by our customers."
            }
          ]
        }
      ],
      "badge": "How We Use Data"
    },
    {
      "id": "section-7",
      "number": 7,
      "title": "DISCLOSURE AND DISTRIBUTION OF YOUR INFORMATION",
      "paragraphs": [
        "We may share your information that we collect for the following purposes:"
      ],
      "subsections": [
        {
          "title": "With Service Providers",
          "paragraphs": [
            "We may share your information with our vendors, consultants, marketing partners, research firms and other service providers or business partners, such as Payment processing companies, to support our business. For example, your information may be shared with outside vendors to send you emails and messages or push notifications to your devices in relation to our Services, to help us analyze and improve the use of our Services, to process and collect payments. We also may use vendors for other projects, such as conducting surveys or organizing sweepstakes for us."
          ]
        },
        {
          "title": "With Other Users",
          "paragraphs": [
            "If you are a delivery partner, we may share your name, phone number and/or profile picture (if applicable), tracking details with other users to provide them the Services."
          ]
        },
        {
          "title": "For Crime Prevention or Investigation",
          "description": "We may share this information with governmental agencies or other companies assisting us, when we are:",
          "items": [
            {
              "label": "(a)",
              "content": "Obligated under the applicable laws or in good faith to respond to court orders and processes; or"
            },
            {
              "label": "(b)",
              "content": "Detecting and preventing against actual or potential occurrence of identity theft, fraud, abuse of Services and other illegal acts;"
            },
            {
              "label": "(c)",
              "content": "Responding to claims that an advertisement, posting or other content violates the intellectual property rights of a third party;"
            },
            {
              "label": "(d)",
              "content": "Under a duty to disclose or share your personal data in order to enforce our Terms of Use and other agreements, policies or to protect the rights, property, or safety of the Company, our customers, or others, or in the event of a claim or dispute relating to your use of our Services. This includes exchanging information with other companies and organisations for the purposes of fraud detection and credit risk reduction."
            }
          ]
        },
        {
          "title": "For Internal Use",
          "paragraphs": [
            "We may share your information with any present or future member of our “Group” (as defined below)or affiliates for our internal business purposes The term “Group” means, with respect to any person, any entity that is controlled by such person, or any entity that controls such person, or any entity that is under common control with such person, whether directly or indirectly, or, in the case of a natural person, any Relative (as such term is defined in the Companies Act, 1956 and the Companies Act, 2013 to the extent applicable) of such person."
          ]
        },
        {
          "title": "With Advertisers and advertising networks",
          "description": "We may work with third parties such as network advertisers to serve advertisements on the Platform and on third-party websites or other media (e.g., social networking platforms). These third parties may use cookies, JavaScript, web beacons (including clear GIFs), Flash LSOs and other tracking technologies to measure the effectiveness of their ads and to personalize advertising content to you.While you cannot opt out of advertising on the Platform, you may opt out of much interest-based advertising on third party sites and through third party ad networks (including DoubleClick Ad Exchange, Facebook Audience Network and Google AdSense). For more information, visit www.aboutads.info/choices. Opting out means that you will no longer receive personalized ads by third parties ad networks from which you have opted out, which is based on your browsing information across multiple sites and online services. If you delete cookies or change devices, your opt out may no longer be effective:",
          "items": [
            {
              "label": "(a)",
              "content": "To fulfill the purpose for which you provide it."
            },
            {
              "label": "(b)",
              "content": "We may share your information other than as described in this Policy if we notify you and you consent to the sharing."
            }
          ]
        }
      ],
      "badge": "Information Sharing"
    },
    {
      "id": "section-8",
      "number": 8,
      "title": "DATA SECURITY PRECAUTIONS",
      "paragraphs": [
        "We have in place reasonable technical and security measures to secure the information collected by us.We use vault and tokenization services from third party service providers to protect the sensitive personal information provided by you. The third-party service providers with respect to our vault and tokenization services and our payment gateway and payment processing are compliant with the payment card industry standard (generally referred to as PCI compliant service providers). You are advised not to send your full credit/debit card details through unencrypted electronic platforms. Where we have given you (or where you have chosen) a username and password which enables you to access certain parts of the Platform, you are responsible for keeping these details confidential. We ask you not to share your password with anyone.Please be aware that the transmission of information via the internet is not completely secure. Although we will do our best to protect your personal data, we cannot guarantee the security of your data transmitted through the Platform. Once we have received your information, we will use strict physical, electronic, and procedural safeguards to try to prevent unauthorised access."
      ],
      "subsections": [],
      "badge": "Security Standards",
      "callout": {
        "type": "security",
        "title": "PCI-DSS Compliant Payment Security",
        "text": "All digital transactions and payment vault services are handled exclusively by PCI-DSS compliant payment gateways with bank-grade tokenization. We never store raw credit/debit card numbers on local web servers."
      }
    },
    {
      "id": "section-9",
      "number": 9,
      "title": "OPT-OUT",
      "paragraphs": [
        "When you sign up for an account, you are opting in to receive emails from Puretyfarm. You can follow the “unsubscribe” instructions in commercial email messages, but note that you cannot opt out of receiving certain administrative notices, service notices, or legal notices from Puretyfarm.If you wish to withdraw your consent for the use and disclosure of your personal information in the manner provided in this Policy, please write to us at care@puretyfarm.in. Please note that we may take time to process such requests, and your request shall take effect no later than 5 (five) business days from the receipt of such request, after which we will not use your personal data for any processing unless required by us to comply with our legal obligations/requirements. We may not be able to offer you any or all Services upon such withdrawal of your consent."
      ],
      "subsections": [],
      "badge": "User Consent & Control",
      "callout": {
        "type": "highlight",
        "title": "Consent Withdrawal Window",
        "text": "You have the right to withdraw your consent for personal information processing anytime by writing to care@puretyfarm.in. Requests take effect within 5 business days from receipt."
      }
    },
    {
      "id": "section-10",
      "number": 10,
      "title": "GRIEVANCE OFFICER AND PLATFORM SECURITY",
      "paragraphs": [
        "If you have any queries relating to the processing or usage of information provided by you in connection with this Policy, please email us at care@puretyfarm.in or write to our Grievance Officer at the following address:Puretyfarm OfficePURETYFARM",
        "Kumhari Chowk, Dhamdha Road, Chhattisgarh – 490042",
        "If you come across any abuse or violation of the Policy, please report to care@puretyfarm.in"
      ],
      "subsections": [],
      "badge": "Grievance Officer",
      "callout": {
        "type": "contact",
        "title": "Grievance Officer Contact Details",
        "text": "PURETYFARM Office: Kumhari Chowk, Dhamdha Road, Durg, Chhattisgarh – 490042 | Email: care@puretyfarm.in | Response Timeline: 5 Business Days"
      }
    }
  ]
};
