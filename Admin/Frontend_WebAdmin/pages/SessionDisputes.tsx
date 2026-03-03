
import React, { useState } from 'react';
import { WorkSession, SessionStatus } from '../types';

const MOCK_SESSIONS: WorkSession[] = [
  { id: 'WS-101', jobId: 'J-88', workerId: 'W-01', employerId: 'E-05', status: SessionStatus.DISPUTE, disputeNote: "Người thuê không trả đúng lương thỏa thuận, bắt làm thêm giờ mà không có phụ phí.", updatedAt: '2 giờ trước' },
  { id: 'WS-102', jobId: 'J-92', workerId: 'W-05', employerId: 'E-12', status: SessionStatus.CONFIRMED, updatedAt: '5 giờ trước' },
  { id: 'WS-103', jobId: 'J-77', workerId: 'W-12', employerId: 'E-20', status: SessionStatus.DONE, updatedAt: '1 ngày trước' },
];

const SessionDisputes: React.FC = () => {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<WorkSession | null>(null);

  const handleResolve = (id: string, newStatus: SessionStatus) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setSelectedSession(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Phiên làm việc & Tranh chấp</h1>
          <p className="text-sm text-slate-500 font-medium">Giám sát các phiên làm việc thời gian thực và can thiệp khi có xung đột.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sessions.map(session => (
          <div key={session.id} className={`bg-white p-6 rounded-2xl border ${session.status === SessionStatus.DISPUTE ? 'border-red-200 bg-red-50/20' : 'border-slate-100'} shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 group transition-all`}>
            <div className="flex-1 flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                session.status === SessionStatus.DISPUTE ? 'bg-red-500 text-white shadow-red-100' : 
                session.status === SessionStatus.DONE ? 'bg-green-500 text-white shadow-green-100' : 'bg-indigo-600 text-white shadow-indigo-100'
              }`}>
                <i className={`fas ${session.status === SessionStatus.DISPUTE ? 'fa-scale-unbalanced' : 'fa-handshake'}`}></i>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-slate-800">{session.id}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tight ${
                    session.status === SessionStatus.DISPUTE ? 'bg-red-100 text-red-600' : 
                    session.status === SessionStatus.DONE ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {session.status === SessionStatus.DISPUTE ? 'Đang tranh chấp' : 
                     session.status === SessionStatus.DONE ? 'Đã hoàn thành' : 'Đang thực hiện'}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                  <span className="text-slate-800 font-black">Job: #{session.jobId}</span>
                  <span className="text-slate-200">•</span>
                  <span>Worker: {session.workerId}</span>
                  <span className="text-slate-200">•</span>
                  <span>Employer: {session.employerId}</span>
                  <span className="text-slate-200">•</span>
                  <span>Cập nhật: {session.updatedAt}</span>
                </div>
                {session.status === SessionStatus.DISPUTE && (
                  <div className="mt-3 p-3 bg-red-100/50 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-800 tracking-tight leading-relaxed">
                      <i className="fas fa-quote-left mr-2 opacity-30"></i>
                      {session.disputeNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setSelectedSession(session)}
                className="flex-1 lg:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                {session.status === SessionStatus.DISPUTE ? 'Phân xử ngay' : 'Xem chi tiết'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Phân xử Tranh chấp */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-red-600 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Hội đồng phân xử #{selectedSession.id}</h2>
                <p className="text-xs text-red-100 mt-1 font-bold uppercase tracking-widest">Can thiệp trạng thái phiên làm việc</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bên thuê (Employer)</p>
                    <p className="text-sm font-black text-slate-800">{selectedSession.employerId}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bên làm (Worker)</p>
                    <p className="text-sm font-black text-slate-800">{selectedSession.workerId}</p>
                  </div>
               </div>

               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nội dung khiếu nại</label>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold text-red-800 leading-relaxed italic">
                   "{selectedSession.disputeNote || "Không có ghi chú cụ thể."}"
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quyết định của Admin</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 h-24 transition-all"
                  placeholder="Ghi rõ lý do phân xử để lưu vào nhật ký hệ thống..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => handleResolve(selectedSession.id, SessionStatus.DONE)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                >
                  Duyệt hoàn thành (Trả tiền cho Worker)
                </button>
                <button 
                  onClick={() => handleResolve(selectedSession.id, SessionStatus.CANCELLED)}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-100 hover:bg-slate-900 transition-all"
                >
                  Hủy phiên (Hoàn tiền cho Employer)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDisputes;
