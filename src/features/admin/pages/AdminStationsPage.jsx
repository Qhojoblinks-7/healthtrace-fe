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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScreeningStations } from "@/features/admin/hooks/useScreeningStations";
import { useRoleConfigs } from "@/features/admin/hooks/useRoleConfigs";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

const STATION_TYPES = [
  { value: "REGISTRATION", label: "Table 1: Registration" },
  { value: "VITALS", label: "Table 2: Vitals" },
  { value: "LAB_GLUCOSE", label: "Table 3A: Lab / Glucose" },
  { value: "DOCTOR_TRIAGE", label: "Table 3B: Doctor Triage" },
  { value: "DISCHARGE", label: "Table 4: Admin Discharge" },
  { value: "GENERAL", label: "General Checkout" },
];

export function AdminStationsPage() {
  const { stations, isLoading, createStation, deleteStation } =
    useScreeningStations();
  const { roleConfigs } = useRoleConfigs();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredStations = stations.filter((station) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      station.name?.toLowerCase().includes(query) ||
      station.station_type?.toLowerCase().includes(query)
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const stepOrder = parseInt(formData.get("stepOrder")?.toString() || "1", 10);
    const roleConfigId = formData.get("roleConfig")?.toString();

    if (!formData.get("name")?.toString().trim()) {
      toast.error("Station name is required");
      return;
    }

    try {
      await createStation({
        name: formData.get("name")?.toString().trim(),
        step_order: stepOrder,
        station_type: formData.get("stationType")?.toString() || "GENERAL",
        role_config: roleConfigId ? parseInt(roleConfigId, 10) : null,
        is_final_discharge: formData.get("isFinalDischarge") === "on",
        is_active: true,
      });
      e.target.reset();
      setShowCreateForm(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this station?")) return;
    try {
      await deleteStation(id);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-card-foreground">Screening Stations</h1>
        <p className="text-muted-foreground mt-1">
          Configure physical tables and their routing order for each health event
        </p>
      </div>

      {!showCreateForm && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Station
          </Button>
        </div>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Station</CardTitle>
            <CardDescription>Add a new screening station to the workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Station Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Table 2: Blood Pressure"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stepOrder">Step Order</Label>
                  <Input
                    id="stepOrder"
                    name="stepOrder"
                    type="number"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stationType">Station Type</Label>
                  <Select name="stationType" defaultValue="GENERAL">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleConfig">Role Config</Label>
                  <Select name="roleConfig">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role config" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleConfigs.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isFinalDischarge" name="isFinalDischarge" />
                <Label htmlFor="isFinalDischarge">Final Discharge Station</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit">Create Station</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading stations...</div>
      ) : filteredStations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No stations match your search." : "No stations configured yet."}
            </p>
            {!searchQuery && (
              <Button
                variant="link"
                onClick={() => setShowCreateForm(true)}
                className="mt-2"
              >
                Create your first station
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations
            .sort((a, b) => a.step_order - b.step_order)
            .map((station) => (
              <Card key={station.id} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge variant="outline">Step {station.step_order}</Badge>
                        {station.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {STATION_TYPES.find((t) => t.value === station.station_type)?.label ||
                          station.station_type}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toast.info("Edit functionality coming soon")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(station.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <Badge variant="secondary">
                        {station.role_config?.role_name || "None"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={station.is_active ? "default" : "secondary"}>
                        {station.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {station.is_final_discharge && (
                      <Badge variant="destructive">Final Discharge</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
