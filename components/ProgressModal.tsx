import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressStep } from '@/components/ProgressStep';

interface ProgressModalProps {
    isOpen: boolean;
    websiteUrl: string;
    imageUrl: string;
    videoUrl: string;
    description: string;
}

export function ProgressModal({ isOpen, websiteUrl, imageUrl, videoUrl, description }: ProgressModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4">
                <Card className="glass border-primary/20 shadow-2xl">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-600">
                            Auto-Generating Tool Data
                        </h3>
                        <div className="space-y-3">
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
