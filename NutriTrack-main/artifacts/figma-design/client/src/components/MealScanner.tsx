import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Camera, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  RotateCcw,
  Utensils,
  Info
} from "lucide-react";

interface FoodAnalysis {
  foodItem?: string;
  mealType?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  alternatives?: string[];
  notes?: string;
}

export function MealScanner() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);

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

          if (data.analysis) {
            setAnalysis(data.analysis);
          }
        } else {
          setErrorMsg(data.error || "Could not recognize food.");
        }
      } catch (err: any) {
        setErrorMsg("Failed to reach vision service.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImagePreview(null);
    setAnalysis(null);
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto border rounded-3xl bg-card shadow-lg p-5 sm:p-6 transition-all border-border/60">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground leading-tight">AI Photo Meal Logger</h3>
            <p className="text-xs text-muted-foreground">Instant dish recognition & macro logging</p>
          </div>
        </div>

        {imagePreview && !loading && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </button>
        )}
      </div>

      {/* Upload Zone */}
      {!imagePreview && (
        <label className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/60 bg-muted/20 hover:bg-primary/5 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-card shadow-md flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-3 border border-border">
            <Utensils className="w-6 h-6" />
          </div>
          
          <p className="text-sm font-semibold text-foreground mb-1 text-center">
            Snap or upload your meal
          </p>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Supports camera capture on mobile devices
          </p>

          <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm group-hover:opacity-90 transition">
            <Camera className="w-4 h-4" />
            <span>Snap Meal</span>
          </span>

          <input
            type="file"
            accept="image/*"
            {...({ capture: "environment" } as any)}
            onChange={handleImageCapture}
            disabled={loading}
            className="hidden"
          />
        </label>
      )}

      {/* Preview & Scanner Animation */}
      {imagePreview && (
        <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-border">
          <img
            src={imagePreview}
            alt="Scanned dish"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loading ? "opacity-50 blur-[1px]" : "opacity-100"
            }`}
          />

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs">
              <div className="w-full h-1 bg-primary shadow-[0_0_15px_var(--color-primary,#22c55e)] animate-pulse mb-3" />
              <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-border">
                <Loader2 className="animate-spin w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Analyzing dish macros...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-destructive text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button 
            onClick={handleReset} 
            className="underline text-xs font-bold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Result Cards */}
      {analysis && (
        <div className="mt-4 space-y-3.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Logged to Daily Tracker</span>
            </div>
            {analysis.mealType && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20">
                {analysis.mealType}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground capitalize">
              {analysis.foodItem || "Recognized Meal"}
            </h4>
            {analysis.notes && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Info className="w-3 h-3 shrink-0" />
                <span>{analysis.notes}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Calories */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Calories</span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-foreground">
                {analysis.calories ?? 0} <span className="text-xs font-normal text-muted-foreground">kcal</span>
              </p>
            </div>

            {/* Protein */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Dumbbell className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Protein</span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-foreground">
                {analysis.proteinG ?? 0} <span className="text-xs font-normal text-muted-foreground">g</span>
              </p>
            </div>

            {/* Carbs */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Wheat className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Carbs</span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-foreground">
                {analysis.carbsG ?? 0} <span className="text-xs font-normal text-muted-foreground">g</span>
              </p>
            </div>

            {/* Fat */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Droplet className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Fat</span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-foreground">
                {analysis.fatG ?? 0} <span className="text-xs font-normal text-muted-foreground">g</span>
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}