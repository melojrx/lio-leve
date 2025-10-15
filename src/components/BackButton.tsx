import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button variant="ghost" onClick={() => navigate(-1)} className={cn("mb-4 -ml-4", className)}>
      <ChevronLeft className="mr-2 h-4 w-4" />
      Voltar
    </Button>
  );
};