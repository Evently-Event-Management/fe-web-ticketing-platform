'use client';

import * as React from 'react';
import {useState} from 'react';
import {UseFormGetValues} from 'react-hook-form';
import MDEditor from '@uiw/react-md-editor';
import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Wand2, AlertTriangle, Loader2, Sparkles, Brain} from 'lucide-react';
import {toast} from 'sonner';
import {getOverview} from '@/lib/actions/aiActions';
import {CreateEventFormData} from '@/lib/validators/event';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useTheme} from "next-themes";

interface GeminiMarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    getValues: UseFormGetValues<CreateEventFormData>;
    organizationName: string;
}

export function GeminiMarkdownEditor({value, onChange, getValues, organizationName}: GeminiMarkdownEditorProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const {resolvedTheme} = useTheme();

    const handleGenerate = async () => {
        const {title, description, categoryName} = getValues();

        if (!title) {
            toast.error("Please enter an Event Title before generating an overview.");
            return;
        }

        setIsGenerating(true);
        toast.loading("AI is crafting your content...");

        try {
            const request = {
                title,
                organization: organizationName,
                description: description || '',
                category: categoryName || '',
                prompt: prompt || 'Make it exciting and comprehensive.'
            };

            const response = await getOverview(request);
            onChange(response.markdownContent);

            toast.dismiss();
            toast.success("✨ AI magic complete!", {
                description: "Your content is ready! Review and customize as needed.",
                duration: 5000,
            });

            setIsDialogOpen(false);
            setPrompt('');
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Oops! The AI had a hiccup. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="space-y-4">
            {/* Simplified Header */}
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg border">
                <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary"/>
                    <div>
                        <Label className="font-semibold">Event Overview</Label>
                        <p className="text-xs text-muted-foreground">Powered by AI</p>
                    </div>
                </div>
                <Button type="button" size="sm" onClick={() => setIsDialogOpen(true)}>
                    <Wand2 className="mr-2 h-4 w-4"/>
                    Generate with AI
                </Button>
            </div>

            {/* Editor with Simplified Placeholder */}
            <div
                data-color-mode={resolvedTheme}
                className="relative rounded-md border"
            >
                <MDEditor
                    value={value || ''}
                    onChange={(val) => onChange(val || '')}
                    height={500}
                    preview="preview"
                />
                {!value && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Click <span
                                className="font-semibold text-primary">Generate with AI</span> to create your event
                                overview.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Simplified Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 flex items-center justify-center bg-primary/10 rounded-full">
                                <Sparkles className="h-8 w-8 text-primary"/>
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl">
                            Generate with AI
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Provide any extra details below to guide the AI.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Standard Alert */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>Always Review AI Content</AlertTitle>
                        <AlertDescription>
                            Carefully check the generated text for accuracy before publishing.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="prompt">
                            Additional Instructions <span className="text-xs text-muted-foreground">(Optional)</span>
                        </Label>
                        <Textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Focus on networking, mention it's for beginners..."
                            className="min-h-24"
                            disabled={isGenerating}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isGenerating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="min-w-28" // Set a min-width to prevent layout shift
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Generating
                                </>
                            ) : (
                                "Generate"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}