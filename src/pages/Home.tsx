import React from "react";
import SEO from "../components/SEO";
import { motion } from "motion/react";
import { Shield, FileCheck, Users, Lock, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <SEO 
        title="Accueil" 
        description="Plateforme officielle du collectif des victimes de la MUTADAFP. Déposez votre dossier, rejoignez l'entraide et suivez l'évolution de l'affaire de vente de terrains fictifs à Abidjan, Côte d'Ivoire."
        keywords="mutadafp, ministère de l'économie et des finances de Côte d'Ivoire, vente de terrains fictifs, Abidjan Côte d'Ivoire, collectif victimes, dossier terrains, cotisations, entraide, recours"
        url="/"
      />

      {/* Hero Section */}
      <section className="relative bg-brand-primary text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl mb-6 leading-tight">
              Le collectif des victimes <br />
              <span className="text-brand-accent italic">de la MUTADAFP</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Face à l'affaire des ventes fictives de terrains impliquant la mutuelle du ministère des Finances, 
              notre collectif, créé en Mars 2026, se mobilise pour recenser toutes les victimes en Côte d'Ivoire et à l'international.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/inscription" className="bg-brand-accent text-brand-primary px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center hover:scale-105 transition-transform">
                Déposer mon dossier <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/historique" className="border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                Notre combat
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-amber-900 font-bold text-lg mb-2">Avertissement Important</h2>
              <p className="text-amber-800 text-sm leading-relaxed">
                Cette plateforme est un outil d'organisation citoyenne né de la nécessité de faire face à une situation d'escroquerie présumée d'envergure. 
                Nous ne sommes ni un tribunal, ni un service de police. Nous agissons pour la défense des intérêts des souscripteurs lésés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Purpose Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl text-brand-primary mb-8 font-serif">Pourquoi rejoindre le collectif ?</h2>
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>
                  Créé en <strong>Mars 2026</strong>, le Collectif des Victimes MUTADAFP est né de la nécessité de fédérer les voix des centaines de souscripteurs lésés. 
                  Qu'il s'agisse d'agents du ministère des Finances ou de citoyens ayant investi leurs économies, 
                  tous partagent le même constat : des promesses de terrains jamais honorées malgré des versements massifs.
                </p>
                <p>
                  L'enquête média a révélé des mécanismes de ventes fictives de terrains, laissant de nombreuses familles dans le désarroi. 
                  Seul, il est difficile de faire face à une telle structure. <strong>L'union est notre seule force.</strong>
                </p>
                <p>
                  Notre objectif est de recenser chaque victime, qu'elle réside en <strong>Côte d'Ivoire</strong> ou au sein de la <strong>diaspora</strong>, 
                  afin de constituer une base de données solide et incontestable pour engager des actions communes, 
                  qu'elles soient juridiques, médiatiques ou administratives.
                </p>
              </div>
              <div className="mt-10 p-6 bg-slate-50 rounded-2xl border-l-4 border-brand-accent">
                <p className="font-bold text-brand-primary italic">
                  "Nous ne demandons que justice : soit nos terrains, soit le remboursement intégral de nos cotisations avec intérêts."
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/justice/800/600" 
                alt="Justice et Solidarité" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<FileCheck className="h-8 w-8 text-brand-primary" />}
              title="Dossier Structuré"
              description="Un parcours guidé pour constituer un dossier complet avec toutes les pièces justificatives nécessaires."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-brand-primary" />}
              title="Action Collective"
              description="L'union fait la force. Centraliser les dossiers permet de donner une dimension réelle à l'ampleur des faits."
            />
            <FeatureCard 
              icon={<Lock className="h-8 w-8 text-brand-primary" />}
              title="Sécurité & RGPD"
              description="Vos données sensibles et pièces d'identité sont chiffrées et protégées selon les normes les plus strictes."
            />
          </div>
        </div>
      </section>

      {/* Resources Preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-16 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl text-brand-primary mb-6">Sources et Enquêtes Publiques</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Consultez les articles de presse et les rapports publics documentant les faits présumés. 
                Nous référençons les sources officielles pour une information transparente.
              </p>
              <Link to="/ressources" className="text-brand-primary font-bold flex items-center hover:underline">
                Consulter les ressources <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex-1 bg-slate-100 rounded-2xl p-6 border border-slate-200">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-brand-primary">
                  <p className="text-xs text-slate-500 mb-1">Enquête Média</p>
                  <p className="font-bold text-sm">Vente fictive de terrains : une mutuelle accusée d'escroquerie...</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-slate-300 opacity-60">
                  <p className="text-xs text-slate-500 mb-1">Source Officielle</p>
                  <p className="font-bold text-sm">Rapport d'audit interne (en attente de publication)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl text-brand-primary mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
