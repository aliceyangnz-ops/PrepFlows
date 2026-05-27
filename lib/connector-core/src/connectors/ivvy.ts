/**
 * iVvy connector.
 *
 * iVvy is a cloud-based venue & event management platform popular in
 * Australia, NZ, South-East Asia and the UK.
 *
 * Field names cover:
 *  - iVvy REST API v1 (camelCase JSON)
 *  - iVvy export spreadsheets
 *  - iVvy webhook payloads (type + data envelope)
 */

import { createHmac } from "node:crypto";
import type { ConnectorFieldMap, RawEventRow } from "../types.js";
import { BaseConnector, type WebhookParseResult } from "./base.js";

export class IvvyConnector extends BaseConnector {
  readonly source = "ivvy" as const;
  readonly displayName = "iVvy";
  readonly webhookSignatureHeader = "x-ivvy-signature";

  readonly fieldMap: ConnectorFieldMap = {
    name: [
      "name",
      "title",
      "bookingName",
      "eventName",
      "subject",
      "Name",
      "Title",
      "BookingName",
      "EventName",
    ],
    date: [
      "date",
      "startDate",
      "eventDate",
      "dateFrom",
      "bookingDate",
      "Start Date",
      "Event Date",
      "Date",
    ],
    startTime: [
      "startTime",
      "timeFrom",
      "eventStartTime",
      "bookingStartTime",
      "Start Time",
      "Time From",
    ],
    endTime: [
      "endTime",
      "timeTo",
      "eventEndTime",
      "bookingEndTime",
      "End Time",
      "Time To",
    ],
    venue: [
      "venueName",
      "venue",
      "property",
      "facilityName",
      "Venue Name",
      "Venue",
      "Property",
    ],
    room: [
      "room",
      "space",
      "functionSpace",
      "roomName",
      "spaceName",
      "venueSpace",
      "area",
      "Room",
      "Space",
      "Function Space",
    ],
    floor: ["floor", "level", "building", "wing", "Floor", "Level"],
    guestCount: [
      "guestCount",
      "attendees",
      "pax",
      "expectedAttendees",
      "guaranteedCount",
      "numberOfGuests",
      "numAttendees",
      "Guest Count",
      "Attendees",
      "PAX",
    ],
    confirmedCount: [
      "confirmedCount",
      "actualAttendees",
      "guaranteedAttendees",
    ],
    bookedBy: [
      "companyName",
      "company",
      "accountName",
      "clientName",
      "organisationName",
      "bookedBy",
      "Company",
      "Account",
      "Client",
    ],
    contactName: [
      "contactName",
      "contactFirstName",
      "contactLastName",
      "primaryContact",
      "bookerName",
      "Contact Name",
    ],
    contactEmail: ["contactEmail", "email", "emailAddress", "Email"],
    contactPhone: [
      "contactPhone",
      "phone",
      "phoneNumber",
      "mobile",
      "mobilePhone",
      "Phone",
      "Mobile",
    ],
    eventType: [
      "eventType",
      "type",
      "category",
      "bookingType",
      "functionType",
      "Event Type",
      "Type",
      "Category",
    ],
    status: ["status", "bookingStatus", "eventStatus", "stage", "Status"],
    menu: [
      "menu",
      "menuDetails",
      "foodBeverage",
      "cateringDetails",
      "menuDescription",
      "packages",
      "Menu",
    ],
    dietaryNotes: [
      "dietaryRequirements",
      "dietaryNotes",
      "specialRequirements",
      "allergies",
      "dietaryRestrictions",
      "Dietary Requirements",
    ],
    notes: [
      "notes",
      "comments",
      "internalNotes",
      "specialInstructions",
      "eventNotes",
      "additionalInfo",
      "Notes",
    ],
    chefInCharge: ["chefInCharge", "chef", "headChef", "Chef In Charge"],
    eventManager: [
      "eventManager",
      "coordinator",
      "eventCoordinator",
      "cateringManager",
      "planner",
      "Event Manager",
    ],
    externalId: [
      "id",
      "bookingId",
      "eventId",
      "code",
      "referenceCode",
      "ID",
      "Booking ID",
    ],
    revenue: [
      "totalRevenue",
      "estimatedRevenue",
      "revenue",
      "totalValue",
      "Revenue",
    ],
  };

  verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string,
  ): boolean {
    const expected = createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");
    return expected === signature;
  }

  parseWebhookPayload(
    _headers: Record<string, string>,
    body: unknown,
  ): WebhookParseResult | null {
    if (!body || typeof body !== "object") return null;
    const b = body as Record<string, unknown>;
    if (b["data"] && typeof b["data"] === "object") {
      return { rows: [b["data"] as RawEventRow], errors: [] };
    }
    if (Array.isArray(b["bookings"])) {
      return { rows: b["bookings"] as RawEventRow[], errors: [] };
    }
    return { rows: [b as RawEventRow], errors: [] };
  }
}

export const ivvyConnector = new IvvyConnector();
