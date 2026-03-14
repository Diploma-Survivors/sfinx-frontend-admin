'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    type ContestFilters,
    ContestSortBy,
    ContestStatus,
} from '@/types/contest';
import { SortOrder } from '@/types/problems';
import {
    ArrowDown,
    ArrowUp,
    Check,
    ChevronDown,
    RotateCcw,
    Search,
    Calendar,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Tooltip } from '@/components/ui/tooltip';

interface ContestFilterProps {
    keyword: string;
    filters: ContestFilters;
    sortBy: ContestSortBy;
    sortOrder: SortOrder;
    onKeywordChange: (newKeyword: string) => void;
    onFiltersChange: (newFilters: ContestFilters) => void;
    onSortByChange: (newSortBy: ContestSortBy) => void;
    onSortOrderChange: (newSortOrder: SortOrder) => void;
    onSearch: () => void;
    onReset: () => void;
    isLoading: boolean;
}

export default function ContestFilter({
    keyword,
    filters,
    sortBy,
    sortOrder,
    onKeywordChange,
    onFiltersChange,
    onSortByChange,
    onSortOrderChange,
    onSearch,
    onReset,
}: ContestFilterProps) {
    const t = useTranslations('ContestFilter');
    const tGeneral = useTranslations('General');

    const handleStatusChange = (status: ContestStatus) => {
        // Single select: if clicking the same status, deselect it (undefined), otherwise select it
        const newStatus = filters.status === status ? undefined : status;
        onFiltersChange({ ...filters, status: newStatus });
    };

    const handleDateChange = (type: 'startAfter' | 'startBefore', value: string) => {
        const newFilters = { ...filters, [type]: value || undefined };
        onFiltersChange(newFilters);
    };

    return (
        <div className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            {/* Row 1: Search & Sort */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={keyword}
                        onChange={(e) => onKeywordChange(e.target.value)}
                        className="pl-10 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-slate-500">{t('sortByLabel')}</div>
                    <Select
                        value={sortBy}
                        onValueChange={(value) => onSortByChange(value as ContestSortBy)}
                    >
                        <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
                            <SelectValue placeholder={t('sortByPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ContestSortBy.ID} className="cursor-pointer">{t('id')}</SelectItem>
                            <SelectItem value={ContestSortBy.START_TIME} className="cursor-pointer">{t('startTime')}</SelectItem>
                            <SelectItem value={ContestSortBy.PARTICIPANT_COUNT} className="cursor-pointer">{t('participantCount')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Tooltip content={sortOrder === SortOrder.DESC ? tGeneral('desc') : tGeneral('asc')}>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                onSortOrderChange(
                                    sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
                                )
                            }
                            className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                        >
                            {sortOrder === SortOrder.DESC ? (
                                <ArrowDown className="h-4 w-4" />
                            ) : (
                                <ArrowUp className="h-4 w-4" />
                            )}
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Row 2: Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                        >
                            {t('status')}
                            {filters.status && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                    1
                                </Badge>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>{t('selectStatus')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.values(ContestStatus).map((status) => {
                            const isChecked = filters.status === status;
                            return (
                                <div
                                    key={status}
                                    className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleStatusChange(status);
                                    }}
                                >
                                    <div className={`flex items-center justify-center w-4 h-4 mr-2 border rounded-full ${isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-slate-300'}`}>
                                        {isChecked && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-sm">{t(`statusOptions.${status}`)}</span>
                                </div>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Start Time Range Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                        >
                            <Calendar className="mr-2 h-4 w-4 opacity-50" />
                            {t('startTime')}
                            {(filters.startAfter || filters.startBefore) && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                    {t('active')}
                                </Badge>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-4">
                            <h4 className="font-medium leading-none">{t('dateRange')}</h4>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="from">{t('from')}</Label>
                                    <Input
                                        id="from"
                                        type="date"
                                        className="col-span-2 h-8"
                                        value={filters.startAfter || ''}
                                        onChange={(e) => handleDateChange('startAfter', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="to">{t('to')}</Label>
                                    <Input
                                        id="to"
                                        type="date"
                                        className="col-span-2 h-8"
                                        value={filters.startBefore || ''}
                                        onChange={(e) => handleDateChange('startBefore', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Reset Button */}
                <Button
                    variant="ghost"
                    onClick={onReset}
                    className="h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('reset')}
                </Button>
            </div>
        </div>
    );
}
