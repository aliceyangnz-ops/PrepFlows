/**
 * Priava connector.
 *
 * Priava is a cloud-based venue management platform used by arenas,
 * stadiums, convention centres and cultural venues.
 *
 * Field names cover:
 *  - Priava REST API (PascalCase JSON)
 *  - Priava export spreadsheets
 *  - Priava webhook payloads
 */

import type { ConnectorFieldMap, RawEventRow } from "../types.js";
import { BaseConnector, type WebhookParseResult } from "./base.js";

export class PriavaConnector extends BaseConnector {
  readonly source = "priava" as const;
  readonly displayName = "Priava";
  readonly webhookSignatureHeader = "x-priava-signature";

  readonly fieldMap: ConnectorFieldMap = {
    name: [
      "EventName",
      "Name",
      "BookingName",
      "FunctionName",
      "EventDescription",
      "Title",
      "Event Name",
      "Booking Name",
    ],
    date: [
      "EventDate",
      "BookingDate",
      "StartDate",
      "DateFrom",
      "EventStartDate",
      "Event Date",
      "Start Date",
    ],
    startTime: [
      "StartTime",
      "EventStartTime",
      "TimeFrom",
      "TimeStart",
      "BookingStartTime",
      "Start Time",
    ],
    endTime: [
      "EndTime",
      "EventEndTime",
      "TimeTo",
      "TimeEnd",
      "BookingEndTime",
      "End Time",
    ],
    venue: [
      "VenueName",
      "Venue",
      "FacilityName",
      "Facility",
      "BuildingName",
      "Property",
      "Venue Name",
      "Facility Name",
    ],
    room: [
      "SpaceName",
      "Space",
      "RoomName",
      "Room",
      "FunctionSpace",
      "AreaName",
      "Area",
      "Space Name",
      "Room Name",
    ],
    floor: ["FloorName", "Floor", "Level", "LevelName", "Zone", "Floor Name"],
    guestCount: [
      "GuestCount",
      "Attendees",
      "ExpectedAttendees",
      "PAX",
      "GuestsExpected",
      "Capacity",
      "NumberOfGuests",
      "Guest Count",
      "Attendee Count",
    ],
    confirmedCount: [
      "ConfirmedAttendees",
      "ActualAttendees",
      "GuaranteedCount",
      "Confirmed Count",
    ],
    bookedBy: [
      "OrganisationName",
      "ClientName",
      "CompanyName",
      "AccountName",
      "CustomerName",
      "Customer",
      "Organisation",
      "Client",
      "Company",
    ],
    contactName: [
      "ContactName",
      "PrimaryContact",
      "ContactFullName",
      "FirstName",
      "LastName",
      "Contact Name",
    ],
    contactEmail: ["ContactEmail", "Email", "EmailAddress", "Contact Email"],
    contactPhone: [
      "ContactPhone",
      "Phone",
      "PhoneNumber",
      "MobilePhone",
      "Telephone",
      "Mobile",
      "Contact Phone",
    ],
    eventType: [
      "EventType",
      "BookingType",
      "Category",
      "EventCategory",
      "FunctionType",
      "Type",
      "Event Type",
      "Category",
    ],
    status: ["Status", "EventStatus", "BookingStatus", "Stage"],
    menu: [
      "Menu",
      "MenuDescription",
      "CateringDetails",
      "FoodBeverage",
      "Package",
      "MenuPackage",
    ],
    dietaryNotes: [
      "DietaryRequirements",
      "DietaryNotes",
      "SpecialRequirements",
      "Allergies",
      "FoodAllergies",
      "DietaryRestrictions",
      "Dietary Requirements",
    ],
    notes: [
      "Notes",
      "Comments",
      "InternalNotes",
      "SpecialInstructions",
      "EventNotes",
      "Remarks",
    ],
    chefInCharge: [
      "ChefInCharge",
      "HeadChef",
      "Chef",
      "ExecutiveChef",
      "Chef In Charge",
    ],
    eventManager: [
      "EventManager",
      "Coordinator",
      "EventCoordinator",
      "CateringManager",
      "VenueManager",
      "Event Manager",
    ],
    externalId: [
      "EventId",
      "BookingId",
      "ID",
      "Id",
      "ReferenceNumber",
      "ConfirmationNumber",
      "BookingReference",
      "ID",
      "Reference",
    ],
    revenue: [
      "TotalRevenue",
      "EstimatedRevenue",
      "RevenueTotal",
      "BookingValue",
      "TotalValue",
      "Revenue",
      "Total Revenue",
    ],
  };

  parseWebhookPayload(
    _headers: Record<string, string>,
    body: unknown,
  ): WebhookParseResult | null {
    if (!body || typeof body !== "object") return null;
    const b = body as Record<string, unknown>;
    // Priava: { EventData: {...} } or { Events: [...] }
    if (Array.isArray(b["Events"])) {
      return { rows: b["Events"] as RawEventRow[], errors: [] };
    }
    if (b["EventData"] && typeof b["EventData"] === "object") {
      return { rows: [b["EventData"] as RawEventRow], errors: [] };
    }
    return { rows: [b], errors: [] };
  }
}

export const priavaConnector = new PriavaConnector();
