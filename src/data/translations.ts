const authKeys = {
    appName: "Swasthya Setu", home: "Home", hospitals: "Hospitals", doctors: "Doctors", help: "Help", 
    healthCard: "Health Card", profile: "Profile", appointments: "Appointments", login: "Login", signup: "Sign Up", 
    searchPlaceholder: "Search doctors, hospitals...", bookNow: "Book Appointment", findHospitals: "Find Hospitals", 
    viewHealthCard: "View Health Card", accessibility: "Accessibility Mode",
    patient: "Patient", doctor: "Doctor", pharmacist: "Pharmacist", admin: "Admin",
    password: "Password", phone_email: "Email or Phone Number",
    login_desc: "Sign in to your account", phone_email_placeholder: "Email or 10-digit number",
    remember_me: "Remember me", forgot_pwd: "Forgot password?", verifying: "Verifying...",
    continue: "Continue", enter_otp: "Enter the 6-digit OTP sent to", signing_in: "Signing In...",
    verify_otp: "Verify & Sign In", back_login: "Back to Login", forgot_desc: "Enter your registered phone/email to reset your password.",
    send_otp: "Send Reset OTP", no_account: "Don't have an account?",
    role_select_desc: "How would you like to use the platform?", have_account: "Already have an account?",
    back: "Back", create_account: "Create Account", create_desc: "Please provide minimal details to register.",
    name: "Full Name", age: "Age", phone: "Phone Number", email: "Email Address", 
    lang_pref_1: "Language Preference 1", lang_pref_2: "Language Preference 2",
    medical_license: "Medical License Number", pharmacy_license: "Pharmacy License", submit: "Submit Application",
    verify_number: "Verify Your Number", resend_otp: "Resend OTP", submitted: "Registration Submitted!",
    pending_desc: "Your account has been created and is currently pending Admin Approval.",
    notify_desc: "You will receive an email and SMS notification once your account is approved."
};

export const translations = {
    en: { ...authKeys },
    hi: { 
        ...authKeys, appName: "स्वास्थ्य सेतु", home: "होम", login: "लॉग इन", signup: "साइन अप", 
        patient: "रोगी", doctor: "डॉक्टर", pharmacist: "फार्मासिस्ट", admin: "व्यवस्थापक",
        password: "पासवर्ड", phone_email: "ईमेल या फोन", login_desc: "साइन इन करें", 
        continue: "जारी रखें", name: "नाम", age: "आयु", phone: "फोन", email: "ईमेल",
        lang_pref_1: "भाषा 1", lang_pref_2: "भाषा 2", submitted: "जमा हो गया!",
        pending_desc: "मंजूरी लंबित है।"
    },
    te: { 
        ...authKeys, appName: "స్వాస్థ్య సేతు", home: "హోమ్", login: "లాగిన్", signup: "సైన్ అప్", 
        patient: "రోగి", doctor: "డాక్టర్", pharmacist: "ఫార్మసిస్ట్", admin: "అడ్మిన్",
        password: "పాస్వర్డ్", phone_email: "ఇమెయిల్ లేదా ఫోన్", login_desc: "సైన్ ఇన్ చేయండి", 
        continue: "కొనసాగించు", name: "పేరు", age: "వయస్సు", phone: "ఫోన్", email: "ఇమెయిల్",
        lang_pref_1: "భాష 1", lang_pref_2: "భాష 2", submitted: "సమర్పించబడింది!",
        pending_desc: "ఆమోదం పెండింగ్‌లో ఉంది."
    },
    ta: { 
        ...authKeys, appName: "சுவஸ்த்யா சேது", home: "முகப்பு", login: "உள்நுழை", signup: "பதிவு செய்க", 
        patient: "நோயாளி", doctor: "மருத்துவர்", pharmacist: "மருந்தாளர்", admin: "நிர்வாகி",
        password: "கடவுச்சொல்", phone_email: "மின்னஞ்சல் அல்லது போன்", login_desc: "உள்நுழைக", 
        continue: "தொடர்க", name: "பெயர்", age: "வயது", phone: "போன்", email: "மின்னஞ்சல்",
        lang_pref_1: "மொழி 1", lang_pref_2: "மொழி 2", submitted: "சமர்ப்பிக்கப்பட்டது!",
        pending_desc: "ஒப்புதல் நிலுவையில் உள்ளது."
    },
    ur: { 
        ...authKeys, appName: "سواستھیا سیتو", home: "ہوم", login: "لاگ ان", signup: "سائن اپ", 
        patient: "مریض", doctor: "ڈاکٹر", pharmacist: "فارماسسٹ", admin: "ایڈمن",
        password: "پاس ورڈ", phone_email: "ای میل یا فون", login_desc: "لاگ ان کریں", 
        continue: "جاری رکھیں", name: "نام", age: "عمر", phone: "فون", email: "ای میل",
        lang_pref_1: "زبان 1", lang_pref_2: "زبان 2", submitted: "جمع ہو گیا!",
        pending_desc: "منظوری زیر التوا ہے۔"
    },
    kn: { 
        ...authKeys, appName: "ಸ್ವಸ್ಥ್ಯ ಸೇತು", home: "ಹೋಮ್", login: "ಲಾಗಿನ್", signup: "ಸೈನ್ ಅಪ್", 
        patient: "ರೋಗಿ", doctor: "ವೈದ್ಯ", pharmacist: "ಫಾರ್ಮಸಿಸ್ಟ್", admin: "ನಿರ್ವಾಹಕ",
        password: "ಪಾಸ್ವರ್ಡ್", phone_email: "ಇಮೇಲ್ ಅಥವಾ ಫೋನ್", login_desc: "ಲಾಗಿನ್ ಮಾಡಿ", 
        continue: "ಮುಂದುವರಿಸಿ", name: "ಹೆಸರು", age: "ವಯಸ್ಸು", phone: "ಫೋನ್", email: "ಇಮೇಲ್",
        lang_pref_1: "ಭಾಷೆ 1", lang_pref_2: "ಭಾಷೆ 2", submitted: "ಸಲ್ಲಿಸಲಾಗಿದೆ!",
        pending_desc: "ಅನುಮೋದನೆ ಬಾಕಿ ಇದೆ."
    },
    ml: { 
        ...authKeys, appName: "സ്വസ്ത്യ സേതു", home: "ഹോം", login: "ലോഗിൻ", signup: "സൈൻ അപ്പ്", 
        patient: "രോഗി", doctor: "ഡോക്ടർ", pharmacist: "ഫാർമസിസ്റ്റ്", admin: "അഡ്മിൻ",
        password: "പാസ്‌വേഡ്", phone_email: "ഇമെയിൽ അല്ലെങ്കിൽ ഫോൺ", login_desc: "ലോഗിൻ ചെയ്യുക", 
        continue: "തുടരുക", name: "പേര്", age: "വയസ്സ്", phone: "ഫോൺ", email: "ഇമെയിൽ",
        lang_pref_1: "ഭാഷ 1", lang_pref_2: "ഭാഷ 2", submitted: "സമർപ്പിച്ചു!",
        pending_desc: "അംഗീകാരം കാത്തിരിക്കുന്നു."
    },
    mr: { 
        ...authKeys, appName: "स्वास्थ्य सेतु", home: "होम", login: "लॉगिन", signup: "साइन अप", 
        patient: "रुग्ण", doctor: "डॉक्टर", pharmacist: "फार्मासिस्ट", admin: "प्रशासक",
        password: "पासवर्ड", phone_email: "ईमेल किंवा फोन", login_desc: "लॉगिन करा", 
        continue: "पुढे जा", name: "नाव", age: "वय", phone: "फोन", email: "ईमेल",
        lang_pref_1: "भाषा 1", lang_pref_2: "भाषा 2", submitted: "सबमिट केले!",
        pending_desc: "मान्यता प्रलंबित आहे."
    },
    gu: { 
        ...authKeys, appName: "સ્વાસ્થ્ય સેતુ", home: "હોમ", login: "લોગિન", signup: "સાઇન અપ", 
        patient: "દર્દી", doctor: "ડોક્ટર", pharmacist: "ફાર્માસિસ્ટ", admin: "એડમિન",
        password: "પાસવર્ડ", phone_email: "ઈમેલ અથવા ફોન", login_desc: "લોગિન કરો", 
        continue: "આગળ વધો", name: "નામ", age: "ઉંમર", phone: "ફોન", email: "ઈમેલ",
        lang_pref_1: "ભાષા 1", lang_pref_2: "ભાષા 2", submitted: "સબમિટ કર્યું!",
        pending_desc: "મંજૂરી બાકી છે."
    },
    pa: { 
        ...authKeys, appName: "ਸਵਾਸਥ ਸੇਤੂ", home: "ਹੋਮ", login: "ਲੌਗਇਨ", signup: "ਸਾਈਨ ਅਪ", 
        patient: "ਮਰੀਜ਼", doctor: "ਡਾਕਟਰ", pharmacist: "ਫਾਰਮਾਸਿਸਟ", admin: "ਐਡਮਿਨ",
        password: "ਪਾਸਵਰਡ", phone_email: "ਈਮੇਲ ਜਾਂ ਫੋਨ", login_desc: "ਲੌਗਇਨ ਕਰੋ", 
        continue: "ਜਾਰੀ ਰੱਖੋ", name: "ਨਾਮ", age: "ਉਮਰ", phone: "ਫੋਨ", email: "ਈਮੇਲ",
        lang_pref_1: "ਭਾਸ਼ਾ 1", lang_pref_2: "ਭਾਸ਼ਾ 2", submitted: "ਸਬਮਿਟ ਕੀਤਾ!",
        pending_desc: "ਮਨਜ਼ੂਰੀ ਪੈਂਡਿੰਗ ਹੈ।"
    },
    bn: { 
        ...authKeys, appName: "স্বাস্থ্য সেতু", home: "হোম", login: "লগইন", signup: "সাইন আপ", 
        patient: "রোগী", doctor: "ডাক্তার", pharmacist: "ফার্মাসিস্ট", admin: "অ্যাডমিন",
        password: "পাসওয়ার্ড", phone_email: "ইমেল বা ফোন", login_desc: "লগইন করুন", 
        continue: "চালিয়ে যান", name: "নাম", age: "বয়স", phone: "ফোন", email: "ইমেল",
        lang_pref_1: "ভাষা 1", lang_pref_2: "ভাষা 2", submitted: "জমা দেওয়া হয়েছে!",
        pending_desc: "অনুমোদন অমীমাংসিত।"
    },
    or: { 
        ...authKeys, appName: "ସ୍ୱାସ୍ଥ୍ୟ ସେତୁ", home: "ହୋମ୍", login: "ଲଗଇନ୍", signup: "ସାଇନ୍ ଅପ୍", 
        patient: "ରୋଗୀ", doctor: "ଡାକ୍ତର", pharmacist: "ଫାର୍ମାସିଷ୍ଟ", admin: "ପ୍ରଶାସକ",
        password: "ପାସୱାର୍ଡ", phone_email: "ଇମେଲ୍ କିମ୍ବା ଫୋନ୍", login_desc: "ଲଗଇନ୍ କରନ୍ତୁ", 
        continue: "ଆଗକୁ ବଢନ୍ତୁ", name: "ନାମ", age: "ବୟସ", phone: "ଫୋନ୍", email: "ଇମେଲ୍",
        lang_pref_1: "ଭାଷା 1", lang_pref_2: "ଭାଷา 2", submitted: "ସମ୍ମିଳିତ ହୋଇଛି!",
        pending_desc: "ଅନୁମୋଦନ ବାକି ଅଛି ।"
    },
    as: { 
        ...authKeys, appName: "স্বাস্থ্য সেতু", home: "হোম", login: "লগইন", signup: "সাইন আপ", 
        patient: "ৰোগী", doctor: "চিকিৎসক", pharmacist: "ফাৰ্মাচিষ্ট", admin: "এডমিন",
        password: "পাছৱৰ্ড", phone_email: "ইমেইল বা ফোন", login_desc: "লগইন কৰক", 
        continue: "আগবাঢ়ক", name: "নাম", age: "বয়স", phone: "ফোন", email: "ইমেইল",
        lang_pref_1: "ভাষা ১", lang_pref_2: "ভাষা ২", submitted: "জমা দিয়া হৈছে!",
        pending_desc: "অনুমোদন বাকী আছে।"
    }
};

export const languageNames: Record<string, string> = {
    en: "English", hi: "हिन्दी", te: "తెలుగు", ta: "தமிழ்", ur: "اردو",
    kn: "ಕನ್ನಡ", ml: "മലയാളം", mr: "मराठी", gu: "ગુજરાતી",
    pa: "ਪੰਜਾਬੀ", bn: "বাংলা", or: "ଓଡ଼ିଆ", as: "অসমীয়া"
};

export type Language = keyof typeof translations;
