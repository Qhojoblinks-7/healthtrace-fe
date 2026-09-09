import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SchemaBuilder } from "@/features/admin/components/SchemaBuilder";
import { DynamicFormRenderer } from "@/lib/form-renderer/DynamicFormRenderer";
import { Eye, Edit, Trash2, Save, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { FIELD_TYPES, FIELD_TYPE_LABELS } from "@/lib/form-renderer/fieldTypes";
import { roleConfigApi } from "../api/roleConfigApi";

export function RoleConfigCard({ role, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [formData, setFormData] = useState({
    role_name: role.role_name || "",
    description: role.description || "",
    schema: role.schema || [],
    is_active: role.is_active ?? true,
  });

  const handleSave = async () => {
    try {
      if (role.id) {
        await roleConfigApi.update(role.id, formData);
      } else {
        await roleConfigApi.create(formData);
      }
      setIsEditing(false);
      onUpdated?.();
    } catch (error) {
      toast.error("Failed to save role", {
        description: error.response?.data?.message || "Please try again",
      });
    }
  };

  const handleDelete = async () => {
    if (!role.id) return;
    try {
      await roleConfigApi.delete(role.id);
      onDeleted?.();
    } catch (error) {
      toast.error("Failed to delete role", {
        description: error.response?.data?.message || "Please try again",
      });
    }
  };

  const handleDuplicate = () => {
    const duplicated = {
      ...formData,
      role_name: `${formData.role_name} (Copy)`,
      schema: JSON.parse(JSON.stringify(formData.schema || [])),
    };
    setFormData(duplicated);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Edit Role</CardTitle>
          <CardDescription>Update role configuration and schema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={formData.role_name}
                onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                placeholder="e.g., Vitals Intake"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this role"
            />
          </div>

          <div className="space-y-2">
            <Label>Form Schema</Label>
            <SchemaBuilder
              schema={formData.schema}
              onChange={(schema) => setFormData({ ...formData, schema })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPreviewing) {
    return (
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {formData.role_name}
            <Badge variant={formData.is_active ? "default" : "secondary"}>
              {formData.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>{formData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewing(false)}>
              Hide Preview
            </Button>
          </div>
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-3">Form Preview</p>
            <DynamicFormRenderer
              schema={formData.schema}
              onChange={(name, value) => {
                setFormData({
                  ...formData,
                  schema: formData.schema.map((field) =>
                    field.name === name ? { ...field, value } : field
                  ),
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  const fieldCount = formData.schema?.length || 0;
  const fieldTypeCounts = formData.schema?.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{formData.role_name}</CardTitle>
            <CardDescription className="mt-1">
              {formData.description || "No description"}
            </CardDescription>
          </div>
          <Badge variant={formData.is_active ? "default" : "secondary"}>
            {formData.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{fieldCount} field{fieldCount !== 1 ? "s" : ""}</span>
          </div>
          {Object.entries(fieldTypeCounts).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(fieldTypeCounts).map(([type, count]) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {FIELD_TYPE_LABELS[type] || type}: {count}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={() => setIsPreviewing(true)} className="gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDuplicate} className="gap-1">
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          {role.id && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="gap-1 text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
