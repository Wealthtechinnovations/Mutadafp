import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "../../services/api";

export default function Register() {
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    country: "Côte d'Ivoire",
    birthDate: "",
    acceptTerms: false,
    acceptDataCollection: false,
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms || !formData.acceptDataCollection) {
      setError("Vous devez accepter les conditions et la collecte de données.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      navigate("/connexion", { state: { message: "Compte créé avec succès. Vous pouvez vous connecter." } });
    } catch (err: any) {
      setError(err.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-brand-primary" />
          <h2 className="mt-6 text-3xl font-serif font-bold text-brand-primary">Inscription</h2>
          <p className="mt-2 text-sm text-slate-600">
            Rejoignez le collectif et déposez votre dossier
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pays de résidence</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-brand-primary rounded border-slate-300"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              />
              <span className="text-sm text-slate-600">
                J'accepte les <Link to="/conditions" className="text-brand-primary font-bold">Conditions d'Utilisation</Link> et je certifie l'exactitude des informations fournies.
              </span>
            </label>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-brand-primary rounded border-slate-300"
                checked={formData.acceptDataCollection}
                onChange={(e) => setFormData({ ...formData, acceptDataCollection: e.target.checked })}
              />
              <span className="text-sm text-slate-600">
                Je consens à la collecte et au traitement de mes données personnelles sensibles (dont pièce d'identité) dans le but exclusif de constituer un dossier collectif.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 transition-all"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Déjà inscrit ?{" "}
          <Link to="/connexion" className="font-bold text-brand-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
