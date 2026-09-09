import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoleConfigs } from "@/features/admin/hooks/useRoleConfigs";
import { RoleConfigCard } from "@/features/admin/components/RoleConfigCard";
import { Plus, Search, LayoutGrid, List } from "lucide-react";

export function AdminRolesPage() {
  const { roleConfigs, isLoading, refetch, createRole } = useRoleConfigs();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredRoles = roleConfigs.filter((role) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      role.role_name?.toLowerCase().includes(query) ||
      role.description?.toLowerCase().includes(query)
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const roleName = formData.get("roleName")?.toString().trim();

    if (!roleName) {
      toast.error("Role name is required");
      return;
    }

    try {
      await createRole({
        role_name: roleName,
        description: formData.get("description")?.toString() || "",
        schema: [],
        is_active: true,
      });
      e.target.reset();
      setShowCreateForm(false);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-card-foreground">Role Configurations</h1>
        <p className="text-muted-foreground mt-1">
          Manage dynamic form schemas for each screening station role
        </p>
      </div>

      {!showCreateForm && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Role
            </Button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Role</CardTitle>
            <CardDescription>Define a new role configuration for a screening station</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    name="roleName"
                    placeholder="e.g., Vitals Intake"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Brief description of this role"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit">Create Role</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading roles...
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No roles match your search." : "No roles configured yet."}
            </p>
            {!searchQuery && (
              <Button
                variant="link"
                onClick={() => setShowCreateForm(true)}
                className="mt-2"
              >
                Create your first role
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => (
            <RoleConfigCard
              key={role.id}
              role={role}
              onUpdated={refetch}
              onDeleted={refetch}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoles.map((role) => (
            <RoleConfigCard
              key={role.id}
              role={role}
              onUpdated={refetch}
              onDeleted={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
