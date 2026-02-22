import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Scale, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useGetCalendarEventsQuery } from "./calendarApi";
import { cn } from "@/lib/utils";
import { generateDailySchedulePDF } from "@/utils/pdfGenerator";
import { Printer } from "lucide-react";
import { toast } from "sonner";

export default function CalendarPage() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [expandedCourts, setExpandedCourts] = useState<string[]>([]);

    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(firstDayOfMonth);
    const endDate = endOfWeek(lastDayOfMonth);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Fetch Events
    const { data: events = [], isLoading } = useGetCalendarEventsQuery({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const getEventsForDay = (day: Date) => {
        return events.filter((event: any) => isSameDay(new Date(event.date), day));
    };

    const handleDayClick = (day: Date) => {
        setSelectedDay(day);
        setIsSheetOpen(true);
        setExpandedCourts([]); 
    };

    const toggleCourt = (courtName: string) => {
        setExpandedCourts(prev => 
            prev.includes(courtName) 
                ? prev.filter(c => c !== courtName)
                : [...prev, courtName]
        );
    };

    const getGroupedEvents = (dayEvents: any[]) => {
        const groups: { [key: string]: any[] } = {};
        dayEvents.forEach(event => {
            const court = event.courtName || "Unspecified Court";
            if (!groups[court]) {
                groups[court] = [];
            }
            groups[court].push(event);
        });
        return groups;
    };

    const renderDayDetails = () => {
        if (!selectedDay) return null;
        
        const dayEvents = getEventsForDay(selectedDay);
        const groupedEvents = getGroupedEvents(dayEvents);
        const courts = Object.keys(groupedEvents).sort();

        return (
            <div className="flex flex-col h-full">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">{format(selectedDay, "EEEE, MMMM do, yyyy")}</h2>
                        <p className="text-muted-foreground">{dayEvents.length} Cases total</p>
                    </div>
                    {dayEvents.length > 0 && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="shrink-0 rounded-xl gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold"
                            onClick={() => {
                                toast.info("Generating Daily Schedule PDF...");
                                generateDailySchedulePDF(selectedDay, groupedEvents);
                            }}
                        >
                            <Printer className="h-4 w-4" />
                            Capture
                        </Button>
                    )}
                </div>

                {courts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        No cases scheduled for this day.
                    </div>
                ) : (
                    <div className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1">
                        {courts.map(court => {
                            const courtCases = groupedEvents[court];
                            const isExpanded = expandedCourts.includes(court);
                            
                            return (
                                <div key={court} className="border rounded-xl shadow-sm bg-card overflow-hidden transition-all">
                                    <button 
                                        onClick={() => toggleCourt(court)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 font-bold">
                                            <Scale className="h-4 w-4 text-primary" />
                                            <span>{court}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs font-bold px-3">
                                                {courtCases.length}
                                            </Badge>
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="border-t bg-muted/10 p-2 space-y-2">
                                            {courtCases.map((event: any, idx: number) => (
                                                <div 
                                                    key={idx}
                                                    onClick={() => navigate(`/cases/${event.caseId}`)}
                                                    className="p-3 rounded-lg hover:bg-background border border-transparent hover:border-border cursor-pointer transition-all flex items-start gap-3 bg-background/50 shadow-sm"
                                                >
                                                    <div className={cn(
                                                        "w-1 h-full min-h-[2.5rem] rounded-full self-stretch shrink-0",
                                                        event.type === 'nextDate' ? "bg-rose-500" :
                                                        event.type === 'registrationDate' ? "bg-blue-500" : "bg-slate-400"
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{event.nameOfParty}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
                                                            <span className="text-primary font-bold">{event.caseNo}</span>
                                                            <span className="opacity-30">|</span>
                                                            <span className={cn(
                                                                "font-bold uppercase tracking-wider text-[10px]",
                                                                event.type === 'nextDate' ? "text-rose-500" :
                                                                event.type === 'registrationDate' ? "text-blue-500" : "text-slate-500"
                                                            )}>
                                                                {event.type === 'nextDate' ? "Upcoming Hearing" : 
                                                                 event.type === 'registrationDate' ? "Case Registration" : "Previous Date"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 self-center" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 min-h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="bg-white/50 dark:bg-slate-900/50 p-4 md:p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
                        <CalendarIcon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hearing Calendar</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Visual schedule of your court dates</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex-1 md:flex-none flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg md:p-1.5 md:rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 md:h-9 md:w-9 rounded-md md:rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-sm">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-bold flex-1 md:w-40 text-center text-sm md:text-base">
                            {format(currentDate, "MMMM yyyy")}
                        </span>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 md:h-9 md:w-9 rounded-md md:rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-sm">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button variant="outline" onClick={goToToday} className="rounded-lg md:rounded-xl border-slate-200 font-bold hover:bg-slate-50 h-8 md:h-10 text-xs md:text-sm">Today</Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-slate-900/20 rounded-[20px] md:rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden backdrop-blur-sm">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center py-2 md:py-4">
                    {weekDays.map(day => (
                        <div key={day} className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.2em] py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Body */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {days.map((day, dayIdx) => {
                        const dayEvents = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, firstDayOfMonth);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div 
                                key={day.toString()}
                                className={cn(
                                    "min-h-[80px] md:min-h-[120px] border-b border-r border-slate-100 dark:border-slate-800 p-1.5 md:p-3 transition-all relative flex flex-col gap-1 md:gap-2 cursor-pointer group",
                                    !isCurrentMonth ? "bg-slate-50/30 dark:bg-slate-900/10 text-slate-300 dark:text-slate-700" : "hover:bg-sky-50/30 dark:hover:bg-sky-900/5",
                                    isToday && "bg-sky-50 dark:bg-sky-900/20"
                                )}
                                onClick={() => handleDayClick(day)}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-xs md:text-sm font-black w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg md:rounded-xl",
                                        isToday ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors"
                                    )}>
                                        {format(day, dateFormat)}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <Badge variant="secondary" className="hidden md:inline-flex bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-none font-black text-[10px] px-2 py-0.5 rounded-lg">
                                            {dayEvents.length} {dayEvents.length === 1 ? 'Case' : 'Cases'}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex gap-1 md:gap-1.5 mt-auto flex-wrap content-end">
                                    {dayEvents.slice(0, 4).map((e: any, i: number) => (
                                        <div key={i} className={cn(
                                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full",
                                            e.type === 'nextDate' ? "bg-rose-400" : "bg-blue-400"
                                        )} title={e.nameOfParty} />
                                    ))}
                                    {dayEvents.length > 4 && <span className="text-[10px] font-black text-slate-400 leading-none">+{dayEvents.length - 4}</span>}
                                </div>
                                
                                {isLoading && isCurrentMonth && dayIdx === 15 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20 backdrop-blur-[1px]">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sheet for Day Details */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 overflow-hidden border-l border-border/50">
                    <SheetHeader className="p-6 border-b bg-slate-50/50 dark:bg-slate-900/50">
                        <SheetTitle className="text-xl font-black">Daily Schedule</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 p-6 overflow-hidden">
                        {renderDayDetails()}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
