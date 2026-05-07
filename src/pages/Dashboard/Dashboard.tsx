import React from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  MessageSquare, 
  Settings as SettingsIcon, 
  Bell,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle
} from "lucide-react";
import { api } from "../../services/api";
import DossierForm from "./DossierForm";
import DocumentsUpload from "./DocumentsUpload";
import Settings from "./Settings";
import Messages from "./Messages";
import Notifications from "./Notifications";

export default function Dashboard() {
  const [dossier, setDossier] = React.useState<any>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!token) {
      navigate("/connexion");
      return;
    }
    fetchDossier();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const data = await api.get("/notifications", token!);
      const unread = data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDossier = async () => {
    try {
      const data = await api.get("/dossiers/my-dossier", token!);
      setDossier(data);
    } catch (err: any) {
      if (err.error?.includes("suspendu")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/connexion", { state: { error: err.error } });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Chargement...</div>;

  const steps = [
    { id: "info", title: "Informations", path: "/tableau-de-bord/dossier" },
    { id: "pieces", title: "Pièces Justificatives", path: "/tableau-de-bord/pieces" },
    { id: "review", title: "Revue & Soumission", path: "/tableau-de-bord/revue" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-brand-primary mb-6 flex items-center">
              <LayoutDashboard className="mr-2 h-5 w-5" /> Menu
            </h2>
            <nav className="space-y-2">
              <SidebarLink to="/tableau-de-bord" icon={<LayoutDashboard />} label="Vue d'ensemble" active={location.pathname === "/tableau-de-bord"} />
              <SidebarLink to="/tableau-de-bord/dossier" icon={<FileText />} label="Mon Dossier" active={location.pathname.includes("/dossier")} />
              <SidebarLink to="/tableau-de-bord/pieces" icon={<Upload />} label="Mes Pièces" active={location.pathname.includes("/pieces")} />
              <SidebarLink to="/tableau-de-bord/revue" icon={<CheckCircle2 />} label="Revue & Soumission" active={location.pathname.includes("/revue")} />
              <SidebarLink to="/tableau-de-bord/messages" icon={<MessageSquare />} label="Messagerie" active={location.pathname.includes("/messages")} />
              <SidebarLink 
                to="/tableau-de-bord/notifications" 
                icon={<Bell />} 
                label={
                  <div className="flex items-center justify-between w-full">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                } 
                active={location.pathname.includes("/notifications")} 
              />
              <SidebarLink to="/tableau-de-bord/parametres" icon={<SettingsIcon />} label="Paramètres" active={location.pathname.includes("/parametres")} />
            </nav>
          </div>

          {/* Status Card */}
          <div className="bg-brand-primary text-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold mb-2">Statut du Dossier</h3>
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm inline-block mb-4">
              {dossier?.status || "BROUILLON"}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dossier?.status === "BROUILLON" 
                ? "Complétez toutes les étapes pour soumettre votre dossier au collectif."
                : "Votre dossier est en cours de traitement par nos administrateurs."}
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Stepper (only for dossier creation phase) */}
          {["BROUILLON", "PIECES_MANQUANTES"].includes(dossier?.status) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, i) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                        location.pathname === step.path ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-200 text-slate-400'
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`text-xs font-bold ${location.pathname === step.path ? 'text-brand-primary' : 'text-slate-400'}`}>
                        {step.title}
                      </span>
                    </div>
                    {i < steps.length - 1 && <div className="flex-grow h-px bg-slate-200 mx-4 mb-6"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Overview dossier={dossier} />} />
            <Route path="/dossier" element={<DossierForm dossier={dossier} onUpdate={fetchDossier} />} />
            <Route path="/pieces" element={<DocumentsUpload dossier={dossier} onUpdate={fetchDossier} />} />
            <Route path="/revue" element={<Review dossier={dossier} onUpdate={fetchDossier} />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/parametres" element={<Settings />} />
            <Route path="*" element={<div className="p-12 text-center text-slate-400">Section non trouvée</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: React.ReactNode, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-brand-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 flex-shrink-0" })}
      <span className="font-medium flex-1">{label}</span>
    </Link>
  );
}

function Overview({ dossier }: { dossier: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl text-brand-primary mb-6">Bienvenue sur votre espace sécurisé</h2>
        <p className="text-slate-600 mb-8">
          C'est ici que vous pouvez gérer votre dossier de déclaration de victime. 
          Suivez les étapes pour fournir les éléments nécessaires à l'action collective.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-brand-primary mb-4 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> État d'avancement
            </h3>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div className="bg-brand-primary h-2 rounded-full transition-all duration-500" style={{ width: `${dossier?.completenessScore || 0}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{dossier?.completenessScore || 0}% complété</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-brand-primary mb-4 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-500" /> Actions requises
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              {dossier?.status === "BROUILLON" && (
                <>
                  {!dossier?.facts && <li>• Complétez l'exposé des faits</li>}
                  {(!dossier?.documents || dossier.documents.length === 0) && <li>• Ajoutez votre pièce d'identité</li>}
                  {dossier?.facts && dossier.documents?.length > 0 && (
                    <li className="text-brand-primary font-bold">
                      <Link to="/tableau-de-bord/revue" className="hover:underline">✓ Prêt pour la soumission</Link>
                    </li>
                  )}
                </>
              )}
              {dossier?.status === "SOUMIS" && <li>• Votre dossier est en attente de validation par l'administrateur</li>}
              {dossier?.status === "COMPLET" && <li className="text-green-600 font-bold">• Dossier validé et complet</li>}
            </ul>
          </div>
        </div>

        {dossier?.status === "BROUILLON" && dossier?.facts && dossier?.documents?.length > 0 && (
          <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-brand-primary">Votre dossier est prêt !</p>
              <p className="text-sm text-slate-600">Vous avez rempli les informations essentielles.</p>
            </div>
            <Link to="/tableau-de-bord/revue" className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-secondary transition-all">
              Soumettre maintenant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Review({ dossier, onUpdate }: { dossier: any, onUpdate: () => void }) {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir soumettre votre dossier ? Vous ne pourrez plus le modifier directement.")) return;
    setLoading(true);
    try {
      await api.post("/dossiers/submit", {}, token!);
      onUpdate();
      setSubmitted(true);
    } catch (err) {
      alert("Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  const isReady = dossier?.facts && dossier?.documents?.length > 0;

  if (submitted || dossier?.status === "SOUMIS") {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-brand-primary mb-4">Dossier Soumis avec Succès !</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Votre dossier a été transmis au collectif. Un accusé de réception vous a été envoyé dans votre messagerie interne.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link to="/tableau-de-bord/messages" className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" /> Voir mes messages
          </Link>
          <Link to="/tableau-de-bord" className="text-slate-500 font-bold hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl text-brand-primary mb-6">Revue finale & Soumission</h2>
      
      <div className="space-y-8 mb-8">
        {/* Facts Summary */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-brand-primary">1. Exposé des faits</h3>
            <Link to="/tableau-de-bord/dossier" className="text-xs text-brand-primary hover:underline font-bold">Modifier</Link>
          </div>
          {dossier?.facts ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 line-clamp-3 italic">"{dossier.facts}"</p>
              <p className="text-sm font-bold">Montant total déclaré : <span className="text-brand-primary">{dossier.totalAmount?.toLocaleString()} XOF</span></p>
            </div>
          ) : (
            <p className="text-sm text-red-500 italic">Aucun fait renseigné.</p>
          )}
        </div>

        {/* Documents Summary */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-brand-primary">2. Pièces justificatives</h3>
            <Link to="/tableau-de-bord/pieces" className="text-xs text-brand-primary hover:underline font-bold">Modifier</Link>
          </div>
          {dossier?.documents?.length > 0 ? (
            <ul className="space-y-2">
              {dossier.documents.map((doc: any) => (
                <li key={doc.id} className="text-sm flex items-center text-slate-600">
                  <FileText className="h-4 w-4 mr-2 text-slate-400" />
                  {doc.fileName} <span className="ml-2 text-[10px] bg-slate-200 px-2 py-0.5 rounded uppercase">{doc.category.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-red-500 italic">Aucune pièce jointe. (Pièce d'identité obligatoire)</p>
          )}
        </div>
        
        {/* Legal Disclaimer */}
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
          <div className="text-sm text-amber-800 space-y-2">
            <p className="font-bold">Engagement sur l'honneur</p>
            <p className="italic leading-relaxed">
              En soumettant ce dossier, je certifie sur l'honneur que toutes les informations fournies sont exactes et sincères. 
              Je comprends que ces informations seront utilisées dans le cadre de l'action collective du Collectif MUTADAFP.
            </p>
          </div>
        </div>
      </div>

      {!isReady && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
          Veuillez compléter l'exposé des faits et ajouter au moins une pièce justificative avant de soumettre.
        </div>
      )}

      <button 
        onClick={handleSubmit}
        disabled={loading || dossier?.status !== "BROUILLON" || !isReady}
        className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 shadow-lg shadow-brand-primary/20"
      >
        {loading ? "Soumission en cours..." : dossier?.status === "BROUILLON" ? "Soumettre mon dossier au collectif" : "Dossier déjà soumis"}
      </button>

      <div className="mt-6 flex justify-center">
        <Link 
          to="/tableau-de-bord/pieces"
          className="text-slate-500 font-bold hover:underline"
        >
          ← Retour aux pièces justificatives
        </Link>
      </div>
      
      {dossier?.status === "SOUMIS" && (
        <p className="mt-4 text-center text-sm text-green-600 font-medium">
          ✓ Votre dossier a été transmis avec succès.
        </p>
      )}
    </div>
  );
}
