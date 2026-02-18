import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; 
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { CreatableSelect } from "@/components/CreatableSelect";
import { MultiSelect } from "@/components/MultiSelect"; 
import { 
    useGetCourtsQuery, useAddCourtMutation, 
    useGetStagesQuery, useAddStageMutation,
    useGetCaseTypesQuery, useAddCaseTypeMutation,
    useGetPartyRolesQuery, useAddPartyRoleMutation,
    useGetAllCasesListQuery 
} from "./dashboardApi";
import { toast } from "sonner"; 
import { Textarea } from "@/components/ui/textarea";

const caseSchema = z.object({
  registrationDate: z.string().or(z.date()).nullable().optional(),
  previousDate: z.string().or(z.date()).nullable().optional(),
  courtName: z.string().optional(),
  caseNo: z.string().optional(),
  nameOfParty: z.string().optional(),
  particulars: z.string().optional(),
  stage: z.string().optional(),
  nextDate: z.string().or(z.date()).nullable().optional(),
  notes: z.string().optional(),
  caseType: z.string().optional(),
  oppositePartyName: z.string().optional(),
  oppositeCounselName: z.string().optional(),
  roleOfParty: z.string().optional(),
  additionalParties: z.string().optional(),
  additionalOppositeParties: z.string().optional(),
  linkedCases: z.array(z.string()).optional(), 
});

type CaseFormProps = {
    initialData?: any; 
    onSubmit: (data: any) => void;
    isLoading: boolean;
    isUpdate?: boolean;
    isAddingHearing?: boolean;
};

export function CaseForm({ initialData, onSubmit, isLoading, isAddingHearing }: CaseFormProps) {
    // Courts
    const { data: courts = [] } = useGetCourtsQuery({});
    const [addCourt] = useAddCourtMutation();
    // Stages
    const { data: stages = [] } = useGetStagesQuery({});
    const [addStage] = useAddStageMutation();
    // Case Types
    const { data: caseTypes = [] } = useGetCaseTypesQuery({});
    const [addCaseType] = useAddCaseTypeMutation();
    // Party Roles
    const { data: partyRoles = [] } = useGetPartyRolesQuery({});
    const [addPartyRole] = useAddPartyRoleMutation();
    // All Cases for Linking
    const { data: allCases = [] } = useGetAllCasesListQuery({});

    const defaultValues = {
        caseNo: "",
        nameOfParty: "",
        particulars: "",
        courtName: "",
        stage: "",
        registrationDate: null,
        previousDate: null,
        nextDate: null,
        notes: "",
        caseType: "",
        oppositePartyName: "",
        oppositeCounselName: "",
        roleOfParty: "",
        additionalParties: "",
        additionalOppositeParties: "",
        linkedCases: [], 
    };

    const form = useForm<z.infer<typeof caseSchema>>({
        resolver: zodResolver(caseSchema),
        defaultValues: initialData || defaultValues,
    });

    const navigate = useNavigate();
    const [isLinking, setIsLinking] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Transform linkedCases if they are objects (from population) to strings (Ids)
            const cleanData = { ...initialData };
            if (Array.isArray(cleanData.linkedCases)) {
                cleanData.linkedCases = cleanData.linkedCases.map((c: any) => 
                    typeof c === 'object' ? c._id : c
                );
            }
            form.reset(cleanData);
            if (cleanData.linkedCases && cleanData.linkedCases.length > 0) {
                setIsLinking(true);
            }
        } else {
            form.reset(defaultValues);
        }
    }, [initialData, form]);

    // Helpers
    const handleCreateCourt = async (name: string) => {
        try {
            const res = await addCourt({ name }).unwrap();
            form.setValue("courtName", res.name);
            toast.success(`Court "${name}" created`);
        } catch (error) { toast.error("Failed to create court"); }
    };
    const handleCreateStage = async (name: string) => {
        try {
            const res = await addStage({ name }).unwrap();
            form.setValue("stage", res.name);
            toast.success(`Stage "${name}" created`);
        } catch (error) { toast.error("Failed to create stage"); }
    }
    const handleCreateCaseType = async (name: string) => {
        try {
            const res = await addCaseType({ name }).unwrap();
            form.setValue("caseType", res.name);
            toast.success(`Case Type "${name}" created`);
        } catch (error) { toast.error("Failed to create case type"); }
    }
    const handleCreatePartyRole = async (name: string) => {
        try {
            const res = await addPartyRole({ name }).unwrap();
            form.setValue("roleOfParty", res.name);
            toast.success(`Role "${name}" created`);
        } catch (error) { toast.error("Failed to create role"); }
    }

    const courtOptions = courts.map((c: any) => ({ label: c.name, value: c.name }));
    const stageOptions = stages.map((s: any) => ({ label: s.name, value: s.name }));
    const caseTypeOptions = caseTypes.map((ct: any) => ({ label: ct.name, value: ct.name }));
    const partyRoleOptions = partyRoles.map((pr: any) => ({ label: pr.name, value: pr.name }));
    
    // Filter out current case if updating to prevent self-linking
    const caseOptions = allCases
        .filter((c: any) => !initialData || c._id !== initialData._id)
        .map((c: any) => ({
            label: `${c.caseNo || "No Case No"} - ${c.nameOfParty || "Unknown Party"}`,
            value: c._id
        }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* ... (Existing Fields: Dates, Court, CaseNo, Parties etc.) ... */}
                {/* To avoid overwriting all fields and making the diff huge, I will try to target sections or rely on previous tools context, but replace_file_content replaces block. */}
                {/* Re-implementing the structure as I am replacing the whole file content effectively or large block */}
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="registrationDate" render={({ field }) => (
                        <FormItem><FormLabel>{isAddingHearing ? "Previous Hearing Date (Internal Link)" : "Registration Date"}</FormLabel>
                        <CustomDatePicker date={field.value ? new Date(field.value) : undefined} onChange={field.onChange} /><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="previousDate" render={({ field }) => (
                        <FormItem><FormLabel>Previous Date</FormLabel>
                        <CustomDatePicker date={field.value ? new Date(field.value) : undefined} onChange={field.onChange} /><FormMessage /></FormItem>
                    )}/>
                </div>

                <FormField control={form.control} name="courtName" render={({ field }) => (
                    <FormItem><FormLabel>Court Name</FormLabel>
                    <CreatableSelect options={courtOptions} value={field.value} onChange={field.onChange} onCreate={handleCreateCourt} placeholder="Select Court" /><FormMessage /></FormItem>
                )}/>

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="caseNo" render={({ field }) => (
                        <FormItem><FormLabel>Case No</FormLabel><FormControl><Input placeholder="Case No" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="caseType" render={({ field }) => (
                        <FormItem><FormLabel>Case Type</FormLabel>
                        <CreatableSelect options={caseTypeOptions} value={field.value} onChange={field.onChange} onCreate={handleCreateCaseType} placeholder="Select Type" /><FormMessage /></FormItem>
                    )}/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-4">
                        <FormField control={form.control} name="nameOfParty" render={({ field }) => (
                            <FormItem><FormLabel>Name of Party</FormLabel><FormControl><Input placeholder="Name of Party" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="roleOfParty" render={({ field }) => (
                            <FormItem><FormLabel>Role of Party</FormLabel>
                            <CreatableSelect options={partyRoleOptions} value={field.value} onChange={field.onChange} onCreate={handleCreatePartyRole} placeholder="Select Role" /><FormMessage /></FormItem>
                        )}/>
                     </div>
                     <FormField control={form.control} name="additionalParties" render={({ field }) => (
                        <FormItem className="h-full"><FormLabel>Additional Parties</FormLabel><FormControl><Textarea className="h-[calc(100%-2rem)] resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-4">
                        <FormField control={form.control} name="oppositePartyName" render={({ field }) => (
                            <FormItem><FormLabel>Opposite Party</FormLabel><FormControl><Input placeholder="Opposite Party Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="oppositeCounselName" render={({ field }) => (
                            <FormItem><FormLabel>Opposite Counsel</FormLabel><FormControl><Input placeholder="Opposite Counsel Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                     </div>
                     <FormField control={form.control} name="additionalOppositeParties" render={({ field }) => (
                        <FormItem className="h-full"><FormLabel>Additional Party (Opposite)</FormLabel><FormControl><Textarea className="h-[calc(100%-2rem)] resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>

                <FormField control={form.control} name="particulars" render={({ field }) => (
                    <FormItem><FormLabel>Particulars</FormLabel><FormControl><Input placeholder="Particulars" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="stage" render={({ field }) => (
                        <FormItem><FormLabel>Stage</FormLabel>
                        <CreatableSelect options={stageOptions} value={field.value} onChange={field.onChange} onCreate={handleCreateStage} placeholder="Select Stage" /><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="nextDate" render={({ field }) => (
                        <FormItem><FormLabel>{isAddingHearing ? "New Hearing Date (Next Date)" : "Next Date"}</FormLabel>
                        <CustomDatePicker date={field.value ? new Date(field.value) : undefined} onChange={field.onChange} /><FormMessage /></FormItem>
                    )}/>
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><FormLabel>Note</FormLabel><FormControl><Textarea placeholder="Add a note..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                {/* Linked Cases Section */}
                <div className="space-y-2 border-t pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="link-cases" 
                            checked={isLinking}
                            onCheckedChange={(checked) => setIsLinking(checked as boolean)}
                        />
                        <label
                            htmlFor="link-cases"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Link other cases?
                        </label>
                    </div>
                    
                    {isLinking && (
                        <FormField
                            control={form.control}
                            name="linkedCases"
                            render={({ field }) => (
                                <FormItem>
                                    <MultiSelect
                                        options={caseOptions}
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        placeholder="Select cases to link..."
                                        onExplorerClick={(id) => navigate(`/cases/${id}`)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Case"}
                </Button>
            </form>
        </Form>
    );
}
