import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, SuggestionCreateData } from '@/lib/api';
import { toast } from 'sonner';

export const suggestionKeys = {
  all: ['suggestions'] as const,
};

export function useSuggestions() {
  return useQuery({
    queryKey: suggestionKeys.all,
    queryFn: () => apiClient.getSuggestions(),
  });
}

export function useCreateSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SuggestionCreateData) => apiClient.createSuggestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all });
      toast.success("Sugestão enviada!", { description: "Obrigado por sua contribuição." });
    },
    onError: (error: any) => {
      toast.error("Falha ao enviar", { description: error.message || "Não foi possível salvar sua sugestão." });
    },
  });
}

export function useAddVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) => apiClient.addVoteToSuggestion(suggestionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all });
    },
    onError: (error: any) => {
      toast.error("Erro ao votar", { description: error.message || "Tente novamente mais tarde." });
    },
  });
}