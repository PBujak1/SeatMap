import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SeatGrid from "@/components/plan/SeatGrid";
import SeatLegend from "@/components/plan/SeatLegend";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const key = (r, c) => `${r}-${c}`;

export default function PublicBook() {
    const { spaceId } = useParams();
    const [space, setSpace] = useState(null);
    const [seats, setSeats] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [name, setName] = useState(localStorage.getItem("sp_name") || "");
    const [email, setEmail] = useState(localStorage.getItem("sp_email") || "");
    const [busy, setBusy] = useState(false);
    const [warn, setWarn] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const s = await base44.entities.Space.get(spaceId);
                const se = await base44.entities.Seat.filter({ space_id: spaceId }, "", 500);
                setSpace(s);
                setSeats(se);
            } catch {
                setSpace(false);
            }
        })();
    }, [spaceId]);

    const load = useCallback(async () => {
        setReservations(await base44.entities.Reservation.filter({ space_id: spaceId, date }, "", 500));
    }, [spaceId, date]);
    useEffect(() => { load(); }, [load]);

    const toggle = async (seat) => {
        if (!seat || seat.type === "blocked" || busy) return;
        const existing = reservations.find((r) => r.seat_id === seat.id);
        setBusy(true);
        try {
            if (existing) {
                if (existing.attendee_email === email.trim()) {
                    await base44.entities.Reservation.delete(existing.id);
                    await load();
                }
            } else {
                if (!name.trim() || !email.trim()) {
                    setWarn("Enter your name and email to reserve a seat.");
                    return;
                }
                setWarn("");
                await base44.entities.Reservation.create({
                    space_id: spaceId,
                    seat_id: seat.id,
                    seat_label: seat.label,
                    space_name: space.name,
                    date,
                    attendee_name: name.trim(),
                    attendee_email: email.trim(),
                });
                localStorage.setItem("sp_name", name.trim());
                localStorage.setItem("sp_email", email.trim());
                await load();
            }
        } finally {
            setBusy(false);
        }
    };

    if (space === null) return <div className="h-64 rounded-3xl bg-neutral-200/50 animate-pulse" />;
    if (space === false)
        return <div className="min-h-screen flex items-center justify-center text-neutral-500">Space not found.</div>;

    const seatMap = Object.fromEntries(seats.map((s) => [key(s.row, s.col), s]));
    const total = seats.filter((s) => s.type !== "blocked").length;
    const taken = reservations.length;

    return (
        <div className="min-h-screen bg-[#FAFAF8]">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">{space.kind}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">{space.name}</h1>
                {space.description && <p className="mt-2 text-neutral-500">{space.description}</p>}

                <div className="mt-8 bg-white rounded-3xl border border-neutral-200/80 p-6">
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs text-neutral-500">Date</Label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-full" />
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Your name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="rounded-full" />
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Email</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@co.com" className="rounded-full" />
                        </div>
                    </div>
                    {warn && <p className="mt-3 text-sm text-red-600">{warn}</p>}
                </div>

                <div className="mt-6 bg-white rounded-3xl border border-neutral-200/80 p-8">
                    <p className="text-center text-[11px] uppercase tracking-[0.22em] text-neutral-400 mb-6">Front of room</p>
                    {total === 0 ? (
                        <p className="text-center text-neutral-500 py-10">No seats available for this space yet.</p>
                    ) : (
                        <SeatGrid
                            rows={space.rows}
                            cols={space.cols}
                            onCellClick={(r, c) => toggle(seatMap[key(r, c)])}
                            renderCell={(r, c) => {
                                const seat = seatMap[key(r, c)];
                                if (!seat) return <div className="w-full h-full" />;
                                const res = reservations.find((x) => x.seat_id === seat.id);
                                const mine = res && res.attendee_email === email.trim();
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
                    <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                        <SeatLegend />
                        <p className="text-xs text-neutral-400">{total - taken} free</p>
                    </div>
                </div>
            </div>
        </div>
    );
}