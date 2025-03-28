import { useState, useEffect } from "react";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
    { code: "ar", label: "العربية" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "zh-CN", label: "简体中文" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "pt", label: "Português" },
    { code: "ru", label: "Русский" },
    { code: "it", label: "Italiano" },
    { code: "tr", label: "Türkçe" },
    { code: "nl", label: "Nederlands" },
    { code: "sv", label: "Svenska" },
    { code: "da", label: "Dansk" },
    { code: "fi", label: "Suomi" },
    { code: "no", label: "Norsk" },
    { code: "pl", label: "Polski" },
    { code: "cs", label: "Čeština" },
    { code: "hu", label: "Magyar" },
    { code: "ro", label: "Română" },
    { code: "sk", label: "Slovenčina" },
    { code: "bg", label: "Български" },
    { code: "hr", label: "Hrvatski" },
    { code: "sl", label: "Slovenščina" },
    { code: "lt", label: "Lietuvių" },
    { code: "lv", label: "Latviešu" },
    { code: "et", label: "Eesti" },
    { code: "el", label: "Ελληνικά" },
    { code: "th", label: "ภาษาไทย" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "id", label: "Bahasa Indonesia" },
    { code: "ms", label: "Bahasa Melayu" },
    { code: "sw", label: "Kiswahili" },
    { code: "tl", label: "Tagalog" },
    { code: "bn", label: "বাংলা" },
    { code: "pa", label: "ਪੰਜਾਬੀ" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "ml", label: "മലയാളം" },
    { code: "or", label: "ଓଡ଼ିଆ" },
    { code: "as", label: "অসমীয়া" },
    { code: "ur", label: "اردو" },

  ];

  useEffect(() => {
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,hi,ar", autoDisplay: false },
          "google_translate_element"
        );
      };
    }

    // Remove Google Translate toolbar forcefully
    const removeGoogleTranslateBar = () => {
      const interval = setInterval(() => {
        const googleFrame = document.querySelector(".goog-te-banner-frame");
        const googleContainer = document.querySelector(".goog-te-gadget");
        const googleBody = document.querySelector("body");
        
        if (googleFrame) googleFrame.style.display = "none";
        if (googleContainer) googleContainer.style.display = "none";
        if (googleBody) googleBody.style.top = "0px";
      }, 500);

      setTimeout(() => clearInterval(interval), 3000); // Stop checking after 3 seconds
    };

    setTimeout(removeGoogleTranslateBar, 1000);
  }, []);

  const handleLanguageChange = (code, label) => {
    setSelectedLang(label);
    setIsOpen(false);

    setTimeout(() => {
      const translateDropdown = document.querySelector(".goog-te-combo");
      if (translateDropdown) {
        translateDropdown.value = code;
        translateDropdown.dispatchEvent(new Event("change"));
      }
    }, 500);
  };

  return (
    <div className="relative z-50">
      {/* Language Button */}
      <div
        className="flex items-center space-x-1 mr-2 cursor-pointer z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700 dark:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {selectedLang}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-md rounded-md z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code, lang.label)}
              className="block w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Google Translate Element (Hidden) */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Forcefully Hide Google Translate Bar */}
      <style>
        {`
          .goog-te-banner-frame { display: none !important; }
          .goog-te-gadget { display: none !important; }
          .goog-te-combo { display: none !important; }
          .skiptranslate { display: none !important; }
          body { top: 0px !important; }
        `}
      </style>
    </div>
  );
};

export default LanguageSelector;
