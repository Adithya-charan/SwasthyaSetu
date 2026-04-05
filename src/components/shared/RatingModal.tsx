'use client';
import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface RatingModalProps {
    doctorName?: string;
    onClose: () => void;
}

export default function RatingModal({ doctorName = 'Dr. Sarah Smith', onClose }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success("Thank you for your feedback!");
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                
                <div className="text-center space-y-4 mb-6">
                    <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden mix-blend-multiply">
                        <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2864&auto=format&fit=crop" alt="Doctor" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">How was your consultation?</h2>
                        <p className="text-slate-600 font-medium">with {doctorName}</p>
                    </div>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star}
                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star className={`w-10 h-10 transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <textarea 
                        rows={3}
                        placeholder="Tell us about your experience (optional)"
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors text-sm"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                    ></textarea>

                    <div className="flex flex-col gap-3 mt-4">
                        <button 
                            disabled={rating === 0 || isSubmitting}
                            onClick={handleSubmit} 
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                        >
                            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Submit Review'}
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-full bg-transparent hover:bg-slate-50 text-slate-500 font-semibold py-3 rounded-xl transition-all"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
