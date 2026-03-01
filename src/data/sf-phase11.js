const sfPhase11 = {
  id: "phase-11",
  title: "Phase 11: Declarative Development & Flows",
  emoji: "🔄",
  description: "Master Salesforce Flows — Screen Flows, Record-Triggered Flows, Scheduled Flows, Auto-Launched Flows, subflows, Flow best practices, and the declarative-first development philosophy.",
  topics: [
    {
      id: "sf-flows-mastery",
      title: "Flows Architecture & Best Practices",
      explanation: `Salesforce's **declarative-first** philosophy means you should always consider Flow before writing Apex. Modern Flows are powerful enough for most business automation, and they're maintainable by admins — not just developers.

**Flow Types:**

1. **Screen Flow** — User-interactive wizards
   - Multi-step forms, guided processes
   - Input validation, conditional screens
   - Can include custom LWC components
   - Use for: application forms, guided data entry, wizards

2. **Record-Triggered Flow** — Replaces Process Builder & Workflow Rules
   - Fires on record create, update, delete
   - Before-save (fast, no DML needed) or After-save (for related records)
   - Replaces: Workflow Rules, Process Builder
   - Use for: field updates, related record creation, validation

3. **Schedule-Triggered Flow** — Runs at specific times
   - Cron-based scheduling (daily, weekly, etc.)
   - Processes batches of records
   - Use for: reminders, cleanup, periodic calculations

4. **Auto-Launched Flow (No Trigger)** — Called from Apex, other Flows
   - Invoked programmatically or from other automations
   - Can accept input/output variables
   - Use for: reusable sub-processes

5. **Platform Event-Triggered Flow** — React to events
   - Triggered by Platform Events
   - Each gets its own transaction
   - Use for: event-driven automation

**Flow vs Apex — when to use which:**
\`\`\`
Use Flow when:
  ✓ Business logic can change frequently (admin-maintainable)
  ✓ Simple field updates and record creation
  ✓ Screen-based user interactions
  ✓ The logic doesn't require complex collections or algorithms

Use Apex when:
  ✓ Complex business logic with multiple conditions
  ✓ Heavy data processing (10,000+ records)
  ✓ External API callouts with complex error handling
  ✓ Unit testing is critical (Flows are harder to unit test)
  ✓ Performance-sensitive operations
\`\`\`

**Before-Save vs After-Save Record-Triggered Flows:**
- **Before-Save:** Runs before the record is committed. Can modify the triggering record's fields directly WITHOUT DML (like a before trigger). Fastest option for simple field updates.
- **After-Save:** Runs after the record is committed. Has an Id. Can create/update related records. Can call Apex actions. More resource-intensive.

**Flow Best Practices:**
1. Use before-save flows for simple field updates (no DML cost)
2. Name elements descriptively (not "Decision1" — use "Check_If_High_Priority")
3. Use subflows for reusable logic
4. Bulkify by using collection variables, not individual operations
5. Document flow purpose and decisions with Description fields
6. Version control: export Flows as metadata in Git`,
      codeExample: `// Invocable Apex — Bridge between Flow and Apex

// 1. Invocable Method — Called from Flow
public class FlowActions {
    
    // Single action called from Flow
    @InvocableMethod(
        label='Send Custom Notification'
        description='Sends a custom notification to specified users'
        category='Notifications'
    )
    public static List<Result> sendNotification(List<Request> requests) {
        List<Result> results = new List<Result>();
        
        for (Request req : requests) {
            try {
                // Build notification
                Messaging.CustomNotification notification = new Messaging.CustomNotification();
                notification.setTitle(req.title);
                notification.setBody(req.body);
                notification.setNotificationTypeId(getNotificationTypeId());
                notification.setTargetId(req.targetRecordId);
                
                // Send to recipients
                notification.send(new Set<String>{req.recipientId});
                
                Result res = new Result();
                res.isSuccess = true;
                res.message = 'Notification sent successfully';
                results.add(res);
            } catch (Exception e) {
                Result res = new Result();
                res.isSuccess = false;
                res.message = e.getMessage();
                results.add(res);
            }
        }
        return results;
    }
    
    // Input parameters (from Flow)
    public class Request {
        @InvocableVariable(required=true label='Notification Title')
        public String title;
        
        @InvocableVariable(required=true label='Notification Body')
        public String body;
        
        @InvocableVariable(required=true label='Target Record ID')
        public Id targetRecordId;
        
        @InvocableVariable(required=true label='Recipient User ID')
        public Id recipientId;
    }
    
    // Output parameters (back to Flow)
    public class Result {
        @InvocableVariable(label='Success')
        public Boolean isSuccess;
        
        @InvocableVariable(label='Message')
        public String message;
    }
    
    private static Id getNotificationTypeId() {
        return [
            SELECT Id FROM CustomNotificationType
            WHERE DeveloperName = 'Custom_Alert' LIMIT 1
        ].Id;
    }
}

// 2. Invocable Method for complex calculations
public class FlowCalculations {
    
    @InvocableMethod(
        label='Calculate Revenue Forecast'
        description='Calculates revenue forecast based on pipeline'
        category='Calculations'
    )
    public static List<ForecastResult> calculateForecast(List<ForecastRequest> requests) {
        List<ForecastResult> results = new List<ForecastResult>();
        
        for (ForecastRequest req : requests) {
            // Complex calculation that would be painful in Flow
            List<Opportunity> pipeline = [
                SELECT Amount, Probability, StageName
                FROM Opportunity
                WHERE AccountId = :req.accountId
                AND IsClosed = false
                AND CloseDate <= :req.forecastEndDate
            ];
            
            Decimal weighted = 0;
            Decimal bestCase = 0;
            for (Opportunity opp : pipeline) {
                if (opp.Amount != null && opp.Probability != null) {
                    weighted += opp.Amount * (opp.Probability / 100);
                    bestCase += opp.Amount;
                }
            }
            
            ForecastResult result = new ForecastResult();
            result.weightedForecast = weighted;
            result.bestCaseForecast = bestCase;
            result.pipelineCount = pipeline.size();
            results.add(result);
        }
        return results;
    }
    
    public class ForecastRequest {
        @InvocableVariable(required=true label='Account ID')
        public Id accountId;
        
        @InvocableVariable(required=true label='Forecast End Date')
        public Date forecastEndDate;
    }
    
    public class ForecastResult {
        @InvocableVariable(label='Weighted Forecast')
        public Decimal weightedForecast;
        
        @InvocableVariable(label='Best Case Forecast')
        public Decimal bestCaseForecast;
        
        @InvocableVariable(label='Pipeline Count')
        public Integer pipelineCount;
    }
}

// 3. Custom Flow Screen Component (LWC)
// flowDataTable.js — Custom LWC for use in Screen Flows
// import { LightningElement, api } from 'lwc';
// export default class FlowDataTable extends LightningElement {
//     @api tableData;       // Input from Flow
//     @api selectedRecords;  // Output to Flow
//     
//     columns = [
//         { label: 'Name', fieldName: 'Name' },
//         { label: 'Industry', fieldName: 'Industry' },
//         { label: 'Revenue', fieldName: 'AnnualRevenue', type: 'currency' }
//     ];
//     
//     handleRowSelection(event) {
//         this.selectedRecords = event.detail.selectedRows;
//         // Dispatch FlowAttributeChangeEvent to update Flow variable
//         this.dispatchEvent(new FlowAttributeChangeEvent(
//             'selectedRecords', this.selectedRecords
//         ));
//     }
// }`,
      exercise: `**Flow Practice:**
1. Build a Screen Flow for employee onboarding that creates Account, Contact, and Case records
2. Create a Record-Triggered Flow (before-save) that sets default values on new Opportunities
3. Create a Record-Triggered Flow (after-save) that creates a Task when a Case is escalated
4. Build a Scheduled Flow that sends reminder emails for Opportunities closing in 7 days
5. Create an Invocable Apex method that performs a complex calculation and call it from a Flow
6. Build a subflow for address validation and use it in 3 different parent Flows
7. Create a Platform Event-Triggered Flow that processes incoming order events
8. Build a custom LWC Screen Component for use in a Screen Flow (e.g., data table selector)
9. Design a Flow that replaces an existing Process Builder + Workflow Rule combination
10. Document all Flows in your org and identify which could be consolidated`,
      commonMistakes: [
        "Using after-save for simple field updates — before-save flows don't need DML and are much more efficient. Use after-save only when you need to create/update related records",
        "Not bulkifying Flows — Flows that process records individually (no collection variables) fail or hit limits with bulk data operations",
        "Creating multiple Record-Triggered Flows on the same object — combine them into one Flow with Decision elements. Salesforce evaluates order but it can be unpredictable",
        "Not testing Flows with bulk data — use Data Loader to insert 200 records and verify the Flow handles them without errors",
        "Building complex algorithms in Flow — if the logic requires nested loops, complex math, or map lookups, use Invocable Apex instead"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When should you use Flow vs Apex? Give specific examples.",
          a: "**Flow:** (1) Simple field updates on save (before-save Flow — zero DML cost). (2) Screen-based wizards for data entry. (3) Scheduled reminders and notifications. (4) Business logic that admins need to modify without deployments. **Apex:** (1) Complex calculations with collections and algorithms. (2) External API callouts with error handling and retry. (3) Processing >10,000 records efficiently (Batch Apex). (4) Code that needs comprehensive unit testing. (5) Complex trigger logic with multiple objects and cascading updates. **Bridge:** Use Invocable Apex to combine Flow's declarative UI with Apex's processing power."
        },
        {
          type: "tricky",
          q: "What is the difference between before-save and after-save Record-Triggered Flows?",
          a: "**Before-save:** Runs BEFORE the record is committed to the database. The record does NOT have an Id (on create). You can modify the triggering record's fields directly — changes are saved automatically without DML (free!). Cannot create/update other records. **After-save:** Runs AFTER the record is committed. Record has an Id. Can create/update/delete related records (uses DML). Can call Apex actions, send emails, publish events. **Performance:** Before-save is much faster (no DML). Use it for: default values, field calculations, simple validation. Use after-save for: creating related records, sending notifications, external updates."
        }
      ]
    }
  ]
};

export default sfPhase11;
