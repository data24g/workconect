
import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { adminApi } from '../services/adminApi';

const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminApi.reviews.getAll();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string) => {
    // TODO: Backend cần API để toggle visibility
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isHidden: !r.isHidden } : r));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kiểm duyệt Đánh giá</h1>
        <p className="text-sm text-slate-500 font-medium">Giám sát đánh giá 2 chiều để đảm bảo tính trung thực của nền tảng.</p>
      </div>

      <div className="grid gap-4">
        {reviews.map(review => (
          <div key={review.id} className={`bg-white p-6 rounded-2xl border ${review.isHidden ? 'border-red-100 opacity-75 grayscale' : 'border-slate-100'} shadow-sm flex flex-col md:flex-row gap-6 transition-all group`}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{review.fromUserId}</span>
                <i className="fas fa-arrow-right text-slate-300 text-[10px]"></i>
                <span className="text-xs font-black text-slate-800">{review.toUserId}</span>
                <span className="ml-auto text-[10px] text-slate-400 font-bold">{review.createdAt}</span>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fas fa-star text-[10px] ${i < review.score ? 'text-amber-400' : 'text-slate-200'}`}></i>
                ))}
                <span className="text-[10px] font-black text-slate-500 ml-2 uppercase tracking-tighter">Điểm: {review.score}/5</span>
              </div>

              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{review.comment}"</p>

              {review.isHidden && (
                <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                  <i className="fas fa-eye-slash"></i> Đánh giá này đang bị ẩn khỏi hồ sơ công khai
                </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleVisibility(review.id)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all ${review.isHidden ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                  }`}
              >
                {review.isHidden ? 'Hiện đánh giá' : 'Ẩn đánh giá'}
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                Cảnh cáo User
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                Xem phiên làm việc
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewModeration;
