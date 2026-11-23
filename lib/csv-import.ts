import {
  parseBoatType,
  parseContactNumber,
  parsePax,
} from "@/lib/booking-fields";
import type { BoatType } from "@/lib/types";

export type ImportRow = {
  leader_name: string;
  contact_number: string;
  boat_type: BoatType;
  pax: number;
};

export type ImportRowError = {
  line: number;
  message: string;
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_]+/g, "");
}

function parseBoatTypeLoose(raw: string): BoatType | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("motor")) return "motor_boat";
  if (value.includes("bajra") || value.includes("bjara")) return "bajra_boat";
  return parseBoatType(value);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export function parseBookingsCsv(text: string): {
  rows: ImportRow[];
  errors: ImportRowError[];
} {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: [{ line: 1, message: "CSV needs a header row and at least one data row." }],
    };
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const nameIdx = headers.findIndex((h) =>
    ["leadername", "guestname", "name"].includes(h),
  );
  const contactIdx = headers.findIndex((h) =>
    ["contactnumber", "mobileno", "mobile", "phone", "contact"].includes(h),
  );
  const boatIdx = headers.findIndex((h) =>
    ["boattype", "boat"].includes(h),
  );
  const paxIdx = headers.findIndex((h) =>
    ["pax", "noofpax", "passengers", "passenger"].includes(h),
  );

  if (nameIdx < 0 || contactIdx < 0 || boatIdx < 0 || paxIdx < 0) {
    return {
      rows: [],
      errors: [
        {
          line: 1,
          message:
            "Header must include name, contact/mobile, boat type, and pax columns.",
        },
      ],
    };
  }

  const rows: ImportRow[] = [];
  const errors: ImportRowError[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const cells = splitCsvLine(lines[i]);
    const leaderName = (cells[nameIdx] || "").trim();
    const contactRaw = cells[contactIdx] || "";
    const boatRaw = cells[boatIdx] || "";
    const paxRaw = cells[paxIdx] || "";

    if (!leaderName && !contactRaw && !boatRaw && !paxRaw) {
      continue;
    }

    const contactNumber = parseContactNumber(contactRaw);
    const boatType = parseBoatTypeLoose(boatRaw);
    const pax = parsePax(paxRaw);

    if (!leaderName) {
      errors.push({ line: lineNo, message: "Missing guest name." });
      continue;
    }
    if (!contactNumber) {
      errors.push({
        line: lineNo,
        message: `Invalid contact number for ${leaderName}.`,
      });
      continue;
    }
    if (!boatType) {
      errors.push({
        line: lineNo,
        message: `Invalid boat type for ${leaderName}. Use Motor or Bajra.`,
      });
      continue;
    }
    if (pax === null) {
      errors.push({
        line: lineNo,
        message: `Invalid passenger count for ${leaderName}.`,
      });
      continue;
    }

    rows.push({
      leader_name: leaderName,
      contact_number: contactNumber,
      boat_type: boatType,
      pax,
    });
  }

  return { rows, errors };
}
