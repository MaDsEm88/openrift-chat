"use client";

import { useState } from "react";
import {
  PricingDialog,
  PricingDialogButton,
  PricingDialogFooter,
  PricingDialogTitle,
  Information,
} from "@/components/pricing/pricing-dialog";
import { Loader2 } from "lucide-react";

import { getPaywallDialogTexts } from "@/components/lib/get-paywall-texts";
import { type CheckFeatureFormattedPreview } from "autumn-js";
import { useAutumn } from "autumn-js/react";

export interface PaywallDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  preview: CheckFeatureFormattedPreview;
}

export default function PaywallDialog(params?: PaywallDialogProps) {
  const { attach } = useAutumn();
  const [loading] = useState(false);

  if (!params || !params.preview) {
    return <></>;
  }

  const { open, setOpen } = params;
  const { products } = params.preview;
  const { title, message } = getPaywallDialogTexts(params.preview);

  return (
    <PricingDialog open={open} setOpen={setOpen}>
      <PricingDialogTitle>{title}</PricingDialogTitle>
      <Information className="mb-2">{message}</Information>
      <PricingDialogFooter>
        <PricingDialogButton
          size="sm"
          className="font-medium shadow transition min-w-20"
          onClick={async () => {
            await attach({
              productId: products[0].id,
            });
          }}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}

          {products.length > 0
            ? products[0].is_add_on
              ? `Purchase ${products[0].name}`
              : `Upgrade to ${products[0].name}`
            : "Contact Us"}
        </PricingDialogButton>
      </PricingDialogFooter>
    </PricingDialog>
  );
}
