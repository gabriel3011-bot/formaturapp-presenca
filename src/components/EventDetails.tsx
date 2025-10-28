import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, User } from "lucide-react";
import { Event, Member } from "@/pages/Index";

interface EventDetailsProps {
  event: Event;
  members: Member[];
  onToggleAttendance: (eventId: string, memberId: string) => void;
}

export const EventDetails = ({ event, members, onToggleAttendance }: EventDetailsProps) => {
  const presentCount = Object.values(event.attendance).filter(Boolean).length;
  const attendanceRate = members.length > 0 ? (presentCount / members.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Event Header */}
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span className="text-lg">
              {new Date(event.date + "T00:00:00").toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-foreground">Taxa de Presença</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {attendanceRate.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-muted/50 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">
                  Presentes: <span className="font-semibold text-foreground">{presentCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">
                  Ausentes: <span className="font-semibold text-foreground">{members.length - presentCount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Members List */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Lista de Presença</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((member) => {
            const isPresent = event.attendance[member.id] || false;
            return (
              <Card
                key={member.id}
                className={`p-4 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  isPresent
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                    : 'bg-card border-border/50'
                }`}
                onClick={() => onToggleAttendance(event.id, member.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isPresent
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-muted'
                    }`}>
                      <User className={`w-5 h-5 ${
                        isPresent
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <span className={`font-medium ${
                      isPresent
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-foreground'
                    }`}>
                      {member.name}
                    </span>
                  </div>

                  <Button
                    variant={isPresent ? "default" : "outline"}
                    size="sm"
                    className={isPresent 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-border/50"
                    }
                  >
                    {isPresent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Presente
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Ausente
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
