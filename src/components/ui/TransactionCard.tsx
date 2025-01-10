import { ArrowDownIcon, ArrowUpIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const TransactionCard = ({
  type,
  amount,
  category,
  description,
  date,
  onEdit,
  onDelete,
}: TransactionCardProps) => {
  const isIncome = type === "income";

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/40">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            isIncome ? "bg-income/10" : "bg-expense/10"
          )}
        >
          {isIncome ? (
            <ArrowUpIcon className="h-5 w-5 text-income" />
          ) : (
            <ArrowDownIcon className="h-5 w-5 text-expense" />
          )}
        </div>
        <div>
          <p className="font-medium">{description}</p>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p
            className={cn(
              "font-medium",
              isIncome ? "text-income" : "text-expense"
            )}
          >
            {isIncome ? "+" : "-"}${amount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};