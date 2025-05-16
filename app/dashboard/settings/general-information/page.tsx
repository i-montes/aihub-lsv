"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { OrganizationService } from "@/lib/services/organization-service"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const countries = [
  { value: "Afganistán", label: "Afganistán" },
  { value: "Albania", label: "Albania" },
  { value: "Alemania", label: "Alemania" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Antigua y Barbuda", label: "Antigua y Barbuda" },
  { value: "Arabia Saudita", label: "Arabia Saudita" },
  { value: "Argelia", label: "Argelia" },
  { value: "Argentina", label: "Argentina" },
  { value: "Armenia", label: "Armenia" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaiyán", label: "Azerbaiyán" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Bangladés", label: "Bangladés" },
  { value: "Barbados", label: "Barbados" },
  { value: "Baréin", label: "Baréin" },
  { value: "Bélgica", label: "Bélgica" },
  { value: "Belice", label: "Belice" },
  { value: "Benín", label: "Benín" },
  { value: "Bielorrusia", label: "Bielorrusia" },
  { value: "Birmania", label: "Birmania" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Bosnia y Herzegovina", label: "Bosnia y Herzegovina" },
  { value: "Botsuana", label: "Botsuana" },
  { value: "Brasil", label: "Brasil" },
  { value: "Brunéi", label: "Brunéi" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Bután", label: "Bután" },
  { value: "Cabo Verde", label: "Cabo Verde" },
  { value: "Camboya", label: "Camboya" },
  { value: "Camerún", label: "Camerún" },
  { value: "Canadá", label: "Canadá" },
  { value: "Catar", label: "Catar" },
  { value: "Chad", label: "Chad" },
  { value: "Chile", label: "Chile" },
  { value: "China", label: "China" },
  { value: "Chipre", label: "Chipre" },
  { value: "Ciudad del Vaticano", label: "Ciudad del Vaticano" },
  { value: "Colombia", label: "Colombia" },
  { value: "Comoras", label: "Comoras" },
  { value: "Corea del Norte", label: "Corea del Norte" },
  { value: "Corea del Sur", label: "Corea del Sur" },
  { value: "Costa de Marfil", label: "Costa de Marfil" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Croacia", label: "Croacia" },
  { value: "Cuba", label: "Cuba" },
  { value: "Dinamarca", label: "Dinamarca" },
  { value: "Dominica", label: "Dominica" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egipto", label: "Egipto" },
  { value: "El Salvador", label: "El Salvador" },
  { value: "Emiratos Árabes Unidos", label: "Emiratos Árabes Unidos" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Eslovaquia", label: "Eslovaquia" },
  { value: "Eslovenia", label: "Eslovenia" },
  { value: "España", label: "España" },
  { value: "Estados Unidos", label: "Estados Unidos" },
  { value: "Estonia", label: "Estonia" },
  { value: "Etiopía", label: "Etiopía" },
  { value: "Filipinas", label: "Filipinas" },
  { value: "Finlandia", label: "Finlandia" },
  { value: "Fiyi", label: "Fiyi" },
  { value: "Francia", label: "Francia" },
  { value: "Gabón", label: "Gabón" },
  { value: "Gambia", label: "Gambia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Ghana", label: "Ghana" },
  { value: "Granada", label: "Granada" },
  { value: "Grecia", label: "Grecia" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guinea-Bisáu", label: "Guinea-Bisáu" },
  { value: "Guinea Ecuatorial", label: "Guinea Ecuatorial" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haití", label: "Haití" },
  { value: "Honduras", label: "Honduras" },
  { value: "Hungría", label: "Hungría" },
  { value: "India", label: "India" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Irak", label: "Irak" },
  { value: "Irán", label: "Irán" },
  { value: "Irlanda", label: "Irlanda" },
  { value: "Islandia", label: "Islandia" },
  { value: "Islas Marshall", label: "Islas Marshall" },
  { value: "Islas Salomón", label: "Islas Salomón" },
  { value: "Israel", label: "Israel" },
  { value: "Italia", label: "Italia" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Japón", label: "Japón" },
  { value: "Jordania", label: "Jordania" },
  { value: "Kazajistán", label: "Kazajistán" },
  { value: "Kenia", label: "Kenia" },
  { value: "Kirguistán", label: "Kirguistán" },
  { value: "Kiribati", label: "Kiribati" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Laos", label: "Laos" },
  { value: "Lesoto", label: "Lesoto" },
  { value: "Letonia", label: "Letonia" },
  { value: "Líbano", label: "Líbano" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libia", label: "Libia" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lituania", label: "Lituania" },
  { value: "Luxemburgo", label: "Luxemburgo" },
  { value: "Macedonia del Norte", label: "Macedonia del Norte" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malasia", label: "Malasia" },
  { value: "Malaui", label: "Malaui" },
  { value: "Maldivas", label: "Maldivas" },
  { value: "Malí", label: "Malí" },
  { value: "Malta", label: "Malta" },
  { value: "Marruecos", label: "Marruecos" },
  { value: "Mauricio", label: "Mauricio" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "México", label: "México" },
  { value: "Micronesia", label: "Micronesia" },
  { value: "Moldavia", label: "Moldavia" },
  { value: "Mónaco", label: "Mónaco" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nauru", label: "Nauru" },
  { value: "Nepal", label: "Nepal" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Níger", label: "Níger" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Noruega", label: "Noruega" },
  { value: "Nueva Zelanda", label: "Nueva Zelanda" },
  { value: "Omán", label: "Omán" },
  { value: "Países Bajos", label: "Países Bajos" },
  { value: "Pakistán", label: "Pakistán" },
  { value: "Palaos", label: "Palaos" },
  { value: "Panamá", label: "Panamá" },
  { value: "Papúa Nueva Guinea", label: "Papúa Nueva Guinea" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Perú", label: "Perú" },
  { value: "Polonia", label: "Polonia" },
  { value: "Portugal", label: "Portugal" },
  { value: "Reino Unido", label: "Reino Unido" },
  { value: "República Centroafricana", label: "República Centroafricana" },
  { value: "República Checa", label: "República Checa" },
  { value: "República del Congo", label: "República del Congo" },
  { value: "República Democrática del Congo", label: "República Democrática del Congo" },
  { value: "República Dominicana", label: "República Dominicana" },
  { value: "Ruanda", label: "Ruanda" },
  { value: "Rumania", label: "Rumania" },
  { value: "Rusia", label: "Rusia" },
  { value: "Samoa", label: "Samoa" },
  { value: "San Cristóbal y Nieves", label: "San Cristóbal y Nieves" },
  { value: "San Marino", label: "San Marino" },
  { value: "San Vicente y las Granadinas", label: "San Vicente y las Granadinas" },
  { value: "Santa Lucía", label: "Santa Lucía" },
  { value: "Santo Tomé y Príncipe", label: "Santo Tomé y Príncipe" },
  { value: "Senegal", label: "Senegal" },
  { value: "Serbia", label: "Serbia" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leona", label: "Sierra Leona" },
  { value: "Singapur", label: "Singapur" },
  { value: "Siria", label: "Siria" },
  { value: "Somalia", label: "Somalia" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Suazilandia", label: "Suazilandia" },
  { value: "Sudáfrica", label: "Sudáfrica" },
  { value: "Sudán", label: "Sudán" },
  { value: "Sudán del Sur", label: "Sudán del Sur" },
  { value: "Suecia", label: "Suecia" },
  { value: "Suiza", label: "Suiza" },
  { value: "Surinam", label: "Surinam" },
  { value: "Tailandia", label: "Tailandia" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Tayikistán", label: "Tayikistán" },
  { value: "Timor Oriental", label: "Timor Oriental" },
  { value: "Togo", label: "Togo" },
  { value: "Tonga", label: "Tonga" },
  { value: "Trinidad y Tobago", label: "Trinidad y Tobago" },
  { value: "Túnez", label: "Túnez" },
  { value: "Turkmenistán", label: "Turkmenistán" },
  { value: "Turquía", label: "Turquía" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Ucrania", label: "Ucrania" },
  { value: "Uganda", label: "Uganda" },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Uzbekistán", label: "Uzbekistán" },
  { value: "Vanuatu", label: "Vanuatu" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Yemen", label: "Yemen" },
  { value: "Yibuti", label: "Yibuti" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabue", label: "Zimbabue" },
]

export default function GeneralInformationSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    contactemail: "",
    address: "",
    city: "",
    state: "",
    country: "",
  })

  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true)
        const { organization } = await OrganizationService.getOrganization()
        if (organization) {
          setFormData({
            name: organization.name || "",
            description: organization.description || "",
            website: organization.website || "",
            contactemail: organization.contactemail || "",
            address: organization.address || "",
            city: organization.city || "",
            state: organization.state || "",
            country: organization.country || "",
          })
        }
      } catch (error) {
        console.error("Error fetching organization:", error)
        toast.error("Error al cargar la información de la organización")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganization()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await OrganizationService.updateOrganization(formData)
      toast.success("Información actualizada correctamente")
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error("Error al actualizar la información")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando información...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Información General</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-gray-200 mb-6">
          <CardHeader>
            <CardTitle>Detalles de la Organización</CardTitle>
            <CardDescription>Información básica sobre tu organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Organización</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe tu organización"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactemail">Email de Contacto</Label>
                <Input
                  id="contactemail"
                  name="contactemail"
                  type="email"
                  value={formData.contactemail}
                  onChange={handleChange}
                  placeholder="contacto@ejemplo.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
            <CardDescription>Ubicación física de tu organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle y número"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Ciudad" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado/Provincia</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Estado o provincia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                      {formData.country
                        ? countries.find((country) => country.value === formData.country)?.label
                        : "Selecciona un país"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar país..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {countries.map((country) => (
                            <CommandItem
                              key={country.value}
                              value={country.value}
                              onSelect={(currentValue) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  country: currentValue,
                                }))
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.country === country.value ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {country.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button type="submit" className="bg-sidebar text-white hover:bg-sidebar/90 mt-4" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
