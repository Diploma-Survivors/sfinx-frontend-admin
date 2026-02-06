'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function FeatureTableSkeleton() {
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
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton width={120} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton width={150} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton width={200} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton width={60} height={20} borderRadius={10} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton width={32} height={32} />
                                        <Skeleton width={32} height={32} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
