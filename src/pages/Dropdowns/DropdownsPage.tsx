import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, Trash2, Settings2, ShieldCheck, ChevronRight, Scale } from "lucide-react";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import {
    useGetCourtsQuery, useAddCourtMutation, useUpdateCourtMutation, useDeleteCourtMutation,
    useGetStagesQuery, useAddStageMutation, useUpdateStageMutation, useDeleteStageMutation,
    useGetCaseTypesQuery, useAddCaseTypeMutation, useUpdateCaseTypeMutation, useDeleteCaseTypeMutation,
    useGetPartyRolesQuery, useAddPartyRoleMutation, useUpdatePartyRoleMutation, useDeletePartyRoleMutation,
} from "../Dashboard/dashboardApi";

const DropdownTab = ({
    title,
    data,
    isLoading,
    isSubmitting,
    isDeleting,
    onAdd,
    onUpdate,
    onDelete,
    placeholder
}: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

    const formSchema = z.object({
        name: z.string().min(1, "Name is required").trim(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "" },
    });

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            form.reset({ name: item.name });
        } else {
            setEditingItem(null);
            form.reset({ name: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingItem) {
                await onUpdate({ id: editingItem._id, name: values.name }).unwrap();
                toast.success(`${title} updated successfully`);
            } else {
                await onAdd({ name: values.name }).unwrap();
                toast.success(`${title} added successfully`);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmation.id) {
            try {
                await onDelete(deleteConfirmation.id).unwrap();
                toast.success("Deleted successfully");
                setDeleteConfirmation({ isOpen: false, id: null });
            } catch (error: any) {
                toast.error("Failed to delete");
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                 <div>
                    <h3 className="text-xl font-bold">{title} Configuration</h3>
                    <p className="text-sm text-slate-500">Manage available options for {title.toLowerCase()}s</p>
                 </div>
                 <Button onClick={() => handleOpenModal()} className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary">
                    <Plus className="h-5 w-5 mr-1.5" /> New {title}
                 </Button>
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 rounded-[24px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="h-14 px-6 text-slate-400 font-black uppercase text-[11px] tracking-widest">Entry Name</TableHead>
                            <TableHead className="h-14 px-6 text-right text-slate-400 font-black uppercase text-[11px] tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={2} className="h-40 text-center text-slate-400 italic">Data is loading...</TableCell></TableRow>
                        ) : data?.map((item: any) => (
                            <TableRow key={item._id} className="group hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800/50">
                                <TableCell className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 rounded-full bg-primary/20 group-hover:bg-primary transition-all" />
                                        {item.name}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmation({ isOpen: true, id: item._id })} className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {data?.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={2} className="h-40 text-center text-slate-400 italic">
                                    No entries found for {title.toLowerCase()}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{editingItem ? `Edit ${title}` : `New ${title}`}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-500">Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder={placeholder} {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 font-bold" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20">
                                    {isSubmitting ? (
                                         <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                         </div>
                                    ) : (editingItem ? "Update Entry" : "Create Entry")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

             <ConfirmDialog 
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title={`Delete ${title}`}
                description="Are you sure you want to delete this item? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
};

export default function DropdownsPage() {
    const { data: courts = [], isLoading: isCourtsLoading } = useGetCourtsQuery({});
    const { data: stages = [], isLoading: isStagesLoading } = useGetStagesQuery({});
    const { data: caseTypes = [], isLoading: isCaseTypesLoading } = useGetCaseTypesQuery({});
    const { data: partyRoles = [], isLoading: isPartyRolesLoading } = useGetPartyRolesQuery({});

    const [addCourt, { isLoading: isAddingCourt }] = useAddCourtMutation();
    const [updateCourt, { isLoading: isUpdatingCourt }] = useUpdateCourtMutation();
    const [deleteCourt, { isLoading: isDeletingCourt }] = useDeleteCourtMutation();

    const [addStage, { isLoading: isAddingStage }] = useAddStageMutation();
    const [updateStage, { isLoading: isUpdatingStage }] = useUpdateStageMutation();
    const [deleteStage, { isLoading: isDeletingStage }] = useDeleteStageMutation();

    const [addCaseType, { isLoading: isAddingCaseType }] = useAddCaseTypeMutation();
    const [updateCaseType, { isLoading: isUpdatingCaseType }] = useUpdateCaseTypeMutation();
    const [deleteCaseType, { isLoading: isDeletingCaseType }] = useDeleteCaseTypeMutation();

    const [addPartyRole, { isLoading: isAddingPartyRole }] = useAddPartyRoleMutation();
    const [updatePartyRole, { isLoading: isUpdatingPartyRole }] = useUpdatePartyRoleMutation();
    const [deletePartyRole, { isLoading: isDeletingPartyRole }] = useDeletePartyRoleMutation();

    return (
        <div className="space-y-8">
            <div className="bg-white/50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Settings2 className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Admin Controls</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage global dropdown options and system preferences</p>
                    </div>
                </div>
            </div>
            
            <Tabs defaultValue="court" className="w-full space-y-8">
                <TabsList className="w-full justify-start rounded-[20px] bg-slate-100/50 dark:bg-slate-900/50 p-1.5 h-auto border border-slate-200/50 dark:border-slate-800 flex overflow-x-auto scrollbar-hide">
                    <TabsTrigger value="court" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary px-6 py-2.5 font-bold transition-all text-slate-500 flex items-center gap-2">
                        <Scale className="h-4 w-4" /> Court Names
                    </TabsTrigger>
                    <TabsTrigger value="stage" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary px-6 py-2.5 font-bold transition-all text-slate-500 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" /> Stages
                    </TabsTrigger>
                    <TabsTrigger value="casetype" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary px-6 py-2.5 font-bold transition-all text-slate-500 flex items-center gap-2">
                        <Settings2 className="h-4 w-4" /> Case Types
                    </TabsTrigger>
                    <TabsTrigger value="partyrole" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary px-6 py-2.5 font-bold transition-all text-slate-500 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Party Roles
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8 transition-all duration-500">
                    <TabsContent value="court" className="focus-visible:outline-none">
                        <DropdownTab 
                            title="Court" 
                            data={courts} 
                            isLoading={isCourtsLoading}
                            isSubmitting={isAddingCourt || isUpdatingCourt}
                            isDeleting={isDeletingCourt}
                            onAdd={addCourt} onUpdate={updateCourt} onDelete={deleteCourt}
                            placeholder="e.g. High Court Of Karnataka"
                        />
                    </TabsContent>

                    <TabsContent value="stage" className="focus-visible:outline-none">
                        <DropdownTab 
                            title="Stage" 
                            data={stages} 
                            isLoading={isStagesLoading}
                            isSubmitting={isAddingStage || isUpdatingStage}
                            isDeleting={isDeletingStage}
                            onAdd={addStage} onUpdate={updateStage} onDelete={deleteStage}
                             placeholder="e.g. Cross Examination"
                        />
                    </TabsContent>

                    <TabsContent value="casetype" className="focus-visible:outline-none">
                        <DropdownTab 
                            title="Case Type" 
                            data={caseTypes} 
                            isLoading={isCaseTypesLoading}
                            isSubmitting={isAddingCaseType || isUpdatingCaseType}
                            isDeleting={isDeletingCaseType}
                            onAdd={addCaseType} onUpdate={updateCaseType} onDelete={deleteCaseType}
                             placeholder="e.g. Civil Suit (Original)"
                        />
                    </TabsContent>

                    <TabsContent value="partyrole" className="focus-visible:outline-none">
                         <DropdownTab 
                            title="Party Role" 
                            data={partyRoles} 
                            isLoading={isPartyRolesLoading}
                            isSubmitting={isAddingPartyRole || isUpdatingPartyRole}
                            isDeleting={isDeletingPartyRole}
                            onAdd={addPartyRole} onUpdate={updatePartyRole} onDelete={deletePartyRole}
                             placeholder="e.g. Plaintiff / Petitioner"
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
