"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, CheckCircle } from "lucide-react"

export default function InvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const type = searchParams.get("type")
    const emailParam = searchParams.get("email")

    if (type !== "invite" || !emailParam) {
      // Redirigir si los parámetros no son correctos
      router.push("/")
      return
    }

    setEmail(emailParam)
  }, [searchParams, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Aquí iría la lógica para enviar los datos al servidor
      // Por ejemplo:
      // const response = await fetch('/api/auth/complete-invite', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email,
      //     firstName: formData.firstName,
      //     lastName: formData.lastName,
      //     password: formData.password
      //   })
      // })

      // Simulamos una espera para la demostración
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Si todo sale bien, mostramos el mensaje de éxito
      setIsSuccess(true)

      // Después de un tiempo, redirigimos al usuario al login
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (error) {
      console.error("Error al completar el registro:", error)
      setErrors({ submit: "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <CardTitle className="text-2xl font-bold text-sidebar">¡Registro completado!</CardTitle>
            <CardDescription>
              Tu cuenta ha sido activada correctamente. Serás redirigido al inicio de sesión en unos segundos.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full bg-sidebar hover:bg-sidebar/90 text-white"
              onClick={() => router.push("/auth/login")}
            >
              Ir al inicio de sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 bg-sidebar rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">G</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-sidebar">Bienvenido a Gabbler</CardTitle>
          <CardDescription>
            Has sido invitado a unirte a nuestra plataforma. Completa tu información para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} disabled className="bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crea una contraseña segura"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.submit && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors.submit}</div>}

            <Button type="submit" className="w-full bg-sidebar hover:bg-sidebar/90 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Procesando..." : "Completar registro"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <a href="/auth/login" className="text-sidebar hover:underline">
              Iniciar sesión
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
