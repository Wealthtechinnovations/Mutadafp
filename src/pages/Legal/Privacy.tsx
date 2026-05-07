import React from "react";
import SEO from "../../components/SEO";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 prose prose-slate">
      <SEO 
        title="Politique de Confidentialité" 
        description="Politique de confidentialité et protection des données (RGPD) du Collectif des Victimes de la MUTADAFP."
        url="/politique-confidentialite"
      />
      <h1 className="text-3xl font-serif font-bold mb-8">Politique de Confidentialité (RGPD)</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">1. Collecte des données</h2>
        <p>
          Nous collectons les données suivantes : Nom, Prénom, Email, Date de naissance, Pays, 
          ainsi que les documents justificatifs (dont pièces d'identité) et témoignages.
          Nous collectons également les messages internes échangés avec l'administration, les notifications système, et les journaux d'actions (logs) pour des raisons de sécurité et d'audit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">2. Finalité du traitement</h2>
        <p>
          Ces données sont collectées dans le but exclusif de constituer un dossier collectif 
          visant à défendre les intérêts des membres, à coordonner d'éventuelles actions juridiques, à communiquer avec notre équipe administrative via la messagerie interne, et à assurer la sécurité et la traçabilité des actions sur la plateforme.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">3. Sécurité</h2>
        <p>
          Les pièces d'identité et documents sensibles sont chiffrés et stockés sur des serveurs sécurisés. 
          L'accès est strictement limité aux administrateurs habilités.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">4. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement 
          et de portabilité de vos données. Vous pouvez exercer ces droits depuis vos paramètres 
          ou en nous contactant.
        </p>
      </section>
    </div>
  );
}
