
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

interface StatusChangeProgrammingLanguageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    languageName: string;
    action: 'activate' | 'deactivate';
    loading: boolean;
}

export function StatusChangeProgrammingLanguageDialog({
    open,
    onOpenChange,
    onConfirm,
    languageName,
    action,
    loading,
}: StatusChangeProgrammingLanguageDialogProps) {
    const t = useTranslations('ProgrammingLanguagePage');

    const isActivate = action === 'activate';
    const titleKey = isActivate ? 'confirmActivateTitle' : 'confirmDeactivateTitle';
    const messageKey = isActivate ? 'confirmActivateMessage' : 'confirmDeactivateMessage';
    const confirmTextKey = isActivate ? 'activate' : 'deactivate';
    const variant = isActivate ? 'default' : 'destructive'; // Green usually default/primary, Red for deactivate? 
    // Wait, user used 'green' for activate and 'red' for deactivate in useDialog.
    // 'default' button is usually primary color (green in this theme).
    // 'destructive' is red.

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t(titleKey)}</DialogTitle>
                    <DialogDescription>
                        {t.rich(messageKey, {
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
                        variant={variant}
                        onClick={onConfirm}
                        disabled={loading}
                        className={isActivate ? "" : "bg-black hover:bg-black/90 text-white"}
                    >
                        {loading ? 'Processing...' : t(confirmTextKey)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
