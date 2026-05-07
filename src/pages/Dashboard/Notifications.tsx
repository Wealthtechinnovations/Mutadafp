import React from "react";
import { api } from "../../services/api";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const token = localStorage.getItem("token");

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds for quasi real-time
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.get("/notifications", token!);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {}, token!);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center">Chargement des notifications...</div>;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl text-brand-primary flex items-center">
          <Bell className="mr-3 h-6 w-6" /> Vos Notifications
        </h2>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {notifications.filter(n => !n.isRead).length} non lues
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Vous n'avez aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-6 rounded-2xl border transition-all ${
                n.isRead ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-brand-primary/10 shadow-sm'
              }`}
              onClick={() => !n.isRead && markAsRead(n.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  n.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                  n.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {n.type === 'SUCCESS' ? <CheckCircle2 className="h-5 w-5" /> :
                   n.type === 'WARNING' ? <AlertCircle className="h-5 w-5" /> :
                   <Info className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
