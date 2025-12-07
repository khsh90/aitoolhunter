import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ToolCardProps {
    tool: any;
    categoryName: string;
}

export default function ToolCard({ tool, categoryName }: ToolCardProps) {
    const date = new Date(tool.date_added).toLocaleDateString();

    return (
        <Link href={`/tool/${tool.$id}`}>
            <Card className="flex flex-col h-full hover:scale-[1.02] transition-transform duration-200 cursor-pointer overflow-hidden animate-on-scroll">
                {/* Elegant logo display with beautiful styling */}
                {tool.image_url && (
                    <div className="relative w-full h-32 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 flex items-center justify-center p-6 backdrop-blur-sm">
                        <div className="relative w-24 h-24 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center p-3 hover:scale-105 transition-transform duration-300">
                            <Image
                                src={tool.image_url}
                                alt={tool.name}
                                width={72}
                                height={72}
                                className="object-contain drop-shadow-2xl"
                                sizes="72px"
                            />
                        </div>
                    </div>
                )}
                <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-base line-clamp-1 text-white">{tool.name}</h3>
                        <Badge variant={tool.tool_type === 'Free' ? 'secondary' : 'default'} className="text-xs shrink-0">
                            {tool.tool_type}
                        </Badge>
                    </div>
                    <Badge variant="outline" className="w-fit mt-1 text-xs text-slate-300 border-slate-500">
                        {categoryName}
                    </Badge>
                </CardHeader>
                <CardContent className="flex-grow px-4 pb-3">
                    <p className="text-xs text-slate-200 line-clamp-2">
                        {tool.description}
                    </p>
                </CardContent>
                <CardFooter className="text-xs text-slate-400 border-t border-white/10 pt-2 pb-3 px-4 mt-auto flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {date}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
