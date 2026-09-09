import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext({
  value: "",
  onValueChange: () => {},
  isOpen: false,
  setIsOpen: () => {},
});

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("Select compound components must be used within <Select>");
  }
  return ctx;
}

function Select({ value, onValueChange, children, ...props }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative w-fit" ref={containerRef} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children, ...props }) {
  const { isOpen, setIsOpen } = useSelectContext();

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border-0 bg-gradient-to-br from-white to-[#E8EDF2] px-4 py-2 text-sm shadow-neu-outer-sm placeholder:text-muted-foreground focus:outline-none focus:shadow-neu-outer disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer dark:from-background dark:to-card",
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

function SelectValue({ placeholder, children }) {
  const { value } = useSelectContext();
  return <span className="text-sm">{children || value || placeholder}</span>;
}

function SelectContent({ className, children, ...props }) {
  const { isOpen, setIsOpen } = useSelectContext();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-[100] mt-1 w-full max-h-60 min-w-[8rem] overflow-auto rounded-xl border-0 bg-gradient-to-br from-white to-[#E8EDF2] text-popover-foreground shadow-neu-outer dark:from-background dark:to-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SelectItem({ className, children, value, ...props }) {
  const { onValueChange, setIsOpen } = useSelectContext();

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer",
        className,
      )}
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Check className="h-4 w-4 opacity-0" />
      </span>
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
