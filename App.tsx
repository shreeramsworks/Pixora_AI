
import React, { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import ImageGrid from './components/ImageGrid';
import ResultsView from './components/ResultsView';
import Logo from './components/Logo';
import ChatBot from './components/ChatBot';
import { UploadedFile, AnalysisResult } from './types';
import { analyzeImageBatch } from './services/geminiService';

// --- Types for Routing ---
type View = 'home' | 'shopify' | 'etsy' | 'amazon' | 'guide' | 'blog' | 'cases' | 'help' | 'privacy' | 'terms' | 'cookie' | 'how-it-works';

// --- Route Mapping ---
const VIEW_TO_PATH: Record<View, string> = {
  'home': '/',
  'shopify': '/shopify',
  'etsy': '/etsy',
  'amazon': '/amazon',
  'guide': '/guide',
  'blog': '/blog',
  'cases': '/case-studies',
  'help': '/help',
  'privacy': '/privacy',
  'terms': '/terms',
  'cookie': '/cookies',
  'how-it-works': '/how-it-works'
};

// --- Blog Data ---
const BLOG_POSTS = [
  {
    id: 'time-saving-automation',
    title: 'The Math of Automation: Saving 20+ Hours/Week',
    readTime: '5 min read',
    date: 'Oct 24, 2024',
    category: 'Productivity',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    summary: 'Manual image optimization is a silent productivity killer. We break down the exact math of how AI transforms a 40-hour workflow into a 15-minute task.',
    content: (
      <>
        <p className="lead text-xl text-slate-600 mb-8 font-light leading-relaxed">
          If you are an e-commerce seller, you know the drill. You finish a photoshoot, and you are staring at a folder of 500 images named <code>DSC_0923.jpg</code> through <code>DSC_1423.jpg</code>. What happens next determines whether you go home at 5 PM or midnight.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">The Invisible Time Sink</h2>
        <p className="text-slate-600 mb-4">
          Most sellers underestimate the time cost of "proper" image SEO. Let's look at the breakdown for a single product with 5 variant images:
        </p>
        <ul className="list-disc pl-6 space-y-3 text-slate-600 mb-8 marker:text-indigo-500">
          <li><strong>Renaming (30 sec):</strong> Thinking of a descriptive name and typing <code>mens-leather-jacket-vintage-brown-front.jpg</code>.</li>
          <li><strong>Alt Text (45 sec):</strong> Writing a unique, accessible description for screen readers and Google.</li>
          <li><strong>Title & Metadata (60 sec):</strong> formatting titles for Amazon or Etsy tags.</li>
          <li><strong>Context Switching (15 sec):</strong> Moving between files and spreadsheets.</li>
        </ul>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-bold text-orange-900">The Reality Check</h3>
          <p className="text-orange-800 mt-2">
            2.5 minutes per image × 5 images per product = <strong>12.5 minutes per product</strong>.<br/>
            For a modest batch of 50 new products? <strong>That is 10.4 hours of non-stop typing.</strong>
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">How Pixora AI Reduces This to Minutes</h2>
        <p className="text-slate-600 mb-4">
          Automation isn't just about speed; it's about eliminating decision fatigue. Our AI analyzes the pixel data of your images to understand context, material, and style instantly.
        </p>
        
        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">1. Visual Recognition</h3>
        <p className="text-slate-600 mb-4">
          Instead of you typing "red cotton dress," the AI sees the image and identifies "Crimson Red," "A-Line Silhouette," "Midi Length," and "Organic Cotton Texture." It builds a keyword profile in milliseconds.
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">2. Batch Processing</h3>
        <p className="text-slate-600 mb-4">
          You upload 200 images at once. The system processes them in parallel. What took you 10 hours now takes the AI about 3 minutes to analyze and generate:
        </p>
        
        <div className="bg-indigo-900 text-white p-8 rounded-2xl my-8 text-center shadow-xl shadow-indigo-900/20">
            <h4 className="text-2xl font-bold mb-4 tracking-tight">The ROI of Your Time</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                    <p className="text-indigo-200 text-sm uppercase tracking-wide font-semibold mb-2">Manual Workflow</p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2"><span className="text-red-400">×</span> 10 hours/week data entry</li>
                        <li className="flex items-center gap-2"><span className="text-red-400">×</span> High risk of typos</li>
                        <li className="flex items-center gap-2"><span className="text-red-400">×</span> Inconsistent keywords</li>
                    </ul>
                </div>
                <div className="bg-emerald-500/20 p-4 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                     <p className="text-emerald-300 text-sm uppercase tracking-wide font-semibold mb-2">AI Workflow</p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 15 minutes/week review</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 100% Format consistency</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Data-driven keywords</li>
                    </ul>
                </div>
             </div>
        </div>

        <p className="text-slate-600">
          Stop being a data entry clerk for your own business. Let Pixora AI handle the grunt work so you can focus on growth.
        </p>
      </>
    )
  },
  {
    id: 'visual-search-seo',
    title: 'Visual Search is the New Battleground',
    readTime: '4 min read',
    date: 'Oct 20, 2024',
    category: 'SEO Strategy',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    summary: 'Google Lens and Pinterest are changing how people shop. Standard keywords are no longer enough. Learn how semantic image attributes help you rank in visual search results.',
    content: (
      <>
        <p className="lead text-xl text-slate-600 mb-8 font-light leading-relaxed">
          For a decade, e-commerce SEO was about matching text to text. A user types "running shoes," and Google looks for pages with the text "running shoes." In 2024, that model is breaking down.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">The Rise of Visual Search</h2>
        <p className="text-slate-600 mb-4">
          Tools like Google Lens, Pinterest Lens, and Amazon Style Snap allow users to search <i>with</i> images. Furthermore, standard Google Images search is becoming increasingly semantic. Google doesn't just read your text; it recognizes what is in your photo.
        </p>

        <div className="my-8 rounded-xl overflow-hidden shadow-lg border border-slate-100">
             <img src="https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=1000" alt="Visual Search Analytics" className="w-full h-64 object-cover" loading="lazy" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">The Gap: When Image and Text Don't Match</h2>
        <p className="text-slate-600 mb-4">
          This is the most common SEO failure we see.
          <br/>
          <strong>Scenario:</strong> You sell a "Boho Chic Rattan Chair."
          <br/>
          <strong>The Problem:</strong> Your filename is <code>IMG_221.jpg</code> and your Alt text is just "chair."
          <br/>
          <strong>The Penalty:</strong> Google's vision AI sees a "woven wooden chair." It sees your text just says "chair." It sees your filename is gibberish. It lacks the confidence to rank you for the high-value term "Rattan Boho Chair."
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">How Semantic Tagging Fixes This</h2>
        <p className="text-slate-600 mb-4">
          Pixora AI bridges this gap by generating metadata that describes the <i>visual reality</i> of the product, aligning it with search intent.
        </p>
        <ul className="list-disc pl-6 space-y-3 text-slate-600 mb-6 marker:text-indigo-500">
          <li><strong>Material Detection:</strong> We explicitly tag "Velvet," "Silk," "Denim," etc.</li>
          <li><strong>Style Attributes:</strong> We identify "Minimalist," "Industrial," "Y2K," helping you rank for aesthetic-based searches.</li>
          <li><strong>Contextual Usage:</strong> We generate keywords like "Office Decor" or "Wedding Guest" based on the image scene.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">Dominating the Shopping Tab</h2>
        <p className="text-slate-600">
          The Google Shopping tab is highly visual. Products with enriched structured data (which we help generate for Shopify Metafields) get better placement. By automating this level of detail, you ensure every single product in your catalog is fighting for top visibility, not just your best sellers.
        </p>
      </>
    )
  },
  {
    id: 'multi-platform-scaling',
    title: 'Scaling to 10,000 SKUs: Multi-Channel Metadata',
    readTime: '6 min read',
    date: 'Oct 15, 2024',
    category: 'Scaling',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=800',
    summary: 'Trying to sell on Amazon, Etsy, and Shopify simultaneously? Discover how to generate platform-specific SEO assets from a single image upload without losing your mind.',
    content: (
      <>
        <p className="lead text-xl text-slate-600 mb-8 font-light leading-relaxed">
          The holy grail for e-commerce brands is "Omnichannel" presence. But the operational reality of selling on Shopify, Amazon, and Etsy simultaneously is a nightmare of conflicting requirements.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">The Platform Conflict</h2>
        <p className="text-slate-600 mb-4">
          You cannot simply copy-paste your product data. Each platform has a different "language" and ranking algorithm.
        </p>

        <div className="overflow-hidden rounded-xl border border-slate-200 my-8 shadow-sm">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-left text-sm uppercase">
                <th className="py-4 px-6 border-b font-bold">Platform</th>
                <th className="py-4 px-6 border-b font-bold">Title Strategy</th>
                <th className="py-4 px-6 border-b font-bold">Key Constraint</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 text-sm">
              <tr className="border-b hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-900">Amazon</td>
                <td className="py-4 px-6">Feature-heavy, keyword stuffing allowed (200 chars)</td>
                <td className="py-4 px-6">Strict white background rules</td>
              </tr>
              <tr className="border-b hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-900">Etsy</td>
                <td className="py-4 px-6">Short, emotive, front-loaded for thumbnails</td>
                <td className="py-4 px-6">Must use exactly 13 tags</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-900">Shopify</td>
                <td className="py-4 px-6">Readable, brand-focused (60-70 chars)</td>
                <td className="py-4 px-6">Alt text & Handle structure matter most</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">The "One-to-Many" Solution</h2>
        <p className="text-slate-600 mb-4">
          Manual editing means rewriting the listing three times. Pixora AI adopts a "One-to-Many" architecture. 
        </p>
        <p className="text-slate-600 mb-4">
          You upload the product image <strong>once</strong>. Our AI agents then branch off to generate specific assets for each platform simultaneously:
        </p>
        <ul className="list-disc pl-6 space-y-3 text-slate-600 mb-6 marker:text-indigo-500">
          <li><strong>Agent A (Amazon):</strong> Generates 5 benefit-driven bullet points and checks for backend search term keywords.</li>
          <li><strong>Agent B (Etsy):</strong> Generates a CSV of 13 comma-separated tags focusing on "gift" and "style" keywords.</li>
          <li><strong>Agent C (Shopify):</strong> Generates a clean URL handle and descriptive alt text for Google Images.</li>
        </ul>
      </>
    )
  }
];

// --- Legal Content ---
const PRIVACY_CONTENT = (
  <div className="space-y-6 text-slate-600">
    <p>Last updated: October 24, 2024</p>
    <p>At Pixora AI, accessible from pixora.ai, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Pixora AI and how we use it.</p>
    
    <h3 className="text-xl font-bold text-slate-900 mt-6">Information We Collect</h3>
    <p>We collect information you provide directly to us when you upload images for analysis. This includes the image data itself and any metadata associated with it. We do not permanently store your uploaded images; they are processed in memory and discarded shortly after analysis.</p>

    <h3 className="text-xl font-bold text-slate-900 mt-6">How We Use Your Information</h3>
    <p>We use the information we collect to:</p>
    <ul className="list-disc pl-6 space-y-2">
        <li>Provide, operate, and maintain our website</li>
        <li>Improve, personalize, and expand our website</li>
        <li>Understand and analyze how you use our website</li>
        <li>Develop new products, services, features, and functionality</li>
    </ul>

    <h3 className="text-xl font-bold text-slate-900 mt-6">Log Files</h3>
    <p>Pixora AI follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>
  </div>
);

const TERMS_CONTENT = (
  <div className="space-y-6 text-slate-600">
     <p>Last updated: October 24, 2024</p>
     <h3 className="text-xl font-bold text-slate-900 mt-6">1. Agreement to Terms</h3>
     <p>By accessing our website at pixora.ai, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

     <h3 className="text-xl font-bold text-slate-900 mt-6">2. Use License</h3>
     <p>Permission is granted to temporarily download one copy of the materials (information or software) on Pixora AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
     
     <h3 className="text-xl font-bold text-slate-900 mt-6">3. Disclaimer</h3>
     <p>The materials on Pixora AI's website are provided on an 'as is' basis. Pixora AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
     
     <h3 className="text-xl font-bold text-slate-900 mt-6">4. Limitations</h3>
     <p>In no event shall Pixora AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pixora AI's website.</p>
  </div>
);

const COOKIE_CONTENT = (
    <div className="space-y-6 text-slate-600">
        <p>Last updated: October 24, 2024</p>
        <p>This Cookie Policy explains how Pixora AI uses cookies and similar technologies to recognize you when you visit our website.</p>
        
        <h3 className="text-xl font-bold text-slate-900 mt-6">What are cookies?</h3>
        <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

        <h3 className="text-xl font-bold text-slate-900 mt-6">How we use cookies</h3>
        <p>We use cookies for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential cookies:</strong> These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas.</li>
            <li><strong>Performance and functionality cookies:</strong> These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use.</li>
            <li><strong>Analytics and customization cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are.</li>
        </ul>
    </div>
);

// --- SEO Helpers ---
const updateHead = (title: string, description: string) => {
  document.title = `${title} | Pixora AI`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  } else {
    const meta = document.createElement('meta');
    meta.name = "description";
    meta.content = description;
    document.head.appendChild(meta);
  }
};

// --- 3D Tilt Component for Feature Cards ---
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [transition, setTransition] = useState('transform 0.1s ease-out');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; // Sensitivity
    const y = (e.clientY - top - height / 2) / 25;
    setTransform(`perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.02)`);
    setTransition('transform 0.1s ease-out');
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)');
    setTransition('transform 0.5s ease-out');
  };

  return (
    <div 
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition }}
    >
      {children}
    </div>
  );
};

// --- 3D Tilt Component for Navigation Links ---
const Nav3DLink: React.FC<{ href: string; onClick: (e: React.MouseEvent) => void; children: React.ReactNode }> = ({ href, onClick, children }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 4; // High sensitivity for small text items
    const y = (e.clientY - top - height / 2) / 4;
    setTransform(`perspective(500px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.1)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(500px) rotateY(0deg) rotateX(0deg) scale(1)');
  };

  return (
    <a
      href={href}
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.1s ease-out' }}
      className="relative px-4 py-2 rounded-xl text-base font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200 inline-block will-change-transform"
    >
      {children}
    </a>
  );
};

// --- Components (Memoized for Performance) ---

const Navbar = memo(({ onNavigate, onStartBatch }: { onNavigate: (view: View) => void, onStartBatch: () => void }) => (
  <nav className="fixed w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm supports-[backdrop-filter]:bg-white/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <a 
          href="/"
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
        >
          <div className="relative">
            <div className="w-14 h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Logo className="w-10 h-10 filter drop-shadow-sm" />
            </div>
          </div>
          <div className="flex flex-col">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none block group-hover:text-indigo-600 transition-colors">
                Pixora AI
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none block mt-1">
                E-commerce Opt
              </span>
          </div>
        </a>
        <div className="hidden md:flex items-center gap-2">
          <Nav3DLink href="/shopify" onClick={(e) => { e.preventDefault(); onNavigate('shopify'); }}>Shopify</Nav3DLink>
          <Nav3DLink href="/etsy" onClick={(e) => { e.preventDefault(); onNavigate('etsy'); }}>Etsy</Nav3DLink>
          <Nav3DLink href="/amazon" onClick={(e) => { e.preventDefault(); onNavigate('amazon'); }}>Amazon</Nav3DLink>
          
          <div className="h-6 w-px bg-slate-200 mx-4"></div>
          
          <button 
            onClick={onStartBatch}
            className="text-base font-bold text-white bg-slate-900 px-6 py-2.5 rounded-full hover:bg-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 border border-transparent"
          >
            Start Free Batch
          </button>
        </div>
      </div>
    </div>
  </nav>
));

const Features = memo(() => (
    <div className="py-24 bg-indigo-50/40 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.1] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-xs mb-3">Why Choose Pixora?</h2>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Turn your product catalog into a <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">SEO Traffic Machine</span>
                </h3>
                <p className="text-lg text-slate-600">
                    Stop manually tagging images. Our multi-modal AI understands your products better than a human tagger and works 100x faster.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        title: "Visual Recognition",
                        desc: "Detects material, color, style, and context automatically from pixels.",
                        icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ),
                        color: "from-blue-100 to-blue-200 text-blue-700"
                    },
                    {
                        title: "Platform Native",
                        desc: "Generates Shopify handles, Etsy tags, and Amazon bullets simultaneously.",
                        icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        ),
                        color: "from-purple-100 to-purple-200 text-purple-700"
                    },
                    {
                        title: "SEO Best Practices",
                        desc: "Strict adherence to Google, A9, and Etsy ranking algorithms.",
                        icon: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        ),
                        color: "from-emerald-100 to-emerald-200 text-emerald-700"
                    }
                ].map((feature, i) => (
                    <TiltCard key={i} className="group hover-glow p-8 rounded-2xl bg-white border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/30 transition-shadow duration-300">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            {feature.icon}
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                    </TiltCard>
                ))}
            </div>
        </div>
    </div>
));

const TrustedBy = memo(() => (
    <div className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Trusted by 2,000+ Modern Brands</p>
             <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                 {/* Professional SVG Logos */}
                 <svg className="h-8" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Acme Corp">
                    <path d="M10 25L15 5L20 25H25L30 5L35 25H28L26 18L24 25H22L20 18L18 25H10Z" fill="currentColor" className="text-slate-800"/>
                    <circle cx="5" cy="15" r="5" fill="currentColor" className="text-indigo-600"/>
                    <rect x="40" y="5" width="5" height="20" fill="currentColor" className="text-slate-800"/>
                    <rect x="50" y="5" width="15" height="5" fill="currentColor" className="text-slate-800"/>
                    <rect x="50" y="12" width="10" height="5" fill="currentColor" className="text-slate-800"/>
                    <rect x="50" y="20" width="15" height="5" fill="currentColor" className="text-slate-800"/>
                 </svg>

                 <svg className="h-7" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NextGen">
                    <path d="M10 5L20 25H26L36 5H30L23 19L16 5H10Z" fill="currentColor" className="text-slate-800"/>
                    <path d="M40 5H55V10H45V12H53V17H45V20H55V25H40V5Z" fill="currentColor" className="text-slate-800"/>
                    <circle cx="80" cy="15" r="10" stroke="currentColor" strokeWidth="4" className="text-slate-800"/>
                    <path d="M100 5H105V25H100V5Z" fill="currentColor" className="text-indigo-500"/>
                 </svg>

                 <svg className="h-9" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Starlight">
                     <path d="M15 15L5 25L25 25L15 15Z" fill="currentColor" className="text-indigo-600"/>
                     <path d="M15 15L25 5L5 5L15 15Z" fill="currentColor" className="text-slate-800"/>
                     <rect x="35" y="5" width="5" height="20" fill="currentColor" className="text-slate-800"/>
                     <circle cx="55" cy="15" r="8" stroke="currentColor" strokeWidth="4" className="text-slate-800"/>
                 </svg>

                 <svg className="h-8" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bolt">
                    <path d="M10 10L20 5L15 15H25L15 25L20 15H10L10 10Z" fill="currentColor" className="text-indigo-500"/>
                    <rect x="35" y="5" width="5" height="20" fill="currentColor" className="text-slate-800"/>
                    <path d="M50 5H65V10H55V25H50V5Z" fill="currentColor" className="text-slate-800"/>
                 </svg>
             </div>
        </div>
    </div>
));

const Hero = memo(({ onStartBatch, onNavigate }: { onStartBatch: () => void, onNavigate: (view: View) => void }) => (
  <header className="relative pt-32 pb-20 sm:pt-48 sm:pb-36 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-indigo-50/50 to-white">
    {/* Dynamic Background Elements */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none transform-gpu">
       <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl animate-blob mix-blend-multiply will-change-transform"></div>
       <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-multiply will-change-transform"></div>
       <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]"></div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-left">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
                    Image to SEO <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient-x">
                    in Milliseconds.
                    </span>
                </h1>
                
                <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                    Turn raw product photos into conversion-ready assets. Generate filenames, alt text, and tags for Shopify, Amazon, and Etsy automatically with Pixora AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={onStartBatch}
                        className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all"
                    >
                        Start Optimizing
                    </button>
                    <button 
                        onClick={() => onNavigate('how-it-works')}
                        className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:border-slate-300"
                    >
                         <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        How it Works
                    </button>
                </div>
                <p className="mt-6 text-sm text-slate-500 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    No credit card required • 50 free images/month
                </p>
            </div>

            {/* Right Visual (3D Floating Cards) */}
            <div className="relative h-[450px] sm:h-[500px] w-full perspective-1000 mt-16 lg:mt-0 mx-auto max-w-[500px] lg:max-w-none scale-[0.85] sm:scale-100 origin-center lg:origin-right transform-gpu">
                {/* Back Card (Input) */}
                <div className="absolute top-0 left-4 sm:top-10 sm:left-10 w-64 sm:w-72 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 transform rotate-[-6deg] z-10 transition-transform hover:rotate-0 duration-500 will-change-transform hover-glow">
                     <div className="aspect-[4/5] bg-slate-100 rounded-lg mb-4 overflow-hidden relative">
                         <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400" alt="Shoe" className="object-cover w-full h-full" loading="lazy" decoding="async" />
                         <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-mono backdrop-blur-sm">DSC_0042.jpg</div>
                     </div>
                     <div className="h-2 w-2/3 bg-slate-100 rounded mb-2"></div>
                     <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                </div>

                {/* Arrow Connector */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg border border-slate-100 text-indigo-600">
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </div>

                {/* Front Card (Output) */}
                <div className="absolute bottom-0 right-4 sm:top-20 sm:right-10 w-72 sm:w-80 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] border border-indigo-100/50 transform rotate-[6deg] z-30 transition-transform hover:rotate-0 duration-500 will-change-transform hover-glow">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">SEO READY</span>
                        <span className="text-xs text-slate-400">Just now</span>
                     </div>
                     <div className="space-y-4">
                         <div>
                             <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">SEO Filename</p>
                             <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">nike-air-max-red-sport.jpg</div>
                         </div>
                         <div>
                             <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Generated Alt Text</p>
                             <p className="text-xs text-slate-600 leading-relaxed">Red Nike running shoe with white sole shown from side profile on grey background.</p>
                         </div>
                         <div className="flex flex-wrap gap-1">
                             {['Sneakers', 'Sportswear', 'Red', 'Running'].map(tag => (
                                 <span key={tag} className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">{tag}</span>
                             ))}
                         </div>
                     </div>
                </div>
            </div>
        </div>
    </div>
  </header>
));

const Footer = memo(({ onNavigate }: { onNavigate: (view: View) => void }) => (
  <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 flex items-center justify-center text-white text-3xl">
                <Logo className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Pixora AI</span>
          </div>
          <p className="text-base text-slate-400 leading-relaxed mb-8 max-w-sm">
            AI-powered asset optimization for modern e-commerce brands. We turn pixel data into profit-generating metadata.
          </p>
          <div className="flex space-x-4">
            {/* Social Placeholders - Now Navigate to Home */}
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </a>
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Resources</h3>
          <ul className="space-y-4">
            <li><button onClick={() => onNavigate('guide')} className="text-slate-400 hover:text-white transition-colors text-left text-sm">SEO Guide 2024</button></li>
            <li><button onClick={() => onNavigate('blog')} className="text-slate-400 hover:text-white transition-colors text-left text-sm">Blog</button></li>
            <li><button onClick={() => onNavigate('cases')} className="text-slate-400 hover:text-white transition-colors text-left text-sm">Case Studies</button></li>
            <li><button onClick={() => onNavigate('help')} className="text-slate-400 hover:text-white transition-colors text-left text-sm">Help Center</button></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Legal</h3>
          <ul className="space-y-4">
            <li><button onClick={() => onNavigate('privacy')} className="text-slate-400 hover:text-white transition-colors text-left text-sm">Privacy Policy</button></li>
            <li><button onClick={() => onNavigate('terms')} className="text-slate-400 hover:text-white transition-colors text-left text-sm">Terms of Service</button></li>
            <li><button onClick={() => onNavigate('cookie')} className="text-slate-400 hover:text-white transition-colors text-left text-sm">Cookie Policy</button></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-sm text-slate-500">© 2024 Pixora AI. All rights reserved.</p>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          <span className="text-xs text-slate-300 font-medium">System Status: Operational</span>
        </div>
      </div>
    </div>
  </footer>
));

const ContentPage = memo(({ title, content, image, onBack, onCtaClick }: { title: string, content: React.ReactNode, image?: string, onBack: () => void, onCtaClick?: () => void }) => (
  <article className="pt-24 min-h-screen bg-white">
    {/* Page Header with optional image */}
    <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-16 sm:py-24 overflow-hidden">
        {image && (
             <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                 <img src={image} alt={title} className="w-full h-full object-cover grayscale" loading="lazy" decoding="async" />
             </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
                onClick={onBack}
                className="mb-8 flex items-center text-sm text-indigo-100 hover:text-white font-medium group transition-colors"
            >
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Home
            </button>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight shadow-sm">
                {title}
            </h1>
            <div className="h-1 w-20 bg-white/30 rounded-full"></div>
        </div>
    </div>

    {/* Content Container */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-20">
      <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 animate-fade-in-up hover-glow">
        <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-img:rounded-xl prose-img:shadow-lg">
          {content}
        </div>
        
        {/* CTA Box */}
        <div className="mt-16">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 md:p-10 text-center text-white shadow-2xl shadow-indigo-500/30 hover-glow">
                <h3 className="font-bold text-2xl md:text-3xl mb-4 tracking-tight">Ready to optimize your catalog?</h3>
                <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">Join 5,000+ sellers automating their image SEO today. Start your free batch now.</p>
                <button 
                onClick={onCtaClick || (() => { onBack(); window.scrollTo({ top: 0, behavior: 'smooth' }); })} 
                className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-all transform hover:-translate-y-1 shadow-lg"
                >
                Start Optimizing for Free
                </button>
            </div>
        </div>
      </div>
    </div>
  </article>
));

// --- Main App Component ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeBlogPost, setActiveBlogPost] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isContactFormSubmitted, setIsContactFormSubmitted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const MAX_BATCH_SIZE = 10;

  // Global Mouse Move for Spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Network Status Monitoring
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
        window.removeEventListener('online', handleStatusChange);
        window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Initialize View based on URL Pathname (Clean URLs)
  useEffect(() => {
    const path = window.location.pathname;
    const matchedView = Object.entries(VIEW_TO_PATH).find(([_, p]) => p === path);
    if (matchedView) {
      setCurrentView(matchedView[0] as View);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const post = urlParams.get('post');
    if (post) setActiveBlogPost(post);

    const handlePopState = () => {
      const path = window.location.pathname;
      const matchedView = Object.entries(VIEW_TO_PATH).find(([_, p]) => p === path);
      setCurrentView(matchedView ? (matchedView[0] as View) : 'home');
      
      const params = new URLSearchParams(window.location.search);
      const post = params.get('post');
      setActiveBlogPost(post);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Dynamic SEO: Update Metadata based on View ---
  useEffect(() => {
    switch (currentView) {
      case 'home':
        updateHead('Automate E-commerce Image SEO', 'Generate SEO-ready filenames, alt text, and tags for Shopify, Etsy, and Amazon from your product images.');
        break;
      case 'shopify':
        updateHead('Shopify Image SEO Guide', 'Learn how to optimize Shopify product images for Google rankings using automated alt text and handles.');
        break;
      case 'etsy':
        updateHead('Etsy Tags & SEO Strategy', 'Master Etsy SEO with the 13-tag strategy and title optimization for better search visibility.');
        break;
      case 'amazon':
        updateHead('Amazon A9 Algorithm Optimization', 'Optimize your Amazon product listings with backend keywords and benefit-driven bullet points.');
        break;
      case 'blog':
        if (activeBlogPost) {
          const post = BLOG_POSTS.find(p => p.id === activeBlogPost);
          if (post) updateHead(post.title, post.summary);
        } else {
          updateHead('E-commerce SEO Blog', 'Expert insights on scaling your e-commerce operations, automation, and SEO strategies.');
        }
        break;
      case 'guide':
        updateHead('2024 E-commerce Image SEO Guide', 'A comprehensive guide to visual search and image optimization for online sellers.');
        break;
      case 'how-it-works':
        updateHead('How Pixora AI Works', 'See how our AI transforms raw product images into SEO-ready assets for Shopify, Etsy, and Amazon in 3 simple steps.');
        break;
      case 'help':
        updateHead('Help Center & Support', 'Get help with Pixora AI. Contact our support team for assistance with your image optimization workflows.');
        break;
      case 'privacy':
        updateHead('Privacy Policy', 'Privacy Policy for Pixora AI.');
        break;
      case 'terms':
        updateHead('Terms of Service', 'Terms of Service for Pixora AI.');
        break;
      case 'cookie':
        updateHead('Cookie Policy', 'Cookie Policy for Pixora AI.');
        break;
      default:
        updateHead('Pixora AI | Image Optimizer', 'AI-powered automated SEO image optimization.');
    }
  }, [currentView, activeBlogPost]);

  // --- Routing: Clean Path Logic ---
  const handleNavigate = useCallback((view: View, blogId?: string) => {
    setCurrentView(view);
    setActiveBlogPost(blogId || null);
    setIsContactFormSubmitted(false);
    window.scrollTo(0, 0);
    
    // Clean Path Routing
    try {
      const path = VIEW_TO_PATH[view] || '/';
      let fullUrl = path;
      if (blogId) {
        fullUrl += `?post=${blogId}`;
      }
      window.history.pushState({}, '', fullUrl);
    } catch (e) {
      console.warn('Navigation state update failed:', e);
    }
  }, []);

  const handleStartBatch = useCallback(() => {
    setResults(null); 
    setCurrentView('home');
    setActiveBlogPost(null);
    
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {
      console.warn('History cleanup failed:', e);
    }
    
    setTimeout(() => {
        const uploadSection = document.getElementById('upload-section');
        if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, 150);
  }, []);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const currentCount = results ? 0 : files.length;
    
    if (currentCount + newFiles.length > MAX_BATCH_SIZE) {
        setError(`Batch limit exceeded. You can only process up to ${MAX_BATCH_SIZE} images at once.`);
        return;
    }

    if (results) {
      setResults(null);
      setFiles([]);
    }

    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle'
    }));
    
    setFiles(prev => [...prev, ...uploadedFiles]);
    setError(null);
  }, [results, files]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleClearQueue = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!navigator.onLine) {
        setError("Connection lost. Please check your internet connection and try again.");
        return;
    }

    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setFiles(prev => prev.map(f => ({ ...f, status: 'analyzing' })));

    try {
      const rawFiles = files.map(f => f.file);
      const data = await analyzeImageBatch(rawFiles);
      setResults(data);
      setFiles(prev => prev.map(f => ({ ...f, status: 'done' })));
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Failed to process images. Please check your API key and try again.";
      // Detect network failure during process
      if (!navigator.onLine || err.message?.includes('fetch') || err.message?.includes('network')) {
        msg = "Network error. Connection lost during analysis. Please check your internet connection.";
      }
      setError(msg);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleDownloadExcel = useCallback(() => {
    if (!results) return;

    // 1. General SEO Data
    const generalHeaders = ['Input Filename', 'SEO Filename', 'Alt Text', 'Title Tag', 'Meta Description (Snippet)', 'Product Description (Content)', 'Focus Keywords', 'Category', 'Material', 'Color', 'Style'];
    const generalRows = results.images.map(img => [
      img.input_filename,
      img.seo.seo_filename,
      img.seo.alt_text,
      img.seo.title || '',
      img.seo.description || '', // Meta description
      img.seo.product_description || '', // New field
      img.seo.focus_keywords?.join(', ') || '',
      img.detected?.category || '',
      img.detected?.material || '',
      img.detected?.color || '',
      img.detected?.style || ''
    ]);

    // 2. Shopify Data
    const shopifyHeaders = ['Handle', 'Title', 'Alt Text', 'Tags', 'Metafields (JSON)'];
    const shopifyRows = results.images.map(img => [
      img.shopify?.handle || '',
      img.seo.title || '',
      img.shopify?.alt_text || img.seo.alt_text,
      img.seo.tags?.join(', ') || '',
      img.shopify?.metafields ? JSON.stringify(img.shopify.metafields) : ''
    ]);

    // 3. Etsy Data
    const etsyHeaders = ['Title', 'Description', 'Tags (13)', 'Materials'];
    const etsyRows = results.images.map(img => [
      img.etsy?.seo_title || '',
      img.etsy?.description || '',
      img.etsy?.tags_13?.join(', ') || '',
      img.detected?.material || ''
    ]);

    // 4. Amazon Data
    const amazonHeaders = ['Title', 'Bullet Points', 'Search Terms', 'Main Features'];
    const amazonRows = results.images.map(img => [
      img.amazon?.title || '',
      img.amazon?.bullet_points?.join('\n') || '',
      img.amazon?.search_terms_keywords?.join(' ') || '',
      img.amazon?.main_features?.join(', ') || ''
    ]);

    const wb = XLSX.utils.book_new();

    const wsGeneral = XLSX.utils.aoa_to_sheet([generalHeaders, ...generalRows]);
    XLSX.utils.book_append_sheet(wb, wsGeneral, "General SEO");

    const wsShopify = XLSX.utils.aoa_to_sheet([shopifyHeaders, ...shopifyRows]);
    XLSX.utils.book_append_sheet(wb, wsShopify, "Shopify");

    const wsEtsy = XLSX.utils.aoa_to_sheet([etsyHeaders, ...etsyRows]);
    XLSX.utils.book_append_sheet(wb, wsEtsy, "Etsy");

    const wsAmazon = XLSX.utils.aoa_to_sheet([amazonHeaders, ...amazonRows]);
    XLSX.utils.book_append_sheet(wb, wsAmazon, "Amazon");

    XLSX.writeFile(wb, `pixora-seo-batch-${Date.now()}.xlsx`);

  }, [results]);

  const renderContent = () => {
    switch (currentView) {
      case 'how-it-works':
        return <ContentPage
          title="How Pixora AI Works"
          image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
          onBack={() => handleNavigate('home')}
          onCtaClick={handleStartBatch}
          content={
            <>
                <p className="lead text-xl text-slate-600 mb-8 font-light">
                    The entire process takes less than 30 seconds for a typical batch of images. Here is exactly what happens under the hood.
                </p>

                <div className="space-y-16 mt-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold border border-indigo-200 shadow-sm hover-glow">1</div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Upload Your Catalog</h3>
                            <p className="text-slate-600 text-lg">Drag and drop up to 50 product images at once. We support high-resolution JPG, PNG, and WebP formats. Your images are processed securely.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                         <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold border border-purple-200 shadow-sm hover-glow">2</div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Visual Analysis (Computer Vision)</h3>
                            <p className="text-slate-600 text-lg">Our AI doesn't just "see" an image; it understands it. It detects:</p>
                            <ul className="grid grid-cols-2 gap-4 mt-4">
                                <li className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2 h-2 bg-purple-500 rounded-full"></span>Material (e.g., "Velvet", "Gold")</li>
                                <li className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2 h-2 bg-purple-500 rounded-full"></span>Color Palette</li>
                                <li className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2 h-2 bg-purple-500 rounded-full"></span>Product Category</li>
                                <li className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2 h-2 bg-purple-500 rounded-full"></span>Stylistic Traits (e.g. "Boho")</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                         <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold border border-blue-200 shadow-sm hover-glow">3</div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">SEO Generation (LLM)</h3>
                            <p className="text-slate-600 text-lg">
                                Using the visual data, our Language Model generates platform-specific assets. It follows strict rules for character limits and ranking algorithms (like Amazon A9 or Etsy's tag matching).
                            </p>
                        </div>
                    </div>

                     <div className="flex flex-col md:flex-row gap-8 items-start">
                         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold border border-emerald-200 shadow-sm hover-glow">4</div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">One-Click Export</h3>
                            <p className="text-slate-600 text-lg">
                                Review the data on your dashboard and make any tweaks. When ready, download a formatted CSV that you can import directly into Shopify, or copy-paste fields into Amazon Seller Central.
                            </p>
                        </div>
                    </div>
                </div>
            </>
          }
        />;

      case 'shopify':
        return <ContentPage 
          title="Shopify Image SEO Guide" 
          image="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=1200"
          onBack={() => handleNavigate('home')} 
          onCtaClick={handleStartBatch}
          content={
            <>
              <p className="lead text-xl text-slate-600 mb-8">
                Ranking your Shopify store requires more than just good products. In 2024, visual search drives over 20% of e-commerce traffic. Optimizing your images is the lowest-hanging fruit for increasing organic visibility.
              </p>

              <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 tracking-tight">1. Descriptive File Naming</h2>
              <p className="text-slate-600 mb-4">
                Google crawls filenames. Uploading <code>DSC0012.jpg</code> tells Google nothing. 
                Instead, filenames should be:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-6">
                <li><strong>Lowercase</strong>: Avoid capitalization issues on different servers.</li>
                <li><strong>Hyphenated</strong>: Google treats hyphens as space separators (underscores are treated as joiners).</li>
                <li><strong>Descriptive</strong>: <code>mens-leather-jacket-black.jpg</code> is perfect.</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 tracking-tight">2. Alt Text Strategy</h2>
              <p className="text-slate-600 mb-4">
                Alt text (alternative text) serves two purposes: accessibility for screen readers and semantic context for search engines.
              </p>
              <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 my-6">
                <p className="font-medium text-slate-700">✅ Good Alt Text:</p>
                <p className="text-slate-600 italic">"Woman wearing a beige trench coat with double-breasted buttons walking in city"</p>
                <p className="font-medium text-slate-700 mt-4">❌ Bad Alt Text:</p>
                <p className="text-slate-600 italic">"coat jacket beige fashion buy now"</p>
              </div>
            </>
          } 
        />;
      
      case 'etsy':
        return <ContentPage 
          title="Etsy SEO: The 13 Tag Strategy" 
          image="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=1200"
          onBack={() => handleNavigate('home')} 
          onCtaClick={handleStartBatch}
          content={
             <>
              <p className="lead text-xl text-slate-600 mb-8">
                Etsy is a unique marketplace where "Findability" is governed by Query Matching and Ranking Quality Score. The single most important factor you can control? Your 13 tags.
              </p>

              <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 tracking-tight">The Golden Rules of Etsy Tags</h2>
              <ul className="list-disc pl-6 space-y-3 text-slate-600 mb-6">
                <li><strong>Use all 13 tags</strong>: Leaving tags empty is leaving money on the table.</li>
                <li><strong>Multi-word phrases</strong>: "Gold Necklace" is better than "Gold" and "Necklace" separately.</li>
                <li><strong>Variety is key</strong>: Mix attributes (Color, Size), Occasions (Wedding, Gift), and Styles (Boho, Minimalist).</li>
              </ul>
            </>
          } 
        />;

      case 'amazon':
        return <ContentPage 
          title="Amazon A9 Algorithm Optimization" 
          image="https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=1200"
          onBack={() => handleNavigate('home')} 
          onCtaClick={handleStartBatch}
          content={
             <>
              <p className="lead text-xl text-slate-600 mb-8">
                The Amazon A9 algorithm cares about two things: <strong>Relevance</strong> (Keywords) and <strong>Performance</strong> (Sales Velocity). You cannot sell if you aren't found.
              </p>

              <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 tracking-tight">Backend Search Terms</h2>
              <p className="text-slate-600 mb-4">
                Many sellers ignore the "Search Terms" field in the backend. You have 250 bytes (not characters) to index for synonyms, misspellings, and Spanish variations.
              </p>
            </>
          } 
        />;

      case 'guide':
        return <ContentPage 
          title="The 2024 E-commerce Image SEO Guide" 
          image="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=1200"
          onBack={() => handleNavigate('home')} 
          onCtaClick={handleStartBatch}
          content={
            <>
              <p className="text-lg text-slate-600 mb-6">
                Welcome to the comprehensive guide for ranking your products through visual assets. This guide covers the technical and creative aspects of Image SEO.
              </p>
              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3 tracking-tight">Chapter 1: The Technical Foundation</h3>
              <p className="text-slate-600 mb-4">
                Before AI and keywords, your foundation must be solid.
                <br/>
                <strong>Format:</strong> Use WebP for Shopify (smaller size, high quality) or high-res JPG for Amazon.
              </p>
            </>
          } 
        />;

      case 'blog':
        const post = BLOG_POSTS.find(p => p.id === activeBlogPost);
        
        if (activeBlogPost && post) {
          return <ContentPage 
            title={post.title}
            image={post.image}
            onBack={() => handleNavigate('blog')}
            onCtaClick={handleStartBatch}
            content={post.content}
          />
        }

        return <ContentPage 
          title="Pixora AI Insights Blog" 
          image="https://images.unsplash.com/photo-1499750310159-5b5f0969755b?auto=format&fit=crop&q=80&w=1200"
          onBack={() => handleNavigate('home')} 
          onCtaClick={handleStartBatch}
          content={
            <div className="space-y-12">
              <p className="text-slate-600 max-w-2xl text-lg">
                Expert insights on automated workflows, algorithm updates, and scaling your e-commerce operations.
              </p>
              <div className="grid gap-10">
                {BLOG_POSTS.map(post => (
                  <article 
                    key={post.id} 
                    className="group grid grid-cols-1 md:grid-cols-3 gap-6 cursor-pointer hover-glow p-4 rounded-xl transition-all"
                    onClick={() => handleNavigate('blog', post.id)}
                  >
                    <div className="aspect-[16/9] md:aspect-auto rounded-xl overflow-hidden shadow-sm">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    </div>
                    <div className="col-span-2 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-full tracking-wider">{post.category}</span>
                        <span className="text-xs text-slate-400 font-medium">{post.readTime}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">
                        {post.title}
                        </h2>
                        <p className="text-slate-600 mb-4 line-clamp-2 text-base leading-relaxed">
                        {post.summary}
                        </p>
                        <div className="flex items-center text-indigo-600 font-bold text-sm">
                        Read Article 
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          } 
        />;

      case 'cases':
        return <ContentPage 
          title="Customer Success Stories" 
          image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
          onBack={() => handleNavigate('home')} 
          onCtaClick={handleStartBatch}
          content={
            <>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow hover-glow">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mb-6">L</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Jewelry Brand "Lumina"</h3>
                    <p className="text-sm font-bold text-indigo-600 mb-4 tracking-wide">+156% ETSY TRAFFIC</p>
                    <p className="text-slate-600 leading-relaxed">
                      "We used Pixora AI to generate all 13 tags for our 500 SKU catalog. The AI found synonyms like 'celestial' and 'dainty' that we never thought to use. Our impressions skyrocketed."
                    </p>
                  </div>
                   <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow hover-glow">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl mb-6">K</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Reseller "KicksFlip"</h3>
                    <p className="text-sm font-bold text-green-600 mb-4 tracking-wide">SAVED 20 HRS/WEEK</p>
                    <p className="text-slate-600 leading-relaxed">
                      "Listing 50 pairs of shoes a week used to be a nightmare of typing. Now I just drop the photos, and the tool detects the colorway, style, and generates the Shopify handle instantly."
                    </p>
                  </div>
               </div>
            </>
          } 
        />;

      case 'help':
        return <ContentPage 
            title="Help Center"
            image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200"
            onBack={() => handleNavigate('home')}
            onCtaClick={handleStartBatch}
            content={
            <div className="max-w-2xl mx-auto">
                {isContactFormSubmitted ? (
                    <div className="text-center py-16 bg-green-50 rounded-2xl border border-green-100 animate-fade-in-up">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Message Sent!</h3>
                        <p className="text-slate-600">Thank you for reaching out. Our support team will get back to you shortly.</p>
                        <button onClick={() => setIsContactFormSubmitted(false)} className="mt-6 text-indigo-600 font-bold hover:underline">Send another message</button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">How can we help?</h2>
                            <p className="text-slate-600 mt-2">Fill out the form below and our support team will get back to you within 24 hours.</p>
                        </div>
                        
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsContactFormSubmitted(true); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input type="text" id="name" className="w-full px-4 py-2 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="John Doe" required />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input type="email" id="email" className="w-full px-4 py-2 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <select id="subject" className="w-full px-4 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Billing</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea id="message" rows={5} className="w-full px-4 py-2 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="Describe your issue..." required></textarea>
                            </div>
                            <button type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                Send Message
                            </button>
                        </form>
                    </>
                )}
                
                <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                     <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors hover-glow">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="font-semibold text-slate-900">Email Us</h3>
                        <p className="text-sm text-slate-500">support@pixora.ai</p>
                     </div>
                     <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors hover-glow">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="font-semibold text-slate-900">Live Chat</h3>
                        <p className="text-sm text-slate-500">Available Mon-Fri</p>
                     </div>
                     <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors hover-glow">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="font-semibold text-slate-900">Documentation</h3>
                        <p className="text-sm text-slate-500">Read the guide</p>
                     </div>
                </div>
            </div>
            }
        />;

      case 'privacy':
         return <ContentPage title="Privacy Policy" onBack={() => handleNavigate('home')} content={PRIVACY_CONTENT} />;
      case 'terms':
         return <ContentPage title="Terms of Service" onBack={() => handleNavigate('home')} content={TERMS_CONTENT} />;
      case 'cookie':
         return <ContentPage title="Cookie Policy" onBack={() => handleNavigate('home')} content={COOKIE_CONTENT} />;

      case 'home':
      default:
        return (
          <>
             {/* Global Spotlight Overlay */}
             <div 
               className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-300"
               style={{ 
                 background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(79, 70, 229, 0.06), transparent 40%)'
               }}
             />

             {/* Offline Banner */}
             {!isOnline && (
                <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-3 z-[100] font-bold text-sm shadow-md animate-fade-in-up flex items-center justify-center gap-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" /></svg>
                    ⚠️ No Internet Connection. Pixora AI requires an active connection to analyze images.
                </div>
             )}

             {/* Show Hero only when not viewing results to keep focus */}
            {!results && <Hero onStartBatch={handleStartBatch} onNavigate={handleNavigate} />}
            
            <main className={`flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20 ${!results ? '-mt-24 sm:-mt-32' : 'mt-24'}`}>
              
              {/* Upload Container (Card) */}
              {!results && (
                <div id="upload-section" className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white p-6 md:p-10 animate-fade-in-up ring-1 ring-slate-900/5 scroll-mt-32 hover-glow">
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Your Product Images</h2>
                    <p className="text-slate-500 mt-2">Supports JPG, PNG, WEBP • Max 10MB per file • Limit 10/batch</p>
                  </div>
                  
                  <FileUpload 
                    onFilesSelected={handleFilesSelected} 
                    disabled={isProcessing}
                  />
                  
                  <ImageGrid 
                    files={files} 
                    onRemove={handleRemoveFile} 
                    onClear={handleClearQueue}
                  />

                  {files.length > 0 && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={handleGenerate}
                        disabled={isProcessing || !isOnline}
                        className={`
                          flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-1 active:translate-y-0
                          ${isProcessing || !isOnline
                            ? 'bg-slate-800 cursor-not-allowed text-slate-400' 
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white'
                          }
                        `}
                      >
                        {isProcessing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Batch...
                          </>
                        ) : (
                          <>
                             {isOnline ? 'Generate SEO Pack' : 'Waiting for connection...'}
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3 animate-shake">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Results Section */}
              {results && (
                <div className="space-y-8"> 
                   <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 hover-glow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Analysis Complete</h3>
                          <p className="text-sm text-slate-500 font-medium">Processed {results.images.length} images successfully</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                         <button 
                          onClick={() => { setResults(null); setFiles([]); }}
                          className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          New Batch
                        </button>
                        <button 
                          onClick={handleDownloadExcel}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Excel
                        </button>
                      </div>
                   </div>
                   
                   <ResultsView data={results} files={files} />
                </div>
              )}

            </main>

            {!results && (
                <>
                    <TrustedBy />
                    <Features />
                </>
            )}
            
            {/* AI Chatbot */}
            <ChatBot onNavigate={(view) => handleNavigate(view as View)} />
          </>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-800">
      <Navbar onNavigate={handleNavigate} onStartBatch={handleStartBatch} />
      {renderContent()}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
