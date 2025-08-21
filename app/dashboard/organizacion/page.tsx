"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import {
  Building,
  Users,
  User,
  Shield,
  Edit,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Organization } from "@/lib/services/organization-service";
import { Profile } from "@/lib/services/auth-service";

export default function OrganizationPage() {
  const { user, profile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);

  const [members, setMembers] = useState<Profile[]>([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (profile?.organizationId) {
      fetchOrganization(profile.organizationId);
      fetchOrganizationMembers(profile.organizationId);
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchOrganization = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("organization")
        .select("*")
        .eq("id", orgId)
        .single();

      if (error) throw error;

      setOrganization(data);
      setFormData({
        name: data.name || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
      });
    } catch (error) {
      console.error("Error fetching organization:", error);
      toast.error("Could not load organization data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationMembers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, lastname, email, avatar, role")
        .eq("organizationId", orgId);

      if (error) throw error;

      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching organization members:", error);
      toast.error("Could not load organization members");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateOrganization = async () => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from("organization")
        .update({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", organization.id);

      if (error) throw error;

      toast.success("Organization updated successfully");
      setEditing(false);
      fetchOrganization(organization.id);
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization");
    }
  };

  const isOwner = profile?.role === "OWNER";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading organization data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Management</h1>
      <p className="text-gray-500">
        Manage your organization details and members. This demonstrates how RLS
        policies control access to organization data.
      </p>

      {!organization ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              No Organization
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              You are not part of any organization. Create one to collaborate
              with team members.
            </p>
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => toast.info("Organization creation coming soon")}
            >
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Organization Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>
                      Information about your organization
                    </CardDescription>
                  </div>
                  {isOwner && !editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!isOwner && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        Only organization owners can edit organization details.
                      </p>
                    </div>
                  </div>
                )}

                {editing ? (
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Organization Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium">
                        Address
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="city" className="text-sm font-medium">
                          City
                        </label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="country"
                          className="text-sm font-medium"
                        >
                          Country
                        </label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: organization.name || "",
                            address: organization.address || "",
                            city: organization.city || "",
                            country: organization.country || "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={updateOrganization}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Organization Name
                      </h3>
                      <p className="mt-1 text-lg">{organization.name}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Address
                      </h3>
                      <p className="mt-1">
                        {organization.address || "No address provided"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          City
                        </h3>
                        <p className="mt-1">
                          {organization.city || "No city provided"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Country
                        </h3>
                        <p className="mt-1">
                          {organization.country || "No country provided"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Created
                      </h3>
                      <p className="mt-1">
                        {new Date(organization.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Organization Members */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Members</span>
                </CardTitle>
                <CardDescription>People in your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length > 0 ? (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {member.avatar ? (
                            <img
                              src={member.avatar || "/placeholder.svg"}
                              alt={`${member.name || "User"}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {member.name} {member.lastname}
                            {member.id === user?.id && (
                              <span className="text-xs text-gray-500 ml-1">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {member.email}
                          </p>
                        </div>
                        {member.role && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                            {member.role === "OWNER" && (
                              <Shield className="h-3 w-3 text-primary-600" />
                            )}
                            <span className="text-xs font-medium">
                              {member.role}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No members found</p>
                    </div>
                  )}
                </div>

                {isOwner && (
                  <Button
                    className="w-full mt-4 bg-primary-600 hover:bg-primary-700"
                    onClick={() => toast.info("Member management coming soon")}
                  >
                    Invite Members
                  </Button>
                )}
              </CardContent>
            </Card>

            {isOwner && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Danger Zone</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() =>
                      toast.info("Organization deletion coming soon")
                    }
                  >
                    Delete Organization
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
