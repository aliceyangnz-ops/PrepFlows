/**
 * Tripleseat connector.
 *
 * Tripleseat is a web-based event management and sales platform popular
 * in restaurants, hotels, and unique venues across the US and globally.
 *
 * Field names cover:
 *  - Tripleseat REST API v1 (snake_case JSON)
 *  - Tripleseat export spreadsheets
 *  - Tripleseat webhook payloads
 */

import { createHmac } from "node:crypto";
import type { ConnectorFieldMap, RawEventRow } from "../types.js";
import { BaseConnector, type WebhookParseResult } from "./base.js";

export class TripleseatConnector extends BaseConnector {
  readonly source = "tripleseat" as const;
  readonly displayName = "Tripleseat";
  readonly webhookSignatureHeader = "x-tripleseat-signature";

  readonly fieldMap: ConnectorFieldMap = {
    name: [
      "name", "event_name", "booking_name", "lead_name", "subject",
      "Name", "Event Name", "Booking Name",
    ],
    date: [
      "date", "event_date", "starts_at", "start_date", "booking_date",
      "Date", "Event Date", "Start Date",
    ],
    startTime: [
      "start_time", "starts_at", "event_start_time", "time_start",
      "Start Time",
    ],
    endTime: [
      "end_time", "ends_at", "event_end_time", "time_end",
      "End Time",
    ],
    venue: [
      "location_name", "venue_name", "location", "site_name",
      "Location", "Venue",
    ],
    room: [
      "room", "room_name", "space", "space_name", "function_space",
      "location_room", "area", "Room", "Space",
    ],
    floor: ["floor", "level", "section", "building", "Floor"],
    guestCount: [
      "guest_count", "expected_guests", "guaranteed_guests",
      "attendance", "number_of_guests", "pax", "covers",
      "Guest Count", "Guests", "Attendance",
    ],
    confirmedCount: [
      "confirmed_guests", "guaranteed_count", "actual_guests",
    ],
    bookedBy: [
      "account_name", "company_name", "client_name", "organization",
      "company", "account", "Account", "Company",
    ],
    contactName: [
      "contact_name", "contact_first_name", "lead_name",
      "first_name", "full_name", "Contact Name",
    ],
    contactEmail: ["contact_email", "email", "email_address", "Email"],
    contactPhone: [
      "contact_phone", "phone", "phone_number", "mobile_phone",
      "cell_phone", "telephone", "Phone",
    ],
    eventType: [
      "event_type", "type", "event_category", "booking_type",
      "category", "lead_type", "Event Type",
    ],
    status: [
      "status", "booking_status", "event_status", "lead_status",
      "stage", "Status",
    ],
    menu: [
      "menu", "menu_name", "food_beverage_details", "catering",
      "package_name", "menu_description", "Menu",
    ],
    dietaryNotes: [
      "dietary_requirements", "dietary_notes", "special_requirements",
      "allergies", "dietary_restrictions", "food_restrictions",
      "Dietary Requirements",
    ],
    notes: [
      "notes", "internal_notes", "comments", "special_instructions",
      "event_notes", "additional_info", "description", "Notes",
    ],
    chefInCharge: ["chef_in_charge", "chef", "head_chef", "executive_chef"],
    eventManager: [
      "event_manager", "assigned_user", "coordinator",
      "event_planner", "sales_manager", "Event Manager",
    ],
    externalId: [
      "id", "booking_id", "event_id", "lead_id", "confirmation_number",
      "ID",
    ],
    revenue: [
      "total_revenue", "estimated_revenue", "revenue", "total_amount",
      "booking_revenue", "food_beverage_minimum", "Revenue",
    ],
  };

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
    return expected === signature;
  }

  parseWebhookPayload(
    _headers: Record<string, string>,
    body: unknown,
  ): WebhookParseResult | null {
    if (!body || typeof body !== "object") return null;
    const b = body as Record<string, unknown>;
    const inner = (b["payload"] ?? b) as Record<string, unknown>;
    const record = inner["booking"] ?? inner["lead"] ?? inner["event"] ?? inner;
    const rows = Array.isArray(record) ? record : [record as RawEventRow];
    return { rows, errors: [] };
  }
}

export const tripleseatConnector = new TripleseatConnector();
