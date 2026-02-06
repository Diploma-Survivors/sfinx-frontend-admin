'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function PlanListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <Skeleton width="60%" height={32} />
                                <div className="mt-2">
                                    <Skeleton width="40%" height={24} />
                                </div>
                            </div>
                            <Skeleton width={60} height={24} borderRadius={20} />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Skeleton count={2} className="mb-4" />
                        <ul className="space-y-3">
                            {[1, 2, 3, 4].map((j) => (
                                <li key={j} className="flex items-start gap-2">
                                    <Skeleton circle width={20} height={20} />
                                    <div className="flex-1">
                                        <Skeleton width="80%" />
                                        <Skeleton width="50%" height={10} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t p-4">
                        <Skeleton width={32} height={32} />
                        <Skeleton width={32} height={32} />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
