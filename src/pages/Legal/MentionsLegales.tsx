import React from "react";
import SEO from "../../components/SEO";

export default function MentionsLegales() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 prose prose-slate">
      <SEO 
        title="Mentions Légales" 
        description="Mentions légales de la plateforme officielle du Collectif des Victimes de la MUTADAFP."
        url="/mentions-legales"
      />
      <h1 className="text-3xl font-serif font-bold mb-8">Mentions Légales</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">1. Éditeur de la plateforme</h2>
        <p>
          Cette plateforme est éditée par le Collectif des Victimes MUTADAFP, 
          une association de fait regroupant des personnes se déclarant victimes de faits présumés d'escroquerie.
        </p>
        <p>Contact : contact@collectif-mutadafp.org</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">2. Hébergement</h2>
        <p>
          La plateforme est hébergée sur des serveurs sécurisés conformes aux normes de protection des données (Google Cloud Platform). Les données (messages, dossiers, logs) sont stockées dans une base de données relationnelle sécurisée (PostgreSQL) garantissant la traçabilité et l'intégrité des informations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">3. Propriété Intellectuelle</h2>
        <p>
          Les contenus originaux (textes, logos, structure) sont la propriété du collectif. 
          Les sources externes citées restent la propriété de leurs auteurs respectifs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">4. Responsabilité</h2>
        <p>
          Le collectif décline toute responsabilité quant à l'exactitude des témoignages déposés par les utilisateurs. 
          Chaque utilisateur est responsable des informations et documents qu'il transmet.
        </p>
      </section>
    </div>
  );
}
