import React from "react";
import SEO from "../components/SEO";
import { ExternalLink, FileText, Info } from "lucide-react";
import { api } from "../services/api";

export default function Resources() {
  const [resources, setResources] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const staticResources = [
    {
      title: "Enquête Média : Vente fictive de terrains",
      source: "Enquête Média",
      url: "https://enquetemedia.info/enquete-vente-fictive-de-terrains-une-mutuelle-du-ministere-des-finances-accusee-descroquerie-organisee/",
      description: "Une enquête détaillée sur les accusations d'escroquerie organisée visant la mutuelle.",
      date: "2024"
    },
    {
      title: "Enquête CrocInfos : Affaire Coulibaly Lacina vs MUTADAFP",
      source: "CrocInfos",
      url: "https://crocinfos.net/article/2342-enquete-affaire-coulibaly-lacina-vs-mutadafp-une-presumee-escroquerie-fonciere-au-ministere-des-finances",
      description: "Une enquête sur une présumée escroquerie foncière au ministère des finances impliquant la MUTADAFP.",
      date: "2024"
    }
  ];

  React.useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await api.get("/public/resources");
      // Map API blog posts to resource format
      const apiResources = data.map((post: any) => ({
        title: post.title,
        source: post.category,
        url: post.sourceUrl || "#",
        description: post.excerpt || post.content.substring(0, 150) + "...",
        date: new Date(post.createdAt).getFullYear().toString()
      }));
      setResources([...staticResources, ...apiResources]);
    } catch (err) {
      console.error(err);
      setResources(staticResources);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title="Ressources et Sources Publiques" 
        description="Consultez les sources publiques, articles d'enquête et documents officiels concernant l'affaire MUTADAFP et la vente de terrains fictifs au ministère de l'économie et des finances de Côte d'Ivoire."
        url="/ressources"
      />

      <div className="mb-12">
        <h1 className="text-4xl text-brand-primary mb-4">Ressources & Sources</h1>
        <p className="text-slate-600 max-w-3xl">
          Nous centralisons ici les informations publiques et les enquêtes de presse. 
          Ces éléments servent de base contextuelle à notre action collective.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-xl">
        <div className="flex items-start space-x-4">
          <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Note d'usage :</strong> Le collectif ne s'approprie pas ces contenus. 
            Nous citons les sources originales et encourageons la lecture complète des articles sur les sites des éditeurs. 
            La présomption d'innocence s'applique à toutes les parties citées dans ces articles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resources.map((res, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-brand-primary mb-4">
              <FileText className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">{res.source}</span>
            </div>
            <h2 className="text-xl text-brand-primary mb-4 font-bold">{res.title}</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{res.description}</p>
            <a 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-brand-primary font-bold hover:underline"
            >
              Lire l'article complet <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-slate-900 text-white rounded-3xl text-center">
        <h2 className="text-2xl mb-6">Vous avez d'autres sources ?</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Si vous disposez de liens vers des articles de presse officiels ou des communiqués publics, 
          n'hésitez pas à nous les transmettre via le formulaire de contact.
        </p>
        <button className="bg-white text-brand-primary px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors">
          Proposer une ressource
        </button>
      </div>
    </div>
  );
}
