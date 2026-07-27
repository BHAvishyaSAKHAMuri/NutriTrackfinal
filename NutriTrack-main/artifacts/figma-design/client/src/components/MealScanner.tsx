import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Sparkles } from "lucide-react";

export function MealScanner() {
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setScannedResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        const res = await fetch("/api/vision/food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64String }),
        });

        const data = await res.json();

        if (res.ok) {
          // Refresh dashboard and meal plan queries
          queryClient.invalidateQueries({ queryKey: ["/api/profile/today"] });
          queryClient.invalidateQueries({ queryKey: ["/api/meal-plan"] });

          const { foodItem, calories, proteinG, carbsG, fatG } = data.analysis;
          setScannedResult(
            `Logged: ${foodItem} (${calories} kcal | ${proteinG}g P / ${carbsG}g C / ${fatG}g F)`
          );
        } else {
          setScannedResult(`Error: ${data.error || "Could not recognize food."}`);
        }
      } catch (err: any) {
        setScannedResult("Failed to reach vision service.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>AI Photo Meal Logger</span>
        </div>

        <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg cursor-pointer hover:opacity-90 transition">
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          <span>{loading ? "Analyzing..." : "Snap Meal"}</span>
          <input
            type="file"
            accept="image/*"
            {...({ capture: "environment" } as any)}
            onChange={handleImageCapture}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>

      {scannedResult && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
          ✓ {scannedResult}
        </p>
      )}
    </div>
  );
}