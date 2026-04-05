'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity, Lock, Mail, User } from 'lucide-react';

import { useRouter } from 'next/navigation';

const languages = [
    "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi",
    "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri (Meitei)",
    "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", "Sindhi",
    "Tamil", "Telugu", "Urdu"
];

// Comprehensive Indian Location Matrix (28 States & 8 UTs)
const locationData: Record<string, Record<string, string[]>> = {
    "Andhra Pradesh": { "Visakhapatnam": ["Bheemunipatnam", "Gajuwaka"], "Vijayawada": ["Patamata", "Bhavanipuram"], "Guntur": ["Tenali", "Mangalagiri"] },
    "Arunachal Pradesh": { "Tawang": ["Mukto", "Lumla"], "Itanagar": ["Naharlagun", "Nirjuli"] },
    "Assam": { "Guwahati": ["Dispur", "Paltan Bazaar"], "Dibrugarh": ["Chabua", "Tingkhong"] },
    "Bihar": { "Patna": ["Danapur", "Phulwari Sharif"], "Gaya": ["Bodh Gaya", "Manpur"] },
    "Chhattisgarh": { "Raipur": ["Naya Raipur", "Bhilai"], "Bilaspur": ["Gevra", "Korba"] },
    "Goa": { "North Goa": ["Panaji", "Mapusa"], "South Goa": ["Margao", "Vasco da Gama"] },
    "Gujarat": { "Ahmedabad": ["Bopal", "Satellite"], "Surat": ["Adajan", "Vesu"], "Vadodara": ["Alkapuri", "Atladara"] },
    "Haryana": { "Gurugram": ["Cyber City", "Sohna"], "Faridabad": ["NIT", "Ballabgarh"] },
    "Himachal Pradesh": { "Shimla": ["Sanjauli", "Kasumpti"], "Manali": ["Old Manali", "Vashisht"] },
    "Jharkhand": { "Ranchi": ["Hinoo", "Doranda"], "Jamshedpur": ["Bistupur", "Sakchi"] },
    "Karnataka": { "Bengaluru Urban": ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "Malleswaram"], "Mysuru": ["Vijayanagar", "Gokulam"] },
    "Kerala": { "Thiruvananthapuram": ["Kowdiar", "Pattom"], "Kochi": ["Edappally", "Fort Kochi"] },
    "Madhya Pradesh": { "Indore": ["Vijay Nagar", "Palasia"], "Bhopal": ["Arera Colony", "MP Nagar"] },
    "Maharashtra": { "Mumbai": ["Andheri", "Bandra", "Dadar", "Powai"], "Pune": ["Shivajinagar", "Kothrud", "Hinjewadi"], "Nagpur": ["Sitabuldi", "Dharampeth"] },
    "Manipur": { "Imphal": ["Thangmeiband", "Uripok"] },
    "Meghalaya": { "Shillong": ["Bara Bazaar", "Police Bazaar"] },
    "Mizoram": { "Aizawl": ["Dawrpui", "Zarkawt"] },
    "Nagaland": { "Kohima": ["PR Hill", "High School area"] },
    "Odisha": { "Bhubaneswar": ["Saheed Nagar", "Patia"], "Cuttack": ["Buxi Bazaar", "CDA"] },
    "Punjab": { "Ludhiana": ["Model Town", "Sarabha Nagar"], "Amritsar": ["Civil Lines", "Ranjit Avenue"] },
    "Rajasthan": { "Jaipur": ["Malviya Nagar", "Mansarovar"], "Udaipur": ["Fatehpura", "Hiran Magri"] },
    "Sikkim": { "Gangtok": ["MG Marg", "Tadong"] },
    "Tamil Nadu": { "Chennai": ["Adyar", "Anna Nagar", "T Nagar", "Velachery"], "Coimbatore": ["Peelamedu", "RS Puram"] },
    "Telangana": { "Hyderabad": ["Banjara Hills", "Jubilee Hills", "HITEC City"], "Warangal": ["Hanamkonda", "Kazipet"] },
    "Tripura": { "Agartala": ["Indranagar", "Radhanagar"] },
    "Uttar Pradesh": { "Lucknow": ["Gomti Nagar", "Hazratganj"], "Noida": ["Sector 15", "Sector 62"], "Kanpur": ["Kakadeo", "Swaroop Nagar"] },
    "Uttarakhand": { "Dehradun": ["Rajpur Road", "Clement Town"], "Haridwar": ["Kankhal", "Jwalapur"] },
    "West Bengal": { "Kolkata": ["Salt Lake", "New Town", "Ballygunge"], "Darjeeling": ["Kurseong", "Kalimpong"] },
    "Delhi": { "New Delhi": ["Connaught Place", "Chanakyapuri"], "South Delhi": ["Saket", "Hauz Khas"] },
    "Jammu and Kashmir": { "Srinagar": ["Lal Chowk", "Rajbagh"], "Jammu": ["Gandhi Nagar", "Trikuta Nagar"] },
    "Chandigarh": { "Chandigarh": ["Sector 17", "Sector 22", "Sector 35"] }
};

export default function SignupPage() {
    const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacist' | 'admin'>('patient');
    
    // Application States
    const [preferredLanguage, setPreferredLanguage] = useState('');
    const [secondaryLanguage, setSecondaryLanguage] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const router = useRouter();

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Profile state is conceptually saved here for future context:
        const userProfile = {
            role,
            preferredLanguage,
            secondaryLanguage,
            location: {
                state: selectedState,
                district: selectedDistrict,
                city: selectedCity
            }
        };
        console.log("Saving user profile state:", userProfile);
        
        router.push(`/signup/onboarding?role=${role}`);
    };

    // Location Derived States
    const availableStates = Object.keys(locationData);
    const availableDistricts = selectedState ? Object.keys(locationData[selectedState]) : [];
    const availableCities = selectedDistrict && selectedState ? locationData[selectedState][selectedDistrict] : [];

    // Base Select Styles
    const selectClass = "w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all rounded-lg text-slate-700 shadow-sm appearance-none";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-8">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row">

                {/* Sidebar Image */}
                <div className="hidden md:block w-1/3 bg-primary-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-20 mix-blend-overlay"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-6 h-6" /> <span className="font-bold text-lg">SwasthyaSetu</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Join the Future of Healthcare</h2>
                            <p className="text-primary-100">Connect with top specialists globally in your local language.</p>
                        </div>
                        <div className="text-sm text-primary-200">© 2024 SwasthyaSetu</div>
                    </div>
                </div>

                {/* Form */}
                <div className="w-full md:w-2/3 p-8">
                    <div className="text-center md:text-left mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                        <p className="text-slate-500">Sign up to get started as a {role}</p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                        {['patient', 'doctor', 'pharmacist', 'admin'].map((r) => (
                            <button
                                type="button"
                                key={r}
                                onClick={() => setRole(r as any)}
                                className={`
                                   px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border
                                   ${role === r
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                                 `}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>

                    <form className="space-y-5" onSubmit={handleSignup}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input label="First Name" placeholder="John" icon={<User className="w-4 h-4" />} required />
                            <Input label="Last Name" placeholder="Doe" icon={<User className="w-4 h-4" />} required />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input label="Email Address" type="email" placeholder="john@example.com" icon={<Mail className="w-4 h-4" />} required />
                            <Input label="Password" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} required />
                        </div>

                        {role === 'doctor' && (
                            <Input label="Medical License ID" placeholder="MD-12345-X" icon={<Activity className="w-4 h-4" />} required />
                        )}

                        {role === 'pharmacist' && (
                            <Input label="Pharmacy License ID" placeholder="PH-99887-Y" icon={<Activity className="w-4 h-4" />} required />
                        )}

                        {/* --- Language Preferences --- */}
                        <div className="pt-2 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Language Preferences</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 block">Preferred Language <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select required className={selectClass} value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)}>
                                            <option value="" disabled>Select language</option>
                                            {languages.map(lang => <option key={`pref-${lang}`} value={lang}>{lang}</option>)}
                                        </select>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">This helps us connect you with doctors who speak your language.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 block">Secondary Language (Optional)</label>
                                    <div className="relative">
                                        <select className={selectClass} value={secondaryLanguage} onChange={(e) => setSecondaryLanguage(e.target.value)}>
                                            <option value="">None</option>
                                            {languages.map(lang => <option key={`sec-${lang}`} value={lang}>{lang}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Structured Location --- */}
                        <div className="pt-2 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Location Details</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 block">State <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select required className={selectClass} value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedCity(''); }}>
                                            <option value="" disabled>Select State</option>
                                            {availableStates.map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 block">District <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select required disabled={!selectedState} className={`${selectClass} ${!selectedState ? 'bg-slate-50 opacity-70' : ''}`} value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedCity(''); }}>
                                            <option value="" disabled>Select District</option>
                                            {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 block">City / Village <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select required disabled={!selectedDistrict} className={`${selectClass} ${!selectedDistrict ? 'bg-slate-50 opacity-70' : ''}`} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                                            <option value="" disabled>Select City</option>
                                            {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 pt-4">
                            <input type="checkbox" required className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                            <p className="text-sm text-slate-500">
                                I agree to the <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>

                        <Button isFullWidth size="lg">Create Account</Button>
                    </form>

                    <p className="text-center text-sm text-slate-600 mt-6 md:mb-0 pb-4">
                        Already have an account? <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
