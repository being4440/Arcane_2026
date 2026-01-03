import React from 'react';
import { Star, User, Calendar, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
const ReviewsPage = ({
  onNavigate,
  feedbacks,
  user,
  onLogout
}) => {
  return <div className="min-h-screen bg-[#0F1A17]">
      <div className="bg-[#1E2A26] border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
           <button onClick={() => onNavigate(user ? user.role === 'seller' ? 'seller-home' : 'buyer-home' : 'landing')} className="flex items-center text-gray-400 hover:text-white transition-colors">
             <ArrowLeft className="w-5 h-5 mr-2" />
             Back
           </button>
           <h1 className="font-bold text-white text-lg"> Reviews</h1>
           <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Feedback</h2>
          
          <div className="space-y-6">
            {feedbacks.map(feedback => <div key={feedback.id} className="bg-[#1E2A26] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{feedback.sellerName}</h3>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <span className="bg-[#0F1A17] px-2 py-1 rounded text-xs mr-2 border border-gray-700">Item: {feedback.materialName}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0F1A17] px-3 py-1 rounded-full border border-yellow-500/30">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-400">{feedback.rating}.0</span>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 italic">"{feedback.comment}"</p>

                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-800 pt-4">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {feedback.buyerName}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {feedback.date}
                  </div>
                </div>
              </div>)}

            {feedbacks.length === 0 && <div className="text-center py-12 text-gray-500">
                  No reviews available yet.
               </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default ReviewsPage;