const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatLocalDate(date: Date): string {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

export function todayDate(): string {
  return formatLocalDate(new Date());
}

export function parseLocalDate(dateString: string): Date | null {
  if (!LOCAL_DATE_PATTERN.test(dateString)) return null;

  const [yearText, monthText, dayText] = dateString.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  const isRealCalendarDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealCalendarDate ? date : null;
}

export function isValidLocalDateString(dateString: string): boolean {
  return parseLocalDate(dateString) !== null;
}

export function addDays(dateString: string, daysToAdd: number): string {
  const parsedDate = parseLocalDate(dateString);
  const date = parsedDate ?? new Date();
  date.setDate(date.getDate() + daysToAdd);
  return formatLocalDate(date);
}

export function formatDisplayDate(dateString: string): string {
  const parsedDate = parseLocalDate(dateString);
  if (!parsedDate) return dateString;

  const today = todayDate();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  if (dateString === today) return "今天";
  if (dateString === yesterday) return "昨天";
  if (dateString === tomorrow) return "明天";

  return `${parsedDate.getFullYear()}年${parsedDate.getMonth() + 1}月${parsedDate.getDate()}日`;
}
