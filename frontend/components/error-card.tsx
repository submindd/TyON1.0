"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry: () => void;
}

export default function ErrorCard({
  title = "Failed to load",
  message,
  onRetry,
}: ErrorCardProps) {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={{ backgroundColor: "#EFECE6" }}
    >
      <Card
        className="border-0 shadow-sm"
        style={{ borderRadius: 20, borderColor: "#efefef" }}
      >
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <AlertCircle size={32} className="text-red-400" />
          <div>
            <p className="font-medium text-neutral-800">{title}</p>
            <p className="mt-1 text-sm text-neutral-500">{message}</p>
          </div>
          <Button
            variant="outline"
            onClick={onRetry}
            className="rounded-xl"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
