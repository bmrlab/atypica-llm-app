"use client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchStatsByStudyUserChatId } from "@/data/ChatStatistics";
import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface NerdStatsProps {
  studyUserChatId: number;
}

type Stat = {
  dimension: string;
  total: number | null;
};

export function NerdStats({ studyUserChatId }: NerdStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (studyUserChatId) {
      setIsLoading(true);
      try {
        const data = await fetchStatsByStudyUserChatId(studyUserChatId);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch chat statistics:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [studyUserChatId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      timeoutId = setTimeout(poll, 10000);
      await loadStats();
    };
    poll();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loadStats]);

  // Helper function to get stat value by dimension
  const getStatValue = (dimension: string) => {
    const stat = stats.find((s) => s.dimension === dimension);
    return stat?.total ?? 0;
  };

  // Format duration in milliseconds to human-readable format
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex justify-end">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:bg-transparent hover:text-primary"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <InfoIcon className="h-3 w-3 mr-1" />
            Nerd Stats
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[40rem] p-0 border-none bg-transparent shadow-none"
          align="center"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading stats...</div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-input overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-input flex items-center">
                  <div className="text-xl font-mono space-x-2">
                    <span>💻</span>
                    <span>atypica.LLM</span>
                    <span className="text-foreground/80">&lt;creative reasoning α&gt;</span>
                    <span>queries</span>
                  </div>
                </div>
                {/* Stats Header */}
                <div className="grid grid-cols-4 border-b border-input border-dashed">
                  <div className="text-foreground/70 py-3 px-6 text-center border-r border-input border-dashed">
                    time
                  </div>
                  <div className="text-foreground/70 py-3 px-6 text-center border-r border-input border-dashed">
                    steps
                  </div>
                  <div className="text-foreground/70 py-3 px-6 text-center border-r border-input border-dashed">
                    personas
                  </div>
                  <div className="text-foreground/70 py-3 px-6 text-center border-r border-input">
                    tokens
                  </div>
                </div>

                {/* Stats Values */}
                <div className="grid grid-cols-4 bg-zinc-100 dark:bg-[#85CFF6]/5 border-b border-input">
                  <div className="text-primary py-6 px-6 text-center text-xl font-mono border-r border-input border-dashed">
                    {formatDuration(getStatValue("duration"))}
                  </div>
                  <div className="text-primary py-6 px-6 text-center text-xl font-mono border-r border-input border-dashed">
                    {getStatValue("steps")}
                  </div>
                  <div className="text-primary py-6 px-6 text-center text-xl font-mono border-r border-input border-dashed">
                    {getStatValue("personas")}
                  </div>
                  <div className="text-primary py-6 px-6 text-center text-xl font-mono border-r border-input">
                    {getStatValue("tokens").toLocaleString()}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 text-zinc-600 dark:text-[#85CFF6] font-medium text-sm">
                  BMRLab @ 特赞科技
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
