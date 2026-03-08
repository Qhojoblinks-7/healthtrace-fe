import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useScreeningStore, useSessionStore } from "@/store";
import { screeningAPI } from "@/api";

/**
 * SubmissionGuard - Form footer with TanStack Mutation
 * Handles "Save & Clear" with loading spinner and toast notifications
 * Mobile responsive with stacked layout on small screens
 */
export function SubmissionGuard() {
  const queryClient = useQueryClient();
  const { screeningFormData, resetFormData } = useScreeningStore();
  const { location, volunteerName } = useSessionStore();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Check for critical values
  const hasCriticalValues = () => {
    const { systolic_bp, diastolic_bp, glucose_level } = screeningFormData;
    if (systolic_bp > 180 || diastolic_bp > 120) return true;
    if (glucose_level > 400) return true;
    return false;
  };

  // TanStack Mutation for form submission
  const mutation = useMutation({
    mutationFn: async (formData) => {
      // Add screening metadata
      const dataWithMeta = {
        ...formData,
        screened_by: volunteerName || "Anonymous",
      };
      return screeningAPI.create(dataWithMeta);
    },
    onMutate: () => {
      toast.loading("Saving screening...", { id: "screening-submit" });
    },
    onSuccess: () => {
      toast.success("Screening saved successfully!", {
        id: "screening-submit",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Clear form after successful submission
      resetFormData();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["screenings"] });
    },
    onError: () => {
      toast.error("Failed to save screening. Please try again.", {
        id: "screening-submit",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  // Handle submit with review check
  const handleSubmit = () => {
    // Add location to form data
    const dataWithLocation = {
      ...screeningFormData,
      location,
    };

    // Check for critical values
    if (hasCriticalValues()) {
      setPendingSubmit(dataWithLocation);
      setShowReviewModal(true);
      return;
    }

    // Direct submit if no critical values
    mutation.mutate(dataWithLocation);
  };

  // Confirm critical submission
  const handleConfirmSubmit = () => {
    setShowReviewModal(false);
    mutation.mutate(pendingSubmit);
    setPendingSubmit(null);
  };

  // Handle clear/reset
  const handleClear = () => {
    if (
      confirm("Are you sure you want to clear the form? All data will be lost.")
    ) {
      resetFormData();
      toast.info("Form cleared");
    }
  };

  // Check if form has minimum required data
  const canSubmit =
    screeningFormData.full_name &&
    screeningFormData.age &&
    screeningFormData.gender;

  return (
    <>
      <Card className="sticky bottom-0 bg-background/95 backdrop-blur border-t shadow-lg">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Clear Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={mutation.isPending}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Clear</span>
          </Button>

          {/* Status - Hidden on very small screens */}
          <div className="text-xs sm:text-sm text-muted-foreground order-1 sm:order-2 text-center sm:text-left">
            {location && (
              <span className="mr-0 sm:mr-4 block sm:inline mb-1 sm:mb-0">
                📍 {location}
              </span>
            )}
            {canSubmit ? (
              <span className="text-green-600">✓ Ready</span>
            ) : (
              <span className="text-yellow-600">⚠ Fill required</span>
            )}
          </div>

          {/* Save Button */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isPending}
            className="w-full sm:w-auto min-w-[140px] order-3"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save & Clear
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Review Modal for Critical Values - Mobile friendly */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Critical Values
              </h3>

              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  The following values are critical:
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 space-y-2">
                  {screeningFormData.systolic_bp > 180 && (
                    <p className="text-red-700 font-medium text-sm">
                      ⚠️ Systolic BP: {screeningFormData.systolic_bp} mmHg
                    </p>
                  )}
                  {screeningFormData.diastolic_bp > 120 && (
                    <p className="text-red-700 font-medium text-sm">
                      ⚠️ Diastolic BP: {screeningFormData.diastolic_bp} mmHg
                    </p>
                  )}
                  {screeningFormData.glucose_level > 400 && (
                    <p className="text-red-700 font-medium text-sm">
                      ⚠️ Glucose: {screeningFormData.glucose_level} mg/dL
                    </p>
                  )}
                </div>

                <p className="text-sm font-medium">Submit anyway?</p>
              </div>

              <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 justify-end flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 sm:flex-none"
                >
                  Go Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmSubmit}
                  className="flex-1 sm:flex-none"
                >
                  Yes, Submit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default SubmissionGuard;
