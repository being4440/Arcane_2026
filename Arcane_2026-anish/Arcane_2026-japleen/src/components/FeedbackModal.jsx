import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeedbackModal = ({ isOpen, onClose, onSubmit, sellerName, materialName, stage }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ rating, comment });
      setRating(0);
      setComment('');
      onClose();
    } catch (err) {
      // Error already shown by parent
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1E2A26] w-full max-w-md rounded-2xl p-6 border border-gray-700 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-1">Leave Feedback</h2>
          {stage && (
             <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#3FA37C]/20 text-[#3FA37C] border border-[#3FA37C]/30 mb-3">
                 {stage}
             </span>
          )}
          
          <p className="text-gray-400 text-sm mb-6">
            For <span className="text-[#3FA37C]">{materialName}</span> from <span className="text-white">{sellerName}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#0F1A17] border border-gray-700 rounded-lg p-3 text-white focus:border-[#3FA37C] focus:outline-none h-24 resize-none"
                placeholder="Share your experience..."
                required
              />
            </div>

            <Button
              type="submit"
              disabled={rating === 0}
              className="w-full bg-[#3FA37C] hover:bg-[#358F6A] text-white py-6 rounded-xl text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Feedback
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackModal;