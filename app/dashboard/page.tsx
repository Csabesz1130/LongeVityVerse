import ButtonAccount from "@/components/ButtonAccount";
import DashboardTabsClient from "@/components/dashboard/DashboardTabs";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Your Longevity Dashboard</h1>
            <p className="text-gray-500 mt-1">Track, analyze, and optimize your healthspan</p>
          </div>
          <ButtonAccount />
        </div>

        {/* Tabbed Dashboard Content */}
        <DashboardTabsClient />
      </div>
    </main>
  );
}
