import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { verifyRole } from "@/lib/dal"

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await verifyRole(["admin"])
  return <DashboardLayout role="admin">{children}</DashboardLayout>
}
