import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Calculator } from "lucide-react";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: TransactionFormData;
}

export const TransactionForm = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: TransactionFormProps) => {
  const { toast } = useToast();
  const [calculatorValue, setCalculatorValue] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || {
      type: "expense",
      amount: "",
      category: "",
      description: "",
    },
  });

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
    toast({
      title: `Transaction ${initialData ? "updated" : "added"} successfully!`,
      duration: 3000,
    });
  };

  const handleCalculatorInput = (value: string) => {
    if (value === "=") {
      try {
        const result = eval(calculatorValue);
        setCalculatorValue(result.toString());
        form.setValue("amount", result.toString());
      } catch (error) {
        toast({
          title: "Invalid calculation",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else if (value === "C") {
      setCalculatorValue("");
      form.setValue("amount", "");
    } else {
      setCalculatorValue((prev) => prev + value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Amount
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="h-6 w-6 p-0"
                    >
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  {showCalculator && (
                    <div className="mt-2 p-2 border rounded-lg">
                      <Input
                        value={calculatorValue}
                        readOnly
                        className="mb-2"
                      />
                      <div className="grid grid-cols-4 gap-1">
                        {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "C", "0", "=", "+"].map((btn) => (
                          <Button
                            key={btn}
                            type="button"
                            variant={btn === "=" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCalculatorInput(btn)}
                          >
                            {btn}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Coffee">Coffee</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update" : "Add"} Transaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};