"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
const dictionary: Record<string, string> = {
  Home: "गृहपृष्ठ",
  "About IPPAN": "इप्पानबारे",
  Membership: "सदस्यता",
  Members: "सदस्यहरू",
  "Hydropower Database": "जलविद्युत् डाटाबेस",
  "Hydropower database": "जलविद्युत् डाटाबेस",
  "Energy Resource Centre": "ऊर्जा स्रोत केन्द्र",
  "Energy resource centre": "ऊर्जा स्रोत केन्द्र",
  "News & Media": "समाचार र मिडिया",
  "News & publications": "समाचार र प्रकाशन",
  Publications: "प्रकाशनहरू",
  "Events & AGM": "कार्यक्रम र साधारण सभा",
  Contact: "सम्पर्क",
  "Member Login": "सदस्य प्रवेश",
  "Member portal": "सदस्य पोर्टल",
  "Become a member": "सदस्य बन्नुहोस्",
  "Member directory": "सदस्य निर्देशिका",
  Search: "खोज्नुहोस्",
  Overview: "अवलोकन",
  "Website CMS": "वेबसाइट व्यवस्थापन",
  "Payments & finance": "भुक्तानी र वित्त",
  "Events & registrations": "कार्यक्रम र दर्ता",
  "AGM & digital voting": "साधारण सभा र मतदान",
  "Digital secretariat": "डिजिटल सचिवालय",
  "Meetings & decisions": "बैठक र निर्णय",
  Communications: "सञ्चार",
  "Reports & analytics": "प्रतिवेदन र विश्लेषण",
  "Users & access": "प्रयोगकर्ता र पहुँच",
  "Audit logs": "गतिविधि अभिलेख",
  "System settings": "प्रणाली सेटिङ",
  "Categories & fees": "वर्ग र शुल्क",
  "Renewals & expiry": "नवीकरण र म्याद",
  Corporate: "संस्थागत",
  Associate: "सहयोगी",
  Individual: "व्यक्तिगत",
  Active: "सक्रिय",
  Expired: "म्याद समाप्त",
  Pending: "बाँकी",
  Approved: "स्वीकृत",
  Rejected: "अस्वीकृत",
  Published: "प्रकाशित",
  Draft: "मस्यौदा",
  "In review": "समीक्षामा",
  Operational: "सञ्चालनमा",
  "Under construction": "निर्माणाधीन",
  Survey: "सर्वेक्षण",
  "Construction not started": "निर्माण सुरु नभएको",
  "Email address": "इमेल ठेगाना",
  Password: "पासवर्ड",
  "Sign in securely": "सुरक्षित प्रवेश",
  "Save changes": "परिवर्तन सुरक्षित गर्नुहोस्",
  "Submit for review": "समीक्षाका लागि पठाउनुहोस्",
  "View details": "विवरण हेर्नुहोस्",
  Download: "डाउनलोड",
  "Read online": "अनलाइन पढ्नुहोस्",
  "Company / organization name": "कम्पनी / संस्था / व्यक्तिको नाम",
  "Contact email": "सम्पर्क इमेल",
  "Membership category": "सदस्यता वर्ग",
  Province: "प्रदेश",
  District: "जिल्ला",
  Title: "शीर्षक",
  Description: "विवरण",
  Status: "अवस्था",
  Date: "मिति",
  Category: "वर्ग",
  "Search results": "खोज परिणाम",
  "All categories": "सबै वर्ग",
  "All provinces": "सबै प्रदेश",
  "All statuses": "सबै अवस्था",
  "Sign out": "बाहिरिनुहोस्",
  "My dashboard": "मेरो ड्यासबोर्ड",
  "Company & membership": "कम्पनी र सदस्यता",
  "Invoices & payments": "बिल र भुक्तानी",
  "Events & tickets": "कार्यक्रम र टिकट",
  "Member resources": "सदस्य स्रोत",
  "AGM & proxy": "साधारण सभा र प्रतिनिधि",
  Notifications: "सूचनाहरू",
  "Track your application": "आवेदनको अवस्था हेर्नुहोस्",
  "Submit membership application": "सदस्यता आवेदन पेश गर्नुहोस्",
  "Membership application": "सदस्यता आवेदन",
  "View public website": "सार्वजनिक वेबसाइट हेर्नुहोस्",
  "Help & support": "सहयोग र सहायता",
  "Total members": "कुल सदस्य",
  "Active memberships": "सक्रिय सदस्यता",
  "Pending applications": "बाँकी आवेदन",
  "Project details": "परियोजना विवरण",
  "Registered projects": "दर्ता परियोजना",
  "Represented capacity": "प्रतिनिधित्व क्षमता",
  "Operating projects": "सञ्चालित परियोजना",
  "No records match your search.": "कुनै विवरण भेटिएन।",
  "Try another filter or add your first record.": "अर्को छनोट गर्नुहोस्।",
  "Good to see you again.": "पुनः स्वागत छ।",
  "Sign in to your member or secretariat workspace.":
    "सदस्य वा सचिवालय खातामा प्रवेश गर्नुहोस्।",
  "Back to the website": "वेबसाइटमा फर्कनुहोस्",
  "News & notices": "समाचार र सूचना",
  "Publications & library": "प्रकाशन र पुस्तकालय",
  "Export report": "प्रतिवेदन निर्यात",
  Review: "समीक्षा",
  Applications: "आवेदनहरू",
  "Renew membership": "सदस्यता नवीकरण",
  "Your membership": "तपाईंको सदस्यता",
  "View all": "सबै हेर्नुहोस्",
  Name: "नाम",
  Email: "इमेल",
  Location: "स्थान",
  Capacity: "क्षमता",
  Reference: "सन्दर्भ",
  "Supporting documents": "सहायक कागजात",
};
const Language = createContext({
  locale: "en",
  setLocale: (_s: string) => {},
  t: (s: string) => s,
  choose: (en: string, _ne: string) => en,
});
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, set] = useState("en");
  useEffect(() => {
    const saved = localStorage.getItem("ippan-language");
    if (saved === "ne") set("ne");
  }, []);
  const setLocale = (s: string) => {
    set(s);
    localStorage.setItem("ippan-language", s);
  };
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <Language.Provider
      value={{
        locale,
        setLocale,
        t: (s) => (locale === "ne" ? dictionary[s] || s : s),
        choose: (en, ne) => (locale === "ne" && ne ? ne : en),
      }}
    >
      {children}
    </Language.Provider>
  );
}
export const useLanguage = () => useContext(Language);
export function LanguageSwitch() {
  const { locale, setLocale } = useLanguage();
  return (
    <button
      className="language-switch"
      aria-label="Switch language"
      onClick={() => setLocale(locale === "en" ? "ne" : "en")}
      lang={locale === "en" ? "ne" : "en"}
    >
      {locale === "en" ? "नेपाली" : "English"}
    </button>
  );
}
