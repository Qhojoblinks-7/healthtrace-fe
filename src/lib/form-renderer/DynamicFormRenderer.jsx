import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIELD_TYPES, FIELD_TYPE_LABELS, FIELD_TYPE_ICONS } from "./fieldTypes";

function renderField(field, value, onChange, error) {
  const fieldId = field.name;
  const hasError = !!error;

  const inputProps = {
    id: fieldId,
    value: value ?? "",
    onChange: (e) => onChange(field.name, e.target.value),
    placeholder: field.placeholder || "",
    className: cn(hasError && "border-destructive"),
  };

  switch (field.type) {
    case FIELD_TYPES.TEXTAREA:
      return (
        <Textarea
          {...inputProps}
          rows={3}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case FIELD_TYPES.NUMBER:
      return (
        <Input
          {...inputProps}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step || 1}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case FIELD_TYPES.EMAIL:
      return <Input {...inputProps} type="email" />;

    case FIELD_TYPES.PHONE:
      return <Input {...inputProps} type="tel" />;

    case FIELD_TYPES.PASSWORD:
      return <Input {...inputProps} type="password" />;

    case FIELD_TYPES.DATE:
      return <Input {...inputProps} type="date" />;

    case FIELD_TYPES.TIME:
      return <Input {...inputProps} type="time" />;

    case FIELD_TYPES.BOOLEAN:
      return (
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => onChange(field.name, checked)}
        />
      );

    case FIELD_TYPES.SELECT:
      return (
        <Select value={value || ""} onValueChange={(val) => onChange(field.name, val)}>
          <SelectTrigger className={cn(hasError && "border-destructive")}>
            <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((option) => (
              <SelectItem key={option.value || option} value={option.value || option}>
                {option.label || option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return <Input {...inputProps} />;
  }
}

export function DynamicFormRenderer({
  schema = [],
  formData = {},
  onChange,
  errors = {},
  disabled = false,
  className = "",
}) {
  const fields = useMemo(() => {
    if (!Array.isArray(schema)) return [];
    return schema.filter((field) => field && field.name);
  }, [schema]);

  const handleChange = (fieldName, value) => {
    if (disabled) return;
    onChange?.(fieldName, value);
  };

  if (!fields.length) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No fields defined for this form.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {fields.map((field) => {
        const error = errors[field.name];
        const value = formData[field.name];

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label || field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {renderField(field, value, handleChange, error)}

            {field.helpText && !error && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { FIELD_TYPES, FIELD_TYPE_LABELS, FIELD_TYPE_ICONS };
