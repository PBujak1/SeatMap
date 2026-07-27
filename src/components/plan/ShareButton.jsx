import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ spaceId, variant = "icon" }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        const url = `${window.location.origin}/join/${spaceId}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {}
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    if (variant === "icon") {
        return (
            <button
                onClick={copy}
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 p-2.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                title="Copy share link"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
        );
    }
    return (
        <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
            {copied ? (
                <><Check className="w-4 h-4 text-emerald-600" /> Link copied</>
            ) : (
                <><Share2 className="w-4 h-4" /> Share</>
            )}
        </button>
    );
}