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
import {Wand2, AlertTriangle, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {getOverview} from '@/lib/actions/aiActions';
import {CreateEventFormData} from '@/lib/validators/event';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

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

    const handleGenerate = async () => {
        const {title, description, categoryName} = getValues();

        if (!title) {
            toast.error("Please enter an Event Title before generating an overview.");
            return;
        }

        setIsGenerating(true);
        toast.loading("Generating with AI...");

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
            // ++ POST-GENERATION PROMPT: A more descriptive success toast
            toast.success("Content generated successfully!", {
                description: "Please review the generated overview and edit any details as needed.",
                duration: 5000,
            });

            setIsDialogOpen(false);
            setPrompt('');
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("An error occurred while generating the overview. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const colorMode = document.documentElement.getAttribute('data-color-mode') || 'light';

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label>Overview</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                    <Wand2 className="mr-2 h-4 w-4"/>
                    Generate with AI
                </Button>
            </div>

            <div data-color-mode={colorMode}>
                <MDEditor
                    value={value || ''}
                    onChange={(val) => onChange(val || '')}
                    height={300}
                    preview="edit"
                />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Event Overview with AI</DialogTitle>
                        <DialogDescription>
                            Provide any additional instructions or keywords. We&#39;ll use the event details you&#39;ve
                            already entered.
                        </DialogDescription>
                    </DialogHeader>

                    {/* ++ DISCLAIMER: Added an alert to warn the user */}
                    <Alert variant="default">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>Review is Required</AlertTitle>
                        <AlertDescription>
                            AI can make mistakes. Please carefully review and edit the generated content to ensure all
                            details are accurate before publishing.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 py-4">
                        <Label htmlFor="prompt">Additional Instructions (Optional)</Label>
                        <Textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Focus on the networking opportunities. Mention that it's beginner-friendly."
                            className="min-h-24"
                        />
                    </div>
                    <DialogFooter>
                        {/* ++ ANIMATION: The button now shows an animated loading state */}
                        <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Please wait...
                                </>
                            ) : (
                                "✨ Generate"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}