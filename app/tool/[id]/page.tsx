'use client';

import { useState, useEffect } from 'react';
import { databases, APPWRITE_CONFIG } from '@/lib/appwrite';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// Import new components
import KeyFeatures from '@/components/tool-detail/KeyFeatures';
import ProsAndCons from '@/components/tool-detail/ProsAndCons';
import WhoIsUsing from '@/components/tool-detail/WhoIsUsing';
import PricingTiers from '@/components/tool-detail/PricingTiers';
import RatingsGrid from '@/components/tool-detail/RatingsGrid';
import YouTubeEmbed from '@/components/tool-detail/YouTubeEmbed';

export default function ToolDetails() {
    const { id } = useParams();
    const [tool, setTool] = useState<any>(null);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    // Initialize animations
    useScrollAnimation();

    useEffect(() => {
        if (id) fetchTool();
    }, [id]);

    const fetchTool = async () => {
        try {
            const toolDoc = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.tools,
                id as string
            );

            // Parse JSON fields from Appwrite
            const parsedTool = {
                ...toolDoc,
                pricingTiers: toolDoc.pricingTiers ?
                    (typeof toolDoc.pricingTiers === 'string' ? JSON.parse(toolDoc.pricingTiers) : toolDoc.pricingTiers) :
                    [],
                ratings: toolDoc.ratings ?
                    (typeof toolDoc.ratings === 'string' ? JSON.parse(toolDoc.ratings) : toolDoc.ratings) :
                    null,
            };

            setTool(parsedTool);

            if (toolDoc.category) {
                const catDoc = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.categories,
                    toolDoc.category
                );
                setCategoryName(catDoc.name);
            }
        } catch (err) {
            console.error('Failed to fetch tool', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <Footer />
        </div>
    );

    if (!tool) return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex items-center justify-center text-muted-foreground">
                Tool not found.
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow w-full px-4 md:px-8 lg:px-12 py-12">
                <Link href="/" className="inline-flex items-center text-sm text-slate-300 hover:text-purple-400 mb-6 transition-colors animate-on-load">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                </Link>

                {/* Hero Section */}
                <div className="glass rounded-2xl p-8 shadow-sm border border-white/10 mb-8 animate-on-load">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {tool.image_url && (
                            <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-purple-400/50 shadow-md flex-shrink-0">
                                <Image
                                    src={tool.image_url}
                                    alt={tool.name}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            </div>
                        )}
                        <div className="flex-grow">
                            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
                                {tool.name}
                            </h1>
                            <p className="text-lg text-slate-200 mb-4 leading-relaxed">
                                {tool.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline" className="text-sm px-3 py-1">
                                    {categoryName}
                                </Badge>
                                <Badge variant={tool.tool_type === 'Free' ? 'secondary' : 'default'} className="px-3 py-1">
                                    {tool.tool_type}
                                </Badge>
                                {tool.dataSource === 'futurepedia' && (
                                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 px-3 py-1">
                                        ✨ Futurepedia Data
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(tool.date_added).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        {tool.website_url && (
                            <Link href={tool.website_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8">
                                    Visit Website <ExternalLink className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* YouTube Video */}
                    {tool.video_url && (
                        <div className="animate-on-load">
                            <YouTubeEmbed videoUrl={tool.video_url} title={`${tool.name} demonstration`} />
                        </div>
                    )}

                    {/* Key Features */}
                    {tool.keyFeatures && tool.keyFeatures.length > 0 && (
                        <div className="animate-on-load">
                            <KeyFeatures features={tool.keyFeatures} />
                        </div>
                    )}

                    {/* Pros & Cons */}
                    {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
                        <div className="animate-on-load">
                            <ProsAndCons pros={tool.pros || []} cons={tool.cons || []} />
                        </div>
                    )}

                    {/* Who's Using This */}
                    {tool.whoIsUsing && tool.whoIsUsing.length > 0 && (
                        <div className="animate-on-scroll">
                            <WhoIsUsing users={tool.whoIsUsing} />
                        </div>
                    )}

                    {/* Pricing */}
                    {tool.pricingTiers && tool.pricingTiers.length > 0 && (
                        <div className="animate-on-scroll">
                            <PricingTiers tiers={tool.pricingTiers} />
                        </div>
                    )}

                    {/* What Makes It Unique */}
                    {tool.whatMakesUnique && (
                        <section className="glass rounded-xl p-6 shadow-sm border border-white/10 animate-on-scroll">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                💡 What Makes {tool.name} Unique?
                            </h2>
                            <p className="text-slate-200 leading-relaxed text-lg">
                                {tool.whatMakesUnique}
                            </p>
                        </section>
                    )}

                    {/* Ratings */}
                    {tool.ratings && (
                        <div className="animate-on-scroll">
                            <RatingsGrid ratings={tool.ratings} />
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
