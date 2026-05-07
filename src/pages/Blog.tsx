import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { Calendar, User, ArrowRight, Search, ExternalLink } from "lucide-react";
import { api } from "../services/api";

export default function Blog() {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // For now, using mock data if API fails or is empty
      const data = await api.get("/public/blog");
      setPosts(data.length > 0 ? data : [
        {
          id: "1",
          title: "L'importance de l'action collective dans l'affaire MUTADAFP",
          excerpt: "Découvrez pourquoi s'unir est la seule solution pour obtenir gain de cause face aux promesses non tenues...",
          category: "Analyse",
          createdAt: new Date().toISOString(),
          author: { firstName: "Eric", lastName: "Diby" },
          slug: "importance-action-collective"
        },
        {
          id: "2",
          title: "Point sur les procédures juridiques en cours",
          excerpt: "Un résumé des dernières avancées judiciaires et des prochaines étapes pour le collectif...",
          category: "Juridique",
          createdAt: new Date().toISOString(),
          author: { firstName: "Eric", lastName: "Diby" },
          slug: "point-procedures-juridiques"
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <SEO 
        title="Blog & Actualités" 
        description="Suivez les dernières actualités et analyses sur l'affaire MUTADAFP, la vente de terrains fictifs et les actions du collectif des victimes en Côte d'Ivoire."
        url="/blog"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-brand-primary mb-4 font-serif">Actualités & Analyses</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Restez informé des dernières avancées de notre combat et accédez à des analyses détaillées sur la situation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${post.slug}/600/400`} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-brand-accent text-brand-primary text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  {post.category}
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center text-xs text-slate-400 mb-4 space-x-4">
                  <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center"><User className="h-3 w-3 mr-1" /> ADMIN</span>
                </div>
                <h2 className="text-xl font-bold text-brand-primary mb-4 group-hover:text-brand-accent transition-colors">
                  {post.category === 'RESSOURCE' && post.sourceUrl ? (
                    <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      {post.title} <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : (
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  )}
                </h2>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                {post.category === 'RESSOURCE' && post.sourceUrl ? (
                  <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold text-sm flex items-center hover:translate-x-1 transition-transform">
                    Consulter la ressource <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <Link to={`/blog/${post.slug}`} className="text-brand-primary font-bold text-sm flex items-center hover:translate-x-1 transition-transform">
                    Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
