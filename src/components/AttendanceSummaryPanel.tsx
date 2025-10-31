import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/pages/Index";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface AttendanceSummaryPanelProps {
  members: Member[];
  allAttendanceRecords: {
    member_id: string;
    is_present: boolean;
    justification?: string | null;
  }[];
  totalEvents: number;
}

export const AttendanceSummaryPanel = ({ 
  members, 
  allAttendanceRecords,
  totalEvents 
}: AttendanceSummaryPanelProps) => {
  
  const getMemberStats = (memberId: string) => {
    const memberRecords = allAttendanceRecords.filter(r => r.member_id === memberId);
    
    const present = memberRecords.filter(r => r.is_present).length;
    const justified = memberRecords.filter(r => !r.is_present && r.justification).length;
    const absent = memberRecords.filter(r => !r.is_present && !r.justification).length;
    const notMarked = totalEvents - memberRecords.length;
    
    const totalAbsent = absent + notMarked;
    
    return { present, justified, absent: totalAbsent, notMarked };
  };

  const getStatusBadge = (absent: number) => {
    if (absent >= 4) {
      return <Badge variant="destructive" className="bg-red-600 dark:bg-red-900/80">Fora</Badge>;
    }
    if (absent === 3) {
      return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700">Atenção</Badge>;
    }
    return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">OK</Badge>;
  };

  if (totalEvents === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum evento criado ainda para gerar estatísticas</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Painel Geral de Faltas</h2>
        <p className="text-sm text-muted-foreground">
          Resumo de todas as {totalEvents} reuniões realizadas
        </p>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Membro</TableHead>
              <TableHead className="text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Presenças
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Justificadas
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Faltas
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum membro cadastrado
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const stats = getMemberStats(member.id);
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">
                        {stats.present}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-semibold">
                        {stats.justified}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold">
                        {stats.absent}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(stats.absent)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
