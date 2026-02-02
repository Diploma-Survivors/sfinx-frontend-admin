'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function StatisticsSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <Skeleton width={200} height={36} />
                    <div className="mt-1">
                        <Skeleton width={300} height={20} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton width={140} height={40} />
                    <Skeleton width={100} height={40} />
                    <Skeleton width={40} height={40} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton width={100} height={20} />
                            <Skeleton width={16} height={16} />
                        </CardHeader>
                        <CardContent>
                            <Skeleton width={80} height={32} />
                            <Skeleton width={120} height={16} className="mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="col-span-1">
                    <CardHeader>
                        <Skeleton width={150} height={24} />
                        <Skeleton width={200} height={16} className="mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton height={300} className="w-full" />
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <Skeleton width={150} height={24} />
                        <Skeleton width={200} height={16} className="mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton height={300} className="w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
