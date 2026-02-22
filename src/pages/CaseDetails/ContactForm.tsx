import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useGetDocumentTypesQuery, useAddDocumentTypeMutation } from "./caseDetailsApi";
import { useState } from "react";

const documentSchema = z.object({
    _id: z.string().optional(), // For editing existing docs
    name: z.string().min(1, "Document name is required"),
    type: z.string().min(1, "Type is required"), // Single ID
    receivedDate: z.date().optional(),
    returnedDate: z.date().optional(),
});

const contactSchema = z.object({
  _id: z.string().optional(),
  whatsappNo: z.string().min(1, "WhatsApp number is required"),
  alternativeNo: z.string().optional(),
  address: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});

type ContactFormProps = {
    onSubmit: (data: any) => void;
    isLoading: boolean;
    initialData?: any; // For editing
    documents?: any[]; // Existing documents to prefill
};


export function ContactForm({ onSubmit, isLoading, initialData, documents = [] }: ContactFormProps) {
    const { data: documentTypes = [], isLoading: isTypesLoading } = useGetDocumentTypesQuery({});
    const [addDocumentType] = useAddDocumentTypeMutation();
    const [openTypeCombo, setOpenTypeCombo] = useState<number | null>(null); 
    const [searchValue, setSearchValue] = useState("");

    // Transform existing documents for form
    const formattedDocs = documents.map(doc => ({
        _id: doc._id,
        name: doc.name,
        type: typeof doc.type === 'object' ? (Array.isArray(doc.type) ? doc.type[0]?._id : doc.type?._id) : (Array.isArray(doc.type) ? doc.type[0] : doc.type),
        receivedDate: doc.receivedDate ? new Date(doc.receivedDate) : undefined,
        returnedDate: doc.returnedDate ? new Date(doc.returnedDate) : undefined,
    }));

    const form = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            _id: initialData?._id,
            whatsappNo: initialData?.whatsappNo || "",
            alternativeNo: initialData?.alternativeNo || "",
            address: initialData?.address || "",
            documents: formattedDocs,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "documents",
    });

    const [removedDocIds, setRemovedDocIds] = useState<string[]>([]);

    const handleRemoveDocument = (index: number) => {
        const doc = fields[index];
        // @ts-ignore - doc might have _id if it was preloaded
        if (doc._id) {
             // @ts-ignore
            setRemovedDocIds(prev => [...prev, doc._id]);
        }
        remove(index);
    };

    const handleFormSubmit = (data: any) => {
        onSubmit({ ...data, removedDocIds });
    };

    const handleCreateType = async (name: string, index: number) => {
        try {
            const newType = await addDocumentType({ name }).unwrap();
            form.setValue(`documents.${index}.type`, newType._id); 
        } catch (error) {
            console.error("Failed to create type", error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

                <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Documents Collected</h3>
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={() => append({ 
                                name: "", 
                                type: "", 
                            })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Document
                        </Button>
                    </div>
                    
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-muted/40 dark:bg-muted/10 relative">
                             <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 hover:text-red-500"
                                onClick={() => handleRemoveDocument(index)}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`documents.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Document Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Passport" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name={`documents.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Type</FormLabel>
                                            <Popover 
                                                open={openTypeCombo === index} 
                                                onOpenChange={(open) => {
                                                    setOpenTypeCombo(open ? index : null);
                                                    if (!open) setSearchValue("");
                                                }}
                                            >
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn("justify-between w-full h-auto min-h-10", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? (
                                                                documentTypes.find((type: any) => type._id === field.value)?.name || "Selected"
                                                            ) : (
                                                                "Select type"
                                                            )}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0 w-[200px] bg-popover text-popover-foreground">
                                                    <Command className="bg-transparent">
                                                        <CommandInput 
                                                            placeholder="Search type..." 
                                                            value={searchValue}
                                                            onValueChange={setSearchValue}
                                                            className="text-foreground"
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty className="py-2 px-2 text-center text-sm">
                                                                {isTypesLoading ? (
                                                                    <p className="py-4 text-muted-foreground">Loading types...</p>
                                                                ) : (
                                                                    <p className="mb-2 text-muted-foreground">No type found.</p>
                                                                )}
                                                                {searchValue && (
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        className="w-full justify-start text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30"
                                                                        onClick={() => {
                                                                            handleCreateType(searchValue, index);
                                                                            setSearchValue("");
                                                                            setOpenTypeCombo(null);
                                                                        }}
                                                                    >
                                                                        Create "{searchValue}"
                                                                    </Button>
                                                                )}
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {documentTypes.map((type: any) => (
                                                                    <CommandItem
                                                                        value={type.name}
                                                                        key={type._id}
                                                                        onSelect={() => {
                                                                            field.onChange(type._id);
                                                                            setOpenTypeCombo(null);
                                                                            setSearchValue(""); 
                                                                        }}
                                                                        className="aria-selected:bg-accent aria-selected:text-accent-foreground"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                field.value === type._id ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {type.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {['receivedDate', 'returnedDate'].map((dateField) => (
                                    <FormField
                                        key={dateField}
                                        control={form.control}
                                        name={`documents.${index}.${dateField}` as any}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="capitalize">{dateField.replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date("2100-01-01") || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {fields.length === 0 && (
                        <div className="text-center p-4 border-2 border-dashed rounded-lg text-muted-foreground">
                            No documents added.
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 font-bold" disabled={isLoading}>
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                             <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             <span>Saving...</span>
                        </div>
                    ) : (
                        "Save Contact & Documents"
                    )}
                </Button>
            </form>
        </Form>
    );
}
