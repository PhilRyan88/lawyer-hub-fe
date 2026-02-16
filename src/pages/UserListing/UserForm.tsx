import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/CustomSelect";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
}).refine((data) => {
    // Password is required for new users (we will handle "isEdit" logic in parent or by checking if initialData exists effectively)
    // Actually simpler: if password provided, confirm must match.
    if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type UserFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
};

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "USER",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        username: initialData.username,
        role: initialData.role,
        password: "", // Don't prefill password
        confirmPassword: ""
      });
    } else {
        form.reset({
            name: "",
            username: "",
            role: "USER",
            password: "",
            confirmPassword: ""
        })
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof userSchema>) => {
    // If editing and password empty, remove it from submission
    const submissionData = { ...values };
    if (!submissionData.password) {
        delete submissionData.password;
        delete submissionData.confirmPassword;
    }
    onSubmit(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder={initialData ? "Leave blank to keep" : "Password"} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="Confirm Password" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <CustomSelect
                options={[
                    { label: "Super Admin", value: "SUPER_ADMIN" },
                    { label: "Admin", value: "ADMIN" },
                    { label: "User", value: "USER" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : (initialData ? "Update User" : "Create User")}
        </Button>
      </form>
    </Form>
  );
}
