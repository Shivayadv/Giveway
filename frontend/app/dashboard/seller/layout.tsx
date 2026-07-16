import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { verifyRole } from "@/lib/dal"

export default async function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  await verifyRole(["seller"])
  return <DashboardLayout role="seller">{children}</DashboardLayout>
}
