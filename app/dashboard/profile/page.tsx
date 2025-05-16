"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Layout } from "@/components/layout"
import { toast } from "sonner"
import { Building } from "lucide-react"

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    avatar: "",
  })

  const supabase = getSupabaseClient()

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        lastname: profile.lastname || "",
        email: profile.email || "",
        avatar: profile.avatar || "",
      })

      // If user has an organization, fetch it
      if (profile.organizationId) {
        fetchOrganization(profile.organizationId)
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [profile])

  const fetchOrganization = async (orgId) => {
    try {
      const { data, error } = await supabase.from("organization").select("*").eq("id", orgId).single()

      if (error) throw error

      setOrganization(data)
    } catch (error) {
      console.error("Error fetching organization:", error)
      toast.error("Could not load organization data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const updateProfile = async () => {
    if (!user) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          lastname: formData.lastname,
          avatar: formData.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading profile data...</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">First Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <Input id="lastname" name="lastname" value={formData.lastname} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={formData.email} disabled />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={updateProfile}
                    disabled={updating}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Organization Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Your organization details</CardDescription>
              </CardHeader>
              <CardContent>
                {organization ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{organization.name}</h3>
                        <p className="text-sm text-gray-500">Organization</p>
                      </div>
                    </div>

                    {organization.address && (
                      <div className="text-sm">
                        <p className="font-medium">Address</p>
                        <p className="text-gray-500">{organization.address}</p>
                      </div>
                    )}

                    {(organization.city || organization.country) && (
                      <div className="text-sm">
                        <p className="font-medium">Location</p>
                        <p className="text-gray-500">
                          {[organization.city, organization.country].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}

                    <div className="text-sm">
                      <p className="font-medium">Member Since</p>
                      <p className="text-gray-500">{new Date(organization.createdAt).toLocaleDateString()}</p>
                    </div>

                    {profile?.role && (
                      <div className="text-sm">
                        <p className="font-medium">Your Role</p>
                        <div className="mt-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs inline-block">
                          {profile.role}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-500">No Organization</h3>
                    <p className="text-sm text-gray-400 mt-1">You are not part of any organization</p>
                    <Button
                      className="mt-4 bg-primary-600 hover:bg-primary-700"
                      onClick={() => toast.info("Organization creation coming soon")}
                    >
                      Create Organization
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
