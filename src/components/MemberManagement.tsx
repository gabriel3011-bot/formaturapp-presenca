import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2 } from "lucide-react";
import { Member } from "@/pages/Index";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Attendance {
  id: string;
  member_id: string;
  event_id: string;
  is_present: boolean;
}

interface MemberManagementProps {
  members: Member[];
  attendances?: Attendance[];
  onAddMember: (name: string) => void;
  onRemoveMember: (memberId: string) => void;
}

// Função para calcular o status de faltas
const getAbsenceStatus = (memberId: string, attendances: Attendance[] = []) => {
  const absences = attendances.filter(
    (att) => att.member_id === memberId && !att.is_present
  ).length;

  if (absences > 3) {
    return { status: 'fora', color: 'text-red-600', bgColor: 'bg-red-100', absences };
  } else if (absences === 3) {
    return { status: 'atenção', color: 'text-orange-600', bgColor: 'bg-orange-100', absences };
  }
  return { status: 'ok', color: '', bgColor: '', absences };
};

export const MemberManagement = ({ members, attendances = [], onAddMember, onRemoveMember }: MemberManagementProps) => {
  const [newMemberName, setNewMemberName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (!newMemberName.trim()) {
      toast.error("Digite o nome do membro");
      return;
    }
    onAddMember(newMemberName.trim());
    setNewMemberName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border/50">
          <Users className="mr-2 h-5 w-5" />
          Gerenciar Membros ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros da Comissão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Add Member */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="member-name" className="sr-only">Nome do membro</Label>
              <Input
                id="member-name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nome do membro"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          {/* Members List */}
          <div className="space-y-2">
            {members.map((member) => {
              const absenceInfo = getAbsenceStatus(member.id, attendances);
              return (
                <Card key={member.id} className={`p-3 flex items-center justify-between ${absenceInfo.bgColor}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${absenceInfo.color}`}>
                      {member.name}
                    </span>
                    {absenceInfo.status !== 'ok' && (
                      <span className={`text-sm ${absenceInfo.color} font-semibold`}>
                        ({absenceInfo.status} - {absenceInfo.absences} faltas)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMember(member.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
