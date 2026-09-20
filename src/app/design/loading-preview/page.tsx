import LearnLoading from "@/app/learn/loading";
import ProblemsLoading from "@/app/problems/loading";
import DashboardLoading from "@/app/dashboard/loading";

export default function LoadingPreviewPage() {
  return (
    <div className="space-y-16 p-8">
      <div id="loading-learn" className="border border-border p-4 rounded-xl">
        <LearnLoading />
      </div>
      <div id="loading-problems" className="border border-border p-4 rounded-xl">
        <ProblemsLoading />
      </div>
      <div id="loading-dashboard" className="border border-border p-4 rounded-xl">
        <DashboardLoading />
      </div>
    </div>
  );
}
