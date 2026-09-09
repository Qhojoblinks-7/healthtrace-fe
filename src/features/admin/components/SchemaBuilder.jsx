import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";
import { FIELD_TYPES, FIELD_TYPE_LABELS, DEFAULT_FIELD_SCHEMA } from "@/lib/form-renderer/fieldTypes";
import { cn } from "@/lib/utils";

function FieldEditor({ field, onChange, onRemove, onMoveUp, onMoveDown, onDuplicate, canMoveUp, canMoveDown }) {
  const [localField, setLocalField] = useState(() => field || { ...DEFAULT_FIELD_SCHEMA });

  const updateField = (updates) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
    onChange(updated);
  };

  const updateOption = (index, value) => {
    const newOptions = [...(localField.options || [])];
    newOptions[index] = value;
    updateField({ options: newOptions });
  };

  const addOption = () => {
    updateField({ options: [...(localField.options || []), `Option ${(localField.options?.length || 0) + 1}`] });
  };

  const removeOption = (index) => {
    const newOptions = localField.options.filter((_, i) => i !== index);
    updateField({ options: newOptions });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="cursor-move text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Field Name</Label>
            <Input
              value={localField.name}
              onChange={(e) => updateField({ name: e.target.value })}
              placeholder="e.g., systolic_bp"
            />
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={localField.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="e.g., Systolic BP"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            title="Duplicate field"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            title="Remove field"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={localField.type}
            onValueChange={(val) => updateField({ type: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={localField.placeholder}
            onChange={(e) => updateField({ placeholder: e.target.value })}
            placeholder="Optional placeholder text"
          />
        </div>
        <div className="space-y-2">
          <Label>Help Text</Label>
          <Input
            value={localField.helpText}
            onChange={(e) => updateField({ helpText: e.target.value })}
            placeholder="Optional hint"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="required"
            checked={!!localField.required}
            onCheckedChange={(checked) => updateField({ required: checked })}
          />
          <Label htmlFor="required" className="text-sm">
            Required
          </Label>
        </div>
      </div>

      {(localField.type === FIELD_TYPES.SELECT || localField.type === FIELD_TYPES.MULTISELECT) && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="space-y-2">
            {(localField.options || []).map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          </div>
        </div>
      )}

      {(localField.type === FIELD_TYPES.NUMBER || localField.type === FIELD_TYPES.RANGE) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Min</Label>
            <Input
              type="number"
              value={localField.min ?? ""}
              onChange={(e) => updateField({ min: e.target.value ? Number(e.target.value) : null })}
              placeholder="No min"
            />
          </div>
          <div className="space-y-2">
            <Label>Max</Label>
            <Input
              type="number"
              value={localField.max ?? ""}
              onChange={(e) => updateField({ max: e.target.value ? Number(e.target.value) : null })}
              placeholder="No max"
            />
          </div>
          <div className="space-y-2">
            <Label>Step</Label>
            <Input
              type="number"
              value={localField.step ?? ""}
              onChange={(e) => updateField({ step: e.target.value ? Number(e.target.value) : null })}
              placeholder="1"
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export function SchemaBuilder({ schema = [], onChange, disabled = false }) {
  const [fields, setFields] = useState(() => {
    if (Array.isArray(schema) && schema.length > 0) {
      return schema;
    }
    return [];
  });

  const handleFieldChange = (index, updatedField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
    onChange?.(newFields);
  };

  const handleAddField = () => {
    const newField = {
      ...DEFAULT_FIELD_SCHEMA,
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    onChange?.(newFields);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    onChange?.(newFields);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setFields(newFields);
    onChange?.(newFields);
  };

  const handleMoveDown = (index) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFields(newFields);
    onChange?.(newFields);
  };

  const handleDuplicate = (index) => {
    const duplicated = { ...fields[index], name: `${fields[index].name}_copy` };
    const newFields = [...fields];
    newFields.splice(index + 1, 0, duplicated);
    setFields(newFields);
    onChange?.(newFields);
  };

  return (
    <div className={cn("space-y-3", disabled && "opacity-60 pointer-events-none")}>
      {fields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No fields defined yet. Click the button below to add your first field.
        </div>
      )}

      {fields.map((field, index) => (
        <FieldEditor
          key={field.name || index}
          field={field}
          onChange={(updated) => handleFieldChange(index, updated)}
          onRemove={() => handleRemoveField(index)}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          onDuplicate={() => handleDuplicate(index)}
          canMoveUp={index > 0}
          canMoveDown={index < fields.length - 1}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddField}
        disabled={disabled}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Field
      </Button>
    </div>
  );
}
