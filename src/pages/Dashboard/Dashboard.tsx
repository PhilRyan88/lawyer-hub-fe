import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react"; 
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/CustomModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CaseForm } from "./CaseForm";
import { DashboardFilters } from "./DashboardFilters";
import { useGetCasesQuery, useAddCaseMutation, useUpdateCaseMutation, useGetCourtsQuery, useDeleteCaseMutation } from "./dashboardApi"; 
import { toast } from "sonner"; 

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

import { useNavigate } from "react-router-dom"; 

import { useSelector, useDispatch } from "react-redux";
import { setPage, setLimit } from "@/store/slices/dashboardSlice";

export default function Dashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { page, limit } = useSelector((state: any) => state.dashboard);

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

    const columns: ColumnDef<Case>[] = [
        {
            accessorKey: "registrationDate",
            header: "Reg. Date",
            cell: ({ row }) => row.original.registrationDate ? format(new Date(row.original.registrationDate), "dd/MM/yyyy") : "-",
        },
        {
            accessorKey: "previousDate",
            header: "Prev. Date",
            cell: ({ row }) => row.original.previousDate ? format(new Date(row.original.previousDate), "dd/MM/yyyy") : "-",
        },
        {
            accessorKey: "courtName",
            header: "Court Name",
        },
        {
            accessorKey: "caseNo",
            header: "Case No",
        },
        {
            accessorKey: "nameOfParty",
            header: "Party Name",
        },
        {
            accessorKey: "particulars",
            header: "Particulars",
        },
        {
            accessorKey: "stage",
            header: "Stage",
        },
        {
            accessorKey: "nextDate",
            header: "Next Date",
            cell: ({ row }) => row.original.nextDate ? format(new Date(row.original.nextDate), "dd/MM/yyyy") : "-",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10"
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
                        className="text-destructive hover:text-red-700 hover:bg-red-100" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.original._id);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-2 p-2">
                <DashboardFilters 
                    search={search} setSearch={setSearch}
                    courts={courts} selectedCourts={selectedCourts} setSelectedCourts={setSelectedCourts}
                    startDate={startDate} setStartDate={setStartDate}
                    endDate={endDate} setEndDate={setEndDate}
                    onSearch={() => { dispatch(setPage(1)); }}
                >
                    <Button 
                        onClick={() => {
                            setEditingCase(null);
                            setIsModalOpen(true);
                        }} 
                        size="icon" 
                        className="h-9 w-9"
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </DashboardFilters>

                <div className="bg-background rounded-md border p-1">
                     {isLoading ? <div className="p-4 text-center">Loading cases...</div> : (
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
    );
}
