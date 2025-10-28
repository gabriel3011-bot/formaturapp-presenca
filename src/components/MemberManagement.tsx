import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2 } from "lucide-react";
import { Member } from "@/pages/Index";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface MemberManagementProps {
  members: Member[];
  onAddMember: (name: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const MemberManagement = ({ members, onAddMember, onRemoveMember }: MemberManagementProps) => {
  const [newMemberName, setNewMemberName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (!newMemberName.trim()) {
      toast.error("Digite o nome do membro");
      return;
    }
    onAddMember(newMemberName);
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
            {members.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum membro cadastrado</p>
              </Card>
            ) : (
              members.map((member) => (
                <Card key={member.id} className="p-3 bg-gradient-to-br from-card to-card/50 border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{member.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember(member.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
