
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export function ProgrammingLanguageTableSkeleton() {
    const t = useTranslations('ProgrammingLanguageTable');

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[120px]">{t('judge0Id')}</TableHead>
                            <TableHead>{t('name')}</TableHead>
                            <TableHead>{t('slug')}</TableHead>
                            <TableHead>{t('monacoLanguage')}</TableHead>
                            <TableHead className="text-center">{t('status')}</TableHead>
                            <TableHead className="text-center">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                <TableCell className="text-center flex justify-center"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
