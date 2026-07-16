import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { verifyRole } from "@/lib/dal"

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  await verifyRole(["user"])
  return <DashboardLayout role="user">{children}</DashboardLayout>
}
