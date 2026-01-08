// src/components/UI/CommentSection.jsx
import React, { useState } from 'react';
import { Send, User } from 'lucide-react';
import ButtonHero from './ButtonHero';

const CommentSection = ({ comments = [], onAddComment, currentUserId, isRTL = false }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="اكتب تعليقك..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          dir={isRTL ? "rtl" : "ltr"}
        />
        <div className="flex justify-end">
          <ButtonHero
            type="submit"
            variant="primary"
            size="sm"
            isRTL={isRTL}
            icon={Send}
            iconPosition={isRTL ? "right" : "left"}
            disabled={!newComment.trim()}>
            إرسال
          </ButtonHero>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                comment.userId === currentUserId
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <User size={16} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {comment.userName || 'مستخدم'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {comment.timestamp
                          ? new Date(comment.timestamp).toLocaleString()
                          : 'قبل قليل'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              لا توجد تعليقات بعد. كن أول من يعلق!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;