import { AIChat } from "@/components/ai/AIChat";
import { FinancialOverview } from "@/components/charts/FinancialOverview";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <DashboardMetrics />
          <div className="grid gap-8 md:grid-cols-2">
            <AIChat />
            <RecentTransactions />
          </div>
          <FinancialOverview />
        </div>
      </main>
    </div>
  );
};

export default Index;