import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roleConfigApi } from "../api/roleConfigApi";

export function useRoleConfigs() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["roleConfigs"],
    queryFn: async () => {
      const response = await roleConfigApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: roleConfigApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roleConfigs"] });
      toast.success("Role created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create role", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roleConfigApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roleConfigs"] });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update role", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roleConfigApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roleConfigs"] });
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete role", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  return {
    roleConfigs: listQuery.data?.results || listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    createRole: createMutation.mutate,
    updateRole: updateMutation.mutate,
    deleteRole: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
