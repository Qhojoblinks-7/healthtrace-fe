import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

const Select = ({ value, onValueChange, children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Find the selected item's display value
  const selectedChild = React.Children.toArray(children).find(
    child => child.props.value === value
  )
  const displayValue = selectedChild?.props?.children || value

  return (
    <div className="relative" {...props}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{displayValue}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {React.Children.map(children, child => {
            if (!child) return null
            return React.cloneElement(child, {
              onClick: () => {
                onValueChange(child.props.value)
                setIsOpen(false)
              },
              className: `${child.props.className || ""} cursor-pointer relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50`
            })
          })}
        </div>
      )}
    </div>
  )
}

const SelectTrigger = ({ className, children, ...props }) => (
  <div
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className || ""}`}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
)

const SelectValue = ({ children, placeholder }) => {
  return <span className="text-sm">{children || placeholder}</span>
}

const SelectContent = ({ className, children, ...props }) => (
  <div
    className={`relative z-50 max-h-60 min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md ${className || ""}`}
    {...props}
  >
    {children}
  </div>
)

const SelectItem = ({ className, children, onClick, ...props }) => (
  <div
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer ${className || ""}`}
    onClick={onClick}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Check className="h-4 w-4 opacity-0" />
    </span>
    {children}
  </div>
)

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
