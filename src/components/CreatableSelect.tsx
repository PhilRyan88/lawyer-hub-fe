import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // Add CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  label: string
  value: string
}

interface CreatableSelectProps {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  onCreate: (value: string) => void
  placeholder?: string
}

export function CreatableSelect({
  options,
  value,
  onChange,
  onCreate,
  placeholder = "Select...",
}: CreatableSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList> {/* Wrap items in CommandList */}
            <CommandEmpty>
                <div className="p-2">
                    <p className="text-sm text-muted-foreground mb-2">No results found.</p>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                            onCreate(inputValue);
                            setOpen(false);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create "{inputValue}"
                    </Button>
                </div>
            </CommandEmpty>
            <CommandGroup>
                {options.map((option) => (
                <CommandItem
                    key={option.value}
                    value={option.label} // Use label for searching
                    onSelect={(currentValue: string) => {
                        // find value by label because Command uses value/label matching
                        const found = options.find(o => o.label.toLowerCase() === currentValue.toLowerCase())
                        onChange(found ? found.value : currentValue)
                        setOpen(false)
                    }}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
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
  )
}
