"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessagesPage = pathname === "/messages"

  return (
    <div className="h-screen w-screen flex overflow-hidden dashboard-layout">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 container ${isMessagesPage ? "p-0 overflow-hidden" : "p-6 overflow-auto"}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
