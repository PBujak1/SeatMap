import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SpaceCard from "@/components/plan/SpaceCard";
import NewSpaceDialog from "@/components/plan/NewSpaceDialog";

export default function Spaces() {
    const [spaces, setSpaces] = useState(null);
    const [seats, setSeats] = useState([]);

    useEffect(() => {
        (async () => {
            const [s, se] = await Promise.all([
                base44.entities.Space.list("-created_date"),
                base44.entities.Seat.list("", 2000),
            ]);
            setSpaces(s);
            setSeats(se);
        })();
    }, []);

    return (
        <div>
            <div className="flex items-end justify-between gap-6 mb-10">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">Seat management</p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight">Spaces</h1>
                    <p className="mt-2 text-neutral-500">Build a floor plan, then let anyone reserve a seat for a day.</p>
                </div>
                <NewSpaceDialog />
            </div>

            {spaces === null ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-56 rounded-3xl bg-neutral-200/50 animate-pulse" />
                    ))}
                </div>
            ) : spaces.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-neutral-300 p-16 text-center">
                    <p className="text-neutral-500">No spaces yet — create your first office or classroom.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spaces.map((s) => (
                        <SpaceCard key={s.id} space={s} seatCount={seats.filter((x) => x.space_id === s.id && x.type !== "blocked").length} />
                    ))}
                </div>
            )}
        </div>
    );
}