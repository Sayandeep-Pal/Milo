import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const ReportModal = ({ reportedId, onClose }) => {
  const { userId } = useUser();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !reportedId) return;

    setIsSubmitting(true);
    try {
      await axios.post('/api/report', {
        reporterId: userId,
        reportedId,
        reason,
        description
      });
      alert('Report submitted. Thank you for keeping Milo safe!');
      onClose();
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-6 border-red-500/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
            <AlertTriangle size={24} /> Report Stranger
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Reason for report</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-red-500 text-white"
            >
              <option value="" disabled className="bg-dark">Select a reason</option>
              <option value="Spam" className="bg-dark">Spam / Advertising</option>
              <option value="Inappropriate" className="bg-dark">Inappropriate content</option>
              <option value="Harassment" className="bg-dark">Harassment / Bullying</option>
              <option value="Other" className="bg-dark">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Details (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-red-500 text-white resize-none"
              placeholder="Provide more context..."
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !reason}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportModal;
