import React from "react";
import SEO from "../components/SEO";
import { motion } from "motion/react";
import { Clock, AlertCircle } from "lucide-react";

export default function History() {
  const timeline = [
    {
      date: "2020 - 2022",
      title: "Période de cotisations massives",
      description: "Selon de nombreux témoignages, une campagne de vente de terrains a été lancée auprès des membres de la mutuelle.",
      type: "internal"
    },
    {
      date: "2023",
      title: "Premières alertes et retards",
      description: "Les premiers délais de livraison ne sont pas respectés. Des membres commencent à s'organiser de manière informelle.",
      type: "internal"
    },
    {
      date: "2024",
      title: "Publication de l'enquête média (Enquête Média)",
      description: "Un article d'investigation met en lumière des irrégularités présumées dans la gestion des fonds fonciers.",
      type: "external"
    },
    {
      date: "2024",
      title: "Enquête CrocInfos : Affaire Coulibaly Lacina vs MUTADAFP",
      description: "Une nouvelle enquête de CrocInfos révèle des détails sur une présumée escroquerie foncière impliquant la mutuelle.",
      type: "external"
    },
    {
      date: "Mars 2026",
      title: "Lancement de la plateforme collective",
      description: "Mise en place de cet outil pour centraliser les dossiers et coordonner l'action des victimes déclarées.",
      type: "internal"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title="Historique et Chronologie des Faits" 
        description="Chronologie prudente des événements liés à l'affaire MUTADAFP, la vente de terrains fictifs à Abidjan, basée sur les témoignages et les sources publiques."
        url="/historique"
      />

      <div className="mb-16">
        <h1 className="text-4xl text-brand-primary mb-4">Historique des Événements</h1>
        <p className="text-slate-600 max-w-3xl">
          Cette chronologie est établie sur la base des témoignages recueillis et des informations publiques disponibles. 
          Elle est sujette à évolution au fur et à mesure de la constitution des dossiers.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-12 pb-12">
        {timeline.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative pl-8 md:pl-12"
          >
            <div className={`absolute -left-[11px] top-0 h-5 w-5 rounded-full border-4 border-white ${item.type === 'external' ? 'bg-brand-accent' : 'bg-brand-primary'}`}></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-400 mb-2">
                <Clock className="h-4 w-4" />
                <span>{item.date}</span>
              </div>
              <h2 className="text-xl text-brand-primary mb-3 font-bold">{item.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-slate-50 p-8 rounded-2xl border border-slate-200 flex items-start space-x-4">
        <AlertCircle className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
        <p className="text-xs text-slate-500 italic leading-relaxed">
          <strong>Prudence Juridique :</strong> Les faits mentionnés ci-dessus sont présentés comme des "témoignages" ou des "allégations" 
          jusqu'à ce qu'une décision de justice définitive intervienne. Le collectif respecte la présomption d'innocence 
          et ne se substitue pas aux autorités compétentes.
        </p>
      </div>
    </div>
  );
}
