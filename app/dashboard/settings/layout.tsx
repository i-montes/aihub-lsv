import type React from "react"
import { Layout } from "@/components/layout"
import { SettingsSidebar } from "./components/settings-sidebar"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <SettingsSidebar />
        </div>
        <div className="w-full md:w-3/4">{children}</div>
      </div>
    </Layout>
  )
}
