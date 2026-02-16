import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  whatsappNo: z.string().min(1, "WhatsApp number is required"),
  alternativeNo: z.string().optional(),
  address: z.string().optional(),
});

type ContactFormProps = {
    onSubmit: (data: any) => void;
    isLoading: boolean;
};

export function ContactForm({ onSubmit, isLoading }: ContactFormProps) {
    const form = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            whatsappNo: "",
            alternativeNo: "",
            address: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="whatsappNo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>WhatsApp Number</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. 919876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="alternativeNo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Alternative Number (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Alternative Number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Client Address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Contact"}
                </Button>
            </form>
        </Form>
    );
}
