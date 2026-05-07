import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Shield, User, FileText, MessageSquare, LogOut, Menu, X } from "lucide-react";

// Pages (to be created)
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Auth/Login"));
const Register = React.lazy(() => import("./pages/Auth/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard/Dashboard"));
const AdminPanel = React.lazy(() => import("./pages/Admin/AdminPanel"));
const Blog = React.lazy(() => import("./pages/Blog"));
const Settings = React.lazy(() => import("./pages/Dashboard/Settings"));
const Resources = React.lazy(() => import("./pages/Resources"));
const History = React.lazy(() => import("./pages/History"));
const MentionsLegales = React.lazy(() => import("./pages/Legal/MentionsLegales"));
const Privacy = React.lazy(() => import("./pages/Legal/Privacy"));

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <React.Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/connexion" element={<Login />} />
                <Route path="/inscription" element={<Register />} />
                <Route path="/ressources" element={<Resources />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/historique" element={<History />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-confidentialite" element={<Privacy />} />
                <Route path="/tableau-de-bord/*" element={<Dashboard />} />
                <Route path="/parametres" element={<Settings />} />
                <Route path="/admin/*" element={<AdminPanel />} />
              </Routes>
            </React.Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-brand-primary" />
              <span className="font-serif font-bold text-xl text-brand-primary hidden sm:block">
                Collectif MUTADAFP
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/historique" className="text-slate-600 hover:text-brand-primary font-medium">Historique</Link>
            <Link to="/blog" className="text-slate-600 hover:text-brand-primary font-medium">Blog</Link>
            <Link to="/ressources" className="text-slate-600 hover:text-brand-primary font-medium">Ressources</Link>
            {token ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center space-x-1 text-brand-primary font-bold">
                    <Shield className="h-4 w-4" />
                    <span>Administration</span>
                  </Link>
                )}
                <Link to="/tableau-de-bord" className="flex items-center space-x-1 text-slate-600 hover:text-brand-primary font-medium">
                  <User className="h-4 w-4" />
                  <span>Mon Dossier</span>
                </Link>
                <Link to="/parametres" className="text-slate-600 hover:text-brand-primary font-medium">Paramètres</Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium">
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="text-slate-600 hover:text-brand-primary font-medium">Connexion</Link>
                <Link to="/inscription" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-4 px-4 space-y-4">
          <Link to="/historique" className="block text-slate-600 font-medium">Historique</Link>
          <Link to="/blog" className="block text-slate-600 font-medium">Blog</Link>
          <Link to="/ressources" className="block text-slate-600 font-medium">Ressources</Link>
          {token ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="block text-brand-primary font-bold">Administration</Link>
              )}
              <Link to="/tableau-de-bord" className="block text-slate-600 font-medium">Mon Dossier</Link>
              <Link to="/parametres" className="block text-slate-600 font-medium">Paramètres</Link>
              <button onClick={handleLogout} className="block text-red-600 font-medium">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="block text-slate-600 font-medium">Connexion</Link>
              <Link to="/inscription" className="block bg-brand-primary text-white px-4 py-2 rounded-lg text-center">S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-4">Collectif MUTADAFP</h3>
            <p className="text-sm leading-relaxed">
              Plateforme d'organisation et d'entraide pour les personnes se déclarant victimes. 
              Nous œuvrons pour la transparence et la justice.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Liens Utiles</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/historique" className="hover:text-white">Historique</Link></li>
              <li><Link to="/ressources" className="hover:text-white">Ressources</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-white">Mentions Légales</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-white">Politique de Confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Avertissement Légal</h4>
            <p className="text-xs italic leading-relaxed">
              Cette plateforme n'est ni un tribunal, ni un service de police. 
              Les informations sont déposées sous la responsabilité de leurs auteurs. 
              La présomption d'innocence s'applique à toute entité citée.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs">
          &copy; {new Date().getFullYear()} Collectif des Victimes. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  );
}
