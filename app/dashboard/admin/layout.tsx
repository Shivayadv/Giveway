import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout role="admin">{children}</DashboardLayout>
}
