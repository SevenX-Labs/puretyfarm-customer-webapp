"use client";

import React, { useState, useEffect } from "react";
import { FiClock, FiBell, FiShield, FiCheckCircle } from "react-icons/fi";

export function PreferencesTab() {
  const [deliverySlot, setDeliverySlot] = useState<"sunrise" | "morning">("sunrise");
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [coldChainAlerts, setColdChainAlerts] = useState(true);
  const [bottleReminders, setBottleReminders] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pf_user_preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.deliverySlot) setDeliverySlot(parsed.deliverySlot);
        if (typeof parsed.whatsappAlerts === "boolean") setWhatsappAlerts(parsed.whatsappAlerts);
        if (typeof parsed.smsAlerts === "boolean") setSmsAlerts(parsed.smsAlerts);
        if (typeof parsed.emailInvoices === "boolean") setEmailInvoices(parsed.emailInvoices);
        if (typeof parsed.coldChainAlerts === "boolean") setColdChainAlerts(parsed.coldChainAlerts);
        if (typeof parsed.bottleReminders === "boolean") setBottleReminders(parsed.bottleReminders);
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        "pf_user_preferences",
        JSON.stringify({
          deliverySlot,
          whatsappAlerts,
          smsAlerts,
          emailInvoices,
          coldChainAlerts,
          bottleReminders,
        })
      );
    } catch {
      // Ignore storage errors
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2.5 transition-all">
          <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Delivery & notification preferences saved successfully!</span>
        </div>
      )}

      {/* Section 1: Morning Delivery Window */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <FiClock className="w-4 h-4 text-[#5C1B13]" />
          <h3 className="text-sm sm:text-base font-bold text-[#1A1008]">Morning Delivery Window</h3>
        </div>
        <p className="text-xs text-[#6B584C] mb-4">
          Choose your preferred morning doorstep arrival window across Raipur routes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeliverySlot("sunrise")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              deliverySlot === "sunrise"
                ? "border-[#5C1B13] bg-[#FAF3EA]/70 ring-1 ring-[#5C1B13]"
                : "border-[#E8DFD4] bg-[#FFFDF7] hover:border-[#5C1B13]/30"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#1A1008]">Sunrise Dawn Slot</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C1B13] bg-white px-2 py-0.5 rounded-full border border-[#E8DFD4]">
                Recommended
              </span>
            </div>
            <p className="text-sm font-bold text-[#5C1B13]">
              Earliest slot on the morning run
            </p>
            <p className="text-[11px] text-[#8C7A6B] mt-1">Chilled milk arrives before your morning tea.</p>
          </button>

          <button
            type="button"
            onClick={() => setDeliverySlot("morning")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              deliverySlot === "morning"
                ? "border-[#5C1B13] bg-[#FAF3EA]/70 ring-1 ring-[#5C1B13]"
                : "border-[#E8DFD4] bg-[#FFFDF7] hover:border-[#5C1B13]/30"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#1A1008]">Morning Slot</span>
              <span className="text-[10px] font-bold text-[#8C7A6B]">Standard</span>
            </div>
            <p className="text-sm font-bold text-[#5C1B13]">
              As per your plan&apos;s delivery window
            </p>
            <p className="text-[11px] text-[#8C7A6B] mt-1">Delivered and placed in doorstep insulated bag.</p>
          </button>
        </div>
      </div>

      {/* Section 2: Notifications & Communication */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <FiBell className="w-4 h-4 text-[#5C1B13]" />
          <h3 className="text-sm sm:text-base font-bold text-[#1A1008]">Notifications & Alerts</h3>
        </div>
        <p className="text-xs text-[#6B584C] mb-4">
          Control how and when you receive order receipts, cold-chain alerts, and morning updates.
        </p>

        <div className="divide-y divide-[#E8DFD4]/70">
          {/* Item 1 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#1A1008]">WhatsApp Dispatch Alerts</p>
              <p className="text-[11px] text-[#6B584C]">Real-time message when your morning route van departs.</p>
            </div>
            <button
              type="button"
              onClick={() => setWhatsappAlerts(!whatsappAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                whatsappAlerts ? "bg-[#5C1B13]" : "bg-[#D5C7B8]"
              }`}
              aria-label="Toggle WhatsApp Alerts"
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  whatsappAlerts ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Item 2 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#1A1008]">SMS Delivery Confirmation</p>
              <p className="text-[11px] text-[#6B584C]">One-tap confirmation message upon doorstep handover.</p>
            </div>
            <button
              type="button"
              onClick={() => setSmsAlerts(!smsAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                smsAlerts ? "bg-[#5C1B13]" : "bg-[#D5C7B8]"
              }`}
              aria-label="Toggle SMS Alerts"
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  smsAlerts ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Item 3 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#1A1008]">Monthly Paperless Statements</p>
              <p className="text-[11px] text-[#6B584C]">Receive consolidated monthly PDF billing invoices by email.</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailInvoices(!emailInvoices)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                emailInvoices ? "bg-[#5C1B13]" : "bg-[#D5C7B8]"
              }`}
              aria-label="Toggle Email Invoices"
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  emailInvoices ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Item 4 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#1A1008]">Evening Glass Bottle Return Reminder</p>
              <p className="text-[11px] text-[#6B584C]">A gentle 9:00 PM reminder to place cleaned bottles for exchange.</p>
            </div>
            <button
              type="button"
              onClick={() => setBottleReminders(!bottleReminders)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                bottleReminders ? "bg-[#5C1B13]" : "bg-[#D5C7B8]"
              }`}
              aria-label="Toggle Bottle Return Reminders"
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  bottleReminders ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Quality & Cold Chain Tracking */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF8F5] p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FiShield className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs sm:text-sm font-bold text-[#1A1008]">4°C Cold-Chain Assurance</h4>
          </div>
          <p className="text-[11px] text-[#6B584C] mt-1 max-w-md">
            Our temperature telemetry logs every crate from dawn milking to your porch. You receive priority notifications if any crate reaches your door above 4.5°C.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setColdChainAlerts(!coldChainAlerts)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            coldChainAlerts
              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
              : "bg-white text-[#8C7A6B] border border-[#E8DFD4]"
          }`}
        >
          {coldChainAlerts ? "Enabled ✓" : "Disabled"}
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl px-6 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white shadow-sm transition-all cursor-pointer"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
