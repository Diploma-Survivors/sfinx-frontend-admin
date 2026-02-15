"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

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
import { useDebounce } from "@/hooks/use-debounce";

export interface Option {
  value: string;
  label: string;
}

interface ComboboxServerProps {
  onSearch: (query: string) => Promise<Option[]>;
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function ComboboxServer({
  onSearch,
  value,
  onSelect,
  placeholder = "Select item...",
  emptyMessage = "No item found.",
  className,
}: ComboboxServerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const results = await onSearch(debouncedSearch);
        setOptions(results);
      } catch (error) {
        console.error("Failed to search options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [debouncedSearch, onSearch]);

  // Handle initial selected label if value exists (this is tricky without full option list)
  // Ideally, the parent should pass the label or we fetch it separately.
  // For now, we rely on the options list which might filter it out if not in search.
  // A better approach for "server" combobox is initializing with the selected option if available.

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption
    ? selectedOption.label
    : selectedLabel || (value ? "Selected (loading...)" : placeholder);

  // If value is present but not in options, we might want to fetch it specifically or rely on parent
  // Simplified for now: assume search finds it or user just selected it.

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {value
              ? options.find((option) => option.value === value)?.label ||
                selectedLabel ||
                value
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          {/* Disable client-side filtering because we do server-side */}
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!loading && options.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue: string) => {
                    onSelect(currentValue === value ? "" : currentValue);
                    setSelectedLabel(option.label);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
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
