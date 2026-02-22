import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Filter, Search, RotateCcw, Star } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// MultiSelect for Courts with refined styling
function MultiSelect({ options, selected, onChange, placeholder }: any) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i: string) => i !== item));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    role="combobox" 
                    aria-expanded={open} 
                    className="w-full justify-between h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-background/50 hover:bg-background transition-colors"
                >
                    <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                        {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
                        {selected.slice(0, 2).map((item: string) => (
                            <Badge variant="secondary" key={item} className="rounded-lg h-6 px-1.5 font-bold bg-primary/10 text-primary border-none">
                                {item}
                                <button
                                    className="ml-1 hover:text-destructive transition-colors outline-none"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUnselect(item);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        {selected.length > 2 && (
                            <Badge variant="secondary" className="rounded-lg h-6 font-bold bg-slate-100 dark:bg-slate-800">
                                +{selected.length - 2}
                            </Badge>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl" align="start">
                <Command className="bg-background">
                    <CommandList>
                        <CommandGroup className="max-h-64">
                            {options.map((option: any) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(
                                            selected.includes(option.value)
                                                ? selected.filter((item: string) => item !== option.value)
                                                : [...selected, option.value]
                                        );
                                    }}
                                    className="flex items-center gap-2 py-3 px-4"
                                >
                                    <div className={cn(
                                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                        selected.includes(option.value) ? "bg-primary border-primary" : "border-slate-300"
                                    )}>
                                        {selected.includes(option.value) && <Check className="h-3 w-3 text-primary-foreground" />}
                                    </div>
                                    <span className="font-medium">{option.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export function DashboardFilters({ 
    search, setSearch, 
    courts, selectedCourts, setSelectedCourts,
    startDate, setStartDate,
    endDate, setEndDate,
    isStarred, setIsStarred,
    onSearch
}: any) {
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const courtOptions = courts.map((c: any) => ({ label: c.name, value: c.name }));

    const hasActiveFilters = selectedCourts.length > 0 || startDate || endDate || isStarred;

    const clearFilters = () => {
        setSelectedCourts([]);
        setStartDate(undefined);
        setEndDate(undefined);
        setIsStarred(false);
    };

    const toggleStar = () => {
        setIsStarred(!isStarred);
        onSearch();
    };

    return (
        <div className="w-full space-y-3">
            {/* Primary Filter Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:max-w-md group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input 
                        placeholder="Search cases, parties, or numbers..." 
                        value={search} 
                        onChange={(e) => {
                            setSearch(e.target.value);
                            onSearch();
                        }} 
                        className="h-11 pl-10 rounded-2xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 focus-visible:ring-primary shadow-md group-hover:border-primary/50 transition-all font-medium"
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                        variant={isStarred ? "secondary" : "outline"}
                        className={cn(
                            "grow sm:grow-0 h-11 rounded-2xl px-4 flex items-center gap-2 font-bold transition-all shadow-sm border-slate-300 dark:border-slate-800",
                            isStarred && "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 shadow-amber-200/20 shadow-lg"
                        )}
                        onClick={toggleStar}
                        title="View Starred Cases"
                    >
                        <Star className={cn("h-4 w-4", isStarred ? "fill-current" : "")} />
                    </Button>

                    <Button 
                        variant={isCollapsed ? "outline" : "secondary"}
                        className={cn(
                            "grow sm:grow-0 h-11 rounded-2xl px-5 flex items-center gap-2 font-bold transition-all shadow-sm border-slate-300 dark:border-slate-800",
                            !isCollapsed && "bg-primary text-primary-foreground border-transparent hover:bg-primary/90 shadow-primary/20 shadow-lg",
                            hasActiveFilters && isCollapsed && "border-primary text-primary"
                        )}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <Filter className={cn("h-4 w-4 transition-transform", !isCollapsed && "rotate-180")} />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                                isCollapsed ? "bg-primary text-primary-foreground" : "bg-white text-primary"
                            )}>
                                { (selectedCourts.length > 0 ? 1 : 0) + (startDate ? 1 : 0) + (endDate ? 1 : 0) }
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Collapsible Advanced Filters */}
            {!isCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2.5fr_auto] gap-6 p-6 rounded-[24px] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Courts</label>
                        <MultiSelect 
                            options={courtOptions} 
                            selected={selectedCourts} 
                            onChange={(vals: any) => {
                                setSelectedCourts(vals);
                                onSearch();
                            }}
                            placeholder="All Courts"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Date Range</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <CustomDatePicker 
                                    date={startDate} 
                                    onChange={(d: any) => {
                                        setStartDate(d);
                                        onSearch();
                                    }} 
                                    placeholder="From Date" 
                                    className="h-10 rounded-xl"
                                />
                            </div>
                            <div className="h-px w-3 bg-slate-300 dark:bg-slate-700 shrink-0" />
                            <div className="flex-1">
                                <CustomDatePicker 
                                    date={endDate} 
                                    onChange={(d: any) => {
                                        setEndDate(d);
                                        onSearch();
                                    }} 
                                    placeholder="To Date" 
                                    className="h-10 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <Button 
                            variant="outline" 
                            className="h-10 px-4 rounded-xl flex items-center gap-2 font-bold text-slate-600 border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-all active:scale-95" 
                            onClick={() => {
                                clearFilters();
                                onSearch();
                            }}
                            title="Reset all filters"
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="hidden sm:inline">Reset</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
