import React from "react";

const items = [
    { label: "Available", cls: "bg-white border border-neutral-300" },
    { label: "Reserved", cls: "bg-neutral-300" },
    { label: "Your seat", cls: "bg-emerald-500" },
    { label: "Front / teacher", cls: "bg-amber-200" },
];

export default function SeatLegend() {
    return (
        <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-500">
            {items.map((i) => (
                <div key={i.label} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-md ${i.cls}`} />
                    {i.label}
                </div>
            ))}
        </div>
    );
}