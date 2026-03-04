import { useTranslation } from "@/i18n/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

const CATEGORIES = ["PAD", "Aortic", "Venous", "Carotid", "DVT/PE"] as const;
const STATUSES = ["active", "completed", "archived"] as const;

interface PatientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
}

export function PatientFilters({
  search, onSearchChange,
  filterCategory, onFilterCategoryChange,
  filterStatus, onFilterStatusChange,
}: PatientFiltersProps) {
  const { t } = useTranslation();

  const hasFilters = filterCategory !== "all" || filterStatus !== "all" || search;

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("patients.searchPlaceholder")}
          className="pl-10"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("patients.filters.allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("patients.filters.allCategories")}</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("patients.filters.allStatuses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("patients.filters.allStatuses")}</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => { onFilterCategoryChange("all"); onFilterStatusChange("all"); onSearchChange(""); }}
          aria-label={t("patients.filters.clearAll")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
