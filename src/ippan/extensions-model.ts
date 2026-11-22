import { State } from "./model";
export const homeSections = [
  "glance",
  "sector",
  "projects",
  "membership",
  "news",
  "events",
  "resources",
  "publications",
  "media",
];
export function upgradeState(s: State): State {
  s.version = Math.max(s.version, 3);
  s.cmsRevisions ??= [];
  s.settings.homeCopy ??= {};
  s.sitePages ??= [
    {
      id: "PAGE-OVERVIEW",
      slug: "our-purpose",
      title: "A collective voice. A sustainable future.",
      titleNe: "सामूहिक आवाज। दिगो भविष्य।",
      body: "IPPAN connects independent power producers, policymakers and partners to support responsible energy development in Nepal. Established in 2001, the association provides a forum for advocacy, knowledge exchange and collaboration.\n\nOur vision is a prosperous, energy-secure Nepal. Our mission is to strengthen the voice and capabilities of independent producers through constructive policy dialogue, member services and shared learning.\n\nOur objectives include a supportive investment environment, responsible development, reliable infrastructure and stronger connections across the energy community.",
      bodyNe:
        "इप्पानले नेपालमा जिम्मेवार ऊर्जा विकासका लागि स्वतन्त्र ऊर्जा उत्पादक, नीति निर्माता र साझेदारहरूलाई जोड्छ। सन् २००१ मा स्थापित संघले पैरवी, ज्ञान आदानप्रदान र सहकार्यको साझा मञ्च प्रदान गर्दछ।\n\nहाम्रो दृष्टि समृद्ध र ऊर्जा सुरक्षित नेपाल हो। रचनात्मक नीतिगत संवाद, सदस्य सेवा र साझा सिकाइमार्फत स्वतन्त्र उत्पादकको आवाज र क्षमता सुदृढ गर्नु हाम्रो उद्देश्य हो।",
      status: "Published",
      seoDescription:
        "IPPAN institutional overview, vision, mission and objectives.",
      menuLabel: "Our purpose",
      order: 1,
    },
    {
      id: "PAGE-PRIVACY",
      slug: "privacy",
      title: "Privacy and demonstration data",
      titleNe: "गोपनीयता र प्रदर्शन तथ्याङ्क",
      body: "This evaluation platform stores membership applications, uploaded documents and account information in a dedicated IPPAN demonstration database. Private documents require an authorized account. Do not submit sensitive real-world documents to this evaluation environment.\n\nContact the secretariat to request correction or removal of submitted information. Newsletter and contact submissions are stored for staff review; external email and SMS delivery are not enabled.",
      bodyNe:
        "यो प्रदर्शन मञ्चले सदस्यता आवेदन, कागजात र खाता विवरण छुट्टै डाटाबेसमा राख्छ। निजी कागजातका लागि अधिकृत खाता आवश्यक छ। यस वातावरणमा संवेदनशील वास्तविक कागजात पेश नगर्नुहोस्।\n\nविवरण सच्याउन सचिवालयमा सम्पर्क गर्नुहोस्। बाह्य इमेल तथा एसएमएस सेवा सक्रिय छैन।",
      status: "Published",
      seoDescription:
        "How the IPPAN evaluation platform handles demonstration information.",
      menuLabel: "Privacy",
      order: 99,
    },
  ];
  s.profiles ??= [];
  s.media ??= [
    {
      id: "MEDIA-01",
      title: "The energy community, together",
      caption: "IPPAN sector gathering · reference imagery",
      type: "Photo",
      url: "/ippan/assembly.jpg",
      status: "Published",
      date: "2026-11-20",
    },
    {
      id: "MEDIA-02",
      title: "Ideas that power tomorrow",
      caption: "Energy expo · reference imagery",
      type: "Photo",
      url: "/ippan/expo.jpg",
      status: "Published",
      date: "2026-11-20",
    },
  ];
  s.categories ??= [
    {
      name: "Corporate",
      fee: 25000,
      description:
        "For energy development companies and institutional producers.",
      documents: "Company registration certificate",
      enabled: true,
    },
    {
      name: "Associate",
      fee: 10000,
      description:
        "For organizations and partners supporting Nepal’s energy sector.",
      documents: "Organization registration certificate",
      enabled: true,
    },
    {
      name: "Individual",
      fee: 5000,
      description:
        "For energy professionals and individual sector contributors.",
      documents: "Professional identification or qualification document",
      enabled: true,
    },
  ];
  s.meetings ??= [];
  s.subscriptions ??= [];
  s.inquiries ??= [];
  s.settings.sections ??= [...homeSections];
  s.settings.heroTitleNe ??= "नेपाललाई ऊर्जा।\nसँगसँगै।";
  s.settings.heroSubtitleNe ??=
    "स्वतन्त्र ऊर्जा उत्पादकहरूको साझा आवाज। समृद्ध, दिगो र ऊर्जा सुरक्षित नेपालका लागि एकजुट।";
  s.settings.contactAddress ??= "Kandevta Complex, Kupondole, Lalitpur, Nepal";
  s.settings.contactEmail ??= "info@ippan.org.np";
  s.settings.contactPhone ??= "+977 01 5445444";
  s.settings.agmAgenda ??=
    "Annual progress and financial reports\nMembership services and policy priorities\nOpen discussion and decisions";
  return s;
}
