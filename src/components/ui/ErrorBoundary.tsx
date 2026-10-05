"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error || new Error("Unknown error"), this.reset);
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD4] my-4 text-center">
          <div className="max-w-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h3 className="text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
              Something went wrong
            </h3>
            <p className="text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed">
              We encountered an unexpected error while rendering this section. Please try again.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={this.reset}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
