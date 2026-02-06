import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface FeatureHeaderProps {
    onRefresh: () => void;
    onCreate: () => void;
    isLoading: boolean;
}

export function FeatureHeader({ onRefresh, onCreate, isLoading }: FeatureHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Features</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage subscription features</p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button onClick={onCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Feature
                </Button>
            </div>
        </div>
    );
}
