<!-- 3e37ec6a-1742-4587-9c6a-094f50d04a9d ad49fe97-81dc-4f66-abdd-2455c11a5805 -->
# Integrate Advanced Analytics Engine

## 1. Infrastructure Setup

### Cache Manager (`lib/cache/cache-manager.ts`)

Create a unified cache manager wrapping the existing Upstash Redis implementation from `libs/planCache.ts`:

- Implement `cache.get()` method with callback support and TTL
- Support cache tags for organized invalidation
- Export singleton instance

### User Model Updates (`lib/db/models/User.ts`)

Add subscription fields to support revenue analytics:

```typescript
subscription?: {
  status: 'active' | 'canceled' | 'past_due';
  plan: string;
  amount: number;
  startDate: Date;
  endDate?: Date;
}
```

### UserEvent Model (`lib/db/models/UserEvent.ts`)

Create new model to track user actions:

- Fields: userId, eventType, timestamp, metadata
- Support events: signup, integration_connected, data_sync, score_viewed, article_read
- Compound indexes: userId + timestamp, eventType + timestamp

## 2. Analytics Engine

### Core Service (`lib/services/analytics-engine.ts`)

Implement the AnalyticsEngine class with methods:

- `getTimeSeries()` - Time series data with aggregation
- `cohortAnalysis()` - Weekly cohort retention tracking  
- `funnelAnalysis()` - User progression through signup → paid funnel
- `rfmSegmentation()` - RFM (Recency, Frequency, Monetary) user segmentation
- `churnPrediction()` - Identify at-risk subscribers
- `revenueAnalytics()` - MRR, ARR, growth rates
- `contentPerformance()` - Top content and category stats
- `userJourney()` - Chronological user event timeline

Key adaptations:

- Use existing User, HealthData, Content models
- Integrate with cache manager for performance
- Handle missing subscription data gracefully

## 3. API Endpoints

Create 7 new analytics endpoints in `/app/api/analytics/`:

### `/timeseries/route.ts`

- GET endpoint for time series health data
- Query params: startDate, endDate, granularity, userId
- Auth: require valid session
- Returns aggregated time series with statistics

### `/cohorts/route.ts`

- GET endpoint for cohort retention analysis
- Query params: cohortDate
- Auth: admin only
- Returns weekly retention data

### `/funnel/route.ts`

- GET endpoint for conversion funnel
- Query params: startDate, endDate
- Auth: admin only
- Returns funnel steps with conversion rates

### `/segments/route.ts`

- GET endpoint for RFM user segmentation
- Auth: admin only
- Returns user segments (Champions, Loyal, At Risk, etc.) with summary

### `/churn-risk/route.ts`

- GET endpoint for churn prediction
- Auth: admin only
- Returns at-risk users categorized by risk level (critical, high, medium)

### `/revenue/route.ts`

- GET endpoint for revenue analytics
- Query params: startDate, endDate
- Auth: admin only
- Returns MRR, ARR, ARPU, growth rates

### `/content/route.ts`

- GET endpoint for content performance
- Query params: startDate, endDate
- Auth: admin only (or allow users to see their own content)
- Returns top performing content and category statistics

## 4. Integration Points

- Import and use `connectDB` from `@/lib/db/mongodb`
- Import models from `@/lib/db/models/*`
- Use `getServerSession` from `next-auth` for authentication
- Follow existing API error handling patterns
- Cache analytics queries with appropriate TTLs (1-24 hours depending on volatility)

## Files to Create

1. `lib/cache/cache-manager.ts` - Unified cache wrapper
2. `lib/db/models/UserEvent.ts` - Event tracking model
3. `lib/services/analytics-engine.ts` - Core analytics service
4. `app/api/analytics/timeseries/route.ts` - Time series endpoint
5. `app/api/analytics/cohorts/route.ts` - Cohort analysis endpoint
6. `app/api/analytics/funnel/route.ts` - Funnel analysis endpoint
7. `app/api/analytics/segments/route.ts` - RFM segmentation endpoint
8. `app/api/analytics/churn-risk/route.ts` - Churn prediction endpoint
9. `app/api/analytics/revenue/route.ts` - Revenue analytics endpoint
10. `app/api/analytics/content/route.ts` - Content performance endpoint

## Files to Modify

1. `lib/db/models/User.ts` - Add subscription fields and indexes

### To-dos

- [ ] Create unified cache manager wrapping Redis with get/set/tags support
- [ ] Add subscription fields to User model with proper types and indexes
- [ ] Create UserEvent model for tracking user actions throughout the platform
- [ ] Implement AnalyticsEngine class with all 8 analytics methods
- [ ] Create timeseries API endpoint with authentication
- [ ] Create cohorts analysis API endpoint (admin only)
- [ ] Create funnel analysis API endpoint (admin only)
- [ ] Create RFM segmentation API endpoint (admin only)
- [ ] Create churn prediction API endpoint (admin only)
- [ ] Create revenue analytics API endpoint (admin only)
- [ ] Create content performance API endpoint