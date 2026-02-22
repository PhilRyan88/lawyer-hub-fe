import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Trash, Calendar as CalendarIcon, IndianRupee, Wallet, CheckCircle2, Receipt, Plus } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CustomModal } from "@/components/CustomModal";

const feeSchema = z.object({
  totalFee: z.coerce.number().min(0, "Total fee must be positive"),
  amountPaid: z.coerce.number().min(0, "Amount paid must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
});

interface AddEditFeeProps {
  caseId: string;
  feeData: any;
  onSubmit: (data: any) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
  isLoading: boolean;
}

export function AddEditFee({ caseId, feeData, onSubmit, onDeletePayment, isLoading }: AddEditFeeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<any>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      totalFee: feeData?.totalFee || 0,
      amountPaid: 0,
      description: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (feeData) {
      form.setValue("totalFee", feeData.totalFee || 0);
    }
  }, [feeData, form]);

  const handleSubmit = async (values: z.infer<typeof feeSchema>) => {
    await onSubmit({
      caseId,
      ...values
    });
    form.reset({
      totalFee: values.totalFee,
      amountPaid: 0,
      description: "",
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(false);
  };

  const totalPaid = feeData?.payments?.reduce((sum: number, p: any) => sum + p.amountPaid, 0) || 0;
  const totalAgreed = feeData?.totalFee || 0;
  const remaining = totalAgreed - totalPaid;
  const isFullyPaid = totalPaid === totalAgreed && totalAgreed > 0;
  const isBonusPaid = totalPaid > totalAgreed;
  const bonusAmount = totalPaid - totalAgreed;

  const formBody = (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
             <FormField
                control={form.control}
                name="totalFee"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Total Agreed Fee</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value ?? ""}
                                    onChange={e => {
                                        const val = e.target.value;
                                        field.onChange(val === "" ? "" : Number(val));
                                    }}
                                    className="pl-10 h-11 rounded-xl"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Payment</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value ?? ""}
                                        onChange={e => {
                                            const val = e.target.value;
                                            field.onChange(val === "" ? "" : Number(val));
                                        }}
                                        className="pl-10 h-11 rounded-xl"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Date</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="date" 
                                        {...field} 
                                        className="pl-10 h-11 rounded-xl"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Stage / Description</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                className="h-11 rounded-xl"
                                placeholder="e.g. Second Installment"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" 
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : "Save Payment"}
            </Button>
        </form>
    </Form>
  );

  return (
    <div className="space-y-8">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Agreed Card */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
              <div className="bg-primary/10 p-3 rounded-xl text-primary transition-transform group-hover:scale-110">
                  <Wallet className="h-6 w-6" />
              </div>
              <div className="flex-1 z-10">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Agreed Fee</p>
                  <p className="text-xl font-black text-primary">₹{totalAgreed.toLocaleString()}</p>
              </div>
              <div className="absolute -right-2 -bottom-2 opacity-5 text-primary">
                 <Wallet className="h-16 w-16 rotate-12" />
              </div>
          </div>

          {/* Paid / Status Card */}
          <div className={`${isBonusPaid ? 'bg-purple-50 border-purple-100' : 'bg-green-50 border-green-100'} border rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group`}>
              <div className={`${isBonusPaid ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'} p-3 rounded-xl transition-transform group-hover:scale-110`}>
                  {isBonusPaid ? <CheckCircle2 className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              </div>
              <div className="flex-1 z-10">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {isBonusPaid ? "Total + Bonus" : "Total Paid"}
                  </p>
                  <p className={`text-xl font-black ${isBonusPaid ? 'text-purple-600' : 'text-green-600'}`}>
                    ₹{totalPaid.toLocaleString()}
                  </p>
              </div>
              {isFullyPaid && (
                  <Badge className="absolute top-3 right-3 bg-green-600 text-[10px] animate-bounce px-2 py-0.5">
                    FULLY PAID
                  </Badge>
              )}
              {isBonusPaid && (
                  <Badge className="absolute top-3 right-3 bg-purple-600 text-[10px] animate-pulse px-2 py-0.5">
                    BONUS PAID
                  </Badge>
              )}
          </div>

          {/* Balance / Bonus Card */}
          {isBonusPaid ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group animate-in zoom-in-95 duration-300">
                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 transition-transform group-hover:scale-110">
                    <IndianRupee className="h-6 w-6" />
                </div>
                <div className="flex-1 z-10">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Bonus Received</p>
                    <p className="text-xl font-black text-indigo-600">₹{bonusAmount.toLocaleString()}</p>
                </div>
                <div className="absolute -right-4 -top-4 text-indigo-200/50">
                   <Plus className="h-16 w-16" />
                </div>
            </div>
          ) : (
            <div className={`${remaining === 0 ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-amber-50 border-amber-100'} border rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group`}>
                <div className={`${remaining === 0 ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'} p-3 rounded-xl transition-transform group-hover:scale-110`}>
                    <Receipt className="h-6 w-6" />
                </div>
                <div className="flex-1 z-10">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Remaining</p>
                    <p className={`text-xl font-black ${remaining === 0 ? 'text-slate-400' : 'text-amber-600'}`}>
                        ₹{Math.max(0, remaining).toLocaleString()}
                    </p>
                </div>
                {remaining === 0 && totalAgreed > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-12 opacity-10">
                        <CheckCircle2 className="h-12 w-12 text-slate-900" />
                    </div>
                )}
            </div>
          )}
      </div>

      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment History
        </h3>
        <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md h-10"
        >
            <Plus className="h-4 w-4 mr-2" /> Add Fee
        </Button>
      </div>

      <div className="space-y-4">
        <div className="border rounded-2xl overflow-x-auto bg-card shadow-sm scrollbar-hide">
            <Table className="min-w-[600px] md:min-w-full">
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Date</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Description</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Amount Paid</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {feeData?.payments?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                No payment records found. Click 'Add Fee' to start.
                            </TableCell>
                        </TableRow>
                    ) : (
                        feeData?.payments?.map((payment: any) => (
                            <TableRow key={payment._id}>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {payment.date ? format(new Date(payment.date), "dd MMM yyyy") : "-"}
                                </TableCell>
                                <TableCell className="font-semibold">{payment.description}</TableCell>
                                <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                                    ₹{payment.amountPaid.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-muted-foreground hover:text-red-500 rounded-lg h-8 w-8"
                                        onClick={() => onDeletePayment(payment._id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
                {feeData?.payments?.length > 0 && (
                     <tfoot className="bg-muted/10 border-t">
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={2} className="text-right font-medium text-muted-foreground uppercase text-[10px] tracking-widest px-4">Cumulative Total Paid</TableCell>
                            <TableCell className="text-right font-black text-green-600 text-lg whitespace-nowrap px-4">₹{totalPaid.toLocaleString()}</TableCell>
                            <TableCell />
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-t-0">
                            <TableCell colSpan={2} className="text-right font-medium text-muted-foreground uppercase text-[10px] tracking-widest px-4">Remaining Balance</TableCell>
                            <TableCell className="text-right font-black text-amber-600 whitespace-nowrap px-4">₹{remaining.toLocaleString()}</TableCell>
                            <TableCell />
                        </TableRow>
                    </tfoot>
                )}
            </Table>
        </div>
      </div>

        <CustomModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add Payment Phase"
            body={formBody}
        />
    </div>
  );
}
