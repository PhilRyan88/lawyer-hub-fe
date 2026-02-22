import { useState } from "react";
import { Plus, Trash2, Edit, ChevronUp, ChevronDown } from "lucide-react"; 
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/CustomModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CaseForm } from "./CaseForm";
import { DashboardFilters } from "./DashboardFilters";
import { useGetCasesQuery, useAddCaseMutation, useUpdateCaseMutation, useGetCourtsQuery, useDeleteCaseMutation } from "./dashboardApi"; 
import { toast } from "sonner"; 
import { useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from "react-redux";
import { setPage, setLimit, setSort } from "@/store/slices/dashboardSlice";
import { CustomTooltip } from "@/components/CustomTooltip";
import { Badge } from "@/components/ui/badge";
import { 
    Calendar, User, Scale, Gavel, 
    Hash, Info, ChevronRight 
} from "lucide-react";

// Define Case Type
export type Case = {
    _id: string;
    registrationDate?: string;
    previousDate?: string;
    courtName: string;
    caseNo: string;
    nameOfParty: string;
    particulars?: string;
    stage?: string;
    nextDate?: string;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { page, limit, filters } = useSelector((state: any) => state.dashboard);
    const { sortBy, sortOrder } = filters;

    const [search, setSearch] = useState("");
    const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    // Query Params
    const queryParams = {
        search,
        courtName: selectedCourts,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        page,
        limit,
        sortBy,
        sortOrder,
    };

    // API Hooks
    const { data, isLoading } = useGetCasesQuery(queryParams);
    const cases = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const { data: courts = [] } = useGetCourtsQuery({});
    const [addCase] = useAddCaseMutation();
    const [updateCase] = useUpdateCaseMutation();
    const [deleteCase] = useDeleteCaseMutation(); 

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<Case | null>(null);
    
    // Alert Dialog State
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

    const handleSaveCase = async (data: any) => {
        try {
            if (editingCase) {
                await updateCase({ id: editingCase._id, ...data }).unwrap();
                toast.success("Case updated successfully");
            } else {
                await addCase(data).unwrap();
                toast.success("Case created successfully");
            }
            setIsModalOpen(false);
            setEditingCase(null);
        } catch (error: any) {
             toast.error(error?.data?.message || "Operation failed");
        }
    }

    const handleEdit = (c: Case) => {
        setEditingCase(c);
        setIsModalOpen(true);
    }

    const handleDelete = (id: string) => {
        setCaseToDelete(id);
        setIsAlertOpen(true);
    }

    const confirmDelete = async () => {
         if(caseToDelete) {
            try {
                await deleteCase(caseToDelete).unwrap();
                toast.success("Case deleted");
            } catch(error: any) {
                toast.error("Failed to delete");
            }
         }
    }

    const handleToggleSort = (field: string) => {
        let newOrder: 'asc' | 'desc' = 'asc';
        if (sortBy === field) {
            newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }
        dispatch(setSort({ sortBy: field, sortOrder: newOrder }));
    };

    const SortHeader = ({ label, field }: { label: string; field: string }) => {
        const isActive = sortBy === field;
        return (
            <div 
                className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group"
                onClick={() => handleToggleSort(field)}
            >
                {label}
                <div className="flex flex-col -space-y-1">
                    <ChevronUp className={cn(
                        "h-3 w-3", 
                        isActive && sortOrder === 'asc' ? "text-primary" : "text-slate-300 group-hover:text-slate-400"
                    )} />
                    <ChevronDown className={cn(
                        "h-3 w-3", 
                        isActive && sortOrder === 'desc' ? "text-primary" : "text-slate-300 group-hover:text-slate-400"
                    )} />
                </div>
            </div>
        );
    };

    const columns: ColumnDef<Case>[] = [
        {
            accessorKey: "registrationDate",
            header: () => <SortHeader label="Registration" field="registrationDate" />,
            cell: ({ row }) => {
                const date = row.original.registrationDate;
                if (!date) return <span className="text-slate-300">-</span>;
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                            <Calendar className="h-3.5 w-3.5 text-primary/60" />
                            {format(new Date(date), "dd MMM, yyyy")}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight ml-5">Reg. Date</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "caseNo",
            header: "Case Detail",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 font-black text-primary">
                        <Hash className="h-3.5 w-3.5 opacity-60" />
                        {row.original.caseNo}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold ml-5">
                        <Scale className="h-3 w-3 opacity-50" />
                        {row.original.courtName}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "nameOfParty",
            header: "Client & Particulars",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {row.original.nameOfParty}
                    </div>
                    {row.original.particulars && (
                        <div className="text-[11px] text-slate-400 font-medium truncate max-w-[150px] ml-5">
                            {row.original.particulars}
                        </div>
                    )}
                </div>
            )
        },
        {
            accessorKey: "stage",
            header: "Current Stage",
            cell: ({ row }) => (
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-none rounded-lg px-2 py-0.5">
                    {row.original.stage}
                </Badge>
            )
        },
        {
            accessorKey: "previousDate",
            header: () => <SortHeader label="Last Hearing" field="previousDate" />,
            cell: ({ row }) => {
                const date = row.original.previousDate;
                if (!date) return <span className="text-slate-300 opacity-50">Not set</span>;
                return (
                    <div className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                        <Info className="h-3.5 w-3.5 opacity-40" />
                        {format(new Date(date), "dd/MM/yy")}
                    </div>
                );
            }
        },
        {
            accessorKey: "nextDate",
            header: () => <SortHeader label="Next Hearing" field="nextDate" />,
            cell: ({ row }) => {
                const date = row.original.nextDate;
                if (!date) return <Badge variant="outline" className="text-slate-300 border-dashed">TBA</Badge>;
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-black text-rose-500 dark:text-rose-400">
                            <Gavel className="h-3.5 w-3.5" />
                            {format(new Date(date), "dd MMM, yyyy")}
                        </div>
                        <span className="text-[10px] text-rose-300 dark:text-rose-900/50 font-black uppercase tracking-widest ml-5 italic">Upcoming</span>
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row.original);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.original._id);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-300 group-hover:text-primary transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#020617] p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Header & Controls Section */}
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    <div className="w-full lg:max-w-3xl">
                        <DashboardFilters 
                            search={search} 
                            setSearch={setSearch}
                            courts={courts} 
                            selectedCourts={selectedCourts} 
                            setSelectedCourts={setSelectedCourts}
                            startDate={startDate} 
                            setStartDate={setStartDate}
                            endDate={endDate} 
                            setEndDate={setEndDate}
                            onSearch={() => { dispatch(setPage(1)); }}
                        />
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                         <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden lg:block mx-2" />
                         <CustomTooltip content="Add New Case" side="left">
                            <Button 
                                onClick={() => {
                                    setEditingCase(null);
                                    setIsModalOpen(true);
                                }} 
                                size="icon" 
                                className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                         </CustomTooltip>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-background rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden transition-all duration-500">
                     {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-slate-500 font-bold animate-pulse">Fetching your cases...</p>
                        </div>
                     ) : (
                        <div className="p-2">
                             <DataTable 
                                columns={columns} 
                                data={cases} 
                                onRowClick={(row) => navigate(`/cases/${row._id}`)}    
                                pageCount={totalPages}
                                pageIndex={page}
                                pageSize={limit}
                                onPageChange={(p) => dispatch(setPage(p))}
                                onLimitChange={(l) => dispatch(setLimit(l))}
                            />
                        </div>
                     )}
                </div>

                <CustomModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingCase(null);
                    }}
                    title={editingCase ? "Edit Case" : "Add New Case"}
                    className="max-w-2xl" 
                    body={
                        <CaseForm
                            initialData={editingCase}
                            onSubmit={handleSaveCase}
                            isLoading={false}
                            isUpdate={!!editingCase}
                        />
                    }
                />

                <ConfirmDialog 
                    isOpen={isAlertOpen}
                    onClose={() => {
                        setIsAlertOpen(false);
                        setCaseToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Case"
                    description="Are you sure you want to delete this case? This action cannot be undone."
                    confirmLabel="Delete"
                    variant="destructive"
                />
            </div>
        </div>
    );
}
