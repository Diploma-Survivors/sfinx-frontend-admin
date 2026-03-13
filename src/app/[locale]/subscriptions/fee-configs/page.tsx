"use client";

import { useState, useEffect } from "react";
import { feeConfigService } from "@/services/fee-config-service";
import { currencyService } from "@/services/currency-service";
import { FeeConfig } from "@/types/fee-config";
import { CurrencyConfig } from "@/types/currency";
import { toastService } from "@/services/toasts-service";
import { FeeConfigTable } from "@/components/subscriptions/fee-configs/fee-config-table";
import { FeeConfigCreateDialog } from "@/components/subscriptions/fee-configs/fee-config-create-dialog";
import { FeeConfigEditDialog } from "@/components/subscriptions/fee-configs/fee-config-edit-dialog";
import { FeeConfigDeleteDialog } from "@/components/subscriptions/fee-configs/fee-config-delete-dialog";
import { CurrencyTable } from "@/components/subscriptions/currencies/currency-table";
import { CurrencyCreateDialog } from "@/components/subscriptions/currencies/currency-create-dialog";
import { CurrencyEditDialog } from "@/components/subscriptions/currencies/currency-edit-dialog";
import { CurrencyDeleteDialog } from "@/components/subscriptions/currencies/currency-delete-dialog";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export default function FeeConfigsPage() {
  const t = useTranslations("Subscription");
  const [activeTab, setActiveTab] = useState("fees");

  // Fee configs state
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [isLoadingFees, setIsLoadingFees] = useState(true);
  const [createFeeOpen, setCreateFeeOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeConfig | null>(null);
  const [deleteFeeOpen, setDeleteFeeOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<{ id: number; code: string } | null>(null);
  const [isDeletingFee, setIsDeletingFee] = useState(false);

  // Currency state
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [createCurrencyOpen, setCreateCurrencyOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyConfig | null>(null);
  const [deleteCurrencyOpen, setDeleteCurrencyOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeletingCurrency, setIsDeletingCurrency] = useState(false);

  useEffect(() => {
    fetchFees();
    fetchCurrencies();
  }, []);

  // Fee config handlers
  const fetchFees = async () => {
    setIsLoadingFees(true);
    try {
      const response = await feeConfigService.getAll();
      setFees(response.data);
    } catch {
      toastService.error(t("feeConfigs.messages.loadError"));
    } finally {
      setIsLoadingFees(false);
    }
  };

  const handleDeleteFee = (id: number, code: string) => {
    setFeeToDelete({ id, code });
    setDeleteFeeOpen(true);
  };

  const confirmDeleteFee = async () => {
    if (!feeToDelete) return;
    setIsDeletingFee(true);
    try {
      await feeConfigService.remove(feeToDelete.id);
      toastService.success(t("feeConfigs.messages.deleteSuccess"));
      fetchFees();
      setDeleteFeeOpen(false);
      setFeeToDelete(null);
    } catch (error: any) {
      toastService.error(error.response?.data?.message || t("feeConfigs.messages.deleteError"));
    } finally {
      setIsDeletingFee(false);
    }
  };

  // Currency handlers
  const fetchCurrencies = async () => {
    setIsLoadingCurrencies(true);
    try {
      const response = await currencyService.getAll();
      setCurrencies(response.data);
    } catch {
      toastService.error(t("currencies.messages.loadError"));
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const handleDeleteCurrency = (id: number, name: string) => {
    setCurrencyToDelete({ id, name });
    setDeleteCurrencyOpen(true);
  };

  const confirmDeleteCurrency = async () => {
    if (!currencyToDelete) return;
    setIsDeletingCurrency(true);
    try {
      await currencyService.remove(currencyToDelete.id);
      toastService.success(t("currencies.messages.deleteSuccess"));
      fetchCurrencies();
      setDeleteCurrencyOpen(false);
      setCurrencyToDelete(null);
    } catch (error: any) {
      toastService.error(error.response?.data?.message || t("currencies.messages.deleteError"));
    } finally {
      setIsDeletingCurrency(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("feeConfigs.header.title")} & {t("currencies.header.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("feeConfigs.header.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => activeTab === "fees" ? fetchFees() : fetchCurrencies()}
            disabled={activeTab === "fees" ? isLoadingFees : isLoadingCurrencies}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(activeTab === "fees" ? isLoadingFees : isLoadingCurrencies) ? "animate-spin" : ""}`} />
            {t("feeConfigs.header.refresh")}
          </Button>
          <Button
            size="sm"
            onClick={() => activeTab === "fees" ? setCreateFeeOpen(true) : setCreateCurrencyOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "fees" ? t("feeConfigs.header.createFee") : t("currencies.header.createCurrency")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="fees">{t("feeConfigs.header.title")}</TabsTrigger>
          <TabsTrigger value="currencies">{t("currencies.header.title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="mt-4">
          <FeeConfigTable
            fees={fees}
            isLoading={isLoadingFees}
            onEdit={(fee) => setEditingFee(fee)}
            onDelete={(id, code) => handleDeleteFee(id, code)}
          />
        </TabsContent>

        <TabsContent value="currencies" className="mt-4">
          <CurrencyTable
            currencies={currencies}
            isLoading={isLoadingCurrencies}
            onEdit={(currency) => setEditingCurrency(currency)}
            onDelete={(id, name) => handleDeleteCurrency(id, name)}
          />
        </TabsContent>
      </Tabs>

      {/* Fee config dialogs */}
      <FeeConfigCreateDialog
        open={createFeeOpen}
        onOpenChange={setCreateFeeOpen}
        onSuccess={fetchFees}
      />
      <FeeConfigEditDialog
        fee={editingFee}
        open={!!editingFee}
        onOpenChange={(open) => { if (!open) setEditingFee(null); }}
        onSuccess={fetchFees}
      />
      <FeeConfigDeleteDialog
        open={deleteFeeOpen}
        onOpenChange={setDeleteFeeOpen}
        fee={feeToDelete}
        onConfirm={confirmDeleteFee}
        isDeleting={isDeletingFee}
      />

      {/* Currency dialogs */}
      <CurrencyCreateDialog
        open={createCurrencyOpen}
        onOpenChange={setCreateCurrencyOpen}
        onSuccess={fetchCurrencies}
      />
      <CurrencyEditDialog
        currency={editingCurrency}
        open={!!editingCurrency}
        onOpenChange={(open) => { if (!open) setEditingCurrency(null); }}
        onSuccess={fetchCurrencies}
      />
      <CurrencyDeleteDialog
        open={deleteCurrencyOpen}
        onOpenChange={setDeleteCurrencyOpen}
        currency={currencyToDelete}
        onConfirm={confirmDeleteCurrency}
        isDeleting={isDeletingCurrency}
      />
    </div>
  );
}
