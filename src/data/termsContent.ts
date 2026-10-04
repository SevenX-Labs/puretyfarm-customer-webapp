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

export const TERMS_CONDITIONS_DATA: LegalDocument = {
  "title": "Terms & Conditions",
  "documentType": "Customer Service Agreement & Terms of Use",
  "entityName": "Puretyfarms (Incorporated under the Companies Act, 2013)",
  "registeredOffice": "Kumhari Chowk, Durg – Chhattisgarh - 490042, India",
  "officialEmail": "care@puretyfarm.in",
  "effectiveDate": "Last Updated: January 2025",
  "jurisdiction": "Courts of Durg, Chhattisgarh, India",
  "preamble": "Overview: This document is an electronic record in terms of Information Technology Act, 2000 and rules there under as applicable and the amended provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000.",
  "sections": [
    {
      "id": "section-1",
      "number": 1,
      "title": "GENERAL",
      "paragraphs": [
        "These terms of use (the “Terms of Use”) govern your use of our website www.Puretyfarm (the “Website”) and our “Puretyfarm” application for mobile and handheld devices (the “App”). The Website along with sub domains and the App are jointly referred to as the “Platform”. Please read these Terms of Use carefully before you use the services. If you do not agree to these Terms of Use, you may not use the services on the Platform, and we request you to uninstall the App. By installing, downloading or even merely using the Platform, you shall be contracting with Puretyfarm and you signify your acceptance to the Terms of Use and other Puretyfarm policies (including but not limited to the Cancellation & Refund Policy, Privacy Policy, Cookies Policy) as posted on the Platform from time to time, which takes effect on the date on which you download, install or use the Services, and create a legally binding arrangement to abide by the same.The Platform is operated and owned by Puretyfarms, a company incorporated under the Companies Act, 2013 and having its registered office at Kumhari Chowk,Durg – Chhattisgarh - 490042, India. For the purpose of these Terms of Use, wherever the context so requires, “you” shall mean any natural or legal person who has agreed to become a buyer or customer on the Platform by providing Registration Data while registering on the Platform as a registered user using any computer systems. The terms “Puretyfarm”, “we”, “us” or “our” shall mean Puretyfarm.Puretyfarm is engaged in the business of food product retail trading and is in the supply of everyday food requirements on a subscription model and on non subscription basis (i.e. ad hoc requirements) and allow buyers (“Buyer/s”) to browse various goods or services (\"Products\") offered for sale (“Services”). The Buyers can choose and place orders (“Orders”) from variety of Products listed and offered for sale on the Platform and Puretyfarm enables delivery of such Orders at select localities of India (“Delivery Services”)."
      ],
      "subsections": [],
      "badge": "General & Service Model"
    },
    {
      "id": "section-2",
      "number": 2,
      "title": "AMENDMENTS",
      "paragraphs": [
        "These Terms of Use are subject to modifications at any time. We reserve the right to modify or change these Terms of Use and other Puretyfarm policies at any time by posting changes on the Platform, and you shall be liable to update yourself of such changes, if any, by accessing the changes on the Platform. You shall, at all times, be responsible for regularly reviewing the Terms of Use and the other Puretyfarm policies and note the changes made on the Platform. Your continued usage of the services after any change is posted constitutes your acceptance of the amended Terms of Use and other Puretyfarm policies. As long as you comply with these Terms of Use, Puretyfarm grants you a personal, non-exclusive, non-transferable, limited privilege to access, enter, and use the Platform. By accepting these Terms of Use, you also accept and agree to be bound by the other terms and conditions and Puretyfarm policies (including but not limited to Cancellation & Refund Policy, Privacy Policy as may be posted on the Platform from time to time."
      ],
      "subsections": [],
      "badge": "Policy Amendments"
    },
    {
      "id": "section-3",
      "number": 3,
      "title": "USE OF PLATFORM AND SERVICES",
      "paragraphs": [],
      "subsections": [
        {
          "title": "General Terms of Sale & Freshness Specifications",
          "items": [
            {
              "label": "1.",
              "content": "All the Products listed on the Platform will be sold at MRP unless otherwise specified. These prices are subject to change with/without notification to you. You agree to pay for the price which is applicable and levied at the date of delivery."
            },
            {
              "label": "2.",
              "content": "Puretyfarm does not make any representation or warranty as to the item-specifics (such as legal title, creditworthiness, identity, etc.) of any of the Manufacturers, Producers/Vendors. You are advised to independently verify the bona fides of any particular Manufacturers, Producers/Vendors of whose products that you choose to deal with on the Platform and use your best judgment in that behalf."
            },
            {
              "label": "3.",
              "content": "Certain products like milk and other dairy products, bread, fruits, vegetables, eggs need to be consumed within 1-2 days of delivery or in accordance with the instructions or specifications of the Manufacturers, producers, Vendors made available on the package, if any. We recommend that you consume the same accordingly as any complaints regarding the quality, deficiency of a particular product will be addressed by the Manufacturers, producers, Vendors considering the follow of instructions or specifications of the Manufacturers, producers, Vendors."
            },
            {
              "label": "4.",
              "content": "Certain products like milk and other dairy products, bread, fruits, vegetables, eggs need to be stored in the refrigerator at a particular temperature levels. We recommend that you store the same accordingly as any complaints regarding the quality, deficiency of a particular product will be addressed by the Manufacturers, producers, Vendors considering the adherence of storage guidelines."
            },
            {
              "label": "5.",
              "content": "THE PRODUCT IMAGES DISPLAYED ON PLATFORM ARE ONLY FOR REFERENCE PURPOSE. WHILE EVERY REASONABLE EFFORT IS MADE TO MAINTAIN ACCURACY OF INFORMATION ON THE PLATFORM, ACTUAL PRODUCT PACKAGING, PRODUCT SIZE, WEIGHT, MRP AND SUCH OTHER PRODUCT DETAILS MAY CONTAIN MORE AND/OR DIFFERENT INFORMATION THAN WHAT IS SHOWN ON THE PLATFORM. IT IS RECOMMENDED NOT TO SOLELY RELY ON THE INFORMATION PRESENTED ON THE PLATFORM."
            },
            {
              "label": "6.",
              "content": "Puretyfarm neither make any representation or guarantee or warranty as to specifics (such as quality, value, saleability, etc.) of the products or services proposed to be sold or offered to be sold or purchased on the Platform nor does implicitly or explicitly support or endorse the sale or purchase of any products or services on the Platform. Puretyfarm accepts no liability for any errors or omissions, on behalf of Manufacturers, Producers/Vendors."
            },
            {
              "label": "7.",
              "content": "Puretyfarm is only a retailer procuring products from Manufacturers, Producers/Vendors. In case of complaints from the Buyer pertaining to efficacy, quality, or any other such issues, user can notify the same to Puretyfarm and concerned Manufacturers, Producers/Vendors shall be liable for redressing Buyer complaints. In the event you raise any, we shall assist you to the best of our abilities by providing relevant information to you, such as details of the Manufacturers, Producers/Vendors and the specific Order to which the complaint relates, to enable satisfactory resolution of the complaint."
            },
            {
              "label": "8.",
              "content": "Call Recording: Puretyfarm may contact via telephone, SMS or other electronic messaging or by email with information about the Service to be offered to you or any feedback thereon. Any calls that may be made by Puretyfarm, by itself or through a third party, to the users pertaining to any Order booking requests of a user may be recorded for internal training and quality purposes by Puretyfarm or any third party if any appointed by Puretyfarm."
            }
          ]
        },
        {
          "title": "3.9 Rules of Conduct & Content Standards",
          "description": "Puretyfarm - Use of Website & Mobile App: You shall not host, display, upload, download, modify, publish, transmit, update or share any information which:",
          "items": [
            { "label": "a.", "content": "belongs to another person and which you do not have any right to;" },
            { "label": "b.", "content": "is grossly harmful, harassing, blasphemous, defamatory, obscene, pornographic, pedophilic, libelous, slanderous, criminally inciting or invasive of another’s privacy, hateful, or racially, ethnically objectionable, disparaging, relating or encouraging money laundering or gambling, or otherwise unlawful in any manner whatsoever; or unlawfully threatening or unlawfully harassing including but not limited to “indecent representation of women” within the meaning of the Indecent Representation of Women (Prohibition) Act, 1986;" },
            { "label": "c.", "content": "is misleading or misrepresentative in any way;" },
            { "label": "d.", "content": "is patently offensive to the online community, such as sexually explicit content, or content that promotes obscenity, pedophilia, racism, bigotry, hatred or physical harm of any kind against any group or individual;" },
            { "label": "e.", "content": "harasses or advocates harassment of another person;" },
            { "label": "f.", "content": "involves the transmission of “junk mail”, “chain letters”, or unsolicited mass mailing or “spamming”;" },
            { "label": "g.", "content": "promotes illegal activities or conduct that is abusive, threatening, obscene, defamatory or libelous;" },
            { "label": "h.", "content": "infringes upon or violates any third party’s rights [including, but not limited to, intellectual property rights, rights of privacy (including without limitation unauthorized disclosure of a person’s name, email address, physical address or phone number) or rights of publicity];" },
            { "label": "i.", "content": "promotes an illegal or unauthorized copy of another person's copyrighted work (see “copyright complaint” below for instructions on how to lodge a complaint about uploaded copyrighted material), such as providing pirated computer programs or links to them, providing information to circumvent manufacture-installed copy-protect devices, or providing pirated music or links to pirated music files;" },
            { "label": "j.", "content": "contains restricted or password-only access pages, or hidden pages or images (those not linked to or from another accessible page);" },
            { "label": "k.", "content": "provides material that exploits people in a sexual, violent or otherwise inappropriate manner or solicits personal information from anyone;" },
            { "label": "l.", "content": "provides instructional information about illegal activities such as making or buying illegal weapons, violating someone’s privacy, or providing or creating computer viruses;" },
            { "label": "m.", "content": "contains video, photographs, or images of another person (with a minor or an adult);" },
            { "label": "n.", "content": "tries to gain unauthorized access or exceeds the scope of authorized access to the Platform or to profiles, blogs, communities, account information, bulletins, friend request, or other areas of the Platform or solicits passwords or personal identifying information for commercial or unlawful purposes from other users;" },
            { "label": "o.", "content": "engages in commercial activities and/or sales without our prior written consent such as contests, sweepstakes, barter, advertising and pyramid schemes, or the buying or selling of products related to the Platform. Throughout these Terms of Use, Puretyfarm’s prior written consent means a communication coming from Puretyfarm’s Legal Department, specifically in response to your request, and expressly addressing and allowing the activity or conduct for which you seek authorization;" },
            { "label": "p.", "content": "solicits gambling or engages in any gambling activity which is or could be construed as being illegal;" },
            { "label": "q.", "content": "interferes with another user’s use and enjoyment of the Platform or any third party’s user and enjoyment of similar services;" },
            { "label": "r.", "content": "refers to any website or URL that, in our sole discretion, contains material that is inappropriate for the Platform or any other website, contains content that would be prohibited or violates the letter or spirit of these Terms of Use;" },
            { "label": "s.", "content": "harm minors in any way;" },
            { "label": "t.", "content": "infringes any patent, trademark, copyright or other intellectual property rights or third party’s trade secrets or rights of publicity or privacy or shall not be fraudulent or involve the sale of counterfeit or stolen products;" },
            { "label": "u.", "content": "violates any law for the time being in force;" },
            { "label": "v.", "content": "deceives or misleads the addressee/users about the origin of such messages or communicates any information which is grossly offensive or menacing in nature;" },
            { "label": "w.", "content": "impersonate another person;" },
            { "label": "x.", "content": "contains software viruses or any other computer code, files or programs designed to interrupt, destroy or limit the functionality of any computer resource; or contains any trojan horses, worms, time bombs, cancelbots, easter eggs or other computer programming routines that may damage, detrimentally interfere with, diminish value of, surreptitiously intercept or expropriate any system, data or personal information;" },
            { "label": "y.", "content": "threatens the unity, integrity, defense, security or sovereignty of India, friendly relations with foreign states, or public order or causes incitement to the commission of any criminal offence or prevents investigation of any offence or is insulting any other nation;" },
            { "label": "z.", "content": "is false, inaccurate or misleading;" },
            { "label": "aa.", "content": "directly or indirectly, offers, attempts to offer, trades or attempts to trade in any item, the dealing of which is prohibited or restricted in any manner under the provisions of any applicable law, rule, regulation or guideline for the time being in force; or" },
            { "label": "ab.", "content": "creates liability for us or causes us to lose (in whole or in part) the services of our internet service provider or other suppliers." }
          ]
        },
        {
          "title": "3.10 Platform Security, Anti-Scraping & Acceptable Use Obligations",
          "description": "In your access and use of Puretyfarm services, you strictly agree and undertake:",
          "items": [
            { "label": "ii.", "content": "You shall not use any “deep-link”, “page-scrape”, “robot”, “spider” or other automatic device, program, algorithm or methodology, or any similar or equivalent manual process, to access, acquire, copy or monitor any portion of the Platform or any Content, or in any way reproduce or circumvent the navigational structure or presentation of the Platform or any Content, to obtain or attempt to obtain any materials, documents or information through any means not purposely made available through the Platform. We reserve our right to prohibit any such activity." },
            { "label": "iii.", "content": "You shall not attempt to gain unauthorized access to any portion or feature of the Platform, or any other systems or networks connected to the Platform or to any server, computer, network, or to any of the services offered on or through the Platform, by hacking, “password mining” or any other illegitimate means." },
            { "label": "iv.", "content": "You shall not probe, scan or test the vulnerability of the Platform or any network connected to the Platform nor breach the security or authentication measures on the Platform or any network connected to the Platform. You may not reverse look-up, trace or seek to trace any information on any other user of or visitor to Platform, or any other Buyer, including any account on the Platform not owned by you, to its source, or exploit the Platform or any service or information made available or offered by or through the Platform, in any way where the purpose is to reveal any information, including but not limited to personal identification or information, other than your own information, as provided for by the Platform." },
            { "label": "v.", "content": "You shall not make any negative, denigrating or defamatory statement(s) or comment(s) about us or the brand name or domain name used by us including the name ‘Puretyfarm’, or otherwise engage in any conduct or action that might tarnish the image or reputation, of Puretyfarm or Manufacturer/Producer/Vendor on platform or otherwise tarnish or dilute any Puretyfarm’s trade or service marks, trade name and/or goodwill associated with such trade or service marks, as may be owned or used by us. You agree that you will not take any action that imposes an unreasonable or disproportionately large load on the infrastructure of the Platform or Puretyfarm’s systems or networks, or any systems or networks connected to Puretyfarm." },
            { "label": "vi.", "content": "You agree not to use any device, software or routine to interfere or attempt to interfere with the proper working of the Platform or any transaction being conducted on the Platform, or with any other person’s use of the Platform." },
            { "label": "vii.", "content": "You may not forge headers or otherwise manipulate identifiers in order to disguise the origin of any message or transmittal you send to us on or through the Platform or any service offered on or through the Platform. You may not pretend that you are, or that you represent, someone else, or impersonate any other individual or entity." },
            { "label": "viii.", "content": "You may not use the Platform or any content on the Platform for any purpose that is unlawful or prohibited by these Terms of Use, or to solicit the performance of any illegal activity or other activity that infringes the rights of Puretyfarm and/or others." },
            { "label": "ix.", "content": "You shall at all times ensure full compliance with the applicable provisions, as amended from time to time, of (a) the Information Technology Act, 2000 and the rules thereunder; (b) all applicable domestic laws, rules and regulations (including the provisions of any applicable exchange control laws or regulations in force); and (c) international laws, foreign exchange laws, statutes, ordinances and regulations (including, but not limited to goods and service tax, income tax, central excise, custom duty, local levies) regarding your use of our service and your listing, purchase, solicitation of offers to purchase, and sale of products or services. You shall not engage in any transaction in an item or service, which is prohibited by the provisions of any applicable law including exchange control laws or regulations for the time being in force." },
            { "label": "x.", "content": "In order to allow us to use the information supplied by you, without violating your rights or any laws, you agree to grant us a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, sub-licensable (through multiple tiers) right to exercise the copyright, publicity, database rights or any other rights you have in your Information, in any media now known or not currently known, with respect to your Information. We will only use your information in accordance with these Terms of Use and Privacy Policy applicable to use of the Platform." },
            { "label": "xi.", "content": "From time to time, you shall be responsible for providing information relating to the products or services proposed to be sold by you. In this connection, you undertake that all such information shall be accurate in all respects. You shall not exaggerate or overemphasize the attributes of such products or services so as to mislead other users in any manner." },
            { "label": "xii.", "content": "You shall not engage in advertising to, or solicitation of, other users of the Platform to buy or sell any products or services, including, but not limited to, products or services related to that being displayed on the Platform or related to us. You may not transmit any chain letters or unsolicited commercial or junk email to other users via the Platform. It shall be a violation of these Terms of Use to use any information obtained from the Platform in order to harass, abuse, or harm another person, or in order to contact, advertise to, solicit, or sell to another person other than us without our prior explicit consent. In order to protect our users from such advertising or solicitation, we reserve the right to restrict the number of messages or emails which a user may send to other users in any 24-hour period which we deem appropriate in its sole discretion. You understand that we have the right at all times to disclose any information (including the identity of the persons providing information or materials on the Platform) as necessary to satisfy any law, regulation or valid governmental request. This may include, without limitation, disclosure of the information in connection with investigation of alleged illegal activity or solicitation of illegal activity or in response to a lawful court order or subpoena. In addition, We can (and you hereby expressly authorize us to) disclose any information about you to law enforcement or other government officials, as we, in our sole discretion, believe necessary or appropriate in connection with the investigation and/or resolution of possible crimes, especially those that may involve personal injury." },
            { "label": "xiii.", "content": "We reserve the right, but has no obligation, to monitor the materials posted on the Platform. Puretyfarm shall have the right to remove or edit any content that in its sole discretion violates, or is alleged to violate, any applicable law or either the spirit or letter of these Terms of Use. Notwithstanding this right, YOU REMAIN SOLELY RESPONSIBLE FOR THE CONTENT OF THE MATERIALS YOU POST ON THE PLATFORM AND IN YOUR PRIVATE MESSAGES. Please be advised that such Content posted does not necessarily reflect Puretyfarm views. In no event shall Puretyfarm assume or have any responsibility or liability for any Content posted or for any claims, damages or losses resulting from use of Content and/or appearance of Content on the Platform. You hereby represent and warrant that you have all necessary rights in and to all Content which you provide and all information it contains and that such Content shall not infringe any proprietary or other rights of third parties or contain any libelous, tortuous, or otherwise unlawful information." },
            { "label": "xiv.", "content": "Your correspondence or business dealings with, or participation in promotions of, advertisers found on or through the Platform, including payment and delivery of related products or services, and any other terms, conditions, warranties or representations associated with such dealings, are solely between you and such advertiser. We shall not be responsible or liable for any loss or damage of any sort incurred as the result of any such dealings or as the result of the presence of such advertisers on the Platform." },
            { "label": "xv.", "content": "It is possible that other users (including unauthorized users or ‘hackers’) may post or transmit offensive or obscene materials on the Platform and that you may be involuntarily exposed to such offensive and obscene materials. It also is possible for others to obtain personal information about you due to your use of the Platform, and that the recipient may use such information to harass or injure you. We do not approve of such unauthorized uses, but by using the Platform You acknowledge and agree that we are not responsible for the use of any personal information that you publicly disclose or share with others on the Platform. Please carefully select the type of information that you publicly disclose or share with others on the Platform." },
            { "label": "xvi.", "content": "Puretyfarm shall have all the rights to take necessary action and claim damages that may occur due to your involvement/participation in any way on your own or through group/s of people, intentionally or unintentionally in DoS/DDoS (Distributed Denial of Services), hacking, pen testing attempts without our prior consent or a mutual legal agreement." }
          ]
        }
      ],
      "badge": "Platform & Product Guidelines"
    },
    {
      "id": "section-4",
      "number": 4,
      "title": "ACCOUNT REGISTRATION OR USE OF THE PLATFORM",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Account Ownership & Eligibility",
          "items": [
            {
              "label": "1.",
              "content": "You may access the Platform by registering to create an account (\"Puretyfarm Account”) and become a member (“Membership”);"
            },
            {
              "label": "2.",
              "content": "We will create your Puretyfarm Account for your use of the Platform services based upon the personal information you provide to us You shall only have one Puretyfarm Account and not permitted to create multiple accounts. If found, you having multiple accounts, Puretyfarm reserves the right to suspend such multiple account without being liable for any compensation."
            },
            {
              "label": "3.",
              "content": "You agree to provide accurate, current and complete information during the registration process and to update such information to keep it accurate, current and complete."
            },
            {
              "label": "4.",
              "content": "We reserve the right to suspend or terminate your Puretyfarm Account and your access to the Services (i) if any information provided during the registration process or thereafter proves to be inaccurate, not current or incomplete; (ii) if it is believed that your actions may cause legal liability for you, other users or us; and/or (iii) if you are found to be non- compliant with the Terms of Use."
            },
            {
              "label": "5.",
              "content": "Goods and services purchased from the Platform are intended for your personal use and you represent that the same are not for resale or you are not acting as an agent for other parties."
            }
          ]
        }
      ],
      "badge": "Account Registration"
    },
    {
      "id": "section-5",
      "number": 5,
      "title": "BOOKINGS AND FINANCIAL TERMS",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Financial Terms & Payment Methods (INR)",
          "items": [
            {
              "label": "1.",
              "content": "The Platform allows you to place Order bookings for subscription or otherwise and we will, subject to the terms and conditions set out herein, enable the delivery of such Order to you. Puretyfarm retain the right to accept or reject your subscription booking or Order bookings at its sole discretions and fulfillment is subject to availability of stocks. Puretyfarm shall make good faith efforts to fulfill Orders but it is under no mandatory obligation to do so in case of reasons beyond control, more particularly detailed hereunder."
            },
            {
              "label": "2.",
              "content": "PURETYFARM DO NOT MANUFACTURE OR PRODUCE THE PRODUCTS LISTED ON PLATFORM. YOU UNDERSTAND THAT ANY ORDER THAT YOU PLACE SHALL BE SUBJECT TO THE TERMS AND CONDITIONS SET OUT IN THESE TERMS OF USE INCLUDING, BUT NOT LIMITED TO, PRODUCT AVAILABILITY AND DELIVERY LOCATION SERVICEABILITY."
            },
            {
              "label": "3.",
              "content": "As a general rule, all Orders placed on the Platform are treated as confirmed."
            },
            {
              "label": "4.",
              "content": "However, upon your successful completion of booking an Order, we may call you on the telephone or mobile number provided to confirm the details of the Order, the price to be paid. For this purpose, you will be required to share certain information with us, including but not limited to (i) your first and last name (ii) mobile number; and (iii) email address. It shall be your sole responsibility to bring any incorrect details to our attention."
            },
            {
              "label": "5.",
              "content": "In addition to the foregoing, we may also contact you by phone and / or email to inform and confirm any change in the Order, due to availability or unavailability of products or change in the price of the Order as informed to us."
            },
            {
              "label": "6.",
              "content": "All payments made against the purchases/services on the Platform by you shall be compulsorily in Indian Rupees acceptable in the Republic of India. The Platform will not facilitate transactions with respect to any other form of currency with respect to the purchases made on Platform. You can pay by (i) credit card or debit card or net banking; (ii) any other RBI approved payment method at the time of booking an Order; or (iii) credit or debit card or cash at the time of delivery. You understand, accept and agree that the payment facility provided by Puretyfarm is neither a banking nor financial service but is merely a facilitator providing an electronic, automated online electronic payment, receiving payment on delivery, collection and remittance facility for the transactions on the Platform using the existing authorized banking infrastructure and credit card payment gateway networks. Further, by providing payment facility, Puretyfarm is neither acting as trustees nor acting in a fiduciary capacity with respect to the transaction or the transaction price."
            },
            {
              "label": "7.",
              "content": "You agree to pay us for the total amount for the Order placed by you on the Platform."
            },
            {
              "label": "8.",
              "content": "The user shall also be liable to pay any additional charges and/or applicable taxes if any which may be applicable to each transaction."
            },
            {
              "label": "9.",
              "content": "In connection with your Order, you will be asked to provide customary billing information such as name, billing address and credit card information either to us or our third party payment processor. You agree to pay us for the Order placed by you on the Platform, in accordance with these Terms, using the methods described under clause VII (6) above. You hereby authorize the collection of such amounts by charging the credit card provided as part of requesting the booking, either directly by us or indirectly, via a third party online payment processor or by one of the payment methods described on the Platform. If you are directed to our third-party payment processor, you may be subject to the terms and conditions governing the use of that third party’s service and that third party’s personal information collection practices. Please review such terms and conditions and privacy policy before using the Platform services. Once your confirmed booking transaction is complete you will receive a confirmation email summarizing your confirmed booking."
            },
            {
              "label": "10.",
              "content": "All the products listed on the Platform will be sold at MRP unless otherwise specified. The prices mentioned at the time of ordering will be the prices charged on the date of booking the Order. Although prices of most of the products do not fluctuate on a daily basis but some of the commodities and fresh food prices do change on a daily basis. In case the prices are higher or lower on the date of actual delivery additional charges will be collected or refunded or adjusted as the case may be from the wallet balance."
            },
            {
              "label": "11.",
              "content": "THE MANUFACTURER/PRODUCER SHALL BE SOLELY RESPONSIBLE FOR ANY WARRANTY/GUARANTEE OF THE PRODUCTS SOLD TO THE BUYERS AND IN NO EVENT SHALL BE THE RESPONSIBILITY OF PURETYFARM SINCE WE ARE MERELY RESELLERS."
            }
          ]
        }
      ],
      "badge": "Bookings & Billing"
    },
    {
      "id": "section-6",
      "number": 6,
      "title": "CANCELLATIONS AND REFUNDS",
      "paragraphs": [
        "Please review our policy regarding daily cancellations, 10:00 PM cut-off times, refund criteria, wallet transfers, and doorstep return guidelines below:"
      ],
      "subsections": [
        {
          "title": "6.1 Cancellation Policy & 10:00 PM Daily Cut-Off",
          "description": "After making an online subscription or placing an order for a particular product:",
          "items": [
            {
              "label": "6.1.i",
              "content": "You as a customer can cancel your delivery for a particular day/Order anytime up to the cut-off time (i.e. 10.00 PM of the day preceding the date of actual delivery of product) by getting in touch with our customer service Chat support or Call. You can also end the Vacation before the cut off time when you want to recommence the delivery. For Buy-Once orders, you can only cancel prior to confirmation."
            },
            {
              "label": "6.1.ii",
              "content": "In the event of an item on your Order being unavailable, we will contact you on the phone number provided to us at the time of placing the Order and inform you of such unavailability. In such an event you will be entitled to cancel the subscription/Order and shall be entitled to a refund in accordance with our refund policy."
            },
            {
              "label": "6.1.iii",
              "content": "We reserve the sole right to cancel your Order in the following circumstances: (a) in the event the designated address falls outside the delivery zone offered by us; (b) failure to contact you by phone or email at the time of confirming the Order booking; (c) failure to deliver your Order due to lack of information, direction or authorization from you at the time of delivery; (d) unavailability of all the items Ordered by you at the time of booking the Order; or (e) in case the delivery person is not allowed inside your compound, community or society or any other reason beyond control causing movement of the delivery person including but not limited to law and order situation."
            }
          ]
        },
        {
          "title": "6.2 Refund Eligibility & Puretyfarm Wallet Settlements",
          "description": "Conditions for pre-paid order refunds and settlement timelines:",
          "items": [
            {
              "label": "6.2.i",
              "content": "You shall be entitled to a refund only if you pre-pay for your Order at the time of placing your Order on the Platform and only in the event of any of the following circumstances: (a) your Order packaging has been tampered or damaged or spilled at the time of delivery and you have not accepted the delivery; (b) us cancelling your Order due to your delivery location falling outside our designated delivery zones or failure to contact you; or (c) you cancelling the Order at the time of confirmation due to unavailability of the items you ordered for at the time of booking."
            },
            {
              "label": "6.2.ii",
              "content": "OUR DECISION ON REFUNDS ITS APPLICABILITY, ETC IN ALL CASES SHALL BE AT OUR SOLE DISCRETION AND SHALL BE FINAL AND BINDING."
            },
            {
              "label": "6.2.iii",
              "content": "All refunds will be credited to Your Puretyfarm wallet. You can trigger a request in Your Puretyfarm wallet to transfer the money from Your Puretyfarm wallet back to source. It will take 3-21 working days for the money to show in Your bank account depending on your bank’s policy."
            }
          ]
        },
        {
          "title": "6.3 Payment on Delivery Waivers",
          "description": "In case of payment at the time of delivery, you will not be required to pay for:",
          "items": [
            {
              "label": "6.3.i",
              "content": "Orders where the packaging has been tampered or damaged or spilled by us;"
            },
            {
              "label": "6.3.ii",
              "content": "Wrong Order being delivered; or"
            },
            {
              "label": "6.3.iii",
              "content": "To the extent of the value of the item/s missing from your Order at the time of delivery."
            }
          ]
        },
        {
          "title": "6.4 Return Policy Conditions",
          "description": "You shall be entitled to return the product in following cases:",
          "items": [
            {
              "label": "6.4.i",
              "content": "Wrong Order being delivered;"
            },
            {
              "label": "6.4.ii",
              "content": "Item substantially damaged or deteriorated in quality."
            }
          ]
        },
        {
          "title": "6.5 Doorstep Handover & Opened Packaging Clarification",
          "description": "Return process and consumer restrictions:",
          "items": [
            {
              "label": "6.5.i",
              "content": "You can return the product to our delivery partner at the time of receipt of product. Alternatively, you can return the product by contacting our Customer care for the same. IT IS HEREBY CLARIFIED THAT NO RETURNS SHALL BE ACCEPTED AFTER THE PACKAGING OF PRODUCT IS OPENED OR PRODUCT IS CONSUMED EITHER IN PART OR OTHERWISE BY YOU."
            }
          ]
        }
      ],
      "badge": "Cancellations & Refunds",
      "callout": {
        "type": "highlight",
        "title": "⏰ 10:00 PM Daily Cut-Off Time",
        "text": "To cancel or pause delivery for the next morning (including setting Vacation Mode), requests must be completed via chat/call before 10:00 PM of the preceding evening."
      }
    },
    {
      "id": "section-7",
      "number": 7,
      "title": "TERMS OF SERVICE",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Service Liability Conditions",
          "items": [
            {
              "label": "1.",
              "content": "You understand that our liability ends once your Order has been delivered to you."
            },
            {
              "label": "2.",
              "content": "We do not offer any refunds against goods already purchased from the Platform unless an error that is directly attributable to us has occurred during the purchase of such product or services."
            },
            {
              "label": "3.",
              "content": "We constantly strive to provide you with accurate information on the Platform. However, in the event of an error, we may, in our sole discretion, contact you with further instructions."
            },
            {
              "label": "4.",
              "content": "If you use the Platform, you do the same at your own risk."
            },
            {
              "label": "5.",
              "content": "You agree to use the Platform for bona fide purposes and you shall not cause any financial or other loss to Puretyfarm. In case Puretyfarm has reason to believe that the Platform and its services are abused to cause loss or intended to cause loss, we shall reserve all the rights to report to law enforcement agencies and/or take all the actions to prevent/eliminate such loss."
            }
          ]
        }
      ],
      "badge": "Terms of Service"
    },
    {
      "id": "section-8",
      "number": 8,
      "title": "NO ENDORSEMENT",
      "paragraphs": [
        "1. We do not endorse any Manufacturer or Producer. In addition, although these Terms of Use require you to provide accurate information, we do not attempt toconfirm, and do not confirm if it is purported identity."
      ],
      "subsections": [],
      "badge": "No Endorsement"
    },
    {
      "id": "section-9",
      "number": 9,
      "title": "GENERAL TERMS OF USE",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Eligibility (18+ Requirement) & User Obligations",
          "items": [
            {
              "label": "1.",
              "content": "Persons who are “incompetent to contract” within the meaning of the Indian Contract Act, 1872 including minors, un-discharged insolvents etc. are not eligible to use the Platform. Only individuals who are 18 years of age or older may use the Platform and avail Services. If you are under 18 years of age and you wish to download, install, access or use the Platform, your parents or legal guardian must acknowledge and agree to the Terms of Use and Privacy Policy. Should your parents or legal guardian fail to agree or acknowledge the Terms of Use and Puretyfarm policies, you shall immediately discontinue its use. Puretyfarm reserves the right to terminate your Membership and / or deny access to the platform if it is brought Puretyfarm’s notice that you are under the age of 18 years."
            },
            {
              "label": "2.",
              "content": "If you choose to use the Platform, it shall be your responsibility to treat your user identification code, password and any other piece of information that we may provide, as part of our security procedures, as confidential and not disclose the same to any person or entity other than us. We shall at times and at our sole discretion reserve the right to disable any user identification code or password if you have failed to comply with any of the provisions of these Terms of Use."
            },
            {
              "label": "3.",
              "content": "As we are providing services in selected cities in India, we have complied with applicable laws of India in making the Platform and its content available to you. In the event the Platform is accessed from outside India or outside our delivery zones, it shall be entirely at your risk. We make no representation that the Platform and its contents are available or otherwise suitable for use outside select cities. If you choose to access or use the Platform from or in locations outside select cities, you do so on your own and shall be responsible for the consequences and ensuring compliance of applicable laws, regulations, byelaws, licenses, registrations, permits, authorisations, rules and guidelines."
            },
            {
              "label": "4.",
              "content": "You shall at all times be responsible for the use of the Services through your computer or mobile device and for bringing these Terms of Use and Puretyfarm policies to the attention of all such persons accessing the Platform on your computer or mobile device."
            },
            {
              "label": "5.",
              "content": "You understand and agree that the use of the Services does not include the provision of a computer or mobile device or other necessary equipment to access it. You also understand and acknowledge that the use of the Platform requires internet connectivity and telecommunication links. You shall bear the costs incurred to access and use the Platform and avail the Services, and we shall not, under any circumstances whatsoever, be responsible or liable for such costs."
            },
            {
              "label": "6.",
              "content": "You agree and grant permission to Puretyfarm to receive promotional SMS and e-mails from Puretyfarm or allied partners. In case you wish to opt out of receiving promotional SMS or email please send a mail to care@puretyfarm.in."
            },
            {
              "label": "7.",
              "content": "By using the Platform you represent and warrant that:"
            },
            {
              "label": "7.i",
              "content": "All registration information you submit is truthful, lawful and accurate and that you agree to maintain the accuracy of such information."
            },
            {
              "label": "7.ii",
              "content": "Your use of the Platform shall be solely for your personal use and you shall not authorize others to use your account, including your profile or email address and that you are solely responsible for all content published or displayed through your account, including any email messages, and your interactions with other users and you shall abide by all applicable local, state, national and foreign laws, treaties and regulations, including those related to data privacy, international communications and the transmission of technical or personal data."
            },
            {
              "label": "7.iii",
              "content": "You will not submit, post, upload, distribute, or otherwise make available or transmit any content that: (a) is defamatory, abusive, harassing, insulting, threatening, or that could be deemed to be stalking or constitute an invasion of a right of privacy of another person; (b) is bigoted, hateful, or racially or otherwise offensive; (c) is violent, vulgar, obscene, pornographic or otherwise sexually explicit; (d) is illegal or encourages or advocates illegal activity or the discussion of illegal activities with the intent to commit them."
            },
            {
              "label": "7.iv",
              "content": "You will not use the Platform in any way that is unlawful, or harms us or any other person or entity, as determined in our sole discretion."
            },
            {
              "label": "7.v",
              "content": "You will not post, submit, upload, distribute, or otherwise transmit or make available any software or other computer files that contain a virus or other harmful component, or otherwise impair or damage the Platform or any connected network, or otherwise interfere with any person or entity’s use or enjoyment of the Platform."
            },
            {
              "label": "7.vi",
              "content": "You will not use another person’s username, or other account information, or another person’s name, likeness, voice, image or photograph or impersonate any person or entity or misrepresent your identity or affiliation with any person or entity."
            },
            {
              "label": "7.vii",
              "content": "You will not engage in any form of antisocial, disrupting, or destructive acts, including “flaming,” “spamming,” “flooding,” “trolling,” and “griefing” as those terms are commonly understood and used on the Internet."
            },
            {
              "label": "7.viii",
              "content": "You will not delete or modify any content of the Platform, including but not limited to, legal notices, disclaimers or proprietary notices such as copyright or trademark symbols, logos, that you do not own or have express permission to modify."
            },
            {
              "label": "7.ix",
              "content": "You will not post or contribute any information or data that may be obscene, indecent, pornographic, vulgar, profane, racist, sexist, discriminatory, offensive, derogatory, harmful, harassing, threatening, embarrassing, malicious, abusive, hateful, menacing, defamatory, untrue or political or contrary to our interests."
            },
            {
              "label": "7.x",
              "content": "You shall not access the Platform without authority or use the Platform in a manner that damages, interferes or disrupts: (a) any part of the Platform or the Platform software; or (b) any equipment or any network on which the Platform is stored or any equipment of any third party."
            },
            {
              "label": "8.",
              "content": "You release and fully indemnify Puretyfarm and/or any of its officers and representatives from any cost, damage, liability or other consequences of any of the actions of the Users of the Platform and specifically waive any claims that you may have in this behalf under any applicable laws of India. Notwithstanding its reasonable efforts in that behalf, Puretyfarm cannot take responsibility or control the information provided by other Users which is made available on the Platform. You may find other User’s information to be offensive, harmful, inconsistent, inaccurate, or deceptive. Please use caution and practice safe trading when using the Platform."
            }
          ]
        }
      ],
      "badge": "Eligibility & Conduct"
    },
    {
      "id": "section-10",
      "number": 10,
      "title": "ACCESS TO THE PLATFORM, ACCURACY AND SECURITY",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Platform Uptime & Accuracy",
          "items": [
            {
              "label": "1.",
              "content": "We endeavor to make the Platform available during the day. However, we do not represent that access to the Platform will be uninterrupted, timely, error free, free of viruses or other harmful components or that such defects will be corrected."
            },
            {
              "label": "2.",
              "content": "We do not warrant that the Platform will be compatible with all hardware and software which you may use. We shall not be liable for damage to, or viruses or other code that may affect, any equipment (including but not limited to your mobile device), software, data or other property as a result of your download, installation, access to or use of the Platform or your obtaining any material from, or as a result of using, the Platform. We shall also not be liable for the actions of third parties."
            },
            {
              "label": "3.",
              "content": "We do not represent or warranty that the information available on the Platform will be correct, accurate or otherwise reliable."
            },
            {
              "label": "4.",
              "content": "We reserve the right to suspend or withdraw access to the Platform to you personally, or to all users temporarily or permanently at any time without notice. We may any time at our sole discretion reinstate suspended users. A suspended User may not register or attempt to register with us or use the Platform in any manner whatsoever until such time that such user is reinstated by us."
            }
          ]
        }
      ],
      "badge": "Security & Availability"
    },
    {
      "id": "section-11",
      "number": 11,
      "title": "RELATIONSHIP WITH OPERATORS IF THE PLATFORM IS ACCESSED ON MOBILE DEVICES",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Apple App Store & Google Play Operator Relations",
          "items": [
            {
              "label": "1.",
              "content": "In the event the Platform is accessed on a mobile device, it is not associated, affiliated, sponsored, endorsed or in any way linked to any platform operator, including, without limitation, Apple, Google, Android (each being an “Operator”)."
            },
            {
              "label": "2.",
              "content": "Your download, installation, access to or use of the Platform is also bound by the terms and conditions of the Operator."
            },
            {
              "label": "3.",
              "content": "You and we acknowledge that these Terms of Use are concluded between you and us only, and not with an Operator, and we, not those Operators, are solely responsible for the Platform and the content thereof to the extent specified in these Terms of Use."
            },
            {
              "label": "4.",
              "content": "The license granted to you for the Platform is limited to a non-transferable license to use the Platform on a mobile device that you own or control and as permitted by these Terms of Use."
            },
            {
              "label": "5.",
              "content": "We are solely responsible for providing any maintenance and support services with respect to the Platform as required under applicable law. You and we acknowledge that an Operator has no obligation whatsoever to furnish any maintenance and support services with respect to the Platform."
            },
            {
              "label": "6.",
              "content": "You and we acknowledge that we, not the relevant Operator, are responsible for addressing any claims of you or any third party relating to the Platform or your possession and/or use of the Platform, including, but not limited to: (i) any claim that the Platform fails to conform to any applicable legal or regulatory requirement; and (ii) claims arising under consumer protection or similar legislation."
            },
            {
              "label": "7.",
              "content": "You and we acknowledge that, in the event of any third party claim that the Platform or your possession and use of the Platform infringes that third party’s intellectual property rights, we, not the relevant Operator, will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim."
            },
            {
              "label": "8.",
              "content": "You must comply with any applicable third party terms of agreement when using the Platform (e.g. you must ensure that your use of the Platform is not in violation of your mobile device agreement or any wireless data service agreement)."
            },
            {
              "label": "9.",
              "content": "You and we acknowledge and agree that the relevant Operator, and that Operator’s subsidiaries are third party beneficiaries of these Terms of Use, and that, upon your acceptance of these Terms of Use, that Operator will have the right (and will be deemed to have accepted the right) to enforce these Terms of Use against you as a third party beneficiary thereof."
            }
          ]
        }
      ],
      "badge": "Mobile App Store Terms"
    },
    {
      "id": "section-12",
      "number": 12,
      "title": "DISCLAIMERS",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Legal Disclaimers (AS IS Basis)",
          "items": [
            {
              "label": "1.",
              "content": "THE PLATFORM MAY BE UNDER CONSTANT UPGRADES, AND SOME FUNCTIONS AND FEATURES MAY NOT BE FULLY OPERATIONAL."
            },
            {
              "label": "2.",
              "content": "DUE TO THE VAGARIES THAT CAN OCCUR IN THE ELECTRONIC DISTRIBUTION OF INFORMATION AND DUE TO THE LIMITATIONS INHERENT IN PROVIDING INFORMATION OBTAINED FROM MULTIPLE SOURCES, THERE MAY BE DELAYS, OMISSIONS, OR INACCURACIES IN THE CONTENT PROVIDED ON THE PLATFORM OR DELAY OR ERRORS IN FUNCTIONALITY OF THE PLATFORM. AS A RESULT, WE DO NOT REPRESENT THAT THE INFORMATION POSTED IS CORRECT IN EVERY CASE."
            },
            {
              "label": "3.",
              "content": "WE EXPRESSLY DISCLAIM ALL LIABILITIES THAT MAY ARISE AS A CONSEQUENCE OF ANY UNAUTHORIZED USE OF CREDIT/ DEBIT CARDS."
            },
            {
              "label": "4.",
              "content": "YOU ACKNOWLEDGE THAT THIRD PARTY SERVICES ARE AVAILABLE ON THE PLATFORM. WE MAY HAVE FORMED PARTNERSHIPS OR ALLIANCES WITH SOME OF THESE THIRD PARTIES FROM TIME TO TIME IN ORDER TO FACILITATE THE PROVISION OF CERTAIN SERVICES TO YOU. HOWEVER, YOU ACKNOWLEDGE AND AGREE THAT AT NO TIME ARE WE MAKING ANY REPRESENTATION OR WARRANTY REGARDING ANY THIRD PARTY’S SERVICES NOR WILL WE BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY CONSEQUENCES OR CLAIMS ARISING FROM OR IN CONNECTION WITH SUCH THIRD PARTY INCLUDING, AND NOT LIMITED TO, ANY LIABILITY OR RESPONSIBILITY FOR, DEATH, INJURY OR IMPAIRMENT EXPERIENCED BY YOU OR ANY THIRD PARTY. YOU HEREBY DISCLAIM AND WAIVE ANY RIGHTS AND CLAIMS YOU MAY HAVE AGAINST US WITH RESPECT TO THIRD PARTY’S / MANUFACTURERS/PRODUCERS/VENDORS’ SERVICES."
            },
            {
              "label": "5.",
              "content": "PURETYFARM DISCLAIMS AND ALL LIABILITY THAT MAY ARISE DUE TO ANY ISSUES WITH RESPECT TO THE PRODUCTS AVAILABLE ON PLATFORM. PURETYFARM IS NOT RESPONSIBLE FOR ANY WARRANTY, GUARANTEE, POST SALE CLAIMS, GENUINENESS OF LISTINGS, CONTENT, PRODUCTS AND SERVICES AS PURETYFARM IS JUST A RETAILER THAT PROCURES THE PRODUCTS FROM THE MANUFACTURER OR PRODUCER OR VENDOR. ALL THE CLAIMS RELATING TO THE PRODUCTS INCLUDING BUT NOT LIMITED TO PRODUCT LIABILITY CLAIMS, DAMAGES AND INJURIES WHICH MAY HAPPEN DUE TO CONSUMPTION SHALL BE REFERRED TO THE CONCERNED MANUFACTURER/PRODUCER/VENDOR AND PURETYFARM SHALL BE ABSOLVED FOR ANY LIABILITY ARISING OUT OF SUCH CLAIM. CUSTOMER CAN SEEK PURETYFARM’S ASSISTANCE FOR GIVING ADDITIONAL INFORMATION IF REQUIRED PROVIDED THE SAME IS AVAILABLE WITH PURETYFARM."
            },
            {
              "label": "6.",
              "content": "WHILE THE MATERIALS PROVIDED ON THE PLATFORM WERE PREPARED TO PROVIDE ACCURATE INFORMATION REGARDING THE SUBJECT DISCUSSED, THE INFORMATION CONTAINED IN THESE MATERIALS IS BEING MADE AVAILABLE WITH THE UNDERSTANDING THAT WE MAKE NO GUARANTEES, REPRESENTATIONS OR WARRANTIES WHATSOEVER, WHETHER EXPRESSED OR IMPLIED, WITH RESPECT TO PROFESSIONAL QUALIFICATIONS, EXPERTISE, QUALITY OF WORK OR OTHER INFORMATION HEREIN. FURTHER, WE DO NOT, IN ANY WAY, ENDORSE ANY SERVICE OFFERED OR DESCRIBED HEREIN. IN NO EVENT SHALL WE BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DECISION MADE OR ACTION TAKEN IN RELIANCE ON SUCH INFORMATION."
            },
            {
              "label": "7.",
              "content": "THE INFORMATION PROVIDED HEREUNDER IS PROVIDED “AS IS”. WE AND / OR OUR EMPLOYEES MAKE NO WARRANTY OR REPRESENTATION REGARDING THE TIMELINESS, CONTENT, SEQUENCE, ACCURACY, EFFECTIVENESS OR COMPLETENESS OF ANY INFORMATION OR DATA FURNISHED HEREUNDER OR THAT THE INFORMATION OR DATA PROVIDED HEREUNDER MAY BE RELIED UPON. MULTIPLE RESPONSES MAY USUALLY BE MADE AVAILABLE FROM DIFFERENT SOURCES AND IT IS LEFT TO THE JUDGEMENT OF USERS BASED ON THEIR SPECIFIC CIRCUMSTANCES TO USE, ADAPT, MODIFY OR ALTER SUGGESTIONS OR USE THEM IN CONJUNCTION WITH ANY OTHER SOURCES THEY MAY HAVE, THEREBY ABSOLVING US AS WELL AS OUR CONSULTANTS, BUSINESS ASSOCIATES, AFFILIATES, BUSINESS PARTNERS AND EMPLOYEES FROM ANY KIND OF PROFESSIONAL LIABILITY."
            },
            {
              "label": "8.",
              "content": "WE SHALL NOT BE LIABLE TO YOU OR ANYONE ELSE FOR ANY LOSSES OR INJURY ARISING OUT OF OR RELATING TO THE INFORMATION PROVIDED ON THE PLATFORM. IN NO EVENT WILL WE OR OUR EMPLOYEES, AFFILIATES, AUTHORS OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DECISION MADE OR ACTION TAKEN BY YOUR RELIANCE ON THE CONTENT CONTAINED HEREIN."
            },
            {
              "label": "9.",
              "content": "IN NO EVENT WILL WE BE LIABLE FOR ANY DAMAGES (INCLUDING, WITHOUT LIMITATION, DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, DAMAGES ARISING FROM PERSONAL INJURY/WRONGFUL DEATH, AND DAMAGES RESULTING FROM LOST PROFITS, LOST DATA OR BUSINESS INTERRUPTION), RESULTING FROM ANY SERVICES PROVIDED BY ANY THIRD PARTY ACCESSED THROUGH THE PLATFORM, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY AND WHETHER OR NOT WE ARE ADVISED OF THE POSSIBILITY OF SUCH DAMAGES."
            },
            {
              "label": "10.",
              "content": "NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, NEITHER PURETYFARM NOR AFFILIATES OF PURETYFARM OR ITS OFFICERS, DIRECTORS, EMPLOYEES SHALL HAVE ANY LIABILITY TO YOU OR TO ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES OR ANY LOSS OF REVENUE OR PROFITS ARISING UNDER OR RELATING TO THE T&CS, THE PURETYFARM PLATFORM OR PURETYFARM SERVICES, EVEN IF ANY OF THE SAID PARTIES HAD BEEN ADVISED OF, KNEW OF, OR SHOULD HAVE KNOWN OF, THE POSSIBILITY OF SUCH DAMAGES. TO THE MAXIMUM EXTENT PERMITTED BY LAW, PURETYFARM’S MAXIMUM AGGREGATE LIABILITY TO YOU FOR ANY CAUSES WHATSOEVER, AND REGARDLESS OF THE FORM OF ACTION (WHETHER LIABILITY ARISES DUE TO NEGLIGENCE OR ANY OTHER TORT, BREACH OF CONTRACT, VIOLATION OF STATUTE, MISREPRESENTATION OR FOR ANY OTHER REASON), WILL AT ALL TIMES BE LIMITED TO RS. 5,000. TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOU WAIVE, RELEASE, DISCHARGE AND HOLD HARMLESS PURETYFARM OR AFFILIATES OF PURETYFARM, AND EACH OF THEIR DIRECTORS, OFFICERS, EMPLOYEES, AND AGENTS, FROM ANY AND ALL CLAIMS, LOSSES, DAMAGES, LIABILITIES, EXPENSES AND CAUSES OF ACTION ARISING OUT OF YOUR USE OF THE PURETYFARM PLATFORM AND/OR PURETYFARM SERVICE."
            }
          ]
        }
      ],
      "badge": "Liability & Disclaimers",
      "callout": {
        "type": "warning",
        "title": "₹5,000 Maximum Aggregate Liability Cap",
        "text": "To the maximum extent permitted by law, Puretyfarm’s maximum aggregate liability for any causes whatsoever will at all times be limited to Rs. 5,000."
      }
    },
    {
      "id": "section-13",
      "number": 13,
      "title": "INTELLECTUAL PROPERTY",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Proprietary Rights & User Content License",
          "items": [
            {
              "label": "1.",
              "content": "We own/have control or have licensed the copyright, trademark and all other intellectual property contained in this Platform, including but not limited to all design, formation of layout, listing order, text, images or links. We are either the owner of intellectual property rights or have the non-exclusive, worldwide, perpetual, irrevocable, royalty free, sub-licensable (through multiple tiers) right to exercise the intellectual property, in the Platform, and in the material published on it."
            },
            {
              "label": "2.",
              "content": "The Platform may provide opportunity for users to post reviews and other comments, questions, suggestions or other information (\"User Content\") and all such User Content submitted by user shall not infringe or violate third party intellectual property rights and user hereby grants Puretyfarm a perpetual, irrevocable, worldwide, non-exclusive, royalty-free, transferable right and licence to use such User Content."
            },
            {
              "label": "3.",
              "content": "You may print off one copy, and may download extracts, of any page(s) from the Platform for your personal reference and you may draw the attention of others within your organisation to material available on the Platform."
            },
            {
              "label": "4.",
              "content": "You must not modify the paper or digital copies of any materials you have printed off or downloaded in any way, and you must not use any illustrations, photographs, video or audio sequences or any graphics separately from any accompanying text."
            },
            {
              "label": "5.",
              "content": "You must not use any part of the materials on the Platform for commercial purposes without obtaining a licence to do so from us or our licensors."
            },
            {
              "label": "6.",
              "content": "If you print off, copy or download any part of the Platform in breach of these Terms of Use, your right to use the Platform will cease immediately and you must, at our option, return or destroy any copies of the materials you have made."
            }
          ]
        }
      ],
      "badge": "Intellectual Property"
    },
    {
      "id": "section-14",
      "number": 14,
      "title": "TREATMENT OF INFORMATION PROVIDED BY YOU",
      "paragraphs": [
        "1. We process information provided by you to us in accordance with our Privacy Policy."
      ],
      "subsections": [],
      "badge": "Privacy Reference"
    },
    {
      "id": "section-15",
      "number": 15,
      "title": "THIRD PARTY CONTENT",
      "paragraphs": [],
      "subsections": [
        {
          "title": "Third Party Content & External Outlinks",
          "items": [
            {
              "label": "1.",
              "content": "We cannot and will not assure that other users are or will be complying with the foregoing rules or any other provisions of these Terms of Use, and, as between you and us, you hereby assume all risk of harm or injury resulting from any such lack of compliance."
            },
            {
              "label": "2.",
              "content": "You acknowledge that when you access a link that leaves the Platform, the site you will enter into is not controlled by us and different terms of use and privacy policy may apply. By assessing links to other sites, you acknowledge that we are not responsible for those sites. We reserve the right to disable links to and / or from third-party sites to the Platform, although we are under no obligation to do so."
            }
          ]
        }
      ],
      "badge": "Third Party Links"
    },
    {
      "id": "section-16",
      "number": 16,
      "title": "SEVERABILITY",
      "paragraphs": [
        "If any of these Terms of Use should be determined to be illegal, invalid or otherwise unenforceable by reason of the laws of any state or country in which these Terms of Use are intended to be effective, then to the extent and within the jurisdiction where that term is illegal, invalid or unenforceable, it shall be severed and deleted and the remaining Terms of Use shall survive, remain in full force and effect and continue to be binding and enforceable."
      ],
      "subsections": [],
      "badge": "Severability"
    },
    {
      "id": "section-17",
      "number": 17,
      "title": "NON-ASSIGNMENT",
      "paragraphs": [
        "You shall not assign or transfer or purport to assign or transfer the contract between you and us to any other person."
      ],
      "subsections": [],
      "badge": "Non-Assignment"
    },
    {
      "id": "section-18",
      "number": 18,
      "title": "GOVERNING LAW AND DISPUTE RESOLUTION",
      "paragraphs": [
        "These Terms of Use are governed by the laws of India. Any action, suit, or other legal proceeding, which is commenced to resolve any matter arising under or relating to this Platform, shall be subject to the jurisdiction of the courts at Durg, India."
      ],
      "subsections": [],
      "badge": "Jurisdiction & Credit Scheme",
      "callout": {
        "type": "highlight",
        "title": "💳 Purety Credit Scheme (No Advance Payment Facility)",
        "text": "Puretyfarm offer No Advance Payment Credit Scheme on their platform . if you are approved for credit from Puretyfarm user need to pay their due credit Amount to Puretyfarm before due date. If you fail to pay the amount Puretyfarm reserve the rights to take legal action against Credit Buyer. If you take credit facility from Puretyfarm you agree with Puretyfarm credit Scheme Terms And Conditons."
      }
    },
    {
      "id": "section-19",
      "number": 19,
      "title": "CONTACT US",
      "paragraphs": [
        "Please contact us for any questions or comments regarding this Platform.Mr. Nirmal Singh (Owner) , Harman Aulakh (Founder)PuretyfarmOffice: Kumhari Chowk,Durg – Chattisgarh - 490042Email: care@puretyfarm.in\n\nTime: All Days (10:00 am- 6:30 pm)"
      ],
      "subsections": [],
      "badge": "Contact Details",
      "callout": {
        "type": "contact",
        "title": "Official Grievance & Executive Contacts",
        "text": "Mr. Nirmal Singh (Owner) | Harman Aulakh (Founder) | Office: Kumhari Chowk, Durg – Chhattisgarh - 490042 | Email: care@puretyfarm.in | Working Hours: All Days 10:00 AM – 6:30 PM"
      }
    }
  ]
};
