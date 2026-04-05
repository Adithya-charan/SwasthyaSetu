import Link from 'next/link'
import { ArrowRight, Video, FileText, Activity, ShieldCheck, Clock, CheckCircle } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <Activity className="w-6 h-6 text-primary-600" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">SwasthyaSetu</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Features</Link>
                        <Link href="#how-it-works" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">How it Works</Link>
                        <Link href="#testimonials" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Testimonials</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-slate-900 font-medium hover:text-primary-600 px-4 py-2">
                            Login
                        </Link>
                        <Link href="/signup" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2">
                            Get Started <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 font-medium text-sm border border-primary-100/50">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                </span>
                                No. 1 Trusted Medical Platform
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                                Healthcare accessible <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">anytime, anywhere.</span>
                            </h1>

                            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                                Connect with certified doctors, manage prescriptions, and track your medical records securely from the comfort of your home.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup?role=patient" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-primary-500/20 text-center">
                                    Book Appointment
                                </Link>
                                <Link href="#demo" className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all text-center flex items-center justify-center gap-2">
                                    <Video className="w-5 h-5 text-slate-400" /> Watch Demo
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {'★★★★★'}
                                    </div>
                                    <p className="text-sm text-slate-500"><span className="font-bold text-slate-900">10k+</span> happy patients</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
                            <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>

                            <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 border border-slate-100 backdrop-blur-sm">
                                <div className="absolute -left-12 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 z-20 animate-bounce-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Status</p>
                                            <p className="text-sm font-bold text-slate-900">Verified Doctor</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -right-8 bottom-32 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 z-20 animate-bounce-slow animation-delay-1500">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Wait Time</p>
                                            <p className="text-sm font-bold text-slate-900">~ 5 mins</p>
                                        </div>
                                    </div>
                                </div>

                                <img
                                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2864&auto=format&fit=crop"
                                    alt="Doctor"
                                    className="rounded-2xl w-full object-cover h-[500px]"
                                />

                                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-4 rounded-xl border border-white/50 shadow-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-slate-900">Dr. Sarah Smith</h3>
                                            <p className="text-sm text-primary-600">Cardiology Specialist</p>
                                        </div>
                                        <button className="bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition-colors">
                                            <Video className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-slate-50" id="features">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive Healthcare Services</h2>
                        <p className="text-slate-600">We bring the hospital to your home with our integrated digital health ecosystem.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Video className="w-8 h-8 text-primary-500" />,
                                title: "Video Consultations",
                                desc: "Connect face-to-face with top specialists via secure high-definition video calls."
                            },
                            {
                                icon: <FileText className="w-8 h-8 text-purple-500" />,
                                title: "Digital Prescriptions",
                                desc: "Get e-prescriptions sent directly to your app or nearest pharmacy instantly."
                            },
                            {
                                icon: <Activity className="w-8 h-8 text-green-500" />,
                                title: "Health Records",
                                desc: "Access all your lab reports, history, and vitals in one secure dashboard."
                            }
                        ].map((service, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 hover:-translate-y-1">
                                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4 text-white">
                                <Activity className="w-6 h-6 text-primary-500" />
                                <span className="text-xl font-bold">SwasthyaSetu</span>
                            </div>
                            <p className="text-slate-400 max-w-sm">
                                Making healthcare accessible, affordable, and seamless for everyone through technology.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Platform</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-primary-400">About Us</Link></li>
                                <li><Link href="#" className="hover:text-primary-400">Find Doctors</Link></li>
                                <li><Link href="#" className="hover:text-primary-400">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-primary-400">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-primary-400">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center text-slate-500 text-sm">
                        © 2024 SwasthyaSetu. All rights reserved.
                    </div>
                </div>
            </footer>

        </div>
    )
}
