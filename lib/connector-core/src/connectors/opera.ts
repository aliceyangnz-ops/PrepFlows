/**
 * Oracle Opera connector.
 *
 * Opera PMS / OHIP (Oracle Hospitality Integration Platform).
 * Field names cover Opera V5/Cloud export files, OHIP REST API responses,
 * and standard Opera Crystal/Excel reports.
 *
 * Note: Opera uses ALL_CAPS field names in exports; camelCase in the OHIP API.
 */

import type { ConnectorFieldMap, RawEventRow } from "../types.js";
import { BaseConnector, type WebhookParseResult } from "./base.js";

export class OperaConnector extends BaseConnector {
  readonly source = "opera" as const;
  readonly displayName = "Oracle Opera";
  readonly webhookSignatureHeader = "x-oracle-signature";

  readonly fieldMap: ConnectorFieldMap = {
    name: [
      "EVENT_NAME", "EventName", "DESCRIPTION", "Description",
      "FUNCTION_NAME", "FunctionName", "BOOKING_NAME", "BookingName",
      "EVENT_DESC", "Name",
    ],
    date: [
      "EVENT_DATE", "EventDate", "BEGIN_DATE", "BeginDate",
      "START_DATE", "StartDate", "FUNCTION_DATE", "FunctionDate",
      "ARRIVAL_DATE", "ArrivalDate", "Date",
    ],
    startTime: [
      "START_TIME", "StartTime", "BEGIN_TIME", "BeginTime",
      "EVENT_START_TIME", "EventStartTime", "TIME_FROM",
      "Start Time", "Begin Time",
    ],
    endTime: [
      "END_TIME", "EndTime", "FINISH_TIME", "FinishTime",
      "EVENT_END_TIME", "EventEndTime", "TIME_TO",
      "End Time", "Finish Time",
    ],
    venue: [
      "PROPERTY", "Property", "RESORT", "Resort",
      "HOTEL_CODE", "HotelCode", "HOTEL_NAME", "HotelName",
      "PROPERTY_NAME", "PropertyName",
    ],
    room: [
      "SPACE_CODE", "SpaceCode", "ROOM_CODE", "RoomCode",
      "FUNCTION_SPACE", "FunctionSpace", "SPACE_NAME", "SpaceName",
      "ROOM_NAME", "RoomName", "VENUE_CODE",
      "Space", "Room", "Function Space",
    ],
    floor: [
      "FLOOR", "Floor", "LEVEL", "Level",
      "BUILDING", "Building", "WING", "Wing",
    ],
    guestCount: [
      "ATTENDEES", "Attendees", "EXPECTED_ATT", "ExpectedAtt",
      "GUARANTEED", "Guaranteed", "PAX", "Pax",
      "EXPECTED_ATTENDANCE", "ExpectedAttendance",
      "NO_OF_ATTENDEES", "NumberOfAttendees",
      "Guest Count", "Attendee Count",
    ],
    confirmedCount: [
      "ACTUAL_ATTENDANCE", "ActualAttendance",
      "CONFIRMED_COUNT", "ConfirmedCount",
      "ACT_ATTENDEES", "ActAttendees",
    ],
    bookedBy: [
      "ACCOUNT_NAME", "AccountName", "COMPANY", "Company",
      "CLIENT_NAME", "ClientName", "ORGANISATION", "Organisation",
      "ORG_NAME", "OrgName", "Account",
    ],
    contactName: [
      "CONTACT_NAME", "ContactName", "BOOKER_NAME", "BookerName",
      "GUEST_NAME", "GuestName", "PRIMARY_CONTACT",
      "Contact Name",
    ],
    contactEmail: [
      "EMAIL", "Email", "CONTACT_EMAIL", "ContactEmail",
      "EMAIL_ADDRESS", "EmailAddress",
    ],
    contactPhone: [
      "PHONE", "Phone", "TELEPHONE", "Telephone",
      "CONTACT_PHONE", "ContactPhone", "MOBILE",
    ],
    eventType: [
      "EVENT_TYPE", "EventType", "CATEG_CODE", "CategCode",
      "CATEGORY", "Category", "FUNCTION_TYPE", "FunctionType",
      "EVENT_CATEG", "EventCategory", "Type",
    ],
    status: [
      "STATUS", "Status", "EVENT_STATUS", "EventStatus",
      "BOOKING_STATUS", "BookingStatus", "STATE",
    ],
    menu: [
      "MENU", "Menu", "MENU_CODE", "MenuCode",
      "FOOD_BEVERAGE", "FoodBeverage", "CATERING", "Catering",
      "MENU_DESCRIPTION", "MenuDescription",
    ],
    dietaryNotes: [
      "DIETARY_REQUIREMENTS", "DietaryRequirements",
      "SPECIAL_REQUIREMENTS", "SpecialRequirements",
      "DIETARY_NOTES", "DietaryNotes",
      "ALLERGIES", "Allergies",
      "Dietary", "Special Requirements",
    ],
    notes: [
      "NOTES", "Notes", "COMMENTS", "Comments",
      "INTERNAL_NOTES", "InternalNotes",
      "SPECIAL_INSTRUCTIONS", "SpecialInstructions",
      "REMARKS",
    ],
    chefInCharge: [
      "CHEF_IN_CHARGE", "ChefInCharge", "HEAD_CHEF", "HeadChef",
      "CHEF", "Chef",
      "Chef In Charge", "Head Chef",
    ],
    eventManager: [
      "EVENT_MANAGER", "EventManager", "COORDINATOR", "Coordinator",
      "CATERING_MANAGER", "CateringManager",
    ],
    externalId: [
      "BOOKING_ID", "BookingId", "EVENT_ID", "EventId",
      "RESERVATION_NO", "ReservationNo", "CONFIRMATION_NO",
      "ID", "Id",
    ],
    revenue: [
      "TOTAL_REVENUE", "TotalRevenue", "ESTIMATED_REVENUE", "EstimatedRevenue",
      "REVENUE", "Revenue", "TOTAL_VALUE", "TotalValue",
    ],
  };

  parseWebhookPayload(
    headers: Record<string, string>,
    body: unknown,
  ): WebhookParseResult | null {
    if (!body || typeof body !== "object") return null;
    // OHIP delivers events as: { events: [...] } or { data: { event: {} } }
    const b = body as Record<string, unknown>;
    const events =
      (b["events"] as RawEventRow[] | undefined) ??
      (b["data"] ? [b["data"] as RawEventRow] : [b as RawEventRow]);
    return { rows: events, errors: [] };
  }
}

export const operaConnector = new OperaConnector();
