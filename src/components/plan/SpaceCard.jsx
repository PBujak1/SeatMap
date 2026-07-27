import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, PencilRuler } from "lucide-react";
import ShareButton from "@/components/plan/ShareButton";

export default function SpaceCard({ space, seatCount }) {
    return (
        <div className="group relative bg-white rounded-3xl border border-neutral-200/80 p-6 transition-all duration-300 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)] hover:-translate-y-0.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">{space.kind}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">{space.name}</h3>
            {space.description && (
                <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{space.description}</p>
            )}
            <p className="mt-4 text-sm text-neutral-400">
                {space.rows} × {space.cols} grid · {seatCount} seats
            </p>
            <div className="mt-6 flex items-center gap-2">
                <Link
                    to={`/book/${space.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-neutral-900 text-white text-sm py-2.5 hover:bg-neutral-700 transition-colors"
                >
                    Reserve a seat <ArrowUpRight className="w-4 h-4" />
                </Link>
                <ShareButton spaceId={space.id} />
                <Link
                    to={`/editor/${space.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-300 p-2.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                    title="Edit layout"
                >
                    <PencilRuler className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}