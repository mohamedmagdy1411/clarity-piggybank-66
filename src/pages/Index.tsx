import { Header } from "@/components/layout/Header";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { FinancialOverview } from "@/components/charts/FinancialOverview";
import { AIAnalysis } from "@/components/dashboard/AIAnalysis";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <DashboardMetrics />
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <RecentTransactions />
            </div>
            <div>
              <AIAnalysis />
              <div className="mt-8">
                <FinancialOverview />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;