"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SystemConfig } from "@/types/system-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
});

interface UpsertConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: SystemConfig | null;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}

export function UpsertConfigDialog({
  open,
  onOpenChange,
  config,
  onSubmit,
}: UpsertConfigDialogProps) {
  const t = useTranslations("SystemConfig.dialog");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        key: config.key,
        value: config.value,
        description: config.description || "",
      });
    } else {
      form.reset({
        key: "",
        value: "",
        description: "",
      });
    }
  }, [config, form, open]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {config ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>
            {config ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("keyLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!!config}
                      placeholder="CONFIG_KEY"
                    />
                  </FormControl>
                  <FormDescription>{t("keyDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("valueLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Value" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">
                {config ? t("saveChanges") : t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
