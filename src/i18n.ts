// Hindi / Hinglish toggle. Main headings, Panchang, predictions and
// numerology are translated; technical terms (Lagna, Vimshottari, Nakshatra,
// Ashtakoot) stay in English/Hinglish as fallback — they have no common
// Hindi UI equivalent that users would recognise better.
export type Lang = 'en' | 'hi';
export const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: 'Astrology Software', tagline: 'Your stars, calculated — not guessed.',
    birthDetails: 'Birth details', calculate: 'Calculate Chart', saveChart: 'Save Chart', savedCharts: 'Saved Charts',
    kundli: 'Kundli', dasha: 'Dasha', panchang: 'Panchang', matching: 'Kundli Milan', transits: 'Transits',
    western: 'Western Chart', predictions: 'Predictions', horoscope2027: 'Horoscope 2027', life100: '100-Year Prediction',
    numerology: 'Numerology', advanced: 'Advanced (Free)', chat: 'AI Astrologer', tarot: 'Tarot', palmistry: 'Palmistry',
    vastu: 'Vastu', prashna: 'Prashna (Horary)', progressions: 'Progressions & Synastry',
    daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
    career: 'Career', love: 'Love / Marriage', health: 'Health', money: 'Money',
    tithi: 'Tithi', nakshatra: 'Nakshatra', yoga: 'Yoga', karana: 'Karana', sunrise: 'Sunrise', sunset: 'Sunset',
    lagna: 'Lagna', moonSign: 'Moon Sign', sunSign: 'Sun Sign', generate: 'Generate', download: 'Download',
    freeInstant: 'Free · Instant', sampleNote: 'Sample chart — enter your own birth details to calculate yours.',
  },
  hi: {
    appTitle: 'ज्योतिष सॉफ्टवेयर', tagline: 'आपके सितारे, गणना से — अनुमान से नहीं।',
    birthDetails: 'जन्म विवरण', calculate: 'कुंडली बनाएँ', saveChart: 'कुंडली सहेजें', savedCharts: 'सहेजी कुंडलियाँ',
    kundli: 'कुंडली', dasha: 'दशा', panchang: 'पंचांग', matching: 'कुंडली मिलान', transits: 'गोचर',
    western: 'पश्चिमी कुंडली', predictions: 'भविष्यवाणी', horoscope2027: 'राशिफल 2027', life100: '100 वर्षीय भविष्यवाणी',
    numerology: 'अंक ज्योतिष', advanced: 'उन्नत (मुफ़्त)', chat: 'AI ज्योतिषी', tarot: 'टैरो', palmistry: 'हस्तरेखा',
    vastu: 'वास्तु', prashna: 'प्रश्न (होररी)', progressions: 'प्रोग्रेशन व सिनैस्ट्री',
    daily: 'दैनिक', weekly: 'साप्ताहिक', monthly: 'मासिक', yearly: 'वार्षिक',
    career: 'करियर', love: 'प्रेम / विवाह', health: 'स्वास्थ्य', money: 'धन',
    tithi: 'तिथि', nakshatra: 'नक्षत्र', yoga: 'योग', karana: 'करण', sunrise: 'सूर्योदय', sunset: 'सूर्यास्त',
    lagna: 'लग्न', moonSign: 'चंद्र राशि', sunSign: 'सूर्य राशि', generate: 'बनाएँ', download: 'डाउनलोड',
    freeInstant: 'मुफ़्त · तुरंत', sampleNote: 'नमूना कुंडली — अपनी कुंडली के लिए अपना जन्म विवरण डालें।',
  },
};
export const t = (lang: Lang, key: string): string => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
