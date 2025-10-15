import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, User, Camera } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess: (newUrl: string) => void;
  fallbackName: string;
}

export const AvatarUpload = ({ currentAvatarUrl, onUploadSuccess, fallbackName }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 2) { // 2MB limit
      toast.error("Arquivo muito grande", { description: "O tamanho máximo da imagem é 2MB." });
      return;
    }

    setIsUploading(true);
    try {
      const newUrl = await apiClient.uploadAvatar(file);
      onUploadSuccess(newUrl);
      toast.success("Avatar atualizado com sucesso!");
    } catch (error) {
      toast.error("Falha no upload", { description: "Não foi possível enviar a imagem. Tente novamente." });
    } finally {
      setIsUploading(false);
    }
  };

  const fallbackInitial = fallbackName?.[0]?.toUpperCase() || <User className="h-6 w-6" />;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src={currentAvatarUrl || undefined} alt="Avatar do usuário" />
          <AvatarFallback className="text-2xl">{fallbackInitial}</AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      <Button asChild variant="outline" size="sm" disabled={isUploading}>
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <Camera className="mr-2 h-4 w-4" />
          Trocar foto
          <input
            id="avatar-upload"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </Button>
    </div>
  );
};