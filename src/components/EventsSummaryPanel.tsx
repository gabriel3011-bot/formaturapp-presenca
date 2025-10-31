import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event } from "@/pages/Index";
import { Calendar, Users, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface EventsSummaryPanelProps {
  events: Event[];
  totalMembers: number;
}

export const EventsSummaryPanel = ({ events, totalMembers }: EventsSummaryPanelProps) => {
  
  const getEventStats = (event: Event) => {
    const total = totalMembers;
    const present = Object.values(event.attendance || {}).filter(Boolean).length;
    const justified = Object.entries(event.justifications || {}).filter(
      ([memberId, justification]) => !event.attendance?.[memberId] && justification
    ).length;
    const absent = total - present - justified;
    
    const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
    const justifiedPercent = total > 0 ? Math.round((justified / total) * 100) : 0;
    const absentPercent = total > 0 ? Math.round((absent / total) * 100) : 0;
    
    return { present, justified, absent, presentPercent, justifiedPercent, absentPercent };
  };

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum evento criado ainda</p>
      </Card>
    );
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Resumo de Todas as Reuniões</h2>
        <p className="text-sm text-muted-foreground">
          Estatísticas automáticas de presença, ausências e justificativas
        </p>
      </div>

      <div className="space-y-4">
        {sortedEvents.map((event) => {
          const stats = getEventStats(event);
          const eventDate = new Date(event.date);
          const isPast = eventDate < new Date();
          
          return (
            <Card key={event.id} className="p-4 bg-gradient-to-br from-card to-card/50">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(eventDate, "PPP", { locale: ptBR })}
                    </p>
                  </div>
                  {isPast && (
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      Realizado
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-muted-foreground">Presentes</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.presentPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">{stats.present} de {totalMembers}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-medium text-muted-foreground">Justificadas</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.justifiedPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">{stats.justified} de {totalMembers}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-medium text-muted-foreground">Ausentes</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.absentPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">{stats.absent} de {totalMembers}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted">
                    <div 
                      className="absolute left-0 top-0 h-full bg-green-500 dark:bg-green-600"
                      style={{ width: `${stats.presentPercent}%` }}
                    />
                    <div 
                      className="absolute top-0 h-full bg-yellow-500 dark:bg-yellow-600"
                      style={{ 
                        left: `${stats.presentPercent}%`,
                        width: `${stats.justifiedPercent}%` 
                      }}
                    />
                    <div 
                      className="absolute top-0 h-full bg-red-500 dark:bg-red-600"
                      style={{ 
                        left: `${stats.presentPercent + stats.justifiedPercent}%`,
                        width: `${stats.absentPercent}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};
