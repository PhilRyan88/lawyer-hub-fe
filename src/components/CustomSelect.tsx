
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"

interface Option {
  label: string
  value: string
}

interface CustomSelectProps {
  options: Option[]
  placeholder?: string
  className?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function CustomSelect({
  options,
  placeholder = "Select an option",
  className,
  value,
  onChange,
  disabled
}: CustomSelectProps) {
  return (
    <Select onValueChange={onChange} defaultValue={value} value={value} disabled={disabled}>
      <FormControl>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
