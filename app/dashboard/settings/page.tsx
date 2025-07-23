"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent as CardContent2,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import {
  User,
  Shield,
  CreditCard,
  MessageSquare,
  Users,
  LogOut,
  Instagram,
  ChevronRight,
  Building,
  Globe,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("profile")
  const [expandedGroups, setExpandedGroups] = useState({
    account: true,
    organization: false,
  })

  useEffect(() => {
    router.push("/dashboard/settings/profile")
  }, [router])

}