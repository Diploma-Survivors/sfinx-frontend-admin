"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { studyPlanService } from "@/services/study-plan-service";
import {
  AdminStudyPlanDetailResponseDto,
  AdminStudyPlanDayResponseDto,
  AdminStudyPlanItemResponseDto,
} from "@/types/study-plan";
import { GripVertical, Trash2, Plus, BookOpen } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// --- Sortable Item Component ---
function SortableItem({
  item,
  onRemove,
}: {
  item: AdminStudyPlanItemResponseDto;
  onRemove: (item: AdminStudyPlanItemResponseDto) => void;
}) {
  const tTable = useTranslations("StudyPlanTable");
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm mb-2 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
            {item.problem.title}
          </span>
          <span className="text-xs text-slate-500 shrink-0">
            ID: {item.problem.id}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span className="capitalize">
            {tTable(
              `difficultyOptions.${item.problem.difficulty.toLowerCase()}`,
            )}
          </span>
          <span>•</span>
          <span>
            {tTable("acceptanceRateShort", {
              rate: Number(item.problem.acceptanceRate).toFixed(1),
            })}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// --- Main Items Management Component ---
interface StudyPlanItemsManagerProps {
  planId: number;
  initialData: AdminStudyPlanDetailResponseDto;
  onRefresh: () => void;
  onAddProblemClick: (dayNumber: number) => void;
}

export default function StudyPlanItemsManager({
  planId,
  initialData,
  onRefresh,
  onAddProblemClick,
}: StudyPlanItemsManagerProps) {
  const t = useTranslations("StudyPlanItemsPage");
  const tTable = useTranslations("StudyPlanTable");
  const toast = useToast();

  const [days, setDays] = useState<AdminStudyPlanDayResponseDto[]>(
    initialData.days || [],
  );
  const [itemToRemove, setItemToRemove] =
    useState<AdminStudyPlanItemResponseDto | null>(null);

  useEffect(() => {
    if (initialData.days && initialData.days.length > 0) {
      setDays(initialData.days);
    } else if (initialData.estimatedDays > 0) {
      const emptyDays = Array.from({ length: initialData.estimatedDays }).map(
        (_, i) => ({
          dayNumber: i + 1,
          items: [],
        }),
      );
      setDays(emptyDays);
    } else {
      setDays([]);
    }
  }, [initialData]);

  const handleAddDay = () => {
    const nextDay =
      days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;
    setDays([...days, { dayNumber: nextDay, items: [] }]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent, dayNumber: number) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the day
      const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
      if (dayIndex === -1) return;

      const currentDay = days[dayIndex];
      const oldIndex = currentDay.items.findIndex(
        (i) => i.id.toString() === active.id,
      );
      const newIndex = currentDay.items.findIndex(
        (i) => i.id.toString() === over.id,
      );

      // Reorder locally first for snappy UI
      const newItems = arrayMove(currentDay.items, oldIndex, newIndex);

      const newDays = [...days];
      newDays[dayIndex] = { ...currentDay, items: newItems };
      setDays(newDays);

      // Prepare payload for backend
      const reorderPayload = {
        items: newItems.map((item, index) => ({
          id: item.id,
          dayNumber: dayNumber,
          orderIndex: index + 1,
        })),
      };

      try {
        await studyPlanService.reorderItems(planId, reorderPayload);
        toast.success(t("reorderSuccess"));
      } catch (error) {
        toast.error(t("actionError"));
        // Revert on error
        setDays(initialData.days || []);
      }
    }
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      await studyPlanService.removeItem(planId, itemToRemove.id);
      toast.success(t("removeSuccess"));
      onRefresh(); // Refresh the whole plan data
    } catch (error) {
      toast.error(t("actionError"));
    } finally {
      setItemToRemove(null);
    }
  };

  const isEmpty = days.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {initialData.name}
            </h2>
            <p className="text-sm text-slate-500">
              {initialData.estimatedDays} {t("days")} •{" "}
              {t("problemsCount", { count: initialData.totalProblems })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800`}
          >
            {tTable(
              `difficultyOptions.${initialData.difficulty.toLowerCase()}`,
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => (
          <div
            key={`day-${day.dayNumber}`}
            className="bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[600px]"
          >
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                {t("day", { day: day.dayNumber })}
              </h3>
              <Badge variant="secondary" className="font-normal text-xs">
                {t("itemsCount", { count: day.items?.length || 0 })}
              </Badge>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, day.dayNumber)}
              >
                <SortableContext
                  items={day.items?.map((i) => i.id.toString()) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1 min-h-[50px]">
                    {day.items?.length > 0 ? (
                      day.items.map((item) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          onRemove={setItemToRemove}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        <p className="text-sm text-slate-500">
                          {t("emptyDay")}
                        </p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed text-primary hover:text-primary hover:bg-primary/5"
                onClick={() => onAddProblemClick(day.dayNumber)}
              >
                <Plus className="h-4 w-4" />
                {t("addProblem")}
              </Button>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddDay}
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 hover:cursor-pointer transition-all group min-h-[200px]"
        >
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-medium text-slate-500 group-hover:text-primary">
            {t("addDay")}
          </span>
        </button>

        {isEmpty && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {t("noItemsTitle")}
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {t("noItemsDescription")}
            </p>
            <Button onClick={() => onAddProblemClick(1)}>
              {t("addProblemToDay", { day: 1 })}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!itemToRemove}
        onOpenChange={(open) => !open && setItemToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmRemoveTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmRemoveMessage")}
              {itemToRemove && (
                <span className="block mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border text-sm font-medium text-slate-700 dark:text-slate-300">
                  {itemToRemove.problem.title}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmRemoveItem}
            >
              {t("remove") || "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
