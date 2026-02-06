
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface DeleteProgrammingLanguageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    languageName: string;
    loading: boolean;
}

export function DeleteProgrammingLanguageDialog({
    open,
    onOpenChange,
    onConfirm,
    languageName,
    loading,
}: DeleteProgrammingLanguageDialogProps) {
    const t = useTranslations('ProgrammingLanguagePage');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
                    <DialogDescription>
                        {t.rich('confirmDeleteMessage', {
                            name: languageName,
                            span: (chunks) => <span className="font-semibold text-foreground">"{chunks}"</span>
                        })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-black hover:bg-black/90 text-white"
                    >
                        {loading ? 'Deleting...' : t('delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
