import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { Bell, CheckCheck, Sparkles, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Notifications</h1>
          <p className="text-sm text-[#666666]">Alerts for new job matches and application status changes.</p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] text-[#111111] text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-[#2563EB]" /> Mark All Read
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => <div key={n} className="bg-white rounded-xl h-20 border border-[#E5E5E5] animate-pulse" />)}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl p-5 border transition-all ${
                notif.is_read ? "border-[#E5E5E5] opacity-75" : "border-[#2563EB]/40 bg-blue-50/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-200">
                    {notif.type === 'NEW_JOB_MATCH' ? <Sparkles className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111111]">{notif.title}</h3>
                    <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-[#8A8A8A] mt-1.5 block">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {notif.job && (
                  <Link
                    to={`/jobs/${notif.job.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 shrink-0 transition-colors"
                  >
                    View Job
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications yet."
          description="When new matching jobs are published or application status updates occur, they will appear here."
        />
      )}

    </div>
  );
};
