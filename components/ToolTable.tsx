import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface ToolTableProps {
    tools: any[];
    categories: any[];
}

export default function ToolTable({ tools, categories }: ToolTableProps) {
    const router = useRouter();

    const getCategoryName = (id: string) => {
        return categories.find(c => c.$id === id)?.name || 'Unknown';
    };

    return (
        <div className="w-full overflow-auto rounded-lg border border-white/20 glass-card">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-white/10 border-b border-white/10">
                    <tr>
                        <th className="px-6 py-3">Tool Name</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Date Added</th>
                    </tr>
                </thead>
                <tbody>
                    {tools.map((tool) => (
                        <tr
                            key={tool.$id}
                            className="border-b border-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => router.push(`/tool/${tool.$id}`)}
                        >
                            <td className="px-6 py-4 font-medium">{tool.name}</td>
                            <td className="px-6 py-4">
                                <Badge variant="glass">{getCategoryName(tool.category)}</Badge>
                            </td>
                            <td className="px-6 py-4 max-w-md" title={tool.description}>
                                {/* Removed truncate to show full description as requested */}
                                {tool.description}
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant={tool.tool_type === 'Free' ? 'secondary' : 'default'}>
                                    {tool.tool_type}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {new Date(tool.date_added).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
