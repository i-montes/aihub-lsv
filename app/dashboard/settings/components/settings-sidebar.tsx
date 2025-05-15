"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Shield,
  MessageSquare,
  Users,
  LogOut,
  ChevronRight,
  File,
  Info,
  FileText,
  CreditCard,
} from "lucide-react"

export function SettingsSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [expandedGroups, setExpandedGroups] = useState({
    account: true,
    organization: true,
  })

  // Expand the appropriate group based on the current path
  useEffect(() => {
    if (pathname.includes("/profile") || pathname.includes("/security")) {
      setExpandedGroups((prev) => ({ ...prev, account: true }))
    } else if (
      pathname.includes("/general-info") ||
      pathname.includes("/user-list") ||
      pathname.includes("/integrations") ||
      pathname.includes("/prompts") ||
      pathname.includes("/wordpress") ||
      pathname.includes("/billing")
    ) {
      setExpandedGroups((prev) => ({ ...prev, organization: true }))
    }
  }, [pathname])

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const handleLogout = () => {
    console.log("Cerrar sesión")
    // Implement actual logout logic here
  }

  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h2 className="text-lg font-bold mb-2">Configuración</h2>

          {/* Account Group */}
          <div className="space-y-1">
            <SettingsMenuGroup
              title="Account"
              expanded={expandedGroups.account}
              onToggle={() => toggleGroup("account")}
            />
            {expandedGroups.account && (
              <>
                <SettingsMenuItem
                  icon={<User size={18} />}
                  title="Profile"
                  href="/dashboard/settings/profile"
                  active={pathname === "/dashboard/settings/profile"}
                  indented
                />
                <SettingsMenuItem
                  icon={<Shield size={18} />}
                  title="Security"
                  href="/dashboard/settings/security"
                  active={pathname === "/dashboard/settings/security"}
                  indented
                />
              </>
            )}
          </div>

          {/* Organization Group */}
          <div className="space-y-1">
            <SettingsMenuGroup
              title="Organization"
              expanded={expandedGroups.organization}
              onToggle={() => toggleGroup("organization")}
            />
            {expandedGroups.organization && (
              <>
                <SettingsMenuItem
                  icon={<Info size={18} />}
                  title="Información general"
                  href="/dashboard/settings/general-info"
                  active={pathname === "/dashboard/settings/general-info"}
                  indented
                />
                <SettingsMenuItem
                  icon={<Users size={18} />}
                  title="Lista de usuarios"
                  href="/dashboard/settings/user-list"
                  active={pathname === "/dashboard/settings/user-list"}
                  indented
                />
                <SettingsMenuItem
                  icon={<MessageSquare size={18} />}
                  title="Integrations"
                  href="/dashboard/settings/integrations"
                  active={pathname === "/dashboard/settings/integrations"}
                  indented
                />
                <SettingsMenuItem
                  icon={<FileText size={18} />}
                  title="Prompts"
                  href="/dashboard/settings/prompts"
                  active={pathname === "/dashboard/settings/prompts"}
                  indented
                />
                <SettingsMenuItem
                  icon={<File size={18} />}
                  title="WordPress"
                  href="/dashboard/settings/wordpress"
                  active={pathname === "/dashboard/settings/wordpress"}
                  indented
                />
                <SettingsMenuItem
                  icon={<CreditCard size={18} />}
                  title="Billing & Usage"
                  href="/dashboard/settings/billing"
                  active={pathname === "/dashboard/settings/billing"}
                  indented
                />
              </>
            )}
          </div>

          <div className="pt-4 mt-4 border-t">
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors text-red-500 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SettingsMenuGroup({
  title,
  expanded,
  onToggle,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors hover:bg-gray-100"
      onClick={onToggle}
      aria-expanded={expanded}
    >
      <span className="font-medium">{title}</span>
      <ChevronRight size={16} className={`transition-transform ${expanded ? "rotate-90" : ""}`} aria-hidden="true" />
    </button>
  )
}

function SettingsMenuItem({
  icon,
  title,
  href,
  active = false,
  className = "",
  indented = false,
}: {
  icon: React.ReactNode
  title: string
  href: string
  active?: boolean
  className?: string
  indented?: boolean
}) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
        active ? "bg-sidebar text-white" : `text-gray-700 hover:bg-gray-100 ${className}`
      } ${indented ? "pl-6" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{title}</span>
      {active && <ChevronRight size={16} className="ml-auto" aria-hidden="true" />}
    </Link>
  )
}
