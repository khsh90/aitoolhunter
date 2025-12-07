'use client';

import { useState, useEffect } from 'react';
import { account, databases, storage, APPWRITE_CONFIG } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllQuotas } from '@/lib/services/quota-tracker';
import type { AutoGenerateResult } from '@/lib/services/types';
import { QuotaDisplay } from '@/components/QuotaDisplay';
import { UnknownToolModal } from '@/components/UnknownToolModal';
import { VerificationErrors } from '@/components/VerificationErrors';
import { ProgressStep } from '@/components/ProgressStep';
import { ProgressModal } from '@/components/ProgressModal';
import { Loader2, Sparkles, Plus, LogOut, Trash2, Edit, Save, X, Upload, Home } from 'lucide-react';
import { QuotaStatus, VerificationResult, UnknownToolError, LoadingStates } from '@/lib/services/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [tools, setTools] = useState<any[]>([]);

    // Initialize animations
    useScrollAnimation();

    // Form States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');

    const [toolName, setToolName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [toolType, setToolType] = useState('Free');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Futurepedia fields
    const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
    const [pros, setPros] = useState<string[]>([]);
    const [cons, setCons] = useState<string[]>([]);
    const [whoIsUsing, setWhoIsUsing] = useState<string[]>([]);
    const [pricingTiers, setPricingTiers] = useState<any[]>([]);
    const [whatMakesUnique, setWhatMakesUnique] = useState('');
    const [ratings, setRatings] = useState<any>(null);
    const [dataSource, setDataSource] = useState('api');

    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);

    // New states for enhanced auto-generation
    const [quotas, setQuotas] = useState<QuotaStatus[]>([]);
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({
        searchingWebsite: false,
        fetchingLogo: false,
        generatingDescription: false,
        findingVideo: false,
        verifying: false
    });
    const [showUnknownToolModal, setShowUnknownToolModal] = useState(false);
    const [unknownToolError, setUnknownToolError] = useState<{ name: string; reason: string } | null>(null);
    const [verificationErrors, setVerificationErrors] = useState<VerificationResult[]>([]);
    const [showExtendedFields, setShowExtendedFields] = useState(false);

    useEffect(() => {
        checkAuth();
        fetchData();
        fetchQuotas();
    }, []);

    const fetchQuotas = async () => {
        try {
            const quotaData = await getAllQuotas();
            setQuotas(quotaData);
        } catch (error) {
            console.error('Failed to fetch quotas:', error);
        }
    };

    const checkAuth = async () => {
        try {
            const session = await account.get();
            setUser(session);
        } catch (err) {
            router.push('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const [catsRes, toolsRes] = await Promise.all([
                databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.categories),
                databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.tools, [Query.orderDesc('date_added')])
            ]);
            setCategories(catsRes.documents);
            setTools(toolsRes.documents);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory) return;
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.categories,
                ID.unique(),
                { name: newCategory }
            );
            setNewCategory('');
            fetchData();
        } catch (err) {
            alert('Failed to add category');
        }
    };

    const handleEditCategory = async (categoryId: string) => {
        if (!editingCategoryName) return;
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.categories,
                categoryId,
                { name: editingCategoryName }
            );
            setEditingCategoryId(null);
            setEditingCategoryName('');
            fetchData();
        } catch (err) {
            alert('Failed to update category');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        // Check if any tools use this category
        const toolsUsingCategory = tools.filter(t => t.category === categoryId);
        if (toolsUsingCategory.length > 0) {
            alert(`Cannot delete this category. ${toolsUsingCategory.length} tool(s) are using it. Please reassign those tools first.`);
            return;
        }

        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.categories,
                categoryId
            );
            fetchData();
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const handleAutoGenerate = async () => {
        if (!toolName) {
            alert('Please enter a tool name first.');
            return;
        }
        setGenerating(true);
        setVerificationErrors([]);
        try {
            // Call API route instead of direct service call
            const response = await fetch('/api/auto-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ toolName }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Unknown tool error
                    const errorData = await response.json();
                    setUnknownToolError({
                        name: errorData.toolName || toolName,
                        reason: errorData.reason || 'Tool not found'
                    });
                    setShowUnknownToolModal(true);
                    return;
                }
                throw new Error('Failed to auto-generate');
            }

            const result: AutoGenerateResult = await response.json();

            if (!result.success) {
                // Handle verification errors or partial data
                if (result.errors && result.errors.length > 0) {
                    setVerificationErrors(result.errors);
                }

                // Pre-fill form with partial data
                if (result.partialData) {
                    if (result.partialData.description) setDescription(result.partialData.description);
                    if (result.partialData.imageUrl) setImageUrl(result.partialData.imageUrl);
                    if (result.partialData.videoUrl) setVideoUrl(result.partialData.videoUrl);
                    if (result.partialData.websiteUrl) setWebsiteUrl(result.partialData.websiteUrl);
                    if (result.partialData.toolType) setToolType(result.partialData.toolType);

                    // Handle category
                    const partialCategory = result.partialData.category;
                    if (partialCategory) {
                        const existingCategory = categories.find(c => c.name === partialCategory);
                        if (existingCategory) {
                            setSelectedCategory(existingCategory.$id);
                        } else {
                            const newCat = await databases.createDocument(
                                APPWRITE_CONFIG.databaseId,
                                APPWRITE_CONFIG.collections.categories,
                                ID.unique(),
                                { name: partialCategory }
                            );
                            await fetchData();
                            setSelectedCategory(newCat.$id);
                        }
                    }
                }
            } else if (result.data) {
                // Success! Set all fields
                console.log('📥 Received data from API:', {
                    hasKeyFeatures: !!result.data.keyFeatures,
                    keyFeaturesLength: result.data.keyFeatures?.length,
                    hasPros: !!result.data.pros,
                    prosLength: result.data.pros?.length,
                    hasCons: !!result.data.cons,
                    consLength: result.data.cons?.length,
                    hasWhoIsUsing: !!result.data.whoIsUsing,
                    whoIsUsingLength: result.data.whoIsUsing?.length,
                    hasPricingTiers: !!result.data.pricingTiers,
                    pricingTiersLength: result.data.pricingTiers?.length,
                    hasRatings: !!result.data.ratings,
                    hasWhatMakesUnique: !!result.data.whatMakesUnique,
                    dataSource: result.data.dataSource
                });

                setDescription(result.data.description);
                setImageUrl(result.data.imageUrl);
                setVideoUrl(result.data.videoUrl);
                setWebsiteUrl(result.data.websiteUrl);
                setToolType(result.data.toolType);

                // Set Futurepedia fields if available
                if (result.data.keyFeatures) setKeyFeatures(result.data.keyFeatures);
                if (result.data.pros) setPros(result.data.pros);
                if (result.data.cons) setCons(result.data.cons);
                if (result.data.whoIsUsing) setWhoIsUsing(result.data.whoIsUsing);
                if (result.data.pricingTiers) setPricingTiers(result.data.pricingTiers);
                if (result.data.whatMakesUnique) setWhatMakesUnique(result.data.whatMakesUnique);
                if (result.data.ratings) setRatings(result.data.ratings);
                if (result.data.dataSource) setDataSource(result.data.dataSource);

                // Check if category exists, if not create it
                const existingCategory = categories.find(c => c.name === result.data!.category);
                if (existingCategory) {
                    setSelectedCategory(existingCategory.$id);
                } else {
                    // Create new category
                    const newCat = await databases.createDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.categories,
                        ID.unique(),
                        { name: result.data.category }
                    );
                    // Refresh categories
                    await fetchData();
                    setSelectedCategory(newCat.$id);
                }
            }

            // Refresh quotas
            await fetchQuotas();
        } catch (err: any) {
            console.error('Auto-generate error:', err);
            alert('Failed to auto-generate: ' + (err.message || 'Unknown error'));
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveTool = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let finalImageUrl = imageUrl;

            // Handle File Upload
            if (imageFile) {
                const fileUpload = await storage.createFile(
                    APPWRITE_CONFIG.bucketId,
                    ID.unique(),
                    imageFile
                );
                // Construct View URL
                finalImageUrl = storage.getFileView(APPWRITE_CONFIG.bucketId, fileUpload.$id).href;
            }

            const payload: any = {
                name: toolName,
                category: selectedCategory,
                description,
                tool_type: toolType,
                image_url: finalImageUrl,
                video_url: videoUrl,
                website_url: websiteUrl,
                date_added: editingId ? undefined : new Date().toISOString(),
            };

            // Add Futurepedia fields if present
            if (keyFeatures.length > 0) payload.keyFeatures = keyFeatures;
            if (pros.length > 0) payload.pros = pros;
            if (cons.length > 0) payload.cons = cons;
            if (whoIsUsing.length > 0) payload.whoIsUsing = whoIsUsing;
            if (pricingTiers.length > 0) payload.pricingTiers = JSON.stringify(pricingTiers);
            if (whatMakesUnique) payload.whatMakesUnique = whatMakesUnique;
            if (ratings) payload.ratings = JSON.stringify(ratings);
            if (dataSource) payload.dataSource = dataSource;

            // Debug: Log what we're saving
            console.log('💾 Saving tool with payload:', {
                ...payload,
                keyFeaturesCount: keyFeatures.length,
                prosCount: pros.length,
                consCount: cons.length,
                whoIsUsingCount: whoIsUsing.length,
                pricingTiersCount: pricingTiers.length,
                hasRatings: !!ratings,
                dataSource
            });

            if (editingId) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.tools,
                    editingId,
                    payload
                );
                alert('Tool updated successfully!');
            } else {
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.tools,
                    ID.unique(),
                    payload
                );
                alert('Tool saved successfully!');
            }

            resetForm();
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to save tool');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTool = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tool?')) return;
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.tools,
                id
            );
            fetchData();
        } catch (err) {
            alert('Failed to delete tool');
        }
    };

    const startEdit = (tool: any) => {
        setEditingId(tool.$id);
        setToolName(tool.name);
        setSelectedCategory(tool.category);
        setToolType(tool.tool_type);
        setDescription(tool.description);
        setImageUrl(tool.image_url || '');
        setVideoUrl(tool.video_url || '');
        setWebsiteUrl(tool.website_url || '');
        setImageFile(null);

        // Load Futurepedia fields
        setKeyFeatures(tool.keyFeatures || []);
        setPros(tool.pros || []);
        setCons(tool.cons || []);
        setWhoIsUsing(tool.whoIsUsing || []);
        setPricingTiers(tool.pricingTiers ? JSON.parse(tool.pricingTiers) : []);
        setWhatMakesUnique(tool.whatMakesUnique || '');
        setRatings(tool.ratings ? JSON.parse(tool.ratings) : null);
        setDataSource(tool.dataSource || 'api');

        // Show extended fields if tool has any extended data
        if (tool.keyFeatures?.length > 0 || tool.pros?.length > 0 || tool.cons?.length > 0 || tool.dataSource === 'futurepedia') {
            setShowExtendedFields(true);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setToolName('');
        setSelectedCategory('');
        setToolType('Free');
        setDescription('');
        setImageUrl('');
        setVideoUrl('');
        setWebsiteUrl('');
        setImageFile(null);

        // Reset Futurepedia fields
        setKeyFeatures([]);
        setPros([]);
        setCons([]);
        setWhoIsUsing([]);
        setPricingTiers([]);
        setWhatMakesUnique('');
        setRatings(null);
        setDataSource('api');
        setShowExtendedFields(false);
    };

    const handleLogout = async () => {
        await account.deleteSession('current');
        router.push('/admin/login');
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen p-8 space-y-8 bg-background text-foreground">
            <div className="flex justify-between items-center glass p-4 rounded-xl">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-600">Admin Dashboard</h1>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        style={{ borderColor: '#800000', color: '#800000' }}
                        className="hover:bg-[#800000] hover:text-white"
                    >
                        <Home className="mr-2 h-4 w-4" /> Home
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
                </div>
            </div>

            {/* Quota Display */}
            {quotas.length > 0 && <QuotaDisplay quotas={quotas} />}

            {/* Verification Errors */}
            {verificationErrors.length > 0 && (
                <VerificationErrors
                    errors={verificationErrors}
                    onDismiss={() => setVerificationErrors([])}
                />
            )}

            {/* Unknown Tool Modal */}
            {showUnknownToolModal && unknownToolError && (
                <UnknownToolModal
                    toolName={unknownToolError.name}
                    reason={unknownToolError.reason}
                    onManualEntry={() => {
                        setShowUnknownToolModal(false);
                        // Keep form fields empty for manual entry
                    }}
                    onRetry={() => {
                        setShowUnknownToolModal(false);
                        setToolName('');
                        setUnknownToolError(null);
                    }}
                    onCancel={() => {
                        setShowUnknownToolModal(false);
                        setUnknownToolError(null);
                        resetForm();
                    }}
                />
            )}

            {/* Progress Modal */}
            <ProgressModal
                isOpen={generating}
                websiteUrl={websiteUrl}
                imageUrl={imageUrl}
                videoUrl={videoUrl}
                description={description}
            />

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Forms */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Manage Categories */}
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Manage Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleAddCategory} className="flex gap-2">
                                <Input
                                    placeholder="New Category Name"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="bg-white text-black border-gray-300 placeholder:text-gray-500"
                                />
                                <Button type="submit"><Plus className="h-4 w-4" /></Button>
                            </form>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <div key={cat.$id} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                                        {editingCategoryId === cat.$id ? (
                                            <>
                                                <Input
                                                    value={editingCategoryName}
                                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                                    className="h-6 w-24 text-xs bg-white text-black px-2"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleEditCategory(cat.$id);
                                                        if (e.key === 'Escape') { setEditingCategoryId(null); setEditingCategoryName(''); }
                                                    }}
                                                    autoFocus
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 p-0"
                                                    onClick={() => handleEditCategory(cat.$id)}
                                                >
                                                    <Save className="h-3 w-3 text-green-600" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 p-0"
                                                    onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}
                                                >
                                                    <X className="h-3 w-3 text-gray-600" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <span>{cat.name}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 p-0"
                                                    onClick={() => {
                                                        setEditingCategoryId(cat.$id);
                                                        setEditingCategoryName(cat.name);
                                                    }}
                                                >
                                                    <Edit className="h-3 w-3 text-blue-600" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 p-0"
                                                    onClick={() => handleDeleteCategory(cat.$id)}
                                                >
                                                    <Trash2 className="h-3 w-3 text-red-600" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add/Edit Tool */}
                    <Card className="glass border-primary/20 shadow-lg shadow-primary/10">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>{editingId ? 'Edit Tool' : 'Add New Tool'}</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveTool}
                                    className="bg-primary hover:bg-primary/90"
                                    disabled={saving || !toolName || !selectedCategory || !description}
                                >
                                    {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                    {editingId ? 'Update' : 'Save'}
                                </Button>
                                {editingId && <Button variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveTool} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Tool Name"
                                            value={toolName}
                                            onChange={(e) => setToolName(e.target.value)}
                                            required
                                            className="bg-white text-black border-gray-300 placeholder:text-gray-500 flex-1"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={handleAutoGenerate}
                                            disabled={generating || !toolName}
                                            className="shrink-0"
                                        >
                                            {generating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                            Auto-Generate All
                                        </Button>
                                    </div>
                                </div>

                                <Select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    required
                                    className="bg-white text-black border-gray-300"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.$id} value={cat.$id}>{cat.name}</option>
                                    ))}
                                </Select>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="Free"
                                            checked={toolType === 'Free'}
                                            onChange={(e) => setToolType(e.target.value)}
                                        /> Free
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="Paid"
                                            checked={toolType === 'Paid'}
                                            onChange={(e) => setToolType(e.target.value)}
                                        /> Paid
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-black">Tool Image</label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="file:text-foreground bg-white text-black border-gray-300"
                                        />
                                    </div>
                                    <div className="text-xs text-black text-center">- OR -</div>
                                    <Input
                                        placeholder="Image URL (e.g., https://example.com/logo.png)"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="bg-white text-black border-gray-300 placeholder:text-gray-500"
                                    />
                                </div>

                                <Input
                                    placeholder="Website URL (e.g., https://tool.com)"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="bg-white text-black border-gray-300 placeholder:text-gray-500"
                                />

                                <Input
                                    placeholder="YouTube Video URL"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="bg-white text-black border-gray-300 placeholder:text-gray-500"
                                />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-black">Description</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        maxLength={500}
                                        placeholder="Brief description of the AI tool..."
                                        className="h-32 bg-white text-black border-gray-300 placeholder:text-gray-500"
                                    />

                                    {/* Progress Indicator */}
                                    {generating && (
                                        <Card className="glass mt-2">
                                            <CardContent className="p-3 space-y-2">
                                                <ProgressStep
                                                    label="Searching for official website..."
                                                    active={true}
                                                    complete={!!websiteUrl}
                                                />
                                                <ProgressStep
                                                    label="Fetching logo..."
                                                    active={!!websiteUrl}
                                                    complete={!!imageUrl}
                                                />
                                                <ProgressStep
                                                    label="Finding YouTube video..."
                                                    active={!!imageUrl}
                                                    complete={!!videoUrl}
                                                />
                                                <ProgressStep
                                                    label="Generating description..."
                                                    active={!!videoUrl}
                                                    complete={!!description}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                                {/* Toggle Button for Extended Fields */}
                                {!showExtendedFields && keyFeatures.length === 0 && pros.length === 0 && cons.length === 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowExtendedFields(true)}
                                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Show Enhanced Data Fields (Features, Pros, Cons, etc.)
                                    </Button>
                                )}

                                {/* Futurepedia Extended Fields */}
                                {(showExtendedFields || dataSource === 'futurepedia' || keyFeatures.length > 0 || pros.length > 0 || cons.length > 0) && (
                                    <Card className="bg-purple-50 border-purple-200">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <span className="text-purple-600">✨</span>
                                                Enhanced Data Fields
                                                {dataSource === 'futurepedia' && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                        From Futurepedia
                                                    </span>
                                                )}
                                            </CardTitle>
                                            {showExtendedFields && keyFeatures.length === 0 && pros.length === 0 && cons.length === 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowExtendedFields(false)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Key Features */}
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                                    Key Features ({keyFeatures.length})
                                                </label>
                                                <div className="space-y-2">
                                                    {keyFeatures.map((feature, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <Input
                                                                value={feature}
                                                                onChange={(e) => {
                                                                    const updated = [...keyFeatures];
                                                                    updated[idx] = e.target.value;
                                                                    setKeyFeatures(updated);
                                                                }}
                                                                className="bg-white text-black"
                                                                placeholder="Feature"
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => setKeyFeatures(keyFeatures.filter((_, i) => i !== idx))}
                                                            >
                                                                <X className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setKeyFeatures([...keyFeatures, ''])}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Add Feature
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Pros */}
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                                    Pros ({pros.length})
                                                </label>
                                                <div className="space-y-2">
                                                    {pros.map((pro, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <Input
                                                                value={pro}
                                                                onChange={(e) => {
                                                                    const updated = [...pros];
                                                                    updated[idx] = e.target.value;
                                                                    setPros(updated);
                                                                }}
                                                                className="bg-white text-black"
                                                                placeholder="Pro"
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => setPros(pros.filter((_, i) => i !== idx))}
                                                            >
                                                                <X className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setPros([...pros, ''])}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Add Pro
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Cons */}
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                                    Cons ({cons.length})
                                                </label>
                                                <div className="space-y-2">
                                                    {cons.map((con, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <Input
                                                                value={con}
                                                                onChange={(e) => {
                                                                    const updated = [...cons];
                                                                    updated[idx] = e.target.value;
                                                                    setCons(updated);
                                                                }}
                                                                className="bg-white text-black"
                                                                placeholder="Con"
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => setCons(cons.filter((_, i) => i !== idx))}
                                                            >
                                                                <X className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setCons([...cons, ''])}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Add Con
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* What Makes Unique */}
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                                    What Makes It Unique
                                                </label>
                                                <Textarea
                                                    value={whatMakesUnique}
                                                    onChange={(e) => setWhatMakesUnique(e.target.value)}
                                                    className="bg-white text-black"
                                                    placeholder="What makes this tool unique..."
                                                    rows={3}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <Card className="h-full glass">
                        <CardHeader>
                            <CardTitle className="text-black">Existing Tools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[800px] overflow-y-auto pr-2">
                                {tools.map((tool) => (
                                    <div key={tool.$id} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-black/10 hover:bg-white/70 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-black">{tool.name}</h4>
                                            <p className="text-xs text-black">{categories.find(c => c.$id === tool.category)?.name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(tool)}>
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteTool(tool.$id)}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
