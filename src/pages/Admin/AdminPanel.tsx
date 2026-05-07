import React from "react";
import { api } from "../../services/api";
import { Shield, Users, FileText, Activity, Search, CheckCircle, AlertCircle, Clock, Database, MessageSquare } from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = React.useState("stats");
  const [stats, setStats] = React.useState<any>(null);
  const [dossiers, setDossiers] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [broadcast, setBroadcast] = React.useState({ title: "", message: "" });
  const [isBroadcasting, setIsBroadcasting] = React.useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [blogPostsList, setBlogPostsList] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [statsData, dossiersData, usersData, logsData, blogData] = await Promise.all([
        api.get("/admin/stats", token!),
        api.get("/admin/dossiers", token!),
        api.get("/admin/users", token!),
        user.role === 'SUPER_ADMIN' ? api.get("/admin/audit-logs", token!) : Promise.resolve([]),
        user.role === 'SUPER_ADMIN' ? api.get("/admin/blog", token!) : Promise.resolve([])
      ]);
      setStats(statsData);
      setDossiers(dossiersData);
      setUsers(usersData);
      setAuditLogs(logsData);
      setBlogPostsList(blogData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleBlock = async (userId: string) => {
    if (!window.confirm("Changer le statut de blocage de cet utilisateur ?")) return;
    try {
      await api.patch(`/admin/users/${userId}/toggle-block`, {}, token!);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'opération");
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!broadcast.title.trim() || !broadcast.message.trim()) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (!window.confirm("Confirmez-vous l'envoi de ce message à TOUS les utilisateurs de la plateforme ? Cette action est irréversible.")) {
      return;
    }

    if (!token) {
      console.error("No token found in localStorage");
      alert("Votre session a expiré. Veuillez vous reconnecter pour diffuser un message.");
      return;
    }

    setIsBroadcasting(true);
    try {
      console.log("Attempting broadcast with token:", token.substring(0, 10) + "...");
      const response = await api.post("/admin/broadcast", broadcast, token);
      console.log("Broadcast success:", response);
      
      alert(`Félicitations ! ${response.message || "Le message a été diffusé avec succès."}`);
      setBroadcast({ title: "", message: "" });
    } catch (err: any) {
      console.error("Broadcast failed:", err);
      const errorMessage = err.error || err.message || "Une erreur inconnue est survenue lors de la diffusion.";
      alert(`Échec de la diffusion : ${errorMessage}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleToggleMessaging = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-messaging`, {}, token!);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'opération");
    }
  };

  const [selectedDossier, setSelectedDossier] = React.useState<any>(null);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [blogPost, setBlogPost] = React.useState({ title: "", content: "", excerpt: "", category: "ACTUALITÉ", published: true, sourceUrl: "" });

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/blog", blogPost, token!);
      alert("Article publié !");
      setBlogPost({ title: "", content: "", excerpt: "", category: "ACTUALITÉ", published: true, sourceUrl: "" });
      fetchData();
    } catch (err) {
      alert("Erreur lors de la publication");
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article/ressource ?")) return;
    try {
      await api.delete(`/admin/blog/${id}`, token!);
      fetchData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleValidateDossier = async (dossierId: string, status: string) => {
    try {
      await api.patch(`/admin/dossiers/${dossierId}/status`, { status }, token!);
      fetchData();
      setSelectedDossier(null);
      alert("Statut mis à jour");
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleContactUser = async (userId: string) => {
    try {
      await api.post(`/messages/user-conversation/${userId}`, {}, token!);
      window.location.href = "/tableau-de-bord/messages";
    } catch (err) {
      alert("Erreur lors de l'ouverture de la conversation");
    }
  };

  if (loading) return <div className="p-12 text-center">Chargement de l'administration...</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-brand-primary text-white py-6 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-brand-accent" />
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight uppercase">Panel d'Administration</h1>
              <p className="text-slate-300 text-xs uppercase tracking-widest font-bold">Collectif MUTADAFP</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Live Database</span>
            </div>
            <span className="bg-brand-accent text-brand-primary px-3 py-1 rounded-full font-bold text-[10px] uppercase">
              {user.role}
            </span>
            <span className="text-slate-300">Bienvenue, {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? 'ADMIN' : `${user.firstName} ${user.lastName}`}</span>
            <a 
              href="/tableau-de-bord/messages" 
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-white/20 transition-all flex items-center"
            >
              <MessageSquare className="h-3 w-3 mr-1" /> Messagerie
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            <button onClick={() => setActiveTab("stats")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'stats' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Stats</button>
            <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'users' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Utilisateurs</button>
            <button onClick={() => setActiveTab("dossiers")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'dossiers' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Dossiers</button>
            {user.role === 'SUPER_ADMIN' && (
              <>
                <button onClick={() => setActiveTab("blog")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'blog' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Blog/Ressources</button>
                <button onClick={() => setActiveTab("broadcast")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'broadcast' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Diffusion</button>
                <button onClick={() => setActiveTab("audit")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'audit' ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Audit Logs</button>
              </>
            )}
          </div>
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="flex flex-col items-end space-y-1"
          >
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors disabled:opacity-50">
              <Activity className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Mise à jour...' : 'Rafraîchir les données'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Dernière synchro : {lastUpdate.toLocaleTimeString()}</span>
          </button>
        </div>

      {activeTab === "stats" && (
        <div className="space-y-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard icon={<Users />} label="Utilisateurs" value={stats?.totalUsers || 0} color="bg-blue-600" />
            <StatCard icon={<FileText />} label="Total Dossiers" value={stats?.totalDossiers || 0} color="bg-indigo-600" />
            <StatCard icon={<Database />} label="Documents" value={stats?.totalDocuments || 0} color="bg-slate-600" />
            <StatCard icon={<Shield />} label="Audit Logs" value={stats?.totalLogs || 0} color="bg-brand-primary" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dossiers Soumis</h3>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-brand-primary">{stats?.pendingDossiers || 0}</p>
              <p className="text-xs text-slate-400 mt-2">En attente de traitement</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dossiers Validés</h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{stats?.validatedDossiers || 0}</p>
              <p className="text-xs text-slate-400 mt-2">Dossiers complets et vérifiés</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pièces Manquantes</h3>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{stats?.incompleteDossiers || 0}</p>
              <p className="text-xs text-slate-400 mt-2">Nécessitent une action utilisateur</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Utilisateur</th>
                <th className="px-6 py-4 font-bold">Pays</th>
                <th className="px-6 py-4 font-bold">Rôle</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold">Messagerie</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.country}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {u.isBlocked ? 'BLOQUÉ' : 'ACTIF'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.canMessage ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.canMessage ? 'AUTORISÉ' : 'DÉSACTIVÉ'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="text-xs font-bold text-brand-primary hover:underline text-left"
                      >
                        Voir détails & documents
                      </button>
                      {user.role === 'SUPER_ADMIN' && u.id !== user.id && (
                        <>
                          <button 
                            onClick={() => handleToggleBlock(u.id)}
                            className={`text-xs font-bold hover:underline text-left ${u.isBlocked ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {u.isBlocked ? 'Débloquer' : 'Bloquer'}
                          </button>
                          <button 
                            onClick={() => handleToggleMessaging(u.id)}
                            className={`text-xs font-bold hover:underline text-left ${u.canMessage ? 'text-slate-600' : 'text-blue-600'}`}
                          >
                            {u.canMessage ? 'Interdire messagerie' : 'Autoriser messagerie'}
                          </button>
                          <button 
                            onClick={() => handleContactUser(u.id)}
                            className="text-xs font-bold text-brand-primary hover:underline text-left"
                          >
                            Contacter
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "dossiers" && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-primary">Dossiers à traiter</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">Utilisateur</th>
                  <th className="px-6 py-4 font-bold">Pays</th>
                  <th className="px-6 py-4 font-bold">Statut</th>
                  <th className="px-6 py-4 font-bold">Complétude</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dossiers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{d.user.firstName} {d.user.lastName}</div>
                      <div className="text-xs text-slate-500">{d.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.user.country}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        d.status === 'SOUMIS' ? 'bg-amber-100 text-amber-700' : 
                        d.status === 'COMPLET' ? 'bg-green-100 text-green-700' :
                        d.status === 'PIECES_MANQUANTES' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full">
                          <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${d.completenessScore}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-500">{d.completenessScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedDossier(d)}
                        className="text-brand-primary text-sm font-bold hover:underline"
                      >
                        Voir le dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "blog" && user.role === 'SUPER_ADMIN' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl text-brand-primary mb-6">Publier un article / Ressource</h2>
          <form onSubmit={handleCreateBlogPost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Titre</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
                  value={blogPost.title}
                  onChange={(e) => setBlogPost({ ...blogPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
                  value={blogPost.category}
                  onChange={(e) => setBlogPost({ ...blogPost, category: e.target.value })}
                >
                  <option value="ACTUALITÉ">Actualité</option>
                  <option value="RESSOURCE">Ressource</option>
                  <option value="COMMUNIQUÉ">Communiqué</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL de redirection (Optionnel)</label>
              <input 
                type="url" 
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
                value={blogPost.sourceUrl}
                onChange={(e) => setBlogPost({ ...blogPost, sourceUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Résumé (Excerpt)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
                value={blogPost.excerpt}
                onChange={(e) => setBlogPost({ ...blogPost, excerpt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contenu (Markdown supporté)</label>
              <textarea 
                rows={10}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
                value={blogPost.content}
                onChange={(e) => setBlogPost({ ...blogPost, content: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all">
              Publier l'article
            </button>
          </form>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-brand-primary mb-6 border-b pb-2">Historique des publications</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Titre</th>
                    <th className="px-6 py-4 font-bold">Catégorie</th>
                    <th className="px-6 py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blogPostsList.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {post.title}
                        {post.sourceUrl && <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 text-[10px] text-blue-500 hover:underline">(Lien externe)</a>}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold">{post.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDeleteBlogPost(post.id)}
                          className="text-xs font-bold text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blogPostsList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Aucune publication trouvée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-brand-primary">Profil de {selectedUser.firstName} {selectedUser.lastName}</h2>
                <p className="text-slate-500">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">Fermer</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Informations Personnelles</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Pays:</span> <span className="font-bold">{selectedUser.country}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Rôle:</span> <span className="font-bold">{selectedUser.role}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Inscrit le:</span> <span className="font-bold">{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Statut:</span> <span className={`font-bold ${selectedUser.isBlocked ? 'text-red-600' : 'text-green-600'}`}>{selectedUser.isBlocked ? 'Bloqué' : 'Actif'}</span></div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Statut du Dossier</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Statut:</span> <span className="font-bold">{selectedUser.dossier?.status || 'Non créé'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Complétude:</span> <span className="font-bold">{selectedUser.dossier?.completenessScore || 0}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Dernière soumission:</span> <span className="font-bold">{selectedUser.dossier?.submittedAt ? new Date(selectedUser.dossier.submittedAt).toLocaleDateString() : 'N/A'}</span></div>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Documents envoyés ({selectedUser.dossier?.documents?.length || 0})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedUser.dossier?.documents?.map((doc: any) => (
                  <div key={doc.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50">
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px]">{doc.fileName}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{doc.category}</p>
                    </div>
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-primary text-xs font-bold hover:underline"
                    >
                      Télécharger
                    </a>
                  </div>
                ))}
                {(!selectedUser.dossier?.documents || selectedUser.dossier.documents.length === 0) && (
                  <p className="text-slate-400 text-sm italic">Aucun document envoyé pour le moment.</p>
                )}
              </div>
            </section>

            <div className="flex justify-end space-x-4 pt-8 border-t">
              <button 
                onClick={() => handleContactUser(selectedUser.id)}
                className="bg-brand-accent text-brand-primary px-6 py-2 rounded-xl font-bold hover:bg-brand-accent/80 transition-all flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer un message
              </button>
              <button 
                onClick={() => {
                  setSelectedDossier(selectedUser.dossier);
                  setSelectedUser(null);
                }}
                disabled={!selectedUser.dossier}
                className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-50"
              >
                Gérer le dossier
              </button>
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-300 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dossier Detail Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-height-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-brand-primary">Dossier de {selectedDossier.user.firstName} {selectedDossier.user.lastName}</h2>
                <p className="text-slate-500">{selectedDossier.user.email}</p>
              </div>
              <button onClick={() => setSelectedDossier(null)} className="text-slate-400 hover:text-slate-600">Fermer</button>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Exposé des faits</h3>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                  "{selectedDossier.facts || "Aucun fait renseigné"}"
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Timeline des événements ({selectedDossier.timelineEvents?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedDossier.timelineEvents?.map((event: any) => (
                    <div key={event.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm flex justify-between">
                      <span className="font-bold">{new Date(event.date).toLocaleDateString()} - {event.type}</span>
                      <span className="text-slate-600">{event.description}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Documents ({selectedDossier.documents?.length || 0})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDossier.documents?.map((doc: any) => (
                    <div key={doc.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-white">
                      <div>
                        <p className="text-sm font-bold truncate max-w-[200px]">{doc.fileName}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{doc.category}</p>
                      </div>
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-primary text-xs font-bold hover:underline"
                      >
                        Télécharger
                      </a>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-wrap gap-4 pt-8 border-t">
                <button 
                  onClick={() => handleContactUser(selectedDossier.userId)}
                  className="bg-brand-accent text-brand-primary px-6 py-2 rounded-xl font-bold hover:bg-brand-accent/80 transition-all flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter la victime
                </button>
                <button 
                  onClick={() => handleValidateDossier(selectedDossier.id, "COMPLET")}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-all"
                >
                  Valider le dossier (Complet)
                </button>
                <button 
                  onClick={() => handleValidateDossier(selectedDossier.id, "PIECES_MANQUANTES")}
                  className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-amber-600 transition-all"
                >
                  Signaler pièces manquantes
                </button>
                <button 
                  onClick={() => handleValidateDossier(selectedDossier.id, "EN_REVUE")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Mettre en revue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "broadcast" && user.role === 'SUPER_ADMIN' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl text-brand-primary mb-6">Message de diffusion</h2>
          <p className="text-slate-600 mb-8">Ce message sera envoyé à TOUS les utilisateurs enregistrés sur la plateforme.</p>
          <form onSubmit={handleBroadcast} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sujet</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
                value={broadcast.title}
                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea 
                rows={6}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
                value={broadcast.message}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isBroadcasting}
              className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isBroadcasting ? (
                <>
                  <Activity className="animate-spin h-5 w-5 mr-2" />
                  Diffusion en cours...
                </>
              ) : (
                "Diffuser le message"
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === "audit" && user.role === 'SUPER_ADMIN' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-brand-primary">Journaux d'Audit (Audit Logs)</h2>
            <p className="text-slate-500 text-sm">Historique des actions critiques effectuées sur la plateforme.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Utilisateur</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                  <th className="px-6 py-4 font-bold">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {log.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Aucun log d'audit trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      </div>

      <div className="mt-12 text-center text-slate-400 text-xs pb-12">
        <p>Plateforme créée en Mars 2026 - Collectif MUTADAFP</p>
        <p className="mt-1">Interface de Gestion Autonome - Accès réservé aux administrateurs</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-xl text-white ${color}`}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-brand-primary">{value}</p>
      </div>
    </div>
  );
}
