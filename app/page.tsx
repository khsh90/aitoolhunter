'use client';

import { useState, useEffect } from 'react';
import { databases, APPWRITE_CONFIG } from '@/lib/appwrite';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalyticsChart from '@/components/AnalyticsChart';
import ToolCard from '@/components/ToolCard';
import ToolTable from '@/components/ToolTable';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List as ListIcon, Search, Loader2 } from 'lucide-react';

export default function Home() {
    const [tools, setTools] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Controls
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sort, setSort] = useState('date'); // date | category
    const [view, setView] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [toolsRes, catsRes] = await Promise.all([
                databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.tools
                ).catch(() => ({ documents: [] })),
                databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.categories
                ).catch(() => ({ documents: [] }))
            ]);
            setTools(toolsRes.documents);
            setCategories(catsRes.documents);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter and Sort Logic
    const filteredTools = tools
        .filter((tool) => {
            const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || tool.category === categoryFilter;
            const matchesType = typeFilter === 'All' || tool.tool_type === typeFilter;
            return matchesSearch && matchesCategory && matchesType;
        })
        .sort((a, b) => {
            if (sort === 'date') {
                return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
            } else {
                const catA = categories.find(c => c.$id === a.category)?.name || '';
                const catB = categories.find(c => c.$id === b.category)?.name || '';
                return catA.localeCompare(catB);
            }
        });

    // Analytics Data
    const chartData = categories.map(cat => {
        const count = tools.filter(t => t.category === cat.$id).length;
        return { name: cat.name, value: count };
    }).filter(d => d.value > 0);

    const getCategoryName = (id: string) => categories.find(c => c.$id === id)?.name || 'Unknown';

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow container px-4 md:px-6 py-8 space-y-8">
                {/* Analytics Section */}
                <section className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <AnalyticsChart data={chartData} />
                    </div>
                    <div className="md:col-span-2 flex flex-col justify-center space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                            Find the Perfect AI Tool
                        </h1>
                        <p className="text-xl text-slate-200 max-w-2xl mx-auto mb-8 text-center">
                            Explore our curated directory of the best AI tools to supercharge your workflow. Updated daily with the latest innovations.
                        </p>
                    </div>
                </section>

                {/* Controls Section */}
                <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tools..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-[150px]"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.$id} value={cat.$id}>{cat.name}</option>
                            ))}
                        </Select>

                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-[150px]"
                        >
                            <option value="All">All Types</option>
                            <option value="Free">Free</option>
                            <option value="Paid">Paid</option>
                        </Select>

                        <Select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-[150px]"
                        >
                            <option value="date">Newest First</option>
                            <option value="category">Category</option>
                        </Select>

                        <div className="flex border border-input rounded-md bg-background/50">
                            <Button
                                variant={view === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setView('grid')}
                                className="rounded-r-none"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={view === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setView('list')}
                                className="rounded-l-none"
                            >
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {filteredTools.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                No tools found matching your criteria.
                            </div>
                        ) : (
                            <>
                                {view === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {filteredTools.map(tool => (
                                            <ToolCard
                                                key={tool.$id}
                                                tool={tool}
                                                categoryName={getCategoryName(tool.category)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <ToolTable tools={filteredTools} categories={categories} />
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
