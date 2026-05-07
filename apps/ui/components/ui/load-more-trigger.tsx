import { ChevronDown, Loader2 } from "lucide-react";

interface LoadMoreTriggerProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  label?: string;
}

export const LoadMoreTrigger = ({
  onLoadMore,
  isLoading,
  hasMore,
  label = "შემდეგი 10 ჩანაწერი",
}: LoadMoreTriggerProps) => {
  if (!hasMore) {
    return (
      <p className="text-slate-600 text-[10px] uppercase mt-4 text-center">
        ყველა მონაცემი ჩატვირთულია
      </p>
    );
  }

  return (
    <div className="pt-4 flex justify-center">
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 transition-all active:scale-95 disabled:opacity-50 text-xs font-medium"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ChevronDown size={14} />
        )}
        {label}
      </button>
    </div>
  );
};
