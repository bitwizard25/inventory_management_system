import { InventoryProvider } from "@/hooks/use-inventory"
import { AppShell } from "@/components/layout/app-shell"

export default function Page() {
  return (
    <InventoryProvider>
      <AppShell />
    </InventoryProvider>
  )
}
