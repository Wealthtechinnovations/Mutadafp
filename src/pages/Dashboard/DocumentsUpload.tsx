import React from "react";
import { api } from "../../services/api";
import { Upload, File, Trash2, Download, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DocumentsUpload({ dossier, onUpdate }: { dossier: any, onUpdate: () => void }) {
  const [uploading, setUploading] = React.useState(false);
  const [category, setCategory] = React.useState("PIECE_IDENTITE");
  const token = localStorage.getItem("token");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      await api.upload("/documents/upload", formData, token!);
      onUpdate();
      alert("Fichier uploadé avec succès");
    } catch (err) {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const res = await fetch(`/api/documents/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (err) {
      alert("Erreur lors du téléchargement");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl text-brand-primary mb-6">Pièces Justificatives</h2>
      
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8 flex items-start space-x-4">
        <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Important :</strong> Veuillez uploader des documents lisibles (PDF, JPG, PNG).</p>
          <p>La pièce d'identité est obligatoire pour la validation de votre dossier.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <h3 className="font-bold mb-4">Ajouter un document</h3>
          <div className="space-y-4">
            <select 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="PIECE_IDENTITE">Pièce d'identité (Recto/Verso)</option>
              <option value="PREUVE_PAIEMENT">Preuve de paiement (Reçu, Virement)</option>
              <option value="CONTRAT_PROMESSE">Contrat ou Promesse de vente</option>
              <option value="CORRESPONDANCES">Correspondances (Emails, Lettres)</option>
              <option value="AUTRES">Autres documents</option>
            </select>
            
            <label className="flex flex-col items-center justify-center w-full h-32 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">{uploading ? "Upload en cours..." : "Cliquez pour uploader"}</span>
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold mb-4">Documents déjà transmis</h3>
          {dossier?.documents?.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Aucun document pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {dossier?.documents?.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-brand-primary" />
                    <div>
                      <p className="text-sm font-bold truncate max-w-[150px]">{doc.fileName}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{doc.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleDownload(doc.id, doc.fileName)}
                      className="p-2 text-slate-400 hover:text-brand-primary transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Link 
          to="/tableau-de-bord/dossier"
          className="text-slate-500 font-bold hover:underline"
        >
          ← Précédent
        </Link>
        <Link 
          to="/tableau-de-bord/revue"
          className="flex items-center space-x-2 bg-brand-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20"
        >
          <span>Suivant : Revue & Soumission</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
