import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function MyReservations() {
    const [items, setItems] = useState(null);

    const load = async () => {
        const me = await base44.auth.me();
        setItems(await base44.entities.Reservation.filter({ attendee_email: me.email }, "-date", 200));
    };

    useEffect(() => { load(); }, []);

    const cancel = async (id) => {
        await base44.entities.Reservation.delete(id);
        load();
    };

    return (
        <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">Attendance</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">My bookings</h1>

            <div className="mt-10 space-y-3">
                {items === null ? (
                    [0, 1].map((i) => <div key={i} className="h-20 rounded-2xl bg-neutral-200/50 animate-pulse" />)
                ) : items.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-neutral-300 p-16 text-center text-neutral-500">
                        Nothing booked yet — <Link to="/" className="underline">pick a space</Link>.
                    </div>
                ) : (
                    items.map((r) => (
                        <div key={r.id} className="bg-white rounded-2xl border border-neutral-200/80 px-6 py-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium tracking-tight">
                                    Seat {r.seat_label} · {r.space_name}
                                </p>
                                <p className="text-sm text-neutral-500 mt-0.5">
                                    {format(parseISO(r.date), "EEEE, d MMM yyyy")}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to={`/book/${r.space_id}`} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">View plan</Link>
                                <Button variant="ghost" onClick={() => cancel(r.id)} className="rounded-full text-neutral-500 hover:text-red-600">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}