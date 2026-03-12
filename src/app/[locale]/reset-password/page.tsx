"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import clientApi from "@/lib/apis/axios-client";
import { toastService } from "@/services/toasts-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toastService.error("Invalid token");
      return;
    }
    if (newPassword !== confirmPassword) {
      toastService.error(t("passwordsDoNotMatch"));
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      toastService.error(t("passwordComplexity"));
      return;
    }

    setIsLoading(true);
    try {
      await clientApi.post("/auth/reset-password", { token, newPassword });
      toastService.success(t("resetPasswordSuccess"));
      router.push("/login");
    } catch (error: any) {
      toastService.error(
        error.response?.data?.message || t("resetPasswordError"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid or missing token.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("resetPasswordTitle")}
          </CardTitle>
          <CardDescription>{t("resetPasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 relative">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-6 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-6 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? t("saving") : t("saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
