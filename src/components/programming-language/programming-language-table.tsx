import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgrammingLanguage } from "@/types/programing-language-type";
import { Edit, Trash2, GripVertical, Ban, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ProgrammingLanguageTableSkeleton } from "./programming-language-table-skeleton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface ProgrammingLanguageTableProps {
  languages: ProgrammingLanguage[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit?: (language: ProgrammingLanguage) => void;
  onDelete?: (language: ProgrammingLanguage) => void;
  onStatusChange?: (language: ProgrammingLanguage) => void;
  onReorder?: (newOrder: ProgrammingLanguage[]) => void;
}

interface SortableRowProps {
  language: ProgrammingLanguage;
  t: any;
  onEdit?: (language: ProgrammingLanguage) => void;
  onDelete?: (language: ProgrammingLanguage) => void;
  onStatusChange?: (language: ProgrammingLanguage) => void;
}

function SortableRow({
  language,
  t,
  onEdit,
  onDelete,
  onStatusChange,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: language.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? "relative" : undefined,
  } as React.CSSProperties;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-slate-100 dark:bg-slate-800 shadow-lg" : ""}
    >
      <TableCell className="w-[50px]">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell className="font-medium">{language.judge0Id || "-"}</TableCell>
      <TableCell>{language.name}</TableCell>
      <TableCell className="text-slate-500">{language.slug}</TableCell>
      <TableCell>{language.monacoLanguage || "-"}</TableCell>
      {/* <TableCell className="text-center">{language.orderIndex}</TableCell> Order index is now implicit via DnD */}
      <TableCell className="text-center">
        <Badge
          variant="secondary"
          className={
            language.isActive
              ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              : ""
          }
        >
          {language.isActive ? t("active") : t("inactive")}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center gap-2">
          {onStatusChange && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStatusChange(language)}
              title={language.isActive ? t("deactivate") : t("activate")}
              className={
                language.isActive
                  ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                  : "text-primary hover:text-primary hover:bg-primary/10"
              }
            >
              {language.isActive ? (
                <Ban className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(language)}
              title={t("edit")}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(language)}
              title={t("delete")}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProgrammingLanguageTable({
  languages,
  loading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
  onReorder,
}: ProgrammingLanguageTableProps) {
  const t = useTranslations("ProgrammingLanguageTable");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require movement of 8px to start drag, prevents accidental clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = languages.findIndex((lang) => lang.id === active.id);
      const newIndex = languages.findIndex((lang) => lang.id === over.id);

      const newOrder = arrayMove(languages, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (loading) {
    return <ProgrammingLanguageTableSkeleton />;
  }

  if (languages.length === 0) {
    return <div className="p-4 text-center text-slate-500">{t("nodata")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[120px]">{t("judge0Id")}</TableHead>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("slug")}</TableHead>
                <TableHead>{t("monacoLanguage")}</TableHead>
                {/* <TableHead className="text-center">{t('orderIndex')}</TableHead> Removed order index column */}
                <TableHead className="text-center">{t("status")}</TableHead>
                <TableHead className="text-center">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={languages.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {languages.map((language) => (
                  <SortableRow
                    key={language.id}
                    language={language}
                    t={t}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>

        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          meta={{
            page,
            limit,
            total,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
          }}
          entityName={t("entityName")}
        />
      </div>
    </div>
  );
}
