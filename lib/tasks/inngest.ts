import { Inngest, EventSchemas } from "inngest";

type Events = {
  "health/sync.requested": {
    data: {
      userId: string;
      source: "google_fit" | "fitbit" | "apple_healthkit";
      forceRefresh?: boolean;
    };
  };
  "health/insights.generate": {
    data: {
      userId: string;
      period: "daily" | "weekly" | "monthly";
    };
  };
  "content/embedding.generate": {
    data: {
      contentId: string;
      text: string;
    };
  };
  "content/related.compute": {
    data: {
      contentId: string;
    };
  };
  "user/weekly-report": {
    data: {
      userId: string;
    };
  };
  "admin/cleanup.old-data": {
    data: {
      olderThan: string; // ISO date
    };
  };
};

export const inngest = new Inngest({
  id: "longevityverse",
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: process.env.INNGEST_EVENT_KEY,
});


