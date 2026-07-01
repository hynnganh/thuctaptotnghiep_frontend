"use client";

import { Suspense } from "react";
import PaymentResultContent from "./PaymentResultContent";

export default function PaymentResultClient() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}