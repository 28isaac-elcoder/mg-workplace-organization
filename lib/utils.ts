import { clsx } from "clsx";

import type { Priority, Status } from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  const safeValue = value.length <= 10 ? `${value}T00:00:00` : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(safeValue));
}

export function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function getDueState(dueDate: string | null | undefined, status?: Status | string) {
  if (!dueDate || status === "Completed" || status === "Cancelled") {
    return "normal";
  }

  const due = new Date(dueDate.length <= 10 ? `${dueDate}T00:00:00` : dueDate);
  due.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return "overdue";
  if (diff <= 7) return "soon";
  return "normal";
}

export function priorityClass(priority: Priority | string) {
  switch (priority) {
    case "Urgent":
      return "badge badge-urgent";
    case "High":
      return "badge badge-high";
    case "Medium":
      return "badge badge-medium";
    default:
      return "badge badge-low";
  }
}

export function statusClass(status: Status | string) {
  switch (status) {
    case "Completed":
      return "badge badge-success";
    case "On Hold":
      return "badge badge-muted";
    case "Cancelled":
      return "badge badge-cancelled";
    case "Waiting":
      return "badge badge-waiting";
    default:
      return "badge badge-info";
  }
}

export function parseListInput(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parsePercent(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return 0;
  const percent = Number(value);
  if (Number.isNaN(percent)) return 0;
  return Math.max(0, Math.min(100, percent));
}

export function absoluteUrl(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}
