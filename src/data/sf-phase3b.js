const sfPhase3b = [
  {
    id: "sf-triggers-deep-dive",
    title: "Triggers & Trigger Frameworks",
    explanation: `**Triggers** are the primary way to execute custom logic when records are created, updated, deleted, or undeleted. Mastering triggers — including when they fire, how to structure them, and how to prevent common pitfalls — is essential for every Salesforce developer.

**Trigger events:**
\`\`\`
before insert  — Before new records are saved (no Id yet)
before update  — Before changed records are saved
before delete  — Before records are deleted
after insert   — After new records are saved (Id available)
after update   — After changed records are saved
after delete   — After records are deleted
after undelete — After records are restored from Recycle Bin
\`\`\`

**Before vs After — when to use which:**
- **Before triggers:** Modify the record's own fields (no DML needed — changes are auto-saved). Validate records (use addError to block save).
- **After triggers:** Access the record's Id (available after save). Create/update RELATED records. Make callouts (with @future). Fire platform events.

**Trigger context variables:**
\`\`\`
Trigger.new       — List of new record versions (insert/update)
Trigger.old       — List of old record versions (update/delete)  
Trigger.newMap    — Map<Id, SObject> of new versions
Trigger.oldMap    — Map<Id, SObject> of old versions
Trigger.isInsert  — True during insert
Trigger.isUpdate  — True during update
Trigger.isDelete  — True during delete
Trigger.isBefore  — True during before events
Trigger.isAfter   — True during after events
Trigger.size      — Number of records in the batch
\`\`\`

**The one-trigger-per-object rule:**
In enterprise orgs, you should have exactly ONE trigger per object that delegates to a handler class. Multiple triggers on the same object lead to unpredictable execution order and debugging nightmares.

**Trigger frameworks** solve common problems:
1. **Single entry point** — One trigger per object
2. **Recursion prevention** — Stop infinite loops
3. **Bypass mechanism** — Skip triggers during data migration
4. **Testability** — Business logic is in classes, not triggers
5. **Separation of concerns** — Thin triggers, fat handlers`,
    codeExample: `// Complete Trigger Framework Implementation

// 1. ITriggerHandler Interface
public interface ITriggerHandler {
    void beforeInsert(List<SObject> newRecords);
    void beforeUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap);
    void beforeDelete(List<SObject> oldRecords);
    void afterInsert(List<SObject> newRecords);
    void afterUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap);
    void afterDelete(List<SObject> oldRecords);
    void afterUndelete(List<SObject> newRecords);
    Boolean isDisabled();
}

// 2. TriggerDispatcher — Routes trigger events to handlers
public class TriggerDispatcher {
    
    public static void run(ITriggerHandler handler) {
        // Check if handler is disabled (bypass)
        if (handler.isDisabled()) return;
        
        // Route to appropriate method
        if (Trigger.isBefore) {
            if (Trigger.isInsert) handler.beforeInsert(Trigger.new);
            if (Trigger.isUpdate) handler.beforeUpdate(Trigger.new, Trigger.oldMap);
            if (Trigger.isDelete) handler.beforeDelete(Trigger.old);
        }
        if (Trigger.isAfter) {
            if (Trigger.isInsert) handler.afterInsert(Trigger.new);
            if (Trigger.isUpdate) handler.afterUpdate(Trigger.new, Trigger.oldMap);
            if (Trigger.isDelete) handler.afterDelete(Trigger.old);
        }
    }
}

// 3. TriggerHandlerBase — Default (empty) implementations
public virtual class TriggerHandlerBase implements ITriggerHandler {
    // Bypass mechanism using Custom Metadata or static variable
    private static Set<String> disabledHandlers = new Set<String>();
    
    public static void disableHandler(String handlerName) {
        disabledHandlers.add(handlerName);
    }
    
    public static void enableHandler(String handlerName) {
        disabledHandlers.remove(handlerName);
    }
    
    public virtual Boolean isDisabled() {
        return disabledHandlers.contains(
            String.valueOf(this).split(':')[0]
        );
    }
    
    // Default empty implementations — override only what you need
    public virtual void beforeInsert(List<SObject> newRecords) {}
    public virtual void beforeUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap) {}
    public virtual void beforeDelete(List<SObject> oldRecords) {}
    public virtual void afterInsert(List<SObject> newRecords) {}
    public virtual void afterUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap) {}
    public virtual void afterDelete(List<SObject> oldRecords) {}
    public virtual void afterUndelete(List<SObject> newRecords) {}
}

// 4. Concrete Handler — Opportunity
public class OpportunityTriggerHandler extends TriggerHandlerBase {
    
    // Recursion guard
    private static Boolean hasRunAfterUpdate = false;
    
    public override void beforeInsert(List<SObject> newRecords) {
        List<Opportunity> opps = (List<Opportunity>) newRecords;
        OpportunityService.setDefaults(opps);
        OpportunityService.validateAmounts(opps);
    }
    
    public override void beforeUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap) {
        List<Opportunity> opps = (List<Opportunity>) newRecords;
        Map<Id, Opportunity> oldOpps = (Map<Id, Opportunity>) oldMap;
        OpportunityService.validateStageTransitions(opps, oldOpps);
    }
    
    public override void afterUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap) {
        if (hasRunAfterUpdate) return; // Prevent recursion
        hasRunAfterUpdate = true;
        
        List<Opportunity> opps = (List<Opportunity>) newRecords;
        Map<Id, Opportunity> oldOpps = (Map<Id, Opportunity>) oldMap;
        
        // Only process opportunities that changed stage
        List<Opportunity> stageChanged = new List<Opportunity>();
        for (Opportunity opp : opps) {
            if (opp.StageName != oldOpps.get(opp.Id).StageName) {
                stageChanged.add(opp);
            }
        }
        
        if (!stageChanged.isEmpty()) {
            OpportunityService.notifyStageChange(stageChanged);
            OpportunityService.updateAccountRevenue(stageChanged);
        }
    }
}

// 5. The Trigger (thin — just 1 line of logic)
// trigger OpportunityTrigger on Opportunity 
//     (before insert, before update, after insert, after update, after delete) {
//     TriggerDispatcher.run(new OpportunityTriggerHandler());
// }

// 6. Service Class — Reusable business logic
public class OpportunityService {
    
    public static void setDefaults(List<Opportunity> opps) {
        for (Opportunity opp : opps) {
            if (opp.StageName == null) opp.StageName = 'Prospecting';
            if (opp.CloseDate == null) opp.CloseDate = Date.today().addDays(90);
            if (opp.Probability == null) opp.Probability = 10;
        }
    }
    
    public static void validateAmounts(List<Opportunity> opps) {
        for (Opportunity opp : opps) {
            if (opp.Amount != null && opp.Amount < 0) {
                opp.Amount.addError('Opportunity amount cannot be negative');
            }
            if (opp.Amount != null && opp.Amount > 10000000) {
                opp.addError('Opportunities over $10M require VP approval');
            }
        }
    }
    
    public static void validateStageTransitions(
        List<Opportunity> newOpps, Map<Id, Opportunity> oldMap
    ) {
        // Prevent backward stage transitions
        Map<String, Integer> stageOrder = new Map<String, Integer>{
            'Prospecting' => 1, 'Qualification' => 2,
            'Needs Analysis' => 3, 'Proposal' => 4,
            'Negotiation' => 5, 'Closed Won' => 6, 'Closed Lost' => 6
        };
        
        for (Opportunity opp : newOpps) {
            Opportunity oldOpp = oldMap.get(opp.Id);
            Integer newOrder = stageOrder.get(opp.StageName);
            Integer oldOrder = stageOrder.get(oldOpp.StageName);
            
            if (newOrder != null && oldOrder != null && newOrder < oldOrder) {
                if (oldOpp.StageName != 'Closed Won' && oldOpp.StageName != 'Closed Lost') {
                    opp.addError('Cannot move stage backward from ' + 
                        oldOpp.StageName + ' to ' + opp.StageName);
                }
            }
        }
    }
    
    public static void notifyStageChange(List<Opportunity> changedOpps) {
        // Create tasks for sales managers
        List<Task> notifications = new List<Task>();
        for (Opportunity opp : changedOpps) {
            notifications.add(new Task(
                WhatId = opp.Id,
                Subject = 'Opportunity stage changed to: ' + opp.StageName,
                OwnerId = opp.OwnerId,
                ActivityDate = Date.today(),
                Priority = opp.Amount > 100000 ? 'High' : 'Normal'
            ));
        }
        if (!notifications.isEmpty()) insert notifications;
    }
    
    public static void updateAccountRevenue(List<Opportunity> opps) {
        // Delegate to Queueable if complex
        Set<Id> accountIds = new Set<Id>();
        for (Opportunity opp : opps) {
            if (opp.AccountId != null) accountIds.add(opp.AccountId);
        }
        if (!accountIds.isEmpty()) {
            System.enqueueJob(new AccountRevenueCalculator(accountIds));
        }
    }
}`,
    exercise: `**Trigger Framework Practice:**
1. Implement the complete trigger framework (interface, dispatcher, base class) from scratch
2. Create a concrete handler for the Account object that validates, sets defaults, and updates related records
3. Add a bypass mechanism using Custom Metadata Type (Trigger_Setting__mdt) instead of static variables
4. Write comprehensive test classes for your trigger handler covering all 7 trigger events
5. Implement a recursion guard that prevents infinite trigger loops
6. Build a trigger handler that tracks field changes: "which fields changed and what were the old values?"
7. Create a trigger on Case that automatically escalates based on Priority and Age
8. Test your framework with a Data Loader operation of 1000 records
9. Add logging to your framework that records which handlers executed and how long each took
10. Implement a before-trigger that prevents deletion of records with specific criteria`,
    commonMistakes: [
      "Having multiple triggers on the same object — execution order is NOT guaranteed. Use one trigger per object with a handler framework",
      "Putting business logic directly in the trigger file — logic should be in handler/service classes for testability and reusability",
      "Not handling recursion — trigger A updates object B, trigger B updates object A → infinite loop → governor limit exception",
      "Modifying Trigger.new records in after triggers — after triggers have read-only records. Use before triggers to modify the triggering record's fields",
      "Not checking which fields changed in update triggers — processing ALL updated records when only a subset actually changed wastes resources"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is the difference between before and after triggers? When would you use each?",
        a: "**Before triggers:** Execute before the record is saved to the database. (1) The record does NOT have an Id yet (on insert). (2) You can modify the record's fields directly (no DML needed). (3) Use for: validation, setting default values, modifying fields. **After triggers:** Execute after the record is saved. (1) The record has an Id. (2) Records are read-only — you cannot modify them. (3) Use for: creating/updating related records, making callouts (@future), firing platform events. (4) Use for: any operation that needs the record's Id."
      },
      {
        type: "scenario",
        q: "You have a trigger that works fine for single record saves but fails with 'Too many SOQL queries' during Data Loader imports. What's wrong?",
        a: "The trigger has a SOQL query inside a for-each loop over Trigger.new. With single record saves, it executes 1 query. With Data Loader (200 records per batch), it executes 200 queries. **Fix:** (1) Move the SOQL query OUTSIDE the loop. (2) Collect all needed IDs in a Set from Trigger.new. (3) Execute ONE query with WHERE Id IN :ids. (4) Build a Map from the results. (5) Use the Map inside the loop for O(1) lookups. This reduces 200 queries to 1, regardless of batch size."
      },
      {
        type: "tricky",
        q: "Why should you have only one trigger per object in Salesforce?",
        a: "When multiple triggers exist on the same object, Salesforce does NOT guarantee their execution order. This creates: (1) **Unpredictable behavior** — the same data might produce different results depending on which trigger runs first. (2) **Debugging nightmares** — you can't reproduce issues consistently. (3) **Shared governor limits** — all triggers share the same transaction limits, and you can't control which trigger consumes resources first. **Solution:** One trigger per object that delegates to a handler class. The handler can call multiple service classes in a deterministic order."
      }
    ]
  },
  {
    id: "sf-async-apex",
    title: "Asynchronous Apex: Future, Queueable, Batch, Schedulable",
    explanation: `**Asynchronous Apex** allows you to run code outside the current transaction, giving you higher governor limits and the ability to perform long-running operations. Understanding when to use each async pattern is a key senior-level skill.

**The four async patterns:**

1. **@future Methods** — Simplest async pattern
   - Static method with @future annotation
   - Runs in its own transaction with higher limits
   - Cannot chain (no future from future)
   - Cannot track execution status
   - Parameters must be primitive types (no SObjects)
   - Use for: simple callouts, quick fire-and-forget operations

2. **Queueable Apex** — Enhanced @future
   - Implements Queueable interface
   - CAN use non-primitive parameters (SObjects, custom types)
   - CAN chain jobs (one Queueable can enqueue another)
   - CAN track via AsyncApexJob
   - Returns a Job ID for monitoring
   - Use for: complex async operations, sequenced processing

3. **Batch Apex** — For processing large data volumes
   - Implements Database.Batchable<SObject>
   - Processes records in configurable chunks (scope size, default 200)
   - Each chunk gets its own governor limits
   - Three phases: start() → execute() × N → finish()
   - Can process millions of records
   - Use for: data cleanup, mass updates, nightly jobs

4. **Schedulable Apex** — Cron-based scheduling
   - Implements Schedulable interface
   - Runs at specified times (cron expression)
   - Often combined with Batch Apex
   - Use for: nightly data processing, periodic cleanup, scheduled reports

**Comparison:**
\`\`\`
Pattern      | Max Params  | Chaining  | Monitoring | Use Case
-------------|-------------|-----------|------------|-------------------
@future      | Primitives  | No        | Limited    | Simple callouts
Queueable    | Any type    | Yes (1)   | Job ID     | Complex async
Batch        | Query/List  | Chain in  | Job ID     | Large volumes
             |            | finish()  |            |
Schedulable  | N/A         | Starts    | Job ID     | Recurring jobs
             |            | other jobs|            |
\`\`\``,
    codeExample: `// Asynchronous Apex — All Four Patterns

// 1. @future — Simple async execution
public class FutureExample {
    
    // Basic @future method
    @future
    public static void updateAccountDescription(Set<Id> accountIds) {
        List<Account> accounts = [
            SELECT Id, Description FROM Account WHERE Id IN :accountIds
        ];
        for (Account acc : accounts) {
            acc.Description = 'Updated async at ' + Datetime.now();
        }
        update accounts;
    }
    
    // @future with callout
    @future(callout=true)
    public static void syncToExternalSystem(Set<Id> accountIds) {
        List<Account> accounts = [
            SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds
        ];
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ExternalCRM/api/accounts');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(accounts));
        
        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            // Log error — can't throw exception back to caller
            System.debug(LoggingLevel.ERROR, 'Sync failed: ' + res.getBody());
        }
    }
}

// 2. Queueable — Advanced async with chaining
public class QueueableExample implements Queueable, Database.AllowsCallouts {
    
    private List<Account> accounts;
    private Integer chainDepth;
    
    public QueueableExample(List<Account> accounts, Integer depth) {
        this.accounts = accounts;
        this.chainDepth = depth;
    }
    
    public void execute(QueueableContext context) {
        // Process current batch
        for (Account acc : accounts) {
            acc.Description = 'Processed by Queueable - Depth: ' + chainDepth;
        }
        update accounts;
        
        // Chain to next job if more work remains
        if (chainDepth < 5) { // Max 5 chains in production
            List<Account> nextBatch = [
                SELECT Id, Description FROM Account 
                WHERE Description = null 
                LIMIT 200
            ];
            
            if (!nextBatch.isEmpty()) {
                System.enqueueJob(
                    new QueueableExample(nextBatch, chainDepth + 1)
                );
            }
        }
    }
}

// Usage:
// Id jobId = System.enqueueJob(new QueueableExample(accounts, 1));
// AsyncApexJob job = [SELECT Status FROM AsyncApexJob WHERE Id = :jobId];

// 3. Batch Apex — Large volume processing
public class AccountCleanupBatch implements 
    Database.Batchable<SObject>, 
    Database.Stateful,
    Database.AllowsCallouts {
    
    // Stateful — instance variables persist across execute() calls
    private Integer recordsProcessed = 0;
    private Integer errorCount = 0;
    private List<String> errors = new List<String>();
    
    // START — Define the data to process
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name, Industry, LastModifiedDate, 
                   AnnualRevenue, Description
            FROM Account
            WHERE LastModifiedDate < LAST_N_DAYS:365
            AND Industry = null
        ]);
        // Can return up to 50 MILLION records
    }
    
    // EXECUTE — Process each chunk (default 200 records)
    public void execute(Database.BatchableContext bc, List<Account> scope) {
        List<Account> toUpdate = new List<Account>();
        
        for (Account acc : scope) {
            try {
                acc.Industry = 'Other';
                acc.Description = 'Auto-classified on ' + Date.today();
                toUpdate.add(acc);
            } catch (Exception e) {
                errorCount++;
                errors.add(acc.Name + ': ' + e.getMessage());
            }
        }
        
        Database.SaveResult[] results = Database.update(toUpdate, false);
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                recordsProcessed++;
            } else {
                errorCount++;
            }
        }
    }
    
    // FINISH — Post-processing (send notification, chain next batch)
    public void finish(Database.BatchableContext bc) {
        // Send completion notification
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new List<String>{'admin@company.com'});
        mail.setSubject('Account Cleanup Batch Complete');
        mail.setPlainTextBody(
            'Records processed: ' + recordsProcessed + '\\n' +
            'Errors: ' + errorCount + '\\n' +
            'Error details: ' + String.join(errors, '\\n')
        );
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
        
        // Chain another batch if needed
        // Database.executeBatch(new NextBatchJob(), 200);
    }
}

// Execute batch:
// Id batchId = Database.executeBatch(new AccountCleanupBatch(), 200);
// // Monitor:
// AsyncApexJob job = [
//     SELECT Status, NumberOfErrors, JobItemsProcessed, TotalJobItems
//     FROM AsyncApexJob WHERE Id = :batchId
// ];

// 4. Schedulable — Run at specific times
public class WeeklyCleanupScheduler implements Schedulable {
    
    public void execute(SchedulableContext sc) {
        // Launch a batch job
        Database.executeBatch(new AccountCleanupBatch(), 200);
    }
}

// Schedule via code:
// String cronExp = '0 0 2 ? * SAT'; // Every Saturday at 2 AM
// System.schedule('Weekly Account Cleanup', cronExp, new WeeklyCleanupScheduler());

// Schedule via Anonymous Apex:
// WeeklyCleanupScheduler scheduler = new WeeklyCleanupScheduler();
// String sch = '0 0 0 * * ?'; // Every day at midnight
// System.schedule('Daily Cleanup', sch, scheduler);

// CRON Expression format:
// Seconds Minutes Hours Day_of_month Month Day_of_week Optional_year
// 0       0       2     ?              *     SAT         = Every Saturday at 2:00 AM`,
    exercise: `**Async Apex Practice:**
1. Write a @future method that makes a callout to an external API and logs the response
2. Build a Queueable job that processes records in batches with chaining (max 5 chains)
3. Create a Batch Apex job that cleans up old records across 3 objects (use Database.Stateful to track counts)
4. Write a Schedulable class that triggers a Batch job every Sunday at 3 AM
5. Implement a Queueable job with error handling that retries failed operations
6. Create a batch job that makes callouts for each record (requires Database.AllowsCallouts)
7. Write a test class for a Batch Apex job using Test.startTest() and Test.stopTest()
8. Build a monitoring dashboard that shows the status of all AsyncApexJobs
9. Implement a chained processing pipeline: Schedulable → Batch → Queueable → @future
10. Design a retry framework using Platform Events and Queueable Apex`,
    commonMistakes: [
      "@future methods cannot accept SObject parameters — only primitives (Integer, String, Set<Id>, List<String>). Pass IDs and re-query inside the method",
      "Chaining Queueable from Queueable is limited to 1 child job in production (but unlimited in tests). For complex chains, use Batch Apex or Platform Events",
      "Not using Database.Stateful in Batch — without it, instance variables are reset between execute() chunks. Your counters will be wrong",
      "Testing async code without Test.startTest()/Test.stopTest() — async code doesn't execute in tests without these boundaries",
      "Scheduling too many concurrent Batch jobs — the limit is 5 concurrent batch jobs. Additional jobs queue but may delay processing"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What are the four types of asynchronous Apex and when would you use each?",
        a: "**@future** — Simplest. Fire-and-forget, primitive params only, no chaining. Use for simple callouts from triggers. **Queueable** — Enhanced @future. Accepts complex params, supports chaining, returns Job ID. Use for complex async logic needing monitoring. **Batch** — For large volumes (millions of records). Processes in chunks with separate governor limits per chunk. Use for mass updates, data migrations, nightly processing. **Schedulable** — Cron-based scheduling. Typically launches Batch or Queueable jobs. Use for recurring scheduled operations. **Decision tree:** Simple callout? → @future. Complex logic? → Queueable. Large data volume? → Batch. Recurring schedule? → Schedulable."
      },
      {
        type: "tricky",
        q: "What is Database.Stateful and why would you use it in Batch Apex?",
        a: "By default, Batch Apex is **stateless** — instance variables are reset between each execute() chunk. Each chunk gets a fresh instance. **Database.Stateful** preserves instance variable values across all execute() invocations. **Use case:** Tracking cumulative counts (total processed, total errors), building a summary report in finish(), accumulating IDs for post-processing. **Warning:** Stateful increases memory usage because the entire object is serialized/deserialized between chunks. Keep stateful variables small — don't store entire SObject lists."
      },
      {
        type: "coding",
        q: "Write a Batch Apex class that deactivates all Contacts not modified in the last year.",
        a: "```apex\npublic class DeactivateOldContacts implements Database.Batchable<SObject>, Database.Stateful {\n    public Integer deactivatedCount = 0;\n    \n    public Database.QueryLocator start(Database.BatchableContext bc) {\n        return Database.getQueryLocator([\n            SELECT Id, Active__c FROM Contact\n            WHERE LastModifiedDate < LAST_N_DAYS:365\n            AND Active__c = true\n        ]);\n    }\n    \n    public void execute(Database.BatchableContext bc, List<Contact> scope) {\n        for (Contact c : scope) {\n            c.Active__c = false;\n        }\n        update scope;\n        deactivatedCount += scope.size();\n    }\n    \n    public void finish(Database.BatchableContext bc) {\n        System.debug('Deactivated contacts: ' + deactivatedCount);\n    }\n}\n// Execute: Database.executeBatch(new DeactivateOldContacts(), 200);\n```"
      }
    ]
  },
  {
    id: "sf-platform-events",
    title: "Platform Events & Event-Driven Architecture",
    explanation: `**Platform Events** are Salesforce's implementation of an event-driven messaging system. They enable loosely coupled communication between components, orgs, and external systems.

**What Platform Events solve:**
1. **Decoupling** — Components communicate without direct dependencies
2. **Async processing** — Events are processed asynchronously
3. **Cross-boundary communication** — Salesforce to external, external to Salesforce
4. **Avoiding governor limits** — Each subscriber gets its own transaction
5. **Audit trail** — Events can be replayed (last 72 hours)

**Platform Events vs other messaging:**
\`\`\`
Platform Events   — Custom events you define. Publish/subscribe model.
Change Data Capture — Automatic events when records change (insert/update/delete/undelete).
Streaming API      — Push notifications for record changes (PushTopic, Generic Events).
Outbound Messaging — Legacy. Sends SOAP messages on workflow rules.
\`\`\`

**Key characteristics:**
- Events are published to Salesforce's event bus
- Multiple subscribers can listen to the same event
- Subscribers can be: Apex triggers, Flows, LWC, CometD clients (external)
- Events are fire-and-forget — the publisher doesn't know who subscribes
- Events persist for 72 hours (replayable)
- Each event trigger gets its own governor limits

**Change Data Capture (CDC):**
Automatically publishes events when standard or custom object records are created, updated, deleted, or undeleted. You don't write publish code — just subscribe.

CDC vs Platform Events:
- CDC: Automatic, captures ALL changes to subscribed objects
- Platform Events: Manual publish, custom payloads, semantic meaning

**When to use Platform Events:**
- Integration: Decouple Salesforce from external systems
- Complex automations: Break governor limit chains
- Audit/logging: Record events without blocking the main transaction
- Cross-org communication: Publish events to external subscribers via CometD`,
    codeExample: `// Platform Events — Complete Implementation

// 1. Publishing Platform Events
public class EventPublisher {
    
    // Publish a single event
    public static void publishOrderEvent(Order__c order) {
        Order_Event__e event = new Order_Event__e(
            Order_Id__c = order.Id,
            Account_Id__c = order.Account__c,
            Total_Amount__c = order.Total_Amount__c,
            Status__c = order.Status__c,
            Event_Type__c = 'ORDER_CREATED'
        );
        
        Database.SaveResult sr = EventBus.publish(event);
        if (!sr.isSuccess()) {
            for (Database.Error err : sr.getErrors()) {
                System.debug('Event publish error: ' + err.getMessage());
            }
        }
    }
    
    // Publish multiple events (bulk)
    public static void publishBulkEvents(List<Order__c> orders) {
        List<Order_Event__e> events = new List<Order_Event__e>();
        
        for (Order__c order : orders) {
            events.add(new Order_Event__e(
                Order_Id__c = order.Id,
                Account_Id__c = order.Account__c,
                Total_Amount__c = order.Total_Amount__c,
                Status__c = order.Status__c,
                Event_Type__c = 'ORDER_UPDATED'
            ));
        }
        
        List<Database.SaveResult> results = EventBus.publish(events);
        
        Integer successCount = 0;
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) successCount++;
        }
        System.debug('Published ' + successCount + '/' + events.size() + ' events');
    }
    
    // Publish from a trigger (decouple processing)
    public static void publishFromTrigger(List<Case> cases) {
        List<Case_Escalation__e> events = new List<Case_Escalation__e>();
        
        for (Case c : cases) {
            if (c.Priority == 'High' && c.Status == 'Escalated') {
                events.add(new Case_Escalation__e(
                    Case_Id__c = c.Id,
                    Priority__c = c.Priority,
                    Account_Id__c = c.AccountId,
                    Escalation_Reason__c = c.Reason
                ));
            }
        }
        
        if (!events.isEmpty()) {
            EventBus.publish(events);
        }
    }
}

// 2. Subscribing to Platform Events (Apex Trigger)
// trigger OrderEventTrigger on Order_Event__e (after insert) {
//     OrderEventHandler.handleEvents(Trigger.new);
// }

public class OrderEventHandler {
    
    public static void handleEvents(List<Order_Event__e> events) {
        List<Task> tasksToCreate = new List<Task>();
        Set<Id> accountIds = new Set<Id>();
        
        for (Order_Event__e event : events) {
            if (event.Event_Type__c == 'ORDER_CREATED' && 
                event.Total_Amount__c > 50000) {
                
                accountIds.add(event.Account_Id__c);
                
                tasksToCreate.add(new Task(
                    Subject = 'Large order received: $' + event.Total_Amount__c,
                    WhatId = event.Order_Id__c,
                    Priority = 'High',
                    ActivityDate = Date.today()
                ));
            }
        }
        
        if (!tasksToCreate.isEmpty()) {
            // Assign tasks to account owners
            Map<Id, Account> accounts = new Map<Id, Account>(
                [SELECT Id, OwnerId FROM Account WHERE Id IN :accountIds]
            );
            
            for (Task t : tasksToCreate) {
                // ... assign owner
            }
            
            insert tasksToCreate;
        }
        
        // Set replay ID checkpoint for error recovery
        // EventBus.TriggerContext.currentContext().setResumeCheckpoint(
        //     events[events.size() - 1].ReplayId
        // );
    }
}

// 3. Change Data Capture — Subscribe to record changes
// trigger AccountChangeEventTrigger on AccountChangeEvent (after insert) {
//     AccountCDCHandler.handleChanges(Trigger.new);
// }

public class AccountCDCHandler {
    
    public static void handleChanges(List<AccountChangeEvent> changes) {
        for (AccountChangeEvent event : changes) {
            EventBus.ChangeEventHeader header = event.ChangeEventHeader;
            
            String changeType = header.getChangeType(); // CREATE, UPDATE, DELETE, UNDELETE
            List<String> changedFields = header.getChangedFields();
            List<String> recordIds = header.getRecordIds();
            
            System.debug('Change Type: ' + changeType);
            System.debug('Changed Fields: ' + changedFields);
            System.debug('Record IDs: ' + recordIds);
            
            if (changeType == 'UPDATE' && changedFields.contains('Industry')) {
                // React to Industry field changes
                // Sync to external system, update related records, etc.
            }
        }
    }
}`,
    exercise: `**Platform Events Practice:**
1. Create a custom Platform Event (Order_Event__e) with 5 fields representing an order
2. Write a publisher class that fires events from an Opportunity trigger when stage reaches 'Closed Won'
3. Create an Apex trigger subscriber that creates follow-up Tasks from the events
4. Subscribe to the event using Lightning Web Components (empApi)
5. Enable Change Data Capture for Account and Contact, write a subscriber trigger
6. Implement an event-driven integration: Salesforce publishes events, an external system subscribes via CometD
7. Build a retry mechanism using Platform Events — failed operations publish retry events
8. Create a real-time notification system using Platform Events and LWC
9. Design an event-driven architecture that breaks a complex automation into 3 separate event chains
10. Test Platform Events using Test.getEventBus().deliver() in unit tests`,
    commonMistakes: [
      "Assuming Platform Events are transactional — they are NOT rolled back if the publishing transaction fails AFTER the event is published (unless using setSavepoint before publish)",
      "Not setting resume checkpoints in event triggers — without checkpoints, missed events during failures cannot be replayed",
      "Publishing too many events in a single transaction — limit is 150,000 published events per hour per org",
      "Not handling event delivery failures — event triggers can fail and retry; use setResumeCheckpoint to avoid reprocessing",
      "Confusing Platform Events with Change Data Capture — Platform Events are custom with explicit publish; CDC is automatic for tracked object changes"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What are Platform Events and how do they differ from Change Data Capture?",
        a: "**Platform Events** are custom events you define (like custom objects but for messaging). You explicitly publish them via EventBus.publish(). They have custom fields with semantic meaning. Use for: cross-system integration, decoupling complex logic, custom business events. **Change Data Capture (CDC)** automatically publishes events when tracked objects change — CREATE, UPDATE, DELETE, UNDELETE. No publish code needed. CDC events contain the changed fields and their values. Use for: syncing record changes to external systems, real-time replication, audit trails. **Key difference:** Platform Events = you control what and when to publish. CDC = automatic capture of all record changes."
      },
      {
        type: "scenario",
        q: "How would you use Platform Events to decouple a complex trigger that's hitting governor limits?",
        a: "**Problem:** A trigger on Opportunity processes stages, creates tasks, updates accounts, sends notifications, and syncs to ERP — all sharing a single transaction's limits. **Solution:** (1) The Opportunity trigger publishes a Platform Event with essential data (OppId, AccountId, Amount, Stage). (2) An event trigger subscriber creates Tasks (separate transaction, separate limits). (3) Another subscriber updates Account revenue (separate transaction). (4) A Flow subscriber handles notifications. (5) An external subscriber (CometD) handles ERP sync. **Result:** The original trigger uses minimal limits (just one EventBus.publish). Each subscriber handles its own logic with its own governor limits."
      }
    ]
  },
  {
    id: "sf-test-classes",
    title: "Test Classes & Testing Strategy",
    explanation: `Salesforce requires a minimum of **75% code coverage** to deploy to production. But at the senior level, testing strategy goes far beyond coverage percentages — it's about verifying business logic, testing edge cases, and ensuring production reliability.

**Testing in Salesforce — key concepts:**
1. **@isTest annotation** — Marks a class or method as a test
2. **Test.startTest() / Test.stopTest()** — Resets governor limits for the code under test; also executes async code synchronously
3. **System.assert / assertEquals / assertNotEquals** — Verify expected outcomes
4. **@TestSetup** — Create test data once, available to all test methods in the class
5. **System.runAs()** — Execute code as a specific user (test security)
6. **Test.getStandardPricebookId()** — Access standard pricebook in tests
7. **HttpCalloutMock / WebServiceMock** — Mock external callouts

**Test data strategy:**
- NEVER rely on existing org data — tests must create their own data
- Use @TestSetup for shared test data across methods
- Build a TestDataFactory class for reusable record creation
- Use \`SeeAllData=false\` (default) — tests don't see org data
- Only use \`SeeAllData=true\` for specific edge cases (like testing with standard pricebooks)

**What to test:**
1. **Positive tests** — Does the feature work correctly with valid input?
2. **Negative tests** — Does it handle invalid input gracefully?
3. **Bulk tests** — Does it work with 200 records (trigger bulk)?
4. **Security tests** — Does it respect sharing and FLS?
5. **Edge cases** — Null values, empty lists, boundary conditions
6. **Permissions tests** — Does it work for different user profiles?

**Beyond 75% coverage:**
At the senior level, coverage percentage is not the goal — **behavioral verification** is. A test that inserts a record and asserts nothing is worthless even if it provides coverage. Every test should have meaningful assertions that verify business logic.`,
    codeExample: `// Testing Strategy — Enterprise Patterns

// 1. TestDataFactory — Reusable test data creation
@isTest
public class TestDataFactory {
    
    public static Account createAccount(String name) {
        return new Account(
            Name = name,
            Industry = 'Technology',
            BillingCity = 'San Francisco',
            BillingState = 'CA'
        );
    }
    
    public static List<Account> createAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(createAccount('Test Account ' + i));
        }
        return accounts;
    }
    
    public static Contact createContact(Id accountId) {
        return new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            AccountId = accountId,
            Email = 'test' + Crypto.getRandomInteger() + '@example.com'
        );
    }
    
    public static Opportunity createOpportunity(Id accountId, String stage) {
        return new Opportunity(
            Name = 'Test Opportunity',
            AccountId = accountId,
            StageName = stage,
            CloseDate = Date.today().addDays(30),
            Amount = 100000
        );
    }
    
    public static User createUser(String profileName) {
        Profile p = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1];
        String uniqueKey = EncodingUtil.convertToHex(
            Crypto.generateAESKey(128)
        ).substring(0, 8);
        
        return new User(
            FirstName = 'Test',
            LastName = 'User ' + uniqueKey,
            Email = uniqueKey + '@test.com',
            Username = uniqueKey + '@test.com.sandbox',
            ProfileId = p.Id,
            Alias = uniqueKey.substring(0, 5),
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US'
        );
    }
}

// 2. Comprehensive Test Class Example
@isTest
private class OpportunityServiceTest {
    
    @TestSetup
    static void setupTestData() {
        // Create shared test data — runs once for all test methods
        Account acc = TestDataFactory.createAccount('Test Corp');
        insert acc;
        
        List<Opportunity> opps = new List<Opportunity>();
        for (Integer i = 0; i < 5; i++) {
            opps.add(TestDataFactory.createOpportunity(acc.Id, 'Prospecting'));
        }
        insert opps;
    }
    
    // Positive test — normal flow
    @isTest
    static void testSetDefaults_setsCorrectValues() {
        List<Opportunity> opps = new List<Opportunity>{
            new Opportunity(Name = 'Test', CloseDate = Date.today())
        };
        
        Test.startTest();
        OpportunityService.setDefaults(opps);
        Test.stopTest();
        
        System.assertEquals('Prospecting', opps[0].StageName, 
            'Default stage should be Prospecting');
        System.assertEquals(10, opps[0].Probability, 
            'Default probability should be 10');
    }
    
    // Negative test — validation
    @isTest
    static void testValidateAmounts_rejectsNegative() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Opportunity opp = TestDataFactory.createOpportunity(acc.Id, 'Prospecting');
        opp.Amount = -5000;
        
        Test.startTest();
        Database.SaveResult sr = Database.insert(opp, false);
        Test.stopTest();
        
        System.assert(!sr.isSuccess(), 'Negative amount should be rejected');
    }
    
    // Bulk test — 200 records
    @isTest
    static void testBulkInsert_handlesMany() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        List<Opportunity> opps = new List<Opportunity>();
        for (Integer i = 0; i < 200; i++) {
            opps.add(TestDataFactory.createOpportunity(acc.Id, 'Prospecting'));
        }
        
        Test.startTest();
        insert opps; // Should trigger without governor limit exceptions
        Test.stopTest();
        
        System.assertEquals(200, [
            SELECT COUNT() FROM Opportunity 
            WHERE AccountId = :acc.Id AND StageName = 'Prospecting'
        ] - 5, 'All 200 records should be inserted'); // -5 from @TestSetup
    }
    
    // Security test — different user profile
    @isTest
    static void testWithStandardUser_respectsSharing() {
        User standardUser = TestDataFactory.createUser('Standard User');
        insert standardUser;
        
        System.runAs(standardUser) {
            Test.startTest();
            List<Account> visible = [SELECT Id FROM Account];
            Test.stopTest();
            
            // Standard user may not see all accounts depending on OWD
            System.assertNotEquals(null, visible, 
                'Query should execute without errors');
        }
    }
    
    // Mock callout test
    @isTest
    static void testExternalSync_handlesResponse() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        Test.startTest();
        // Call the method that makes a callout
        FutureExample.syncToExternalSystem(
            new Set<Id>{[SELECT Id FROM Account LIMIT 1].Id}
        );
        Test.stopTest();
        
        // Verify the callout was processed
        System.assert(true, 'Callout completed without errors');
    }
}

// 3. HTTP Callout Mock
@isTest
public class MockHttpResponse implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"status":"success","id":"ext-123"}');
        res.setStatusCode(200);
        return res;
    }
}

// 4. Testing Platform Events
@isTest
private class OrderEventTest {
    
    @isTest
    static void testEventPublish() {
        Order_Event__e event = new Order_Event__e(
            Order_Id__c = '001000000000001',
            Total_Amount__c = 75000,
            Event_Type__c = 'ORDER_CREATED'
        );
        
        Test.startTest();
        Database.SaveResult sr = EventBus.publish(event);
        Test.stopTest();
        
        System.assert(sr.isSuccess(), 'Event should publish successfully');
    }
    
    @isTest
    static void testEventSubscriber() {
        // Deliver events in test context
        Order_Event__e event = new Order_Event__e(
            Order_Id__c = '001000000000001',
            Total_Amount__c = 75000,
            Event_Type__c = 'ORDER_CREATED'
        );
        
        Test.startTest();
        EventBus.publish(event);
        Test.getEventBus().deliver(); // Force delivery in test
        Test.stopTest();
        
        // Verify subscriber created tasks
        List<Task> tasks = [SELECT Subject FROM Task WHERE Subject LIKE '%Large order%'];
        System.assert(tasks.size() > 0, 'Subscriber should create task for large orders');
    }
}`,
    exercise: `**Testing Practice:**
1. Create a TestDataFactory with methods for Account, Contact, Opportunity, Case, and User
2. Write a test class with @TestSetup that creates shared data for 5 test methods
3. Write a bulk test that inserts 200 records and verifies trigger behavior
4. Implement a mock HTTP callout and test a class that makes external API calls
5. Write negative test cases that verify exceptions are thrown for invalid input
6. Test a sharing scenario using System.runAs() with Standard User and Admin profiles
7. Write a test for a Batch Apex class — verify start(), execute(), and finish()
8. Test Platform Event publishing and subscriber behavior using Test.getEventBus().deliver()
9. Achieve 95%+ coverage for a complex trigger handler with all 7 trigger events
10. Write a test that verifies field-level security using Security.stripInaccessible()`,
    commonMistakes: [
      "Writing tests that only increase coverage without assertions — empty tests pass but don't verify anything",
      "Using SeeAllData=true when not needed — this makes tests dependent on org data and causes failures in different environments",
      "Not testing bulk scenarios (200 records) — code that works for 1 record may hit governor limits with 200",
      "Forgetting Test.startTest() and Test.stopTest() — async code won't execute without these, and governor limits won't reset",
      "Hard-coding record IDs in tests — IDs are different across orgs. Always create test data dynamically"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is the minimum code coverage required in Salesforce and why shouldn't you aim for just the minimum?",
        a: "**Minimum: 75%** overall Apex code coverage to deploy to production, with at least 1% for each individual class. **Why aim higher:** (1) 75% coverage doesn't guarantee business logic is correct — tests without assertions provide coverage but no validation. (2) Complex classes should have 90%+ coverage to catch edge cases. (3) Tests serve as documentation — they show HOW the code should behave. (4) Good tests catch regression bugs when code changes. (5) Senior developers focus on **behavioral testing**, not percentage: positive cases, negative cases, bulk, security, and edge cases."
      },
      {
        type: "tricky",
        q: "What does Test.startTest() and Test.stopTest() actually do?",
        a: "**Test.startTest():** (1) Resets all governor limits — the code between startTest/stopTest gets FRESH limits, separate from the test setup code. (2) Without this, your test data setup consumes limits that your actual code needs. **Test.stopTest():** (1) Forces all asynchronous code (@future, Queueable, Batch, Platform Events) to execute SYNCHRONOUSLY. Without stopTest(), async code never runs in tests. (2) Marks the end of the 'measured' section. You should do all assertions AFTER stopTest() to verify async results."
      },
      {
        type: "coding",
        q: "Write a test method that verifies a trigger rejects Accounts with duplicate names.",
        a: "```apex\n@isTest\nstatic void testDuplicateAccountRejected() {\n    // Create first account\n    Account acc1 = new Account(Name = 'Duplicate Corp');\n    insert acc1;\n    \n    // Try to create duplicate\n    Account acc2 = new Account(Name = 'Duplicate Corp');\n    \n    Test.startTest();\n    Database.SaveResult sr = Database.insert(acc2, false);\n    Test.stopTest();\n    \n    System.assert(!sr.isSuccess(), 'Duplicate account should be rejected');\n    System.assert(\n        sr.getErrors()[0].getMessage().contains('Duplicate'),\n        'Error message should mention duplicate:' + sr.getErrors()[0].getMessage()\n    );\n}\n```"
      }
    ]
  }
];

export default sfPhase3b;
