import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Filter } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Simple MultiSelect for Courts
function MultiSelect({ options, selected, onChange, placeholder }: any) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i: string) => i !== item));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-auto min-h-10">
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 && placeholder}
                        {selected.map((item: string) => (
                            <Badge variant="secondary" key={item} className="mr-1 mb-1">
                                {item}
                                <button
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(item);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleUnselect(item)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandList>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option: any) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(
                                            selected.includes(option.value)
                                                ? selected.filter((item: string) => item !== option.value)
                                                : [...selected, option.value]
                                        );
                                        setOpen(true);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(option.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

import * as React from "react";

export function DashboardFilters({ 
    search, setSearch, 
    courts, selectedCourts, setSelectedCourts,
    startDate, setStartDate,
    endDate, setEndDate,
    children
}: any) {
    const [showFilters, setShowFilters] = React.useState(false);

    const courtOptions = courts.map((c: any) => ({ label: c.name, value: c.name }));

    return (
        <div className="bg-card p-2 rounded-lg border mb-2">
            
            {/* Mobile Header: Filter Toggle + Add Button */}
            <div className="md:hidden flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Filters & Actions</span>
                <div className="flex gap-2">
                    <Button 
                        variant={showFilters ? "secondary" : "outline"} 
                        size="icon" 
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                    </Button>
                     {children}
                </div>
            </div>

            <div className={cn("flex flex-col md:flex-row gap-2 items-end", !showFilters && "hidden md:flex")}>
                <div className="flex-1 w-full md:w-auto">
                    <label className="text-xs font-medium mb-1 block">Search Case/Party</label>
                    <Input 
                        placeholder="Search..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="h-9"
                    />
                </div>
                
                <div className="flex-1 w-full md:w-auto">
                    <label className="text-xs font-medium mb-1 block">Courts</label>
                    <MultiSelect 
                        options={courtOptions} 
                        selected={selectedCourts} 
                        onChange={setSelectedCourts}
                        placeholder="Select Courts"
                    />
                </div>

                <div className="w-full md:w-auto">
                    <label className="text-xs font-medium mb-1 block">From Date</label>
                    <CustomDatePicker date={startDate} onChange={setStartDate} placeholder="Start Date" className="w-full md:w-[130px] h-9" />
                </div>

                <div className="w-full md:w-auto">
                    <label className="text-xs font-medium mb-1 block">To Date</label>
                    <CustomDatePicker date={endDate} onChange={setEndDate} placeholder="End Date" className="w-full md:w-[130px] h-9" />
                </div>

                {/* Desktop Action Button Slot (Hidden on mobile to avoid duplication) */}
                {children && (
                     <div className="hidden md:block w-full md:w-auto">
                        {children}
                     </div>
                )}
            </div>
        </div>
    );
}
