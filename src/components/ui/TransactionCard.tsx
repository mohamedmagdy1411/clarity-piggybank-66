import { Card } from "@/components/ui/card";
import {
  ShoppingCart,
  Car,
  CreditCard,
  Briefcase,
  Home,
  Coffee,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionType = "income" | "expense";

interface TransactionCardProps {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "shopping":
      return ShoppingCart;
    case "transport":
      return Car;
    case "salary":
      return Briefcase;
    case "rent":
      return Home;
    case "food":
      return Utensils;
    case "coffee":
      return Coffee;
    default:
      return CreditCard;
  }
};

export const TransactionCard = ({
  type,
  amount,
  category,
  description,
  date,
}: TransactionCardProps) => {
  const Icon = getCategoryIcon(category);
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors duration-200 animate-fade-in border-border/40 bg-card/50">
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            type === "income" ? "bg-income/10" : "bg-expense/10"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              type === "income" ? "text-income" : "text-expense"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {description}
          </p>
          <p className="text-xs text-muted-foreground truncate">{category}</p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-semibold",
              type === "income" ? "text-income" : "text-expense"
            )}
          >
            {type === "income" ? "+" : "-"}${amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </div>
    </Card>
  );
};