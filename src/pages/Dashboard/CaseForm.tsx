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
import { 
    Calendar, Scale, Gavel, User, Users, 
    FileText, Link as LinkIcon, Info, Briefcase,
    Plus, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  vakkalath: z.string().optional(),
});

type CaseFormProps = {
    initialData?: any; 
    onSubmit: (data: any) => void;
    isLoading: boolean;
    isUpdate?: boolean;
    isAddingHearing?: boolean;
};

export function CaseForm({ initialData, onSubmit, isLoading, isAddingHearing }: CaseFormProps) {
    const { data: courts = [] } = useGetCourtsQuery({});
    const [addCourt] = useAddCourtMutation();
    const { data: stages = [] } = useGetStagesQuery({});
    const [addStage] = useAddStageMutation();
    const { data: caseTypes = [] } = useGetCaseTypesQuery({});
    const [addCaseType] = useAddCaseTypeMutation();
    const { data: partyRoles = [] } = useGetPartyRolesQuery({});
    const [addPartyRole] = useAddPartyRoleMutation();
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
        vakkalath: "",
    };

    const form = useForm<z.infer<typeof caseSchema>>({
        resolver: zodResolver(caseSchema),
        defaultValues: initialData || defaultValues,
    });

    const navigate = useNavigate();
    const [isLinking, setIsLinking] = useState(false);

    useEffect(() => {
        if (initialData) {
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
    
    const caseOptions = allCases
        .filter((c: any) => !initialData || c._id !== initialData._id)
        .map((c: any) => ({
            label: `${c.caseNo || "No Case No"} - ${c.nameOfParty || "Unknown Party"}`,
            value: c._id
        }));

    const SectionTitle = ({ icon: Icon, title, description }: any) => (
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h3>
                {description && <p className="text-[11px] text-slate-400 font-medium">{description}</p>}
            </div>
        </div>
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
                
                {/* Section 1: Core Timeline & Court */}
                <div className="group transition-all">
                    <SectionTitle icon={Gavel} title="Timeline & Authority" description="Standard case identifiers and hearing dates" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField control={form.control} name="registrationDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 opacity-50" /> {isAddingHearing ? "Prev. Hearing" : "Reg. Date"}</FormLabel>
                                <CustomDatePicker date={field.value ? new Date(field.value) : undefined} onChange={field.onChange} />
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="previousDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Info className="h-3.5 w-3.5 opacity-50" /> Previous Date</FormLabel>
                                <CustomDatePicker date={field.value ? new Date(field.value) : undefined} onChange={field.onChange} />
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="nextDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 font-bold text-rose-500"><Gavel className="h-3.5 w-3.5" /> {isAddingHearing ? "New Hearing" : "Next Date"}</FormLabel>
                                <CustomDatePicker date={field.value ? new Date(field.value) : undefined} onChange={field.onChange} />
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <FormField control={form.control} name="courtName" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Scale className="h-3.5 w-3.5 opacity-50" /> Court Name</FormLabel>
                                <CreatableSelect options={courtOptions} value={field.value} onChange={field.onChange} onCreate={handleCreateCourt} placeholder="Select or create court..." />
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="caseNo" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 font-bold text-primary"><FileText className="h-3.5 w-3.5" /> Case Number</FormLabel>
                                <FormControl><Input placeholder="e.g. OS 123/2024" className="h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="caseType" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 opacity-50" /> Case Type</FormLabel>
                                <CreatableSelect options={caseTypeOptions} value={field.value} onChange={field.onChange} onCreate={handleCreateCaseType} placeholder="Select or create type..." />
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </div>

                {/* Section 2: Client Details */}
                <div>
                   <SectionTitle icon={User} title="Client Representation" description="Information about the party you are representing" />
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <FormField control={form.control} name="nameOfParty" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name of Party</FormLabel>
                                    <FormControl><Input placeholder="Client Name" className="h-10 rounded-xl" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="roleOfParty" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role of Party</FormLabel>
                                    <CreatableSelect options={partyRoleOptions} value={field.value} onChange={field.onChange} onCreate={handleCreatePartyRole} placeholder="Select role..." />
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="vakkalath" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vakkalath</FormLabel>
                                    <FormControl><Input placeholder="Enter Vakkalath" className="h-10 rounded-xl" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="additionalParties" render={({ field }) => (
                            <FormItem className="h-full">
                                <FormLabel>Additional Parties</FormLabel>
                                <FormControl><Textarea className="min-h-[116px] lg:h-[calc(100%-2rem)] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 resize-none" placeholder="Co-petitioners, etc." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                   </div>
                </div>

                {/* Section 3: Opposition */}
                <div>
                    <SectionTitle icon={Users} title="Opposite Party" description="Details of the defending party and their counsel" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <FormField control={form.control} name="oppositePartyName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Opposite Party Name</FormLabel>
                                    <FormControl><Input placeholder="Defendant Name" className="h-10 rounded-xl border-dashed" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="oppositeCounselName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Opposite Counsel</FormLabel>
                                    <FormControl><Input placeholder="Counsel Name" className="h-10 rounded-xl" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="additionalOppositeParties" render={({ field }) => (
                            <FormItem className="h-full">
                                <FormLabel>Additional Party (Opposite)</FormLabel>
                                <FormControl><Textarea className="min-h-[116px] lg:h-[calc(100%-2rem)] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 resize-none" placeholder="Other defendants..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </div>

                {/* Section 4: Case Logistics & Notes */}
                <div>
                    <SectionTitle icon={FileText} title="Current Status & Notes" description="Next steps and general observations" />
                    <div className="grid grid-cols-1 gap-6">
                        <FormField control={form.control} name="stage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Stage</FormLabel>
                                <CreatableSelect options={stageOptions} value={field.value} onChange={field.onChange} onCreate={handleCreateStage} placeholder="Select stage..." />
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mt-6">
                        <FormField control={form.control} name="particulars" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Particulars</FormLabel>
                                <FormControl><Input placeholder="Quick summary of the case contents..." className="h-10 rounded-xl" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 opacity-50" /> Internal Notes</FormLabel>
                                <FormControl><Textarea placeholder="Confidential observations or internal instructions..." className="min-h-[100px] rounded-2xl" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </div>

                {/* Section 5: Case Linking */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors", isLinking ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500")}>
                                <LinkIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">Case Relationships</h4>
                                <p className="text-[10px] text-slate-500 font-medium tracking-tight">Connect this case to other related matters</p>
                            </div>
                        </div>
                        <Checkbox 
                            id="link-cases" 
                            checked={isLinking}
                            onCheckedChange={(checked) => setIsLinking(checked as boolean)}
                            className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                    </div>
                    
                    {isLinking && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                            <FormField
                                control={form.control}
                                name="linkedCases"
                                render={({ field }) => (
                                    <FormItem>
                                        <MultiSelect
                                            options={caseOptions}
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Search and select related cases..."
                                            onExplorerClick={(id) => navigate(`/cases/${id}`)}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                        type="submit" 
                        className="flex-1 h-12 rounded-2xl font-black shadow-lg shadow-primary/20 gap-2 text-md transition-all active:scale-95" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Plus className="h-5 w-5" />
                        )}
                        {isLoading ? "Preserving..." : "Save Case Entry"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
