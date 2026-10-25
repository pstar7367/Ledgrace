import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";
import { readPreferences } from "./preferences.js";

function formatWeekRange(value, locale) {
  const date = new Date(`${value}T00:00:00`);
  const start = new Date(date);
  const weekStart = readPreferences().weekStartsOn === "Monday" ? 1 : 0;
  const offset = (date.getDay() - weekStart + 7) % 7;
  start.setDate(date.getDate() - offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString(locale, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function WorkspaceCalendar({
  value,
  onChange,
  ariaLabel,
  className = "",
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language || document.documentElement.lang || "en";
  const inputRef = useRef(null);
  const openPicker = () => {
    if (typeof inputRef.current?.showPicker === "function") inputRef.current.showPicker();
    else inputRef.current?.click();
  };

  return (
    <label
      className={`budget-date-chip analytics-date-chip workspace-calendar ${className}`}
      onClick={openPicker}
    >
      <CalendarDays size={14} />
      <span>{formatWeekRange(value, locale)}</span>
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
