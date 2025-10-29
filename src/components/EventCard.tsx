import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Users, CheckCircle2, XCircle, Edit, Trash2, MessageSquare } from "lucide-react";
import { Event } from "@/pages/Index";

interface EventCardProps {
  event: Event;
  stats: { total: number; present: number; absent: number; justified: number };
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
}

export const EventCard = ({ event, stats, onClick, onEdit, onDelete }: EventCardProps) => {
  const attendanceRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <Card
      className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 border-border/50"
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 flex-1">
            {event.title}
          </h3>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0 shrink-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 shrink-0 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o evento "{event.title}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(event.id);
                      }}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isPast && (
              <Badge variant="secondary" className="shrink-0">
                Passado
              </Badge>
            )}
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(event.date + "T00:00:00").toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Presença</span>
            <span className="text-sm font-semibold text-foreground">
              {attendanceRate.toFixed(0)}%
            </span>
          </div>

          <div className="w-full bg-muted/50 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{stats.present}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <MessageSquare className="w-4 h-4" />
              <span>{stats.justified}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <XCircle className="w-4 h-4" />
              <span>{stats.absent}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{stats.total}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
