"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Check, ChevronsUpDown, PlusCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Database } from "@/lib/database.types"

type Organization = Database["public"]["Tables"]["organization"]["Row"]

export function OrganizationSwitcher() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function loadOrganizations() {
      try {
        setLoading(true)

        // Obtener el usuario actual
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Obtener el perfil del usuario con su organización
        const { data: profile } = await supabase.from("profiles").select("organizationId").eq("id", user.id).single()

        if (!profile?.organizationId) return

        // Obtener la organización actual
        const { data: currentOrg } = await supabase
          .from("organization")
          .select("*")
          .eq("id", profile.organizationId)
          .single()

        if (currentOrg) {
          setSelectedOrganization(currentOrg)
          setOrganizations([currentOrg])
        }

        // Obtener todas las organizaciones a las que pertenece el usuario
        // (Para futuras implementaciones de múltiples organizaciones)
        // const { data: orgs } = await supabase
        //   .from("organization")
        //   .select("*")
        //   .in("id", userOrgs.map(o => o.organizationId))

        // if (orgs) {
        //   setOrganizations(orgs)
        // }
      } catch (error) {
        console.error("Error al cargar organizaciones:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganizations()
  }, [supabase])

  const selectOrganization = (organization: Organization) => {
    setSelectedOrganization(organization)
    setOpen(false)
    // Aquí podrías implementar la lógica para cambiar de organización
    // Por ahora solo tenemos una organización por usuario
  }

  const createNewOrganization = () => {
    // Para futuras implementaciones
    router.push("/dashboard/settings/organization/new")
    setOpen(false)
  }

  const goToSettings = () => {
    router.push("/dashboard/settings/organization")
    setOpen(false)
  }

  if (loading || !selectedOrganization) {
    return (
      <Button variant="outline" className="w-[200px] justify-start">
        <span className="animate-pulse">Cargando...</span>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar organización"
          className="w-[200px] justify-between"
        >
          <span className="truncate">{selectedOrganization.name}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar organización..." />
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup heading="Organizaciones">
              {organizations.map((org) => (
                <CommandItem key={org.id} onSelect={() => selectOrganization(org)} className="text-sm">
                  {org.name}
                  <Check
                    className={cn("ml-auto h-4 w-4", selectedOrganization.id === org.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem onSelect={createNewOrganization} className="cursor-pointer text-sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear organización
              </CommandItem>
              <CommandItem onSelect={goToSettings} className="cursor-pointer text-sm">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
