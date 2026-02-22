import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useGetMissedDatesQuery, useMarkMissedAsDoneMutation } from "./missedDateApi";
import { DataTable } from "@/components/ui/data-table"; 
import { useSelector, useDispatch } from "react-redux";
import { setPage, setLimit } from "@/store/slices/missedDateSlice";
import type { ColumnDef } from "@tanstack/react-table";
import {  Calendar, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MissedDate() {
  const dispatch = useDispatch();
  const { page, limit } = useSelector((state: any) => state.missedDate);
  const navigate = useNavigate();
  const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useGetMissedDatesQuery({ page, limit });
  const [markAsDone, { isLoading: isMarking }] = useMarkMissedAsDoneMutation();
  
  const missedCases = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleMarkAsDone = async (id: string) => {
    try {
        await markAsDone(id).unwrap();
        toast.success("Case marked as processed");
        // Clear check state for this ID
        setCheckedRows(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    } catch (error) {
        toast.error("Failed to update status");
    }
  };

  const columns: ColumnDef<any>[] = [
      {
          id: "markAsDone",
          header: "Mark as Done",
          cell: ({ row }) => (
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                    checked={!!checkedRows[row.original._id]} 
                    onCheckedChange={(checked) => {
                        setCheckedRows(prev => ({
                            ...prev,
                            [row.original._id]: !!checked
                        }));
                    }}
                />
                {checkedRows[row.original._id] && (
                    <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 px-2 text-[11px] font-bold bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 animate-in fade-in slide-in-from-left-2 duration-300"
                        onClick={() => handleMarkAsDone(row.original._id)}
                        disabled={isMarking}
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Submit
                    </Button>
                )}
            </div>
          ),
      },
      {
          accessorKey: "registrationDate",
          header: "Registration Date",
          cell: ({ row }) => row.original.registrationDate ? format(new Date(row.original.registrationDate), "dd MMM yyyy") : "-",
      },
      {
          accessorKey: "caseNo",
          header: "Case No",
          cell: ({ row }) => <span className="font-bold text-primary">{row.original.caseNo}</span>
      },
      {
          accessorKey: "nameOfParty",
          header: "Party Name",
          cell: ({ row }) => <span className="font-medium">{row.original.nameOfParty}</span>
      },
      {
          accessorKey: "courtName",
          header: "Court Name",
      },
      {
          accessorKey: "nextDate",
          header: "Next Date (Missed)",
          cell: ({ row }) => (
              <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 font-black text-rose-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {row.original.nextDate ? format(new Date(row.original.nextDate), "dd MMM yyyy") : "TBA"}
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-5">Update Required</span>
              </div>
          ),
      },
  ];

  return (
    <div className="space-y-6">
        <DataTable 
            columns={columns} 
            data={missedCases} 
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/cases/${row._id}?highlight=true`)}
            pageCount={totalPages}
            pageIndex={page}
            pageSize={limit}
            onPageChange={(p) => dispatch(setPage(p))}
            onLimitChange={(l) => dispatch(setLimit(l))}
        />
    </div>
  );
}
