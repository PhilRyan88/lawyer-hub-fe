
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
  inForm?: boolean
}

export function CustomSelect({
  options,
  placeholder = "Select an option",
  className,
  value,
  onChange,
  disabled,
  inForm = true
}: CustomSelectProps) {
  const trigger = (
    <SelectTrigger className={className}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  )

  return (
    <Select onValueChange={onChange} defaultValue={value} value={value} disabled={disabled}>
      {inForm ? (
        <FormControl>
          {trigger}
        </FormControl>
      ) : (
        trigger
      )}
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
