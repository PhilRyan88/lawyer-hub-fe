import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useGetMissedDatesQuery } from "./missedDateApi";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table"; // Use DataTable
import { useSelector, useDispatch } from "react-redux";
import { setPage, setLimit } from "@/store/slices/missedDateSlice";
import type { ColumnDef } from "@tanstack/react-table";

export default function MissedDate() {
  const dispatch = useDispatch();
  const { page, limit } = useSelector((state: any) => state.missedDate);
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetMissedDatesQuery({ page, limit });
  console.log("MissedDate Component Data:", data);
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
      },
      {
          accessorKey: "nameOfParty",
          header: "Party Name",
      },
      {
          accessorKey: "courtName",
          header: "Court Name",
      },
      {
          accessorKey: "nextDate",
          header: "Next Date (Missed)",
          cell: ({ row }) => (
              <span className="text-red-500 font-bold">
                  {row.original.nextDate ? format(new Date(row.original.nextDate), "dd MMM yyyy") : "Date Not Updated"}
              </span>
          ),
      },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading missed dates</div>;

  return (
    <div className="p-2 space-y-2">
      <Card>
        <CardContent className="p-2">
            <DataTable 
                columns={columns} 
                data={missedCases} 
                onRowClick={(row) => navigate(`/cases/${row._id}?highlight=true`)}
                pageCount={totalPages}
                pageIndex={page}
                pageSize={limit}
                onPageChange={(p) => dispatch(setPage(p))}
                onLimitChange={(l) => dispatch(setLimit(l))}
            />
        </CardContent>
      </Card>
    </div>
  );
}
