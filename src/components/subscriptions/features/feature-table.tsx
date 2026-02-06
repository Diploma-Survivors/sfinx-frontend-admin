import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { FeatureTableSkeleton } from './feature-table-skeleton';

interface FeatureTableProps {
    features: any[];
    isLoading: boolean;
    onEdit: (feature: any) => void;
    onDelete: (id: number, name: string) => void;
}

export function FeatureTable({ features, isLoading, onEdit, onDelete }: FeatureTableProps) {
    if (isLoading) {
        return <FeatureTableSkeleton />;
    }

    const getFeatureName = (feature: any) => {
        const enTranslation = feature.translations?.find((t: any) => t.languageCode === 'en');
        return enTranslation?.name || feature.key;
    };

    const getFeatureDescription = (feature: any) => {
        const enTranslation = feature.translations?.find((t: any) => t.languageCode === 'en');
        return enTranslation?.description || '';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Features</CardTitle>
                <CardDescription>Manage subscription features and translations</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No features found
                                </TableCell>
                            </TableRow>
                        ) : (
                            features.map((feature) => (
                                <TableRow key={feature.id}>
                                    <TableCell className="font-mono text-sm">{feature.key}</TableCell>
                                    <TableCell className="font-medium">{getFeatureName(feature)}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 max-w-md truncate">
                                        {getFeatureDescription(feature)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={feature.isActive ? 'default' : 'secondary'}>
                                            {feature.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onEdit(feature)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => onDelete(feature.id, getFeatureName(feature))}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
