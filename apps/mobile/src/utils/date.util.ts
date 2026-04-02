import { format } from "date-fns";

export const formatDisplayDate = (value: string | Date) =>
  format(new Date(value), "MMM d, yyyy");

export const formatDateInput = (value: Date) => format(value, "yyyy-MM-dd");
