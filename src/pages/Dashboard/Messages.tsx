import React from "react";
import { api } from "../../services/api";
import { MessageSquare, Send, User, Search } from "lucide-react";

export default function Messages() {
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [selectedConv, setSelectedConv] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  React.useEffect(() => {
    fetchConversations();
  }, []);

  React.useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      const interval = setInterval(() => fetchMessages(selectedConv.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  const fetchConversations = async () => {
    try {
      const data = await api.get("/messages/conversations", token!);
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startAdminConversation = async () => {
    try {
      const conv = await api.post("/messages/admin-conversation", {}, token!);
      // Refresh conversations list
      await fetchConversations();
      // Select the new/existing conversation
      setSelectedConv(conv);
    } catch (err) {
      alert("Impossible de contacter l'administrateur pour le moment.");
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const data = await api.get(`/messages/conversations/${convId}/messages`, token!);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const msg = await api.post(`/messages/conversations/${selectedConv.id}/messages`, { content: newMessage }, token!);
      setMessages([...messages, msg]);
      setNewMessage("");
    } catch (err) {
      alert("Erreur lors de l'envoi");
    }
  };

  if (loading) return <div className="p-12 text-center">Chargement de la messagerie...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex h-[600px]">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-primary flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" /> Messages
            </h2>
          </div>
          {currentUser.role === 'USER' && (
            <button 
              onClick={startAdminConversation}
              className="w-full py-3 px-4 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all font-bold flex items-center justify-center space-x-2 shadow-sm"
            >
              <User className="h-4 w-4" />
              <span>Contacter l'Admin</span>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucune conversation active.
            </div>
          ) : (
            conversations.map((conv) => {
              const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUser.id);
              return (
                <div 
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedConv?.id === conv.id ? 'bg-slate-50 border-l-4 border-l-brand-primary' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {otherParticipant?.user.role === 'SUPER_ADMIN' || otherParticipant?.user.role === 'ADMIN' ? 'ADMIN' : `${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName}`}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {conv.messages[0]?.content || "Nouvelle conversation"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {selectedConv ? (
          <>
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">
                  {(() => {
                    const other = selectedConv.participants.find((p: any) => p.userId !== currentUser.id)?.user;
                    return other?.role === 'SUPER_ADMIN' || other?.role === 'ADMIN' ? 'ADMIN' : `${other?.firstName} ${other?.lastName}`;
                  })()}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const senderName = msg.sender?.role === 'SUPER_ADMIN' || msg.sender?.role === 'ADMIN' ? 'ADMIN' : `${msg.sender?.firstName} ${msg.sender?.lastName}`;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                      isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      {!isMe && <div className="text-[10px] font-bold text-slate-400 mb-1">{senderName}</div>}
                      {msg.content}
                      {!isMe && msg.content.startsWith("[DIFFUSION:") && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <button 
                            onClick={() => {
                              const input = document.getElementById('message-input') as HTMLInputElement;
                              if (input) {
                                input.focus();
                                setNewMessage(`Re: ${msg.content.split(']')[0].replace('[DIFFUSION: ', '')} - `);
                              }
                            }}
                            className="text-[10px] font-bold text-brand-primary hover:underline flex items-center"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Répondre au Super Admin
                          </button>
                        </div>
                      )}
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-3">
              <input 
                id="message-input"
                type="text" 
                placeholder="Votre message..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="p-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="h-16 w-16 mb-4 opacity-10" />
            <p>Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  );
}
