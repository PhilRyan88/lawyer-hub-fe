import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  onExplorerClick?: (value: string) => void;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  onExplorerClick,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleUnselect = (item: string) => {
    onChange(value.filter((i) => i !== item));
  };

  const handleSelect = (currentValue: string) => {
    // Check if selected
    const isSelected = value.includes(currentValue);
    if (isSelected) {
      handleUnselect(currentValue);
    } else {
      onChange([...value, currentValue]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((val) => {
                 const option = options.find((o) => o.value === val);
                 return (
                    <Badge variant="secondary" key={val} className="mr-1 pr-1 flex items-center gap-1">
                      <span 
                        className={cn("truncate", onExplorerClick && "cursor-pointer hover:underline")}
                        onClick={(e) => {
                            if (onExplorerClick) {
                                e.stopPropagation();
                                onExplorerClick(val);
                            }
                        }}
                        title={onExplorerClick ? "Click to view case details" : undefined}
                      >
                        {option ? option.label.split(" - ")[0] : val} 
                      </span>
                      <div
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-secondary-foreground/20 p-0.5"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUnselect(val);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnselect(val);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </div>
                    </Badge>
                 );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
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
