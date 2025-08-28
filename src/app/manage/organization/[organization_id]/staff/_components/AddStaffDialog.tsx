"use client";

import React, {useState} from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {inviteStaffToOrganization} from '@/lib/actions/organizationActions';
import {OrganizationMemberResponse, OrganizationRole} from '@/types/oraganizations';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {toast} from 'sonner';

// Form schema for adding staff
const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    role: z.string().min(1, 'Please select a role'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    onSuccess: (newMember: OrganizationMemberResponse) => void;
}

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
                                                                  open,
                                                                  onOpenChange,
                                                                  organizationId,
                                                                  onSuccess,
                                                              }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            role: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            setIsSubmitting(true);
            // Show loading toast
            const loadingToast = toast.loading('Inviting staff member...');

            // Convert the role value to an array as the API expects string[]
            const newMember = await inviteStaffToOrganization(organizationId, {
                email: values.email,
                roles: [values.role],
            });

            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Staff member invited successfully');
            onSuccess(newMember);
            form.reset();
        } catch (error) {
            console.error('Failed to invite staff:', error);
            // Ensure loading toast is dismissed on error
            toast.dismiss();
            toast.error('Failed to invite staff member. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Staff Member</DialogTitle>
                    <DialogDescription>
                        Invite a new staff member to your organization.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        We&#39;ll send an invitation to this email address.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={OrganizationRole.SCANNER}>
                                                Scanner
                                            </SelectItem>
                                            {/* Additional roles can be added here in the future */}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The permission level for this staff member.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Inviting...' : 'Invite Staff'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
