import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ProfileUpdateData } from '@/lib/api';
import { toast } from 'sonner';

export const profileKeys = {
  profile: () => ['profile'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: () => apiClient.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateData) => apiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar perfil', {
        description: error.message || 'Não foi possível salvar as alterações.',
      });
    },
  });
}