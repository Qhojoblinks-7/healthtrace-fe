import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { screeningStationApi } from "../api/screeningStationApi";

export function useScreeningStations() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["screeningStations"],
    queryFn: async () => {
      const response = await screeningStationApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: screeningStationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screeningStations"] });
      toast.success("Station created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create station", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => screeningStationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screeningStations"] });
      toast.success("Station updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update station", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: screeningStationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screeningStations"] });
      toast.success("Station deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete station", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  return {
    stations: listQuery.data?.results || listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    createStation: createMutation.mutate,
    updateStation: updateMutation.mutate,
    deleteStation: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
