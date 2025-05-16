"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ContentService, type Content } from "@/lib/services/content-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Layout } from "@/components/layout"
import { toast } from "sonner"
import { FileText, Plus, Edit, Trash2, Eye, MoreHorizontal, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ContentPage() {
  const { user, profile } = useAuth()
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState("all") // 'all', 'mine', 'published', 'draft'

  useEffect(() => {
    if (user) {
      fetchContent()
    }
  }, [user, filter])

  const fetchContent = async () => {
    try {
      const { contents } = await ContentService.getContents(filter)
      setContents(contents)
    } catch (error) {
      console.error("Error fetching content:", error)
      toast.error("Could not load content data")
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title) {
      toast.error("Title is required")
      return
    }

    try {
      if (editingId) {
        // Update existing content
        await ContentService.updateContent(editingId, {
          title: formData.title,
          description: formData.description,
        })

        toast.success("Content updated successfully")
      } else {
        // Create new content
        await ContentService.createContent({
          title: formData.title,
          description: formData.description,
        })

        toast.success("Content created successfully")
      }

      // Reset form and refresh content
      setFormData({ title: "", description: "" })
      setShowForm(false)
      setEditingId(null)
      fetchContent()
    } catch (error) {
      console.error("Error saving content:", error)
      toast.error(editingId ? "Failed to update content" : "Failed to create content")
    }
  }

  const handleEdit = (content: Content) => {
    setFormData({
      title: content.title,
      description: content.description || "",
    })
    setEditingId(content.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      await ContentService.deleteContent(id)
      toast.success("Content deleted successfully")
      fetchContent()
    } catch (error) {
      console.error("Error deleting content:", error)
      toast.error("Failed to delete content")
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Published</span>
      case "DRAFT":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Draft</span>
      case "ARCHIVED":
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Archived</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading content...</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-gray-500">
              Create and manage content. This demonstrates how API-based access control works.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>All Content</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("mine")}>My Content</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("published")}>Published</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("draft")}>Drafts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => {
                setFormData({ title: "", description: "" })
                setEditingId(null)
                setShowForm(!showForm)
              }}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {showForm ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  New Content
                </>
              )}
            </Button>
          </div>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Content" : "Create New Content"}</CardTitle>
              <CardDescription>
                {editingId ? "Update your existing content" : "Add new content to your organization"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter content description"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                    {editingId ? "Update Content" : "Create Content"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.length > 0 ? (
            contents.map((content) => (
              <Card key={content.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(content)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(content.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {content.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>Created: {formatDate(content.createdAt)}</div>
                    {getStatusBadge(content.status)}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 py-2 px-6 flex justify-between">
                  <div className="text-xs text-gray-500">
                    {content.userId === user?.id ? "Created by you" : "Created by team member"}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-500">No Content Found</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                {filter !== "all"
                  ? `No content matches the "${filter}" filter. Try changing the filter or create new content.`
                  : "Get started by creating your first content item."}
              </p>
              {filter !== "all" && (
                <Button variant="outline" className="mt-4" onClick={() => setFilter("all")}>
                  Show All Content
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
