import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Scale, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useGetCalendarEventsQuery } from "./calendarApi";
import { cn } from "@/lib/utils";

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
        setExpandedCourts([]); // Reset expanded courts when opening new day
    };

    const toggleCourt = (courtName: string) => {
        setExpandedCourts(prev => 
            prev.includes(courtName) 
                ? prev.filter(c => c !== courtName)
                : [...prev, courtName]
        );
    };

    // Grouping Logic
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
                <div className="mb-6">
                    <h2 className="text-xl font-bold">{format(selectedDay, "EEEE, MMMM do, yyyy")}</h2>
                    <p className="text-muted-foreground">{dayEvents.length} Cases total</p>
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
                                <div key={court} className="border rounded-lg shadow-sm bg-card overflow-hidden">
                                    <button 
                                        onClick={() => toggleCourt(court)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 font-semibold">
                                            <Scale className="h-4 w-4 text-primary" />
                                            <span>{court}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
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
                                                    className="p-2 rounded hover:bg-background border border-transparent hover:border-border cursor-pointer transition-all flex items-start gap-2 bg-background/50"
                                                >
                                                    <div className={cn(
                                                        "w-1 h-full min-h-[2rem] rounded-full self-stretch shrink-0",
                                                        event.type === 'nextDate' ? "bg-green-500" :
                                                        event.type === 'registrationDate' ? "bg-blue-500" : "bg-slate-400"
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{event.nameOfParty}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{event.caseNo}</span>
                                                            <span>•</span>
                                                            <span className={cn(
                                                                "font-medium",
                                                                event.type === 'nextDate' ? "text-green-600" :
                                                                event.type === 'registrationDate' ? "text-blue-600" : "text-slate-600"
                                                            )}>
                                                                {event.type === 'nextDate' ? "Next Date" : 
                                                                 event.type === 'registrationDate' ? "Registration" : "Previous Date"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
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
        <div className="container mx-auto py-6 px-4 min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Scale className="h-6 w-6 text-primary" />
                    Case Calendar
                </h1>
                
                <div className="flex items-center gap-2 bg-card p-1 rounded-lg border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold w-32 text-center text-lg">
                        {format(currentDate, "MMMM yyyy")}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Button variant="outline" onClick={goToToday}>Today</Button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card rounded-lg shadow border flex-1 flex flex-col">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 border-b bg-muted/40 text-center py-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-sm font-medium text-muted-foreground uppercase tracking-wider py-1">
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
                                    "min-h-[100px] border-b border-r p-2 transition-all relative flex flex-col gap-1 cursor-pointer hover:bg-muted/20",
                                    !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                                    isToday && "bg-sky-50 dark:bg-sky-900/10"
                                )}
                                onClick={() => handleDayClick(day)}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                        isToday && "bg-primary text-primary-foreground"
                                    )}>
                                        {format(day, dateFormat)}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <>
                                            {/* Mobile: Small rounded number */}
                                            <div className="md:hidden flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
                                                {dayEvents.length}
                                            </div>
                                            {/* Desktop: Full Badge */}
                                            <Badge variant="secondary" className="hidden md:flex text-xs bg-sky-100 text-sky-700 hover:bg-sky-200">
                                                {dayEvents.length} Cases
                                            </Badge>
                                        </>
                                    )}
                                </div>

                                {/* Preview Dots (Optional visual indicator of load) */}
                                <div className="flex gap-1 mt-auto flex-wrap content-end">
                                    {dayEvents.slice(0, 5).map((e: any, i: number) => (
                                        <div key={i} className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            e.type === 'nextDate' ? "bg-green-400" : "bg-blue-400"
                                        )} />
                                    ))}
                                    {dayEvents.length > 5 && <span className="text-[10px] text-muted-foreground leading-none">+</span>}
                                </div>
                                
                                {/* Loading State */}
                                {isLoading && isCurrentMonth && dayIdx === 15 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sheet for Day Details */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Daily Schedule</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 mt-4 overflow-hidden">
                        {renderDayDetails()}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
