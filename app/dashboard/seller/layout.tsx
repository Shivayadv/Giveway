import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout role="seller">{children}</DashboardLayout>
}
