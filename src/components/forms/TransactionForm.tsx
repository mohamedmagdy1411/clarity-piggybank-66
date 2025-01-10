import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Calculator, Wand2 } from "lucide-react";
import { processTransactionText, suggestTransactionEdits } from "@/services/aiService";
import { Textarea } from "@/components/ui/textarea";

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
  const [aiText, setAiText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleAIProcess = async () => {
    if (!aiText.trim()) {
      toast({
        title: "Please enter a description of your transaction",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processTransactionText(aiText);
      form.setValue("type", result.type);
      form.setValue("amount", result.amount.toString());
      form.setValue("category", result.category);
      form.setValue("description", result.description);
      setAiText("");
      toast({
        title: "Transaction details extracted successfully!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to process transaction text",
        description: "Please try again with a clearer description",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAISuggestions = async () => {
    if (!initialData) return;

    setIsProcessing(true);
    try {
      const suggestions = await suggestTransactionEdits(initialData);
      form.setValue("type", suggestions.type);
      form.setValue("amount", suggestions.amount.toString());
      form.setValue("category", suggestions.category);
      form.setValue("description", suggestions.description);
      toast({
        title: "AI suggestions applied!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to get AI suggestions",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Edit transaction details or get AI suggestions"
              : "You can either fill in the details manually or describe your transaction below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {!initialData && (
              <FormItem>
                <FormLabel>Describe your transaction</FormLabel>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="E.g.: I spent $25 on coffee today"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAIProcess}
                    disabled={isProcessing}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </FormItem>
            )}

            {initialData && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAISuggestions}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Get AI Suggestions
                </Button>
              </div>
            )}

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
