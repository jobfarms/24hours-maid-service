import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
  image?: string;
  tags: string[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'How to Choose the Right Domestic Help for Your Home',
    slug: 'choose-domestic-help',
    excerpt: 'A comprehensive guide to finding and hiring the perfect domestic help that matches your needs and budget.',
    content: `Finding the right domestic help is crucial for maintaining a comfortable home. Here are key factors to consider...`,
    author: 'Sarah Johnson',
    date: '2024-01-15',
    category: 'Tips & Guides',
    readTime: 5,
    tags: ['hiring', 'domestic-help', 'tips'],
  },
  {
    id: '2',
    title: 'Top 10 Qualities to Look for in a Professional Maid',
    slug: 'qualities-professional-maid',
    excerpt: 'Discover the essential qualities that make a professional maid reliable, trustworthy, and efficient.',
    content: `A professional maid should possess several key qualities that ensure your home is well-maintained...`,
    author: 'Michael Chen',
    date: '2024-01-12',
    category: 'Hiring Tips',
    readTime: 6,
    tags: ['maid', 'professional', 'qualities'],
  },
  {
    id: '3',
    title: 'Managing Your Household Budget with Professional Services',
    slug: 'household-budget-management',
    excerpt: 'Learn how to effectively budget for domestic services without compromising on quality.',
    content: `Budgeting for household services requires careful planning and understanding of market rates...`,
    author: 'Emma Williams',
    date: '2024-01-10',
    category: 'Budget Tips',
    readTime: 7,
    tags: ['budget', 'cost-effective', 'planning'],
  },
  {
    id: '4',
    title: 'Safety and Security: Vetting Your Domestic Help',
    slug: 'safety-vetting-domestic-help',
    excerpt: 'Essential steps to ensure the safety and security of your home and family when hiring domestic help.',
    content: `Safety is paramount when inviting domestic help into your home. Here's how to properly vet candidates...`,
    author: 'David Kumar',
    date: '2024-01-08',
    category: 'Safety',
    readTime: 8,
    tags: ['safety', 'security', 'vetting'],
  },
  {
    id: '5',
    title: 'The Benefits of Professional Childcare Services',
    slug: 'professional-childcare-benefits',
    excerpt: 'Explore how professional nannies and childcare providers can support your family\'s needs.',
    content: `Professional childcare services offer numerous benefits for working parents and families...`,
    author: 'Lisa Anderson',
    date: '2024-01-05',
    category: 'Childcare',
    readTime: 6,
    tags: ['childcare', 'nanny', 'family'],
  },
];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      {/* Hero Section */}
      <motion.div
        className="py-16 px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent mb-4"
          variants={itemVariants}
        >
          24Hours Blog
        </motion.h1>
        <motion.p className="text-xl text-gray-400 max-w-2xl mx-auto" variants={itemVariants}>
          Tips, guides, and insights for finding and managing the perfect domestic help
        </motion.p>
      </motion.div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <motion.div
          className="mb-12 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Search */}
          <motion.div className="relative" variants={itemVariants}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </motion.div>

          {/* Categories */}
          <motion.div className="flex flex-wrap gap-3" variants={itemVariants}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                !selectedCategory
                  ? 'bg-cyan-500 text-white'
                  : 'backdrop-blur-lg bg-white/3 border border-white/5 text-gray-300 hover:bg-white/5'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-white'
                    : 'backdrop-blur-lg bg-white/3 border border-white/5 text-gray-300 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredPosts.map((post) => (
            <motion.article
              key={post.id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center overflow-hidden">
                <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform">
                  {post.category === 'Tips & Guides' && '💡'}
                  {post.category === 'Hiring Tips' && '👥'}
                  {post.category === 'Budget Tips' && '💰'}
                  {post.category === 'Safety' && '🔒'}
                  {post.category === 'Childcare' && '👶'}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.readTime} min read</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all group/btn">
                  <span>Read Article</span>
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {filteredPosts.length === 0 && (
          <motion.div className="text-center py-12" variants={itemVariants}>
            <p className="text-gray-400 text-lg">No articles found matching your search.</p>
          </motion.div>
        )}
      </div>

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: '24Hours Maid Services Blog',
          description: 'Tips, guides, and insights for finding and managing domestic help',
          url: 'https://24hoursmaid.com/blog',
          blogPost: BLOG_POSTS.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            keywords: post.tags.join(', '),
          })),
        })}
      </script>
    </div>
  );
}
