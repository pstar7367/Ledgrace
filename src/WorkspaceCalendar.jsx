import { useRef } from "react";
import { CalendarDays } from "lucide-react";

function formatWeekRange(value) {
  const date = new Date(`${value}T00:00:00`);
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function WorkspaceCalendar({
  value,
  onChange,
  ariaLabel,
  className = "",
}) {
  const inputRef = useRef(null);
  const openPicker = () => {
    if (typeof inputRef.current?.showPicker === "function")
      inputRef.current.showPicker();
    else inputRef.current?.click();
  };

  return (
    <label
      className={`budget-date-chip analytics-date-chip workspace-calendar ${className}`}
      onClick={openPicker}
    >
      <CalendarDays size={14} />
      <span>{formatWeekRange(value)}</span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
      />
    </label>
  );
}
