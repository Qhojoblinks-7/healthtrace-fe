import * as React from "react";
import { ChevronDown, Check } from "lucide-react";

const Select = ({ value, onValueChange, children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Find the selected item's display value
  const findSelectedValue = (children) => {
    let selectedValue = null;
    React.Children.forEach(children, (child) => {
      if (child && child.props && child.props.value === value) {
        selectedValue = child.props.children;
      }
      if (child && child.props && child.props.children) {
        const found = findSelectedValue(child.props.children);
        if (found) selectedValue = found;
      }
    });
    return selectedValue;
  };

  const displayValue = findSelectedValue(children) || value;

  // Find the SelectTrigger child to get its className
  const triggerChild = React.Children.toArray(children).find(
    (child) => child && child.type === SelectTrigger,
  );
  const triggerClassName = triggerChild?.props?.className || "";

  // Find the SelectContent child
  const contentChild = React.Children.toArray(children).find(
    (child) => child && child.type === SelectContent,
  );

  // Clone SelectContent and add onClick handlers to its children
  const renderDropdownContent = () => {
    if (!contentChild) return null;

    return React.cloneElement(contentChild, {
      children: React.Children.map(contentChild.props.children, (item) => {
        if (!item || item.type !== SelectItem) return item;
        return React.cloneElement(item, {
          onClick: () => {
            onValueChange(item.props.value);
            setIsOpen(false);
          },
        });
      }),
    });
  };

  return (
    <div className="relative" {...props}>
      <div
        className={`flex h-10 w-full items-center justify-between rounded-xl border-0 bg-gradient-to-br from-white to-[#E8EDF2] px-4 py-2 text-sm shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)] placeholder:text-muted-foreground focus:outline-none focus:shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${triggerClassName}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{displayValue}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full">
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ className, children, ...props }) => (
  <div
    className={`flex h-10 w-full items-center justify-between rounded-xl border-0 bg-gradient-to-br from-white to-[#E8EDF2] px-4 py-2 text-sm shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)] placeholder:text-muted-foreground focus:outline-none focus:shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className || ""}`}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
);

const SelectValue = ({ children, placeholder }) => {
  return <span className="text-sm">{children || placeholder}</span>;
};

const SelectContent = ({ className, children, ...props }) => (
  <div
    className={`relative z-[100] max-h-60 min-w-[8rem] overflow-auto rounded-xl border-0 bg-gradient-to-br from-white to-[#E8EDF2] text-popover-foreground shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] ${className || ""}`}
    {...props}
  >
    {children}
  </div>
);

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
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
