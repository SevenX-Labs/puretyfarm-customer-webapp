"use client";

import React from "react";
import { FiCheckCircle, FiTruck, FiShield, FiUser, FiCalendar, FiClock } from "react-icons/fi";
import { Order } from "@/types/models";

interface ActivityTabProps {
  orders: Order[];
}

export function ActivityTab({ orders }: ActivityTabProps) {
  const events = [
    {
      id: "ev_1",
      title: "Chilled A2 Milk Batch Delivered",
      description: "Delivered cold-chain glass bottle at 3.8°C to your doorstep in Raipur.",
      time: "Today, 6:42 AM",
      icon: FiTruck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      badge: "Completed",
    },
    {
      id: "ev_2",
      title: "Authentication Verified",
      description: "Logged in via 6-digit secure SMS OTP from current browser session.",
      time: "Today, 6:15 AM",
      icon: FiShield,
      color: "text-[#5C1B13] bg-[#FAF3EA] border-[#E8DFD4]",
      badge: "Security",
    },
    {
      id: "ev_3",
      title: "Cold-Chain Quality Check Passed",
      description: "Sunrise batch #PF-RPR-402 passed all 16 purity tests with zero adulterants.",
      time: "Yesterday, 5:30 AM",
      icon: FiCheckCircle,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      badge: "Lab Quality",
    },
    {
      id: "ev_4",
      title: "Customer Profile Details Confirmed",
      description: "Personal account and delivery contact instructions verified.",
      time: "3 days ago",
      icon: FiUser,
      color: "text-[#966038] bg-[#FAF4ED] border-[#E8DFD4]",
      badge: "Account",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Activity Overview Summary */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-[#5C1B13]" />
            <h3 className="text-sm sm:text-base font-bold text-[#1A1008]">Activity Log & Audit Trail</h3>
          </div>
          <span className="text-[11px] font-semibold text-[#8C7A6B]">Last 30 Days</span>
        </div>
        <p className="text-xs text-[#6B584C]">
          Track morning cold-chain delivery confirmations, portal security events, and subscription updates.
        </p>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DFD4]">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                {/* Node indicator */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${event.color}`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1008]">{event.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6F0] border border-[#E8DFD4] text-[#5C1B13]">
                      {event.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B584C] mt-1 leading-relaxed">{event.description}</p>
                </div>

                <span className="text-[11px] font-medium text-[#8C7A6B] shrink-0 self-start sm:self-auto">
                  {event.time}
                </span>
              </div>
            );
          })}

          {orders.length > 0 && (
            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-2 pt-2">
              <div className="absolute -left-6 sm:-left-8 top-2.5 w-6 h-6 rounded-full border border-[#E8DFD4] bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center shrink-0">
                <FiCalendar className="w-3 h-3" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1A1008]">
                  {orders.length} Bottle Orders Executed
                </h4>
                <p className="text-xs text-[#6B584C] mt-1">
                  All active orders dispatched via temperature-monitored vehicles in Raipur.
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#8C7A6B] shrink-0">Historical</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
