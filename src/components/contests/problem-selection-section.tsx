import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { SelectProblemsModal } from '@/components/problems/related-problems-modal';
import { Problem } from '@/types/problems';
import { FieldErrors } from 'react-hook-form';
import { ContestFormValues } from './schema';
import { SortableRow } from './sortable-row';

export type SelectedProblem = Problem & { points: number; orderIndex: number };

interface ProblemSelectionSectionProps {
    selectedProblems: SelectedProblem[];
    onProblemsChange: (problems: SelectedProblem[]) => void;
    errors: FieldErrors<ContestFormValues>;
}

export function ProblemSelectionSection({
    selectedProblems,
    onProblemsChange,
    errors,
}: ProblemSelectionSectionProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleProblemsSelect = (problems: Problem[]) => {
        const newProblems = [...selectedProblems];
        problems.forEach((p) => {
            if (!newProblems.find((existing) => existing.id === p.id)) {
                newProblems.push({ ...p, points: 10, orderIndex: newProblems.length }); // Default score and order
            }
        });
        onProblemsChange(newProblems);
    };

    const handleRemoveProblem = (problemId: number) => {
        const newProblems = selectedProblems
            .filter((p) => p.id !== problemId)
            .map((p, index) => ({ ...p, orderIndex: index }));
        onProblemsChange(newProblems);
    };

    const handleScoreChange = (problemId: number, score: number) => {
        const newProblems = selectedProblems.map((p) =>
            p.id === problemId ? { ...p, points: score } : p
        );
        onProblemsChange(newProblems);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = selectedProblems.findIndex((p) => p.id === active.id);
            const newIndex = selectedProblems.findIndex((p) => p.id === over.id);

            const newProblems = arrayMove(selectedProblems, oldIndex, newIndex);
            const reordered = newProblems.map((p, index) => ({ ...p, orderIndex: index }));
            onProblemsChange(reordered);
        }
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Select Problems</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <SelectProblemsModal
                    title="Select Problems"
                    selectedProblemIds={selectedProblems.map((p) => p.id)}
                    onProblemsSelect={handleProblemsSelect}
                />

                <div className="rounded-md border overflow-hidden">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Problem</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <SortableContext
                                    items={selectedProblems.map((p) => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {selectedProblems.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-slate-500"
                                            >
                                                No problems selected.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        [...selectedProblems]
                                            .sort((a, b) => a.orderIndex - b.orderIndex)
                                            .map((problem) => (
                                                <SortableRow
                                                    key={problem.id}
                                                    problem={problem}
                                                    score={problem.points}
                                                    onRemove={handleRemoveProblem}
                                                    onScoreChange={handleScoreChange}
                                                />
                                            ))
                                    )}
                                </SortableContext>
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                {errors.problems && (
                    <p className="text-sm text-red-500">
                        {errors.problems.message}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
