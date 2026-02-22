import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, ShieldCheck, ShieldBan, Users } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/CustomModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UserForm } from "./UserForm";
import { useGetUsersQuery, useAddUserMutation, useUpdateUserMutation, useDeleteUserMutation, useToggleUserAccessMutation } from "./usersApi";
import { useSelector, useDispatch } from "react-redux";
import { setPage, setLimit } from "@/store/slices/userListingSlice";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export type User = {
  _id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
};

export default function UserListing() {
  const dispatch = useDispatch();
  const { page, limit } = useSelector((state: any) => state.userListing);

  const { data, isLoading } = useGetUsersQuery({ page, limit });
  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleAccess, { isLoading: isToggling }] = useToggleUserAccessMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    try {
        await addUser(data).unwrap();
        toast.success("User created successfully");
        setIsModalOpen(false);
    } catch (error: any) {
        toast.error(error?.data?.message || "Failed to create user");
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingUser) return;
    try {
        await updateUser({ id: editingUser._id, ...data }).unwrap();
        toast.success("User updated successfully");
        setIsModalOpen(false);
        setEditingUser(null);
    } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update user");
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
        await deleteUser(userToDelete).unwrap();
        toast.success("User deleted");
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
    } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete user");
    }
  }

  const handleToggle = async (id: string) => {
      try {
          await toggleAccess(id).unwrap();
          toast.success("Access toggled");
      } catch (error: any) {
             toast.error(error?.data?.message || "Failed to toggle access");
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

  const startDelete = (id: string) => {
      setUserToDelete(id);
      setIsDeleteDialogOpen(true);
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User Details",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{row.original.name}</span>
          <span className="text-xs text-slate-500">@{row.original.username}</span>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant="outline" className="font-bold border-slate-200">{row.original.role}</Badge>
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
          <Badge className={row.original.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-none px-3" : "bg-red-100 text-red-700 hover:bg-red-100 border-none px-3"}>
              {row.original.isActive ? "Active" : "Revoked"}
          </Badge>
      )
    },
    {
        id: "grant_revoke",
        header: "Access Toggle",
        cell: ({ row }) => (
            <Button variant="ghost" size="sm" onClick={() => handleToggle(row.original._id)} disabled={isToggling} className="h-8 rounded-lg">
                {isToggling ? (
                    <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                ) : (
                    row.original.isActive ? <ShieldBan className="w-4 h-4 text-red-500 mr-2" /> : <ShieldCheck className="w-4 h-4 text-green-500 mr-2" />
                )}
                <span className="text-xs font-bold">{row.original.isActive ? "Revoke" : "Grant"}</span>
            </Button>
        )
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEditModal(row.original)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => startDelete(row.original._id)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ];

  return (
        <div className="space-y-6">
            <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Control account access and roles</p>
                    </div>
                </div>
                <Button onClick={openAddModal} className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <Plus className="mr-2 h-5 w-5" /> Add 
                </Button>
            </div>

            <DataTable 
                columns={columns} 
                data={users}
                isLoading={isLoading}
                pageCount={totalPages}
                pageIndex={page}
                pageSize={limit}
                onPageChange={(p) => dispatch(setPage(p))}
                onLimitChange={(l) => dispatch(setLimit(l))}
            />

            <CustomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? "Edit User" : "Add New User"}
                body={
                    <UserForm
                        initialData={editingUser}
                        onSubmit={editingUser ? handleUpdate : handleCreate}
                        isLoading={isAdding || isUpdating}
                    />
                }
            />

            <ConfirmDialog 
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
                confirmLabel="Delete User"
                variant="destructive"
                isLoading={isDeleting}
            />
        </div>
  );
}
