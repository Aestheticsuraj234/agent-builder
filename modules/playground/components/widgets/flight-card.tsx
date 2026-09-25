export function FlightCard({
  data,
}: {
  data: {
    from?: string;
    to?: string;
    airline?: string;
    price?: string;
    note?: string;
  };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm">
      <p className="font-medium">Flight option</p>
      <p className="mt-2">
        {data.from ?? "?"} → {data.to ?? "?"}
      </p>
      {data.airline && <p className="text-muted-foreground">Airline: {data.airline}</p>}
      {data.price && <p className="text-muted-foreground">Price: {data.price}</p>}
      {data.note && <p className="mt-2 text-xs">{data.note}</p>}
    </div>
  );
}
