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
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

interface PointAlertDialogProps {
  points: number;
  children: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function PointAlertDialog({ points, children, onConfirm, onCancel }: PointAlertDialogProps) {
  const t = useTranslations("Components.PointAlertDialog");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmOperation")}</AlertDialogTitle>
          <AlertDialogDescription>{t("pointConsumption", { points })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t("confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
