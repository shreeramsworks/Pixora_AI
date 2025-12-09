
import React, { useState } from 'react';
import { AnalysisResult, ImageResult, Platform, UploadedFile } from '../types';

interface ResultsViewProps {
  data: AnalysisResult;
  files: UploadedFile[];
}

const CopyButton = ({ text, className = "", label = "Copy" }: { text: string, className?: string, label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`group relative p-1.5 hover:bg-indigo-50 rounded-md transition-all ${className}`}
      title={label}
    >
      {copied ? (
        <span className="flex items-center text-green-600 scale-110 transition-transform">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </span>
      ) : (
        <span className="flex items-center text-slate-400 group-hover:text-indigo-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
        </span>
      )}
      {copied && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded font-bold opacity-90 shadow-lg whitespace-nowrap z-50">
          Copied!
        </span>
      )}
    </button>
  );
};

const ResultsView: React.FC<ResultsViewProps> = ({ data, files }) => {
  const [activePlatform, setActivePlatform] = useState<Platform>('general');

  // Helper to match input filename to original preview
  const getPreview = (filename: string) => {
    const original = files.find(f => f.file.name === filename);
    return original ? original.previewUrl : '';
  };

  // Helper for Attribute Colors
  const getAttrColor = (key: string) => {
    switch (key.toLowerCase()) {
      case 'material': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'color': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'style': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'gender': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const platforms: { id: Platform; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General SEO', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: 'shopify', label: 'Shopify', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { id: 'etsy', label: 'Etsy', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg> },
    { id: 'amazon', label: 'Amazon', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Batch Summary Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Batch Context</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase">
                {data.batch_summary.preset} Preset
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 uppercase">
                Category: {data.batch_summary.primary_category || 'Mixed'}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner">
            {platforms.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  activePlatform === p.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {data.images.map((img, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
              {/* Image Column */}
              <div className="w-full lg:w-80 bg-slate-50 p-8 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col items-center justify-center">
                <div className="w-full aspect-square bg-white rounded-xl border border-slate-100 p-4 shadow-sm mb-4 relative group">
                    <img 
                        src={getPreview(img.input_filename)} 
                        alt="Product" 
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                        Original
                    </div>
                </div>
                <div className="w-full text-center">
                    <div className="text-xs font-mono text-slate-500 break-all mb-3 truncate max-w-[200px] mx-auto opacity-70" title={img.input_filename}>{img.input_filename}</div>
                    <div className="inline-flex items-center px-3 py-1 bg-white text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></div>
                        {img.variant_role || 'Main Image'}
                    </div>
                </div>
              </div>

              {/* Data Column */}
              <div className="flex-1 p-8 lg:p-10">
                
                {activePlatform === 'general' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SEO Filename</label>
                                    <CopyButton text={img.seo.seo_filename} />
                                </div>
                                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-sm font-mono text-indigo-900 select-all">
                                    {img.seo.seo_filename}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Title Tag</label>
                                    <CopyButton text={img.seo.title || ''} />
                                </div>
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm">
                                    {img.seo.title}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meta Description (Snippet)</label>
                                <CopyButton text={img.seo.description || ''} />
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed shadow-sm">
                                {img.seo.description}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product Description (Content)</label>
                                <CopyButton text={img.seo.product_description || ''} label="Copy Full Description" />
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed shadow-inner max-h-40 overflow-y-auto custom-scrollbar">
                                {img.seo.product_description}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alt Text</label>
                                <CopyButton text={img.seo.alt_text} />
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed shadow-sm">
                                {img.seo.alt_text}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Keywords ({img.seo.focus_keywords?.length || 0})</label>
                                <CopyButton text={img.seo.focus_keywords?.join(', ') || ''} label="Copy Comma Separated" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {img.seo.focus_keywords?.map((k, i) => (
                                    <span key={i} className="px-3 py-1 bg-white text-slate-600 text-xs font-medium rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default">
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {img.detected && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-4 tracking-wider">AI Detected Attributes</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Material', value: img.detected.material },
                                        { label: 'Color', value: img.detected.color },
                                        { label: 'Style', value: img.detected.style },
                                        { label: 'Gender', value: img.detected.gender },
                                    ].map((attr, i) => (
                                        <div key={i} className={`flex flex-col p-3 rounded-lg border ${getAttrColor(attr.label)} transition-all`}>
                                            <span className="text-[10px] uppercase font-bold mb-1 opacity-70">{attr.label}</span>
                                            <span className="font-semibold text-sm">{attr.value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activePlatform === 'shopify' && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Handle</label>
                                    <CopyButton text={img.shopify?.handle || img.seo.seo_filename.replace(/\.[^/.]+$/, "")} />
                                </div>
                                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm font-mono text-emerald-900">
                                    {img.shopify?.handle || img.seo.seo_filename.replace(/\.[^/.]+$/, "")}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alt Text (Shopify)</label>
                                    <CopyButton text={img.shopify?.alt_text || img.seo.alt_text} />
                                </div>
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm">
                                    {img.shopify?.alt_text || img.seo.alt_text}
                                </div>
                            </div>
                        </div>
                        {img.shopify?.metafields && img.shopify.metafields.length > 0 && (
                             <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-4 tracking-wider">Metafields (Structured Data)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     {img.shopify.metafields.map((field, idx) => (
                                         <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-indigo-300 transition-colors shadow-sm">
                                             <div className="flex flex-col overflow-hidden mr-4">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">{field.key}</span>
                                                <span className="text-sm font-medium text-slate-700 truncate" title={field.value}>{field.value}</span>
                                             </div>
                                             <CopyButton text={field.value} className="bg-slate-50 opacity-0 group-hover:opacity-100" />
                                         </div>
                                     ))}
                                </div>
                            </div>
                        )}
                     </div>
                )}

                {activePlatform === 'etsy' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Title <span className="text-slate-300 font-normal ml-1">({img.etsy?.seo_title?.length || 0}/140 chars)</span>
                                </label>
                                <CopyButton text={img.etsy?.seo_title || img.seo.title || ''} />
                            </div>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm">
                                {img.etsy?.seo_title || img.seo.title}
                            </div>
                        </div>
                         <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Tags (13 Max)
                                </label>
                                <CopyButton text={img.etsy?.tags_13?.join(', ') || ''} label="Copy Comma Separated" />
                            </div>
                            <div className="flex flex-wrap gap-2 p-5 bg-orange-50/50 rounded-xl border border-orange-100">
                                {img.etsy?.tags_13?.map((tag, i) => (
                                     <span key={i} className="px-3 py-1 bg-white text-orange-800 text-sm font-medium rounded-md border border-orange-200 shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                         <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description Intro</label>
                                <CopyButton text={img.etsy?.description || img.seo.description || ''} />
                            </div>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
                                {img.etsy?.description || img.seo.description?.substring(0, 200) + "..."}
                            </div>
                        </div>
                    </div>
                )}

                {activePlatform === 'amazon' && (
                    <div className="space-y-6">
                         <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product Title</label>
                                <CopyButton text={img.amazon?.title || img.seo.title || ''} />
                            </div>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium shadow-sm">
                                {img.amazon?.title || img.seo.title}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bullet Points (Key Features)</label>
                                <CopyButton text={img.amazon?.bullet_points?.join('\n') || ''} label="Copy as Text" />
                            </div>
                            <ul className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                {img.amazon?.bullet_points?.map((bp, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700">
                                        <div className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm">{i+1}</div>
                                        <span className="leading-relaxed">{bp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Search Terms (Backend Keywords)</label>
                                <CopyButton text={img.amazon?.search_terms_keywords?.join(' ') || ''} />
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-500 break-words leading-relaxed">
                                {img.amazon?.search_terms_keywords?.join(' ')}
                            </div>
                        </div>
                    </div>
                )}

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;
