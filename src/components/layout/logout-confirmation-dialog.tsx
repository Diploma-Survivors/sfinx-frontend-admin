'use client';

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

interface LogoutConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function LogoutConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
}: LogoutConfirmationDialogProps) {
    const t = useTranslations('Sidebar');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('logoutConfirmTitle')}</DialogTitle>
                    <DialogDescription>{t('logoutConfirmMessage')}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onOpenChange(false);
                            onConfirm();
                        }}
                    >
                        {t('logout')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
