import { useState } from "react";
import { Check, X, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAbsenceCount, getAbsenceStatus } from "@/hooks/useAbsenceCount";

interface AttendanceMarkerProps {
  memberId: string;
  memberName: string;
  isPresent: boolean | null;
  justification?: string;
  onToggle: (isPresent: boolean, justification?: string) => void;
}

export const AttendanceMarker = ({
  memberId,
  memberName,
  isPresent,
  justification,
  onToggle,
}: AttendanceMarkerProps) => {
  const [isJustificationOpen, setIsJustificationOpen] = useState(false);
  const [localJustification, setLocalJustification] = useState(justification || "");
  const absenceCount = useAbsenceCount(memberId);
  const absenceStatusInfo = getAbsenceStatus(absenceCount);

  const handleSaveJustification = () => {
    onToggle(false, localJustification);
    setIsJustificationOpen(false);
  };

  const handleAbsentClick = () => {
    if (isPresent === false && justification) {
      // If already absent with justification, just open dialog to view/edit
      setIsJustificationOpen(true);
    } else {
      // Mark as absent and open justification dialog
      setIsJustificationOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <Button
          variant={isPresent === true ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(true, "")}
          className="gap-1"
        >
          <Check className="h-4 w-4" />
          Presente
        </Button>

        <Dialog open={isJustificationOpen} onOpenChange={setIsJustificationOpen}>
          <DialogTrigger asChild>
            <Button
              variant={isPresent === false ? "destructive" : "outline"}
              size="sm"
              onClick={handleAbsentClick}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Ausente
              {isPresent === false && justification && (
                <Info className="h-3 w-3 ml-1" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Justificativa de Falta - {memberName}</DialogTitle>
              <DialogDescription>
                Adicione um motivo para a falta (opcional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Ex: Atestado médico, motivos familiares..."
                value={localJustification}
                onChange={(e) => setLocalJustification(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsJustificationOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveJustification}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Salvar Justificativa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Badge variant="outline" className={absenceStatusInfo.bgColor}>
        <span className={absenceStatusInfo.color}>
          {absenceCount} faltas - {absenceStatusInfo.label}
        </span>
      </Badge>
    </div>
  );
};
