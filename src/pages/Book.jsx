import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SeatGrid from "@/components/plan/SeatGrid";
import SeatLegend from "@/components/plan/SeatLegend";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PencilRuler } from "lucide-react";
import { format } from "date-fns";

const key = (r, c) => `${r}-${c}`;

export default function Book() {
    const { spaceId } = useParams();
    const [space, setSpace] = useState(null);
    const [seats, setSeats] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [me, setMe] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            const [s, se, u] = await Promise.all([
                base44.entities.Space.get(spaceId),
                base44.entities.Seat.filter({ space_id: spaceId }, "", 500),
                base44.auth.me(),
            ]);
            setSpace(s);
            setSeats(se);
            setMe(u);
        })();
    }, [spaceId]);

    const loadReservations = useCallback(async () => {
        setReservations(await base44.entities.Reservation.filter({ space_id: spaceId, date }, "", 500));
    }, [spaceId, date]);

    useEffect(() => { loadReservations(); }, [loadReservations]);

    const toggle = async (seat) => {
        if (!seat || seat.type === "blocked" || busy) return;
        const existing = reservations.find((r) => r.seat_id === seat.id);
        setBusy(true);
        if (existing) {
            if (existing.attendee_email === me?.email) await base44.entities.Reservation.delete(existing.id);
        } else {
            await base44.entities.Reservation.create({
                space_id: spaceId,
                seat_id: seat.id,
                seat_label: seat.label,
                space_name: space.name,
                date,
                attendee_name: me?.full_name || me?.email,
                attendee_email: me?.email,
            });
        }
        await loadReservations();
        setBusy(false);
    };

    if (!space) return <div className="h-64 rounded-3xl bg-neutral-200/50 animate-pulse" />;

    const seatMap = Object.fromEntries(seats.map((s) => [key(s.row, s.col), s]));
    const taken = reservations.length;
    const total = seats.filter((s) => s.type !== "blocked").length;

    return (
        <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Spaces
            </Link>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">{space.kind}</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">{space.name}</h1>
                    <p className="mt-2 text-sm text-neutral-500">{total - taken} of {total} seats free on this day</p>
                </div>
                <div className="flex items-end gap-2">
                    <div>
                        <p className="text-xs text-neutral-500 mb-1.5">Date</p>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-full w-44" />
                    </div>
                    <Link
                        to={`/editor/${spaceId}`}
                        className="inline-flex items-center justify-center rounded-full border border-neutral-300 p-2.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                        title="Edit layout"
                    >
                        <PencilRuler className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-3xl border border-neutral-200/80 p-8">
                <p className="text-center text-[11px] uppercase tracking-[0.22em] text-neutral-400 mb-6">Front of room</p>
                {total === 0 ? (
                    <p className="text-center text-neutral-500 py-10">
                        No seats yet — <Link to={`/editor/${spaceId}`} className="underline">draw the layout</Link>.
                    </p>
                ) : (
                    <SeatGrid
                        rows={space.rows}
                        cols={space.cols}
                        onCellClick={(r, c) => toggle(seatMap[key(r, c)])}
                        renderCell={(r, c) => {
                            const seat = seatMap[key(r, c)];
                            if (!seat) return <div className="w-full h-full" />;
                            const res = reservations.find((x) => x.seat_id === seat.id);
                            const mine = res && res.attendee_email === me?.email;
                            const cls =
                                seat.type === "blocked"
                                    ? "bg-neutral-800"
                                    : mine
                                        ? "bg-emerald-500 text-white shadow-md"
                                        : res
                                            ? "bg-neutral-300 text-neutral-600"
                                            : seat.type === "teacher"
                                                ? "bg-amber-200 text-amber-900 hover:bg-amber-300"
                                                : "bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-900";
                            return (
                                <div
                                    title={res ? `${seat.label} · ${res.attendee_name}` : seat.label}
                                    className={`w-full h-full rounded-xl flex items-center justify-center text-xs font-medium transition-all duration-200 ${cls}`}
                                >
                                    {seat.type === "blocked" ? "" : seat.label}
                                </div>
                            );
                        }}
                    />
                )}
                <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-center"><SeatLegend /></div>
            </div>
        </div>
    );
}