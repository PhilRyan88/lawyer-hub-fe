import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, ShieldCheck, ShieldBan } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/CustomModal";
import { UserForm } from "./UserForm";
import { useGetUsersQuery, useAddUserMutation, useUpdateUserMutation, useDeleteUserMutation, useToggleUserAccessMutation } from "./usersApi";
// If hook doesn't exist, I'll remove it or use alert for now.
// Shadcn usually puts it in hooks/use-toast.ts if installed. user said "install shadcn components". 
// I'll assume standard alerts or minimal feedback if toast missing.
// Actually I'll create a minimal use-toast or just use alert/console for simplicity unless verified.
// I'll stick to console/alert to avoid file missing errors, or minimal internal state.

export type User = {
  _id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
};

import { useSelector, useDispatch } from "react-redux";
import { setPage, setLimit } from "@/store/slices/userListingSlice";

export default function UserListing() {
  const dispatch = useDispatch();
  const { page, limit } = useSelector((state: any) => state.userListing);

  const { data, isLoading } = useGetUsersQuery({ page, limit });
  const users = data?.data || []; // Handle paginated response structure
  const totalPages = data?.totalPages || 1;

  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [toggleAccess] = useToggleUserAccessMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreate = async (data: any) => {
    try {
        await addUser(data).unwrap();
        setIsModalOpen(false);
    } catch (error: any) {
        alert(error?.data?.message || "Failed to create user");
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingUser) return;
    try {
        await updateUser({ id: editingUser._id, ...data }).unwrap();
        setIsModalOpen(false);
        setEditingUser(null);
    } catch (error: any) {
        alert(error?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
        try {
            await deleteUser(id).unwrap();
        } catch (error: any) {
            alert(error?.data?.message || "Failed to delete user");
        }
    }
  }

  const handleToggle = async (id: string) => {
      try {
          await toggleAccess(id).unwrap();
      } catch (error: any) {
             alert(error?.data?.message || "Failed to toggle access");
      }
  }

  const openAddModal = () => {
      setEditingUser(null);
      setIsModalOpen(true);
  }

  const openEditModal = (user: User) => {
      setEditingUser(user);
      setIsModalOpen(true);
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
          <span className={row.original.isActive ? "text-green-500" : "text-red-500"}>
              {row.original.isActive ? "Active" : "Inactive"}
          </span>
      )
    },
    {
        id: "grant_revoke",
        header: "Grant/Revoke",
        cell: ({ row }) => (
            <Button variant="ghost" size="sm" onClick={() => handleToggle(row.original._id)}>
                {row.original.isActive ? <ShieldBan className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-green-500" />}
            </Button>
        )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => openEditModal(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original._id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ];

  return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="bg-background rounded-md border">
                 {isLoading ? <div className="p-4">Loading...</div> : (
                    <DataTable 
                        columns={columns} 
                        data={users}
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
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? "Edit User" : "Add New User"}
                body={
                    <UserForm
                        initialData={editingUser}
                        onSubmit={editingUser ? handleUpdate : handleCreate}
                        isLoading={false}
                    />
                }
            />
        </div>
  );
}
