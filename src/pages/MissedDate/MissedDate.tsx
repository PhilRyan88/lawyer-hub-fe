import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useGetMissedDatesQuery } from "./missedDateApi";
import { DataTable } from "@/components/ui/data-table"; 
import { useSelector, useDispatch } from "react-redux";
import { setPage, setLimit } from "@/store/slices/missedDateSlice";
import type { ColumnDef } from "@tanstack/react-table";
import {  Calendar } from "lucide-react";

export default function MissedDate() {
  const dispatch = useDispatch();
  const { page, limit } = useSelector((state: any) => state.missedDate);
  const navigate = useNavigate();

  const { data, isLoading } = useGetMissedDatesQuery({ page, limit });
  const missedCases = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const columns: ColumnDef<any>[] = [
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
