/**
 * Delphi (Amadeus Sales & Catering) connector.
 *
 * Delphi is a Salesforce-based S&C platform widely used in luxury hotels.
 * Field names cover Delphi FDC Salesforce custom objects, the Amadeus
 * Hospitality API, and the standard Delphi CSV/Excel export.
 */

import type { ConnectorFieldMap, RawEventRow } from "../types.js";
import { BaseConnector, type WebhookParseResult } from "./base.js";

export class DelphiConnector extends BaseConnector {
  readonly source = "delphi" as const;
  readonly displayName = "Delphi (Amadeus S&C)";
  readonly webhookSignatureHeader = "x-sfdc-signature";

  readonly fieldMap: ConnectorFieldMap = {
    name: [
      "Name",
      "Subject",
      "Booking_Name__c",
      "BookingName",
      "Event_Name__c",
      "EventName",
      "FunctionName",
      "Booking Name",
      "Event Name",
    ],
    date: [
      "Event_Date__c",
      "EventDate",
      "Start_Date__c",
      "StartDate",
      "Booking_Date__c",
      "Date__c",
      "ArrivalDate",
      "Arrival_Date__c",
      "Event Date",
      "Start Date",
    ],
    startTime: [
      "Start_Time__c",
      "StartTime",
      "Event_Start__c",
      "Function_Start_Time__c",
      "BookingStartTime",
      "Start Time",
      "Event Start",
    ],
    endTime: [
      "End_Time__c",
      "EndTime",
      "Event_End__c",
      "Function_End_Time__c",
      "BookingEndTime",
      "End Time",
      "Event End",
    ],
    venue: [
      "Hotel_Name__c",
      "Property__c",
      "HotelName",
      "PropertyName",
      "Venue__c",
      "Account.Name",
      "Hotel Name",
      "Property",
    ],
    room: [
      "Function_Space__c",
      "FunctionSpace",
      "Room__c",
      "RoomName",
      "Space__c",
      "SpaceName",
      "Ballroom__c",
      "Function Space",
      "Room",
      "Space",
    ],
    floor: ["Floor__c", "Level__c", "Building__c", "Wing__c", "Floor", "Level"],
    guestCount: [
      "Guest_Count__c",
      "GuestCount",
      "Expected_Attendance__c",
      "ExpectedAttendance",
      "PAX__c",
      "Pax__c",
      "Attendees__c",
      "Guest Count",
      "Expected Attendance",
      "PAX",
    ],
    confirmedCount: [
      "Guaranteed_Count__c",
      "GuaranteedCount",
      "Confirmed_Count__c",
      "Guaranteed Count",
    ],
    bookedBy: [
      "Account.Name",
      "Company__c",
      "AccountName",
      "Organisation__c",
      "Client_Name__c",
      "ClientName",
      "Account Name",
      "Company",
      "Client Name",
    ],
    contactName: [
      "Contact.Name",
      "ContactName",
      "Primary_Contact__c",
      "Contact_Name__c",
      "BillingContact",
      "Contact Name",
    ],
    contactEmail: [
      "Contact.Email",
      "ContactEmail",
      "Email__c",
      "Contact_Email__c",
      "BillingEmail",
      "Email",
    ],
    contactPhone: [
      "Contact.Phone",
      "ContactPhone",
      "Phone__c",
      "Contact_Phone__c",
      "MobilePhone",
      "Phone",
    ],
    eventType: [
      "Event_Type__c",
      "EventType",
      "Function_Type__c",
      "FunctionType",
      "Category__c",
      "Booking_Type__c",
      "Event Type",
      "Function Type",
    ],
    status: [
      "Stage",
      "StageName",
      "Status__c",
      "Booking_Status__c",
      "Status",
      "Booking Status",
    ],
    menu: [
      "Menu__c",
      "MenuDetails__c",
      "Food_Beverage__c",
      "CateringNotes__c",
      "Menu Description",
      "Menu",
      "Catering",
    ],
    dietaryNotes: [
      "Dietary_Requirements__c",
      "DietaryRequirements",
      "Dietary_Notes__c",
      "Special_Requirements__c",
      "Allergies__c",
      "Dietary Requirements",
      "Special Requirements",
    ],
    notes: [
      "Notes__c",
      "EventNotes",
      "Internal_Notes__c",
      "Comments__c",
      "SpecialInstructions",
      "Notes",
      "Comments",
    ],
    chefInCharge: [
      "Chef_In_Charge__c",
      "HeadChef__c",
      "Chef__c",
      "Chef In Charge",
      "Head Chef",
    ],
    eventManager: [
      "Event_Manager__c",
      "EventManager",
      "Coordinator__c",
      "CateringManager",
      "EventPlanner",
      "Event Manager",
      "Coordinator",
    ],
    externalId: [
      "Id",
      "BookingId__c",
      "Event_ID__c",
      "Opportunity_Id__c",
      "Booking ID",
      "Event ID",
    ],
    revenue: [
      "Amount",
      "Total_Revenue__c",
      "TotalRevenue",
      "Estimated_Revenue__c",
      "FoodBeverageRevenue",
      "Revenue",
      "Total Revenue",
    ],
  };

  parseWebhookPayload(
    _headers: Record<string, string>,
    body: unknown,
  ): WebhookParseResult | null {
    if (!body || typeof body !== "object") return null;
    // Salesforce Outbound Messages wrap records in a payload structure
    const b = body as Record<string, unknown>;
    const notifications = b["notifications"] ?? b["records"] ?? b;
    const rows: RawEventRow[] = Array.isArray(notifications)
      ? notifications
      : [b];
    return { rows, errors: [] };
  }
}

export const delphiConnector = new DelphiConnector();
