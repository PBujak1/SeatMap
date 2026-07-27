import React from "react";

export default function SeatGrid({ rows, cols, renderCell, onCellClick }) {
    return (
        <div className="overflow-x-auto">
            <div
                className="grid gap-2 mx-auto w-fit"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(44px, 56px))` }}
            >
                {Array.from({ length: rows * cols }).map((_, i) => {
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    return (
                        <button
                            key={`${row}-${col}`}
                            onClick={() => onCellClick?.(row, col)}
                            className="aspect-square rounded-xl transition-all duration-200"
                        >
                            {renderCell(row, col)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}