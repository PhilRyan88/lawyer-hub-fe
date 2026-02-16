import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
} from "../Dashboard/dashboardApi"; // Adjust path if needed

// Reusable Component for Each Tab
const DropdownTab = ({
    title,
    data,
    isLoading,
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
            } catch (error: any) {
                toast.error("Failed to delete");
            }
            setDeleteConfirmation({ isOpen: false, id: null });
        }
    }

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                 <h3 className="text-lg font-medium">{title} List</h3>
                 <Button onClick={() => handleOpenModal()} className="bg-sky-500 hover:bg-sky-600">
                    <Plus className="h-4 w-4 mr-2" /> Add {title}
                 </Button>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((item: any) => (
                            <TableRow key={item._id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                                            <Edit2 className="h-4 w-4 text-sky-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmation({ isOpen: true, id: item._id })}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {data?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                    No {title.toLowerCase()}s found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder={placeholder} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

             <ConfirmDialog 
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title={`Delete ${title}`}
                description="Are you sure you want to delete this item? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
};

export default function DropdownsPage() {
    // Queries
    const { data: courts = [], isLoading: isCourtsLoading } = useGetCourtsQuery({});
    const { data: stages = [], isLoading: isStagesLoading } = useGetStagesQuery({});
    const { data: caseTypes = [], isLoading: isCaseTypesLoading } = useGetCaseTypesQuery({});
    const { data: partyRoles = [], isLoading: isPartyRolesLoading } = useGetPartyRolesQuery({});

    // Mutations
    const [addCourt] = useAddCourtMutation();
    const [updateCourt] = useUpdateCourtMutation();
    const [deleteCourt] = useDeleteCourtMutation();

    const [addStage] = useAddStageMutation();
    const [updateStage] = useUpdateStageMutation();
    const [deleteStage] = useDeleteStageMutation();

    const [addCaseType] = useAddCaseTypeMutation();
    const [updateCaseType] = useUpdateCaseTypeMutation();
    const [deleteCaseType] = useDeleteCaseTypeMutation();

    const [addPartyRole] = useAddPartyRoleMutation();
    const [updatePartyRole] = useUpdatePartyRoleMutation();
    const [deletePartyRole] = useDeletePartyRoleMutation();

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Manage Dropdowns</h1>
            
            <Tabs defaultValue="court" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                    <TabsTrigger value="court" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Court Name</TabsTrigger>
                    <TabsTrigger value="stage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Stage</TabsTrigger>
                    <TabsTrigger value="casetype" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Case Types</TabsTrigger>
                    <TabsTrigger value="partyrole" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Role of Party</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="court">
                        <DropdownTab 
                            title="Court" 
                            data={courts} 
                            isLoading={isCourtsLoading}
                            onAdd={addCourt} onUpdate={updateCourt} onDelete={deleteCourt}
                            placeholder="e.g. High Court"
                        />
                    </TabsContent>

                    <TabsContent value="stage">
                        <DropdownTab 
                            title="Stage" 
                            data={stages} 
                            isLoading={isStagesLoading}
                            onAdd={addStage} onUpdate={updateStage} onDelete={deleteStage}
                             placeholder="e.g. Hearing"
                        />
                    </TabsContent>

                    <TabsContent value="casetype">
                        <DropdownTab 
                            title="Case Type" 
                            data={caseTypes} 
                            isLoading={isCaseTypesLoading}
                            onAdd={addCaseType} onUpdate={updateCaseType} onDelete={deleteCaseType}
                             placeholder="e.g. Criminal Appeal"
                        />
                    </TabsContent>

                    <TabsContent value="partyrole">
                         <DropdownTab 
                            title="Party Role" 
                            data={partyRoles} 
                            isLoading={isPartyRolesLoading}
                            onAdd={addPartyRole} onUpdate={updatePartyRole} onDelete={deletePartyRole}
                             placeholder="e.g. Petitioner"
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
