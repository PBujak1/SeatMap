import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SeatGrid from "@/components/plan/SeatGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";

const TYPES = ["seat", "teacher", "blocked"];
const key = (r, c) => `${r}-${c}`;

export default function PlanEditor() {
    const { spaceId } = useParams();
    const navigate = useNavigate();
    const [space, setSpace] = useState(null);
    const [cells, setCells] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const s = await base44.entities.Space.get(spaceId);
            const seats = await base44.entities.Seat.filter({ space_id: spaceId }, "", 500);
            setSpace(s);
            setCells(Object.fromEntries(seats.map((x) => [key(x.row, x.col), x.type || "seat"])));
        })();
    }, [spaceId]);

    const cycle = (r, c) => {
        setCells((prev) => {
            const cur = prev[key(r, c)];
            const next = cur === undefined ? "seat" : TYPES[TYPES.indexOf(cur) + 1];
            const copy = { ...prev };
            if (!next) delete copy[key(r, c)];
            else copy[key(r, c)] = next;
            return copy;
        });
    };

    const save = async () => {
        setSaving(true);
        const existing = await base44.entities.Seat.filter({ space_id: spaceId }, "", 500);
        await Promise.all(existing.map((s) => base44.entities.Seat.delete(s.id)));
        const records = Object.entries(cells).map(([k, type]) => {
            const [row, col] = k.split("-").map(Number);
            return {
                space_id: spaceId,
                row,
                col,
                type,
                label: `${String.fromCharCode(65 + row)}${col + 1}`,
            };
        });
        if (records.length) await base44.entities.Seat.bulkCreate(records);
        setSaving(false);
        navigate(`/book/${spaceId}`);
    };

    const removeSpace = async () => {
        const seats = await base44.entities.Seat.filter({ space_id: spaceId }, "", 500);
        await Promise.all(seats.map((s) => base44.entities.Seat.delete(s.id)));
        await base44.entities.Space.delete(spaceId);
        navigate("/");
    };

    if (!space) return <div className="h-64 rounded-3xl bg-neutral-200/50 animate-pulse" />;

    const seatCount = Object.values(cells).filter((t) => t !== "blocked").length;

    return (
        <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Spaces
            </Link>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{space.name} — layout</h1>
                    <p className="mt-2 text-neutral-500 text-sm">
                        Tap a cell to place a seat, again for a front/teacher desk, again for a blocked spot, again to clear.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={removeSpace} className="rounded-full text-neutral-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete space
                    </Button>
                    <Button onClick={save} disabled={saving} className="rounded-full bg-neutral-900 hover:bg-neutral-700">
                        {saving ? "Saving…" : `Save layout (${seatCount} seats)`}
                    </Button>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-3xl border border-neutral-200/80 p-8">
                <p className="text-center text-[11px] uppercase tracking-[0.22em] text-neutral-400 mb-6">Front of room</p>
                <SeatGrid
                    rows={space.rows}
                    cols={space.cols}
                    onCellClick={cycle}
                    renderCell={(r, c) => {
                        const t = cells[key(r, c)];
                        const cls =
                            t === "seat"
                                ? "bg-white border border-neutral-400 text-neutral-700"
                                : t === "teacher"
                                    ? "bg-amber-200 border border-amber-300 text-amber-900"
                                    : t === "blocked"
                                        ? "bg-neutral-800 text-neutral-500"
                                        : "bg-neutral-100/70 border border-dashed border-neutral-300 text-neutral-300";
                        return (
                            <div className={`w-full h-full rounded-xl flex items-center justify-center text-xs font-medium ${cls}`}>
                                {t && t !== "blocked" ? `${String.fromCharCode(65 + r)}${c + 1}` : ""}
                            </div>
                        );
                    }}
                />
            </div>
        </div>
    );
}