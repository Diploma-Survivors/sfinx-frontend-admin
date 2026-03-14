'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, ArrowUpDown, ArrowDown, ArrowUp, RotateCcw, Tag as TagIcon, Layers } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TagsTable } from '@/components/tags-topics/tags-table';
import { CreateTagDialog } from '@/components/tags-topics/create-tag-dialog';
import { EditTagDialog } from '@/components/tags-topics/edit-tag-dialog';
import { EditTopicDialog } from '@/components/tags-topics/edit-topic-dialog';
import { CreateTopicDialog } from '@/components/tags-topics/create-topic-dialog';
import { Tag, TagSortBy } from '@/types/tags';
import { TagsService } from '@/services/tags-service';
import { toastService } from '@/services/toasts-service';
import { useDialog } from '@/components/providers/dialog-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopicsTable } from '@/components/tags-topics/topics-table';
import { TopicsService } from '@/services/topics-service';
import { Topic, TopicSortBy } from '@/types/topics';
import useTags from '@/hooks/use-tags';
import useTopics from '@/hooks/use-topics';
import { useTranslations } from 'next-intl';
import { SortOrder } from '@/types/problems';

export default function TagsPage() {
    const t = useTranslations('TagsPage');
    const tGeneral = useTranslations('General');
    // Tags Hook
    const {
        tags,
        totalCount: tagsCount,
        isLoading: tagsLoading,
        filters: tagFilters,
        keyword: tagKeyword,
        sortBy: tagSortBy,
        sortOrder: tagSortOrder,
        handleFiltersChange: handleTagFiltersChange,
        handleKeywordChange: handleTagKeywordChange,
        handleSortByChange: handleTagSortByChange,
        handleSortOrderChange: handleTagSortOrderChange,
        handleReset: handleResetTags,
        handlePageChange: setTagPage,
        refresh: handleTagRefresh,
        meta: tagMeta,
    } = useTags();

    // Topics Hook
    const {
        topics,
        totalCount: topicsCount,
        isLoading: topicsLoading,
        filters: topicFilters,
        keyword: topicKeyword,
        sortBy: topicSortBy,
        sortOrder: topicSortOrder,
        handleFiltersChange: handleTopicFiltersChange,
        handleKeywordChange: handleTopicKeywordChange,
        handleSortByChange: handleTopicSortByChange,
        handleSortOrderChange: handleTopicSortOrderChange,
        handleReset: handleResetTopics,
        handlePageChange: setTopicPage,
        refresh: handleTopicRefresh,
        meta: topicMeta,
    } = useTopics();

    // Edit State
    const [editTag, setEditTag] = useState<Tag | null>(null);
    const [isEditTagOpen, setIsEditTagOpen] = useState(false);
    const [editTopic, setEditTopic] = useState<Topic | null>(null);
    const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);

    const { confirm } = useDialog();

    const handleEditTag = (tag: Tag) => {
        setEditTag(tag);
        setIsEditTagOpen(true);
    };

    const handleDeleteTagClick = async (tag: Tag) => {
        const confirmed = await confirm({
            title: t('confirmDeleteTitle'),
            message: (
                <span>
                    {t.rich('confirmDeleteTagMessage', {
                        name: tag.name,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}" </span>
                    })}
                </span>
            ),
            confirmText: t('delete'),
            cancelText: t('cancel'),
            color: 'red',
        });

        if (confirmed) {
            try {
                await TagsService.deleteTag(tag.id);
                toastService.success(t('deleteTagSuccess'));
                handleTagRefresh();
            } catch (error) {
                console.error('Failed to delete tag:', error);
                toastService.error(t('deleteTagError'));
            }
        }
    };

    // Placeholder handlers for Topics
    const handleEditTopic = (topic: Topic) => {
        setEditTopic(topic);
        setIsEditTopicOpen(true);
    };

    const handleDeleteTopicClick = async (topic: Topic) => {
        const confirmed = await confirm({
            title: t('confirmDeleteTitle'),
            message: (
                <span>
                    {t.rich('confirmDeleteTopicMessage', {
                        name: topic.name,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}" </span>
                    })}
                </span>
            ),
            confirmText: t('delete'),
            cancelText: t('cancel'),
            color: 'red',
        });

        if (confirmed) {
            try {
                await TopicsService.deleteTopic(topic.id);
                toastService.success(t('deleteTopicSuccess'));
                handleTopicRefresh();
            } catch (error) {
                console.error('Failed to delete topic:', error);
                toastService.error(t('deleteTopicError'));
            }
        }
    };


    const handleTagStatusChange = async (tag: Tag) => {
        const newStatus = tag.isActive === true ? false : true;
        const action = newStatus === true ? 'activate' : 'deactivate';

        const confirmed = await confirm({
            title: newStatus === true ? t('confirmActivateTitle') : t('confirmDeactivateTitle'),
            message: (
                <span>
                    {t.rich(newStatus === true ? 'confirmActivateTagMessage' : 'confirmDeactivateTagMessage', {
                        name: tag.name,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}"</span>
                    })}
                </span>
            ),
            confirmText: newStatus === true ? t('activate') : t('deactivate'),
            cancelText: t('cancel'),
            color: newStatus === true ? 'green' : 'red',
        });

        if (confirmed) {
            try {
                await TagsService.updateTagStatus(tag.id);
                toastService.success(newStatus === true ? t('activateTagSuccess') : t('deactivateTagSuccess'));
                handleTagRefresh();
            } catch (error) {
                console.error(`Failed to ${action} tag:`, error);
                toastService.error(newStatus === true ? t('activateTagError') : t('deactivateTagError'));
            }
        }
    };

    const handleTopicStatusChange = async (topic: Topic) => {
        const newStatus = !topic.isActive;
        const action = newStatus ? 'activate' : 'deactivate';

        const confirmed = await confirm({
            title: newStatus ? t('confirmActivateTitle') : t('confirmDeactivateTitle'),
            message: (
                <span>
                    {t.rich(newStatus ? 'confirmActivateTopicMessage' : 'confirmDeactivateTopicMessage', {
                        name: topic.name,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}"</span>
                    })}
                </span>
            ),
            confirmText: newStatus ? t('activate') : t('deactivate'),
            cancelText: t('cancel'),
            color: newStatus ? 'green' : 'red',
        });

        if (confirmed) {
            try {
                await TopicsService.updateTopicStatus(topic.id);
                toastService.success(newStatus ? t('activateTopicSuccess') : t('deactivateTopicSuccess'));
                handleTopicRefresh();
            } catch (error) {
                console.error(`Failed to ${action} topic:`, error);
                toastService.error(newStatus ? t('activateTopicError') : t('deactivateTopicError'));
            }
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <Tabs defaultValue="tags" className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-2 h-auto">
                        <TabsTrigger
                            value="tags"
                            className="cursor-pointer data-[state=active]:bg-white data-[state=active]:dark:bg-slate-700 data-[state=active]:text-green-600 data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all"
                        >
                            <TagIcon className="w-4 h-4 mr-2" />
                            <span>{t('tagsList')}</span>
                            <span className="ml-2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {tagsCount}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="topics"
                            className="cursor-pointer data-[state=active]:bg-white data-[state=active]:dark:bg-slate-700 data-[state=active]:text-green-600 data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all"
                        >
                            <Layers className="w-4 h-4 mr-2" />
                            <span>{t('topicsList')}</span>
                            <span className="ml-2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {topicsCount}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="tags" className="space-y-6">
                    {/* Filters and Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="relative flex-1 w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={tagKeyword}
                                onChange={(e) => handleTagKeywordChange(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <Select
                                value={tagFilters.isActive === undefined ? 'all' : tagFilters.isActive ? 'active' : 'inactive'}
                                onValueChange={(value: any) => handleTagFiltersChange({ ...tagFilters, isActive: value === 'all' ? undefined : value === 'active' })}
                            >
                                <SelectTrigger className="w-full sm:w-[140px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-0 focus:ring-offset-0 cursor-pointer">
                                    <SelectValue placeholder={t('allStatuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="cursor-pointer">{t('allStatuses')}</SelectItem>
                                    <SelectItem value="active" className="cursor-pointer">{t('active')}</SelectItem>
                                    <SelectItem value="inactive" className="cursor-pointer">{t('inactive')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <div>{t('sortBy')}</div>
                                <Select
                                    value={tagSortBy}
                                    onValueChange={(value) => handleTagSortByChange(value as TagSortBy)}
                                >
                                    <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
                                        <SelectValue placeholder={t('sortBy')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={TagSortBy.ID} className="cursor-pointer">{t('id')}</SelectItem>
                                        <SelectItem value={TagSortBy.CREATED_AT} className="cursor-pointer">{t('createdAt')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Tooltip content={tagSortOrder === SortOrder.DESC ? tGeneral('desc') : tGeneral('asc')}>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            handleTagSortOrderChange(
                                                tagSortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
                                            )
                                        }
                                        className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                                    >
                                        {tagSortOrder === SortOrder.DESC ? (
                                            <ArrowDown className="h-4 w-4" />
                                        ) : (
                                            <ArrowUp className="h-4 w-4" />
                                        )}
                                    </Button>
                                </Tooltip>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleResetTags}
                                className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                                title={t('resetFilters')}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <CreateTagDialog onSuccess={handleTagRefresh} />
                        </div>
                    </div>

                    <TagsTable
                        tags={tags}
                        loading={tagsLoading}
                        page={tagMeta?.page || 1}
                        totalPages={tagMeta?.totalPages || 1}
                        onPageChange={setTagPage}
                        onEdit={handleEditTag}
                        onDelete={handleDeleteTagClick}
                        onStatusChange={handleTagStatusChange}
                    />
                </TabsContent>

                <TabsContent value="topics" className="space-y-6">
                    {/* Filters and Controls for Topics */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="relative flex-1 w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={topicKeyword}
                                onChange={(e) => handleTopicKeywordChange(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <Select
                                value={topicFilters.isActive === undefined ? 'all' : topicFilters.isActive ? 'active' : 'inactive'}
                                onValueChange={(value: any) => handleTopicFiltersChange({ ...topicFilters, isActive: value === 'all' ? undefined : value === 'active' })}
                            >
                                <SelectTrigger className="w-full sm:w-[140px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-0 focus:ring-offset-0 cursor-pointer">
                                    <SelectValue placeholder={t('allStatuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="cursor-pointer">{t('allStatuses')}</SelectItem>
                                    <SelectItem value="active" className="cursor-pointer">{t('active')}</SelectItem>
                                    <SelectItem value="inactive" className="cursor-pointer">{t('inactive')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <div>{t('sortBy')}</div>
                                <Select
                                    value={topicSortBy}
                                    onValueChange={(value) => handleTopicSortByChange(value as TopicSortBy)}
                                >
                                    <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
                                        <SelectValue placeholder={t('sortBy')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={TopicSortBy.ID} className="cursor-pointer">{t('id')}</SelectItem>
                                        <SelectItem value={TopicSortBy.CREATED_AT} className="cursor-pointer">{t('createdAt')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Tooltip content={topicSortOrder === SortOrder.DESC ? tGeneral('desc') : tGeneral('asc')}>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            handleTopicSortOrderChange(
                                                topicSortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
                                            )
                                        }
                                        className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                                    >
                                        {topicSortOrder === SortOrder.DESC ? (
                                            <ArrowDown className="h-4 w-4" />
                                        ) : (
                                            <ArrowUp className="h-4 w-4" />
                                        )}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleResetTopics}
                            className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                            title={t('resetFilters')}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <CreateTopicDialog onSuccess={handleTopicRefresh} />
                    </div>

                    <TopicsTable
                        topics={topics}
                        loading={topicsLoading}
                        page={topicMeta?.page || 1}
                        totalPages={topicMeta?.totalPages || 1}
                        onPageChange={setTopicPage}
                        onEdit={handleEditTopic}
                        onDelete={handleDeleteTopicClick}
                        onStatusChange={handleTopicStatusChange}
                    />
                </TabsContent>
            </Tabs>

            {/* Edit Dialogs */}
            <EditTagDialog
                tag={editTag}
                open={isEditTagOpen}
                onOpenChange={setIsEditTagOpen}
                onSuccess={handleTagRefresh}
            />
            <EditTopicDialog
                topic={editTopic}
                open={isEditTopicOpen}
                onOpenChange={setIsEditTopicOpen}
                onSuccess={handleTopicRefresh}
            />
        </div>
    );
}
