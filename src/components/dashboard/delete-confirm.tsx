"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteConfirmProps = {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: "default" | "ghost" | "outline";
  triggerSize?: "sm" | "default" | "lg" | "icon";
  iconOnly?: boolean;
};

export function DeleteConfirm({
  action,
  hiddenFields,
  triggerLabel,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "outline",
  triggerSize = "sm",
  iconOnly = false,
}: DeleteConfirmProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant={variant}
            size={triggerSize}
            className="text-destructive hover:bg-destructive/10 gap-2"
            aria-label={triggerLabel}
          >
            <Trash2 className="h-4 w-4" />
            {!iconOnly && triggerLabel}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action}>
          {Object.entries(hiddenFields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteConfirmTranslated({
  type,
  hiddenFields,
  action,
}: {
  type: "order" | "event" | "message" | "invoice";
  hiddenFields: Record<string, string>;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const t = useTranslations(`dashboard.delete.${type}`);
  const tc = useTranslations("dashboard.delete.common");
  return (
    <DeleteConfirm
      action={action}
      hiddenFields={hiddenFields}
      triggerLabel={t("trigger")}
      title={t("title")}
      description={t("description")}
      confirmLabel={tc("confirm")}
      cancelLabel={tc("cancel")}
    />
  );
}
