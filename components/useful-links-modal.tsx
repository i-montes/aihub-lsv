'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface UsefulLink {
  id: number;
  name: string;
  description: string | null;
  link: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface UsefulLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinksUpdated: () => void;
}

interface LinkFormData {
  id?: number;
  name: string;
  description: string;
  link: string;
}

export default function UsefulLinksModal({ isOpen, onClose, onLinksUpdated }: UsefulLinksModalProps) {
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkFormData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>({
    name: '',
    description: '',
    link: ''
  });
  const [errors, setErrors] = useState<Partial<LinkFormData>>({});

  // Cargar enlaces al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchLinks();
    }
  }, [isOpen]);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/useful-links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
      } else {
        toast.error('Error al cargar los enlaces');
      }
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Error al cargar los enlaces');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (data: LinkFormData): boolean => {
    const newErrors: Partial<LinkFormData> = {};

    if (!data.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!data.link.trim()) {
      newErrors.link = 'El enlace es requerido';
    } else {
      try {
        new URL(data.link);
      } catch {
        newErrors.link = 'Debe ser una URL válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveLink = async () => {
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    try {
      const isEditing = editingLink !== null;
      const url = '/api/useful-links';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { ...formData, id: editingLink.id } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(isEditing ? 'Enlace actualizado' : 'Enlace creado');
        await fetchLinks();
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al guardar el enlace');
      }
    } catch (error) {
      console.error('Error saving link:', error);
      toast.error('Error al guardar el enlace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este enlace?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/useful-links?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Enlace eliminado');
        await fetchLinks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al eliminar el enlace');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Error al eliminar el enlace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLink = (link: UsefulLink) => {
    setEditingLink(link);
    setFormData({
      id: link.id,
      name: link.name,
      description: link.description || '',
      link: link.link
    });
    setIsAddingNew(true);
    setErrors({});
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', link: '' });
    setEditingLink(null);
    setIsAddingNew(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
    onLinksUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Enlaces Útiles</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botón para añadir nuevo enlace */}
          {!isAddingNew && (
            <Button
              onClick={() => setIsAddingNew(true)}
              className="w-full"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Nuevo Enlace
            </Button>
          )}

          {/* Formulario para añadir/editar enlace */}
          {isAddingNew && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">
                {editingLink ? 'Editar Enlace' : 'Nuevo Enlace'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre del enlace"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción opcional del enlace"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="link">URL *</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://ejemplo.com"
                    className={errors.link ? 'border-red-500' : ''}
                  />
                  {errors.link && (
                    <p className="text-sm text-red-500 mt-1">{errors.link}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveLink}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingLink ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de enlaces existentes */}
          <div className="space-y-3">
            <h3 className="font-semibold">Enlaces Existentes</h3>
            
            {isLoading && links.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Cargando enlaces...</p>
            ) : links.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay enlaces configurados aún.
              </p>
            ) : (
              <div className="space-y-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="border rounded-lg p-3 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{link.name}</h4>
                      {link.description && (
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                      )}
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 block"
                      >
                        {link.link}
                      </a>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLink(link)}
                        disabled={isLoading}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}