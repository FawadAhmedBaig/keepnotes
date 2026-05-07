"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LabelType } from "@/lib/types";
import { createLabel, updateLabel, deleteLabel } from "@/lib/actions/labels";

async function fetchLabels(): Promise<LabelType[]> {
  const response = await fetch("/api/labels");
  if (!response.ok) {
    throw new Error("Failed to fetch labels");
  }
  return response.json();
}

export function useLabels() {
  return useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const result = await createLabel(name);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      toast.success("Label created");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create label");
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await updateLabel(id, name);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      toast.success("Label updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update label");
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteLabel(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Label deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete label");
    },
  });
}
