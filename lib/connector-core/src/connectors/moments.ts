/**
 * Moments (Ungerboeck) connector.
 *
 * Moments is the dominant venue & event management platform in Australia/NZ.
 * Field names below cover the standard Moments Explorer export and the
 * Ungerboeck REST API (v20+).
 */

import { createHmac } from "node:crypto";
import type { ConnectorFieldMap, RawEventRow } from "../types.js";
import { BaseConnector, type WebhookParseResult } from "./base.js";

export class MomentsConnector extends BaseConnector {
  readonly source = "moments" as const;
  readonly displayName = "Moments (Ungerboeck)";
  readonly webhookSignatureHeader = "x-ub-signature";

  readonly fieldMap: ConnectorFieldMap = {
    name: [
      "EventName",
      "Event Name",
      "SubjectLine",
      "Subject Line",
      "Name",
      "BookingName",
      "Booking Name",
      "FunctionName",
      "Function Name",
    ],
    date: [
      "EventDate",
      "Event Date",
      "StartDate",
      "Start Date",
      "BookingDate",
      "Booking Date",
      "Date",
    ],
    startTime: [
      "EventStart",
      "Event Start",
      "StartTime",
      "Start Time",
      "BookingStartTime",
      "EventStartTime",
      "TimeFrom",
      "Time From",
    ],
    endTime: [
      "EventEnd",
      "Event End",
      "EndTime",
      "End Time",
      "BookingEndTime",
      "EventEndTime",
      "TimeTo",
      "Time To",
    ],
    venue: [
      "FacilityName",
      "Facility Name",
      "VenueName",
      "Venue Name",
      "OrganizationName",
      "Organization",
      "Property",
    ],
    room: [
      "FunctionSpace",
      "Function Space",
      "RoomName",
      "Room Name",
      "SpaceName",
      "Space Name",
      "Room",
      "Space",
      "Venue",
    ],
    floor: ["Floor", "Level", "Building", "Wing", "Area"],
    guestCount: [
      "AttendeeCount",
      "Attendee Count",
      "ExpectedCount",
      "Expected Count",
      "GuaranteedCount",
      "Guaranteed Count",
      "PAX",
      "Pax",
      "NumberOfAttendees",
      "Number of Attendees",
      "Guests",
    ],
    confirmedCount: [
      "ConfirmedCount",
      "Confirmed Count",
      "ActualCount",
      "Actual Count",
    ],
    bookedBy: [
      "AccountName",
      "Account Name",
      "OrganizationName",
      "Organization Name",
      "CompanyName",
      "Company Name",
      "ClientName",
      "Client Name",
      "BookedBy",
    ],
    contactName: [
      "ContactName",
      "Contact Name",
      "ContactFullName",
      "PrimaryContact",
      "Primary Contact",
      "EventContact",
    ],
    contactEmail: [
      "ContactEmail",
      "Contact Email",
      "Email",
      "EmailAddress",
      "Email Address",
    ],
    contactPhone: [
      "ContactPhone",
      "Contact Phone",
      "Phone",
      "PhoneNumber",
      "Phone Number",
      "MobilePhone",
      "Mobile",
    ],
    eventType: [
      "EventType",
      "Event Type",
      "FunctionType",
      "Function Type",
      "Category",
      "EventCategory",
      "Type",
    ],
    status: ["EventStatus", "Status", "BookingStatus", "Booking Status"],
    menu: [
      "Menu",
      "MenuDescription",
      "MenuItems",
      "FoodBeverage",
      "Food & Beverage",
      "Catering",
    ],
    dietaryNotes: [
      "DietaryRequirements",
      "Dietary Requirements",
      "DietaryNotes",
      "Dietary Notes",
      "Dietary",
      "SpecialRequirements",
      "Special Requirements",
      "Allergies",
      "FoodAllergies",
    ],
    notes: [
      "EventNotes",
      "Notes",
      "SpecialInstructions",
      "Special Instructions",
      "InternalNotes",
      "Comments",
    ],
    chefInCharge: [
      "ChefInCharge",
      "Chef In Charge",
      "Chef",
      "ExecutiveChef",
      "HeadChef",
      "Head Chef",
    ],
    eventManager: [
      "EventManager",
      "Event Manager",
      "FunctionCoordinator",
      "Coordinator",
      "Planner",
    ],
    externalId: [
      "EventCode",
      "Event Code",
      "BookingId",
      "Booking ID",
      "FunctionId",
      "EventId",
      "ID",
      "Id",
    ],
    revenue: [
      "EstimatedRevenue",
      "Estimated Revenue",
      "TotalRevenue",
      "Total Revenue",
      "FunctionRevenue",
      "Revenue",
      "TotalValue",
    ],
  };

  verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string,
  ): boolean {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    return expected === signature.replace(/^sha256=/, "");
  }

  parseWebhookPayload(
    _headers: Record<string, string>,
    body: unknown,
  ): WebhookParseResult | null {
    if (!body || typeof body !== "object") return null;
    const rows: RawEventRow[] = Array.isArray(body)
      ? body
      : [body as RawEventRow];
    return { rows, errors: [] };
  }
}

export const momentsConnector = new MomentsConnector();
