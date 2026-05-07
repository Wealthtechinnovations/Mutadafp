import React from "react";
import { api } from "../../services/api";
import { Save, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DossierForm({ dossier, onUpdate }: { dossier: any, onUpdate: () => void }) {
  const [facts, setFacts] = React.useState(dossier?.facts || "");
  const [totalAmount, setTotalAmount] = React.useState(dossier?.totalAmount || 0);
  const [loading, setLoading] = React.useState(false);
  const token = localStorage.getItem("token");

  const [showEventForm, setShowEventForm] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({ date: "", type: "PAIEMENT", description: "", amount: 0 });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/dossiers/timeline", newEvent, token!);
      onUpdate();
      setShowEventForm(false);
      setNewEvent({ date: "", type: "PAIEMENT", description: "", amount: 0 });
    } catch (err) {
      alert("Erreur lors de l'ajout de l'événement");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/dossiers/update-facts", { facts, totalAmount }, token!);
      onUpdate();
      alert("Dossier mis à jour");
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl text-brand-primary mb-6">Exposé des faits</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Décrivez précisément les faits (dates, interlocuteurs, promesses faites)
          </label>
          <textarea
            rows={10}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
            placeholder="Soyez le plus factuel possible..."
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Montant total versé (XOF)</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="font-bold text-sm mb-4">Timeline des événements</h3>
          <p className="text-xs text-slate-500 mb-4">Ajoutez les dates clés de votre dossier (paiements, relances, etc.)</p>
          
          <div className="space-y-3">
            {dossier?.timelineEvents?.map((event: any) => (
              <div key={event.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-sm">
                <span>{new Date(event.date).toLocaleDateString()} - {event.type}</span>
                <span className="text-slate-500">{event.description}</span>
              </div>
            ))}
          </div>
          
          {showEventForm ? (
            <div className="mt-4 p-4 bg-white rounded-xl border border-brand-primary/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  required
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <select 
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <option value="PAIEMENT">Paiement</option>
                  <option value="PROMESSE">Promesse</option>
                  <option value="RELANCE">Relance</option>
                  <option value="RDV">Rendez-vous</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <input 
                type="text" 
                placeholder="Description courte..."
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={handleAddEvent}
                  className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Confirmer
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="text-slate-500 px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setShowEventForm(true)}
              className="mt-4 text-brand-primary text-sm font-bold flex items-center hover:underline"
            >
              <Plus className="mr-1 h-4 w-4" /> Ajouter un événement
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/tableau-de-bord"
            className="flex-1 flex items-center justify-center px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
          >
            Annuler
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
          </button>
          
          <Link 
            to="/tableau-de-bord/pieces"
            className="flex-1 flex items-center justify-center space-x-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20"
          >
            <span>Suivant</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </form>
    </div>
  );
}
