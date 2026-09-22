import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─── Stats Card ───────────────────────────────────────────────────────────────

type StatCardColor =
    | "blue"
    | "purple"
    | "green"
    | "amber"
    | "red"
    | "indigo"
    | "navy"
    | "teal"
    | "orange"
    | "emerald"
    | "rose"
    | "sky"
    | "violet";

const statCardStyles: Record<
    StatCardColor,
    {
        cardBg: string;
        borderActive: string;
        iconBg: string;
        title: string;
        pill: string;
        icon: string;
        sub: string;
    }
> = {
    navy: {
        cardBg: "rgb(196, 226, 245)",
        borderActive: "#004C97",
        iconBg: "#004C97",
        title: "text-[#2C5EAD] dark:text-blue-300",
        pill: "bg-[#e8eef4] text-[#001F3F] dark:bg-blue-900/30 dark:text-blue-300",
        icon: "text-white",
        sub: "text-[#2C5EAD] dark:text-blue-300",
    },
    blue: {
        cardBg: "rgba(59, 130, 246, 0.12)",
        borderActive: "#3b82f6",
        iconBg: "#3b82f6",
        title: "text-blue-700 dark:text-blue-400",
        pill: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        icon: "text-white",
        sub: "text-blue-500 dark:text-blue-300",
    },
    purple: {
        cardBg: "rgba(168, 85, 247, 0.12)",
        borderActive: "#a855f7",
        iconBg: "#a855f7",
        title: "text-purple-700 dark:text-purple-400",
        pill: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        icon: "text-white",
        sub: "text-purple-500 dark:text-purple-300",
    },
    green: {
        cardBg: "rgba(16, 185, 129, 0.12)",
        borderActive: "#10b981",
        iconBg: "#10b981",
        title: "text-green-700 dark:text-green-400",
        pill: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        icon: "text-white",
        sub: "text-green-500 dark:text-green-300",
    },
    amber: {
        cardBg: "rgba(245, 158, 11, 0.12)",
        borderActive: "#f59e0b",
        iconBg: "#f59e0b",
        title: "text-amber-700 dark:text-amber-300",
        pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        icon: "text-white",
        sub: "text-amber-500 dark:text-amber-300",
    },
    red: {
        cardBg: "rgba(239, 68, 68, 0.12)",
        borderActive: "#ef4444",
        iconBg: "#ef4444",
        title: "text-red-700 dark:text-red-400",
        pill: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        icon: "text-white",
        sub: "text-red-500 dark:text-red-300",
    },
    indigo: {
        cardBg: "rgba(99, 102, 241, 0.12)",
        borderActive: "#6366f1",
        iconBg: "#6366f1",
        title: "text-indigo-700 dark:text-indigo-400",
        pill: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
        icon: "text-white",
        sub: "text-indigo-500 dark:text-indigo-300",
    },
    teal: {
        cardBg: "rgba(20, 184, 166, 0.12)",
        borderActive: "#14b8a6",
        iconBg: "#14b8a6",
        title: "text-teal-700 dark:text-teal-400",
        pill: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
        icon: "text-white",
        sub: "text-teal-500 dark:text-teal-300",
    },
    orange: {
        cardBg: "rgba(249, 115, 22, 0.12)",
        borderActive: "#f97316",
        iconBg: "#f97316",
        title: "text-orange-700 dark:text-orange-400",
        pill: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        icon: "text-white",
        sub: "text-orange-500 dark:text-orange-300",
    },
    emerald: {
        cardBg: "rgba(5, 150, 105, 0.12)",
        borderActive: "#059669",
        iconBg: "#059669",
        title: "text-emerald-700 dark:text-emerald-400",
        pill: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: "text-white",
        sub: "text-emerald-500 dark:text-emerald-300",
    },
    rose: {
        cardBg: "rgba(244, 63, 94, 0.12)",
        borderActive: "#f43f5e",
        iconBg: "#f43f5e",
        title: "text-rose-700 dark:text-rose-400",
        pill: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
        icon: "text-white",
        sub: "text-rose-500 dark:text-rose-300",
    },
    sky: {
        cardBg: "rgba(14, 165, 233, 0.16)",
        borderActive: "#0ea5e9",
        iconBg: "#0ea5e9",
        title: "text-sky-700 dark:text-sky-400",
        pill: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
        icon: "text-white",
        sub: "text-sky-500 dark:text-sky-300",
    },
    violet: {
        cardBg: "rgba(139, 92, 246, 0.16)",
        borderActive: "#8b5cf6",
        iconBg: "#8b5cf6",
        title: "text-violet-700 dark:text-violet-400",
        pill: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
        icon: "text-white",
        sub: "text-violet-500 dark:text-violet-300",
    },
};

export const StatCard = ({
    label,
    value,
    sub,
    // progress,
    color,
    icon,
    number,
    onClick,
    active,
    className,
}: {
    label: string;
    value?: number | string;
    sub?: string;
    progress?: number;
    color: StatCardColor;
    icon?: React.ReactNode;
    number?: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    className?: string;
}) => {
    const s = statCardStyles[color];
    return (
        <Card
            onClick={onClick}
            className={cn(
                "group relative min-w-0 cursor-pointer overflow-hidden gap-0 py-2 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                active && "shadow-md scale-[1.02]",
                className,
            )}
            style={{
                backgroundColor: s.cardBg,
                borderColor: active ? s.borderActive : "transparent",
                boxShadow: active
                    ? `0 4px 12px ${s.borderActive}33`
                    : undefined,
            }}
        >
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 px-3 pb-1 pt-0">
                <CardTitle
                    className={cn(
                        "flex min-w-0 items-center gap-1.5 text-sm font-medium",
                        s.title,
                    )}
                >
                    <span className="min-w-0 truncate text-lg font-semibold tracking-tight">
                        {label}
                    </span>
                    <span
                        className={cn(
                            "rounded-full px-2 text-base font-bold",
                            s.pill,
                        )}
                    >
                        {value !== undefined ? value : ""}
                    </span>
                </CardTitle>
                {icon && (
                    <div
                        className={cn(
                            "rounded-xl p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105",
                            s.icon,
                        )}
                        style={{ backgroundColor: s.iconBg }}
                    >
                        {icon}
                    </div>
                )}
                {number && (
                    <div
                        className={cn(
                            "rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105",
                            s.icon,
                        )}
                        style={{ backgroundColor: s.iconBg }}
                    >
                        {number}
                    </div>
                )}
            </CardHeader>
            {sub && (
                <CardContent className="relative z-10 px-3 pb-0 pt-0 ">
                    <p className={cn("text-2xl font-bold ", s.sub)}>{sub}</p>
                </CardContent>
            )}
            {/* {progress !== undefined && (
                <div className="mt-3 mx-3">
                    <Progress value={progress} className="w-full bg-gray-400" />
                </div>
            )} */}
        </Card>
    );
};
