"use client";

import type { ThemeName } from "@/lib/types";
import { THEMES } from "@/lib/icon-mapper";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemePickerProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export function ThemePicker({ currentTheme, onThemeChange }: ThemePickerProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {THEMES.map((theme) => (
        <Tooltip key={theme.name}>
          <TooltipTrigger>
            <button
              onClick={() => onThemeChange(theme.name)}
              className={`theme-dot h-7 w-7 rounded-full border-2 flex items-center justify-center text-[10px] cursor-pointer ${
                currentTheme === theme.name
                  ? "theme-dot-active border-current"
                  : "border-transparent hover:border-current/30"
              }`}
              style={{ backgroundColor: theme.preview, color: theme.preview }}
              aria-label={theme.label}
            >
              {currentTheme === theme.name && (
                <span className="text-white text-[10px] font-bold drop-shadow-sm">✓</span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {theme.emoji} {theme.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
