import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function NewSpaceDialog() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", kind: "office", description: "", rows: 6, cols: 8 });

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        const space = await base44.entities.Space.create({
            ...form,
            rows: Number(form.rows),
            cols: Number(form.cols),
        });
        setSaving(false);
        setOpen(false);
        navigate(`/editor/${space.id}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full bg-neutral-900 hover:bg-neutral-700">
                    <Plus className="w-4 h-4 mr-1.5" /> New space
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="tracking-tight">Create a space</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Studio floor 3" />
                    </div>
                    <div>
                        <Label>Type</Label>
                        <Select value={form.kind} onValueChange={(v) => set("kind", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {["office", "classroom", "lab", "other"].map((k) => (
                                    <SelectItem key={k} value={k}>{k}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Rows</Label>
                            <Input type="number" min="1" max="14" value={form.rows} onChange={(e) => set("rows", e.target.value)} />
                        </div>
                        <div>
                            <Label>Columns</Label>
                            <Input type="number" min="1" max="14" value={form.cols} onChange={(e) => set("cols", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
                    </div>
                    <Button onClick={submit} disabled={saving} className="w-full rounded-full bg-neutral-900 hover:bg-neutral-700">
                        {saving ? "Creating…" : "Create & draw layout"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}