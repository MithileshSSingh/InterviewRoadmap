const sfPhase1 = {
  id: "phase-1",
  title: "Phase 1: Role Expectations & Career Path",
  emoji: "🎯",
  description: "Understand the Salesforce Developer → Senior Developer → Technical Architect career trajectory, interview structures, certification roadmap, and what differentiates each level.",
  topics: [
    {
      id: "sf-developer-responsibilities",
      title: "Salesforce Developer Responsibilities",
      explanation: `A **Salesforce Developer** is responsible for building and customizing solutions on the Salesforce platform using Apex, Visualforce, Lightning Web Components, and declarative tools.

**Core responsibilities:**
1. **Custom Development** — Write Apex classes, triggers, batch jobs, and Lightning Web Components
2. **Declarative Configuration** — Build flows, process builders, validation rules, and formula fields
3. **Data Management** — Design custom objects, relationships, and manage data migration
4. **Integration** — Connect Salesforce with external systems via REST/SOAP APIs
5. **Testing** — Write unit tests with ≥75% code coverage (platform requirement)
6. **Deployment** — Package and deploy changes using change sets, SFDX, or CI/CD pipelines

**Day-to-day work:**
- Translate business requirements into technical solutions on the Salesforce platform
- Collaborate with admins, architects, and business analysts
- Debug production issues using debug logs, SOQL queries, and the Developer Console
- Evaluate "clicks vs. code" — always prefer declarative solutions when possible
- Participate in code reviews and maintain coding standards

**Key technical skills expected:**
- Strong Apex programming (object-oriented, governor-limit-aware)
- SOQL/SOSL query mastery
- Lightning Web Components (LWC) for custom UI
- Understanding of Salesforce security model (OWD, profiles, sharing rules)
- Familiarity with Salesforce DX and version control

**What separates a good developer from a great one:**
A great Salesforce developer doesn't just write code — they understand the **platform philosophy**. Salesforce is metadata-driven and multi-tenant. Every line of code runs within governor limits. Great developers think in terms of **bulkification**, **security context**, and **declarative-first** design.

🏢 **Enterprise context:** In large organizations, Salesforce developers work on orgs with 500+ custom objects, millions of records, and complex automation chains. Understanding how your code fits into this bigger picture is essential.`,
      codeExample: `// A typical day for a Salesforce Developer — building a trigger
// that automatically assigns a Case to the right queue based on criteria

trigger CaseAssignment on Case (before insert, before update) {
    // Bulkified — handles single and bulk operations
    List<Case> casesToRoute = new List<Case>();
    
    for (Case c : Trigger.new) {
        if (c.Status == 'New' && c.Priority == 'High') {
            casesToRoute.add(c);
        }
    }
    
    if (!casesToRoute.isEmpty()) {
        // Query once outside the loop — governor-limit-aware
        Group escalationQueue = [
            SELECT Id FROM Group 
            WHERE Type = 'Queue' AND DeveloperName = 'Escalation_Queue'
            LIMIT 1
        ];
        
        for (Case c : casesToRoute) {
            c.OwnerId = escalationQueue.Id;
        }
    }
}

// Developer also writes the corresponding test class
@isTest
private class CaseAssignmentTest {
    @isTest
    static void testHighPriorityCaseAssignment() {
        // Create test data
        Case testCase = new Case(
            Subject = 'Test High Priority',
            Status = 'New',
            Priority = 'High'
        );
        
        Test.startTest();
        insert testCase;
        Test.stopTest();
        
        // Verify assignment
        Case result = [SELECT OwnerId FROM Case WHERE Id = :testCase.Id];
        // Assert the case was routed to the escalation queue
        System.assertNotEquals(UserInfo.getUserId(), result.OwnerId, 
            'High priority case should be reassigned to queue');
    }
}`,
      exercise: `**Self-Assessment Exercises:**
1. List 10 declarative tools in Salesforce and when you'd use each vs. writing code
2. Write a trigger that prevents duplicate Contact records based on Email
3. Build a Lightning Web Component that displays Account details with related Contacts
4. Create a batch Apex job that updates all Opportunities closing this month
5. Set up a connected app and make a REST API callout to an external service
6. Design a custom object model for a project management application
7. Write test classes achieving >90% coverage for a complex trigger
8. Debug a governor limit exception in a production debug log
9. Deploy a package of changes from sandbox to production using SFDX
10. List all governor limits you can name from memory`,
      commonMistakes: [
        "Writing SOQL queries or DML operations inside loops — leads to governor limit exceptions in production with bulk data",
        "Not understanding the difference between before and after triggers — before triggers modify records without DML, after triggers have record IDs",
        "Ignoring bulkification — code that works for 1 record fails when Data Loader inserts 200 records",
        "Choosing code over declarative solutions — always evaluate if a Flow, Validation Rule, or Formula can solve the problem first",
        "Not considering the security context — running SOQL 'with sharing' vs 'without sharing' has major implications"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does a typical day look like for a Salesforce Developer in an enterprise?",
          a: "A typical day involves: (1) Morning standup to review sprint tasks. (2) Developing Apex triggers, classes, or LWC components based on user stories. (3) Writing SOQL queries to investigate data issues. (4) Code reviews for team members' pull requests. (5) Writing unit tests (75%+ coverage required). (6) Collaborating with admins on declarative vs. code decisions. (7) Debugging production issues via debug logs. (8) Deploying changes through CI/CD or change sets. The key emphasis is on bulkified, governor-limit-aware code that follows Salesforce best practices."
        },
        {
          type: "conceptual",
          q: "When should you use declarative tools vs. writing Apex code?",
          a: "**Declarative first** is the Salesforce philosophy. Use declarative when: (1) Flows can handle the automation logic. (2) Validation rules can enforce data integrity. (3) Formula fields can compute derived values. (4) Process Builder (legacy) handles simple field updates. Use code when: (1) Complex business logic with conditional branching that Flows can't handle efficiently. (2) Integration callouts to external systems. (3) Complex data transformations across multiple objects. (4) Custom UI beyond standard Lightning components. (5) Performance-critical operations needing fine-tuned SOQL."
        },
        {
          type: "scenario",
          q: "You see a trigger with a SOQL query inside a for loop. What's the problem and how do you fix it?",
          a: "This is a **bulkification violation**. In a for loop iterating over Trigger.new (up to 200 records in a bulk operation), each iteration fires a SOQL query. With 200 records, that's 200 queries — exceeding the 100 SOQL query governor limit. **Fix:** Move the SOQL query outside the loop. Collect all needed IDs into a Set, query once with a WHERE IN clause, build a Map<Id, SObject> from results, then reference the map inside the loop. This pattern converts O(n) queries to O(1)."
        },
        {
          type: "tricky",
          q: "What are the top 5 governor limits every Salesforce developer must know?",
          a: "**Per-transaction limits:** (1) **100 SOQL queries** (synchronous) / 200 (asynchronous). (2) **150 DML statements** per transaction. (3) **10,000 DML rows** per transaction. (4) **50,000 SOQL rows** returned per transaction. (5) **10-second CPU time limit** (synchronous) / 60 seconds (async). Also critical: 100 callouts per transaction, 6MB heap size (sync) / 12MB (async), and 100 future method invocations per transaction."
        }
      ]
    },
    {
      id: "sf-senior-developer-expectations",
      title: "Senior Developer Differentiators",
      explanation: `A **Senior Salesforce Developer** goes beyond writing code — they make **architectural decisions**, mentor junior developers, and drive technical strategy across projects.

**What differentiates Senior from mid-level:**

1. **Architectural Thinking**
   - Designs solutions that scale across multiple orgs
   - Understands governor limits deeply and architects around them proactively
   - Makes "build vs. buy vs. configure" decisions for AppExchange packages
   - Designs integration patterns (point-to-point, hub-and-spoke, event-driven)

2. **Technical Leadership**
   - Leads code reviews and establishes coding standards
   - Mentors junior developers on Salesforce best practices
   - Creates reusable frameworks (trigger frameworks, service layers, utility classes)
   - Drives adoption of Salesforce DX, CI/CD, and DevOps practices

3. **Cross-Functional Collaboration**
   - Translates business requirements into scalable technical designs
   - Partners with Salesforce Architects on enterprise-level decisions
   - Works with admins to define the boundary between clicks and code
   - Collaborates with security teams on data access and compliance

4. **Production Mastery**
   - Owns incident response for Salesforce-related production issues
   - Performs root cause analysis on governor limit failures
   - Designs monitoring and alerting strategies for Apex jobs
   - Manages large data migrations (millions of records) without downtime

5. **Advanced Platform Knowledge**
   - Deep understanding of the Salesforce execution context (order of execution)
   - Platform event architecture for event-driven solutions
   - Shield encryption and compliance features
   - Multi-org strategies and data synchronization

**Interview expectations at Senior level:**
- You're expected to **drive the conversation**, not wait for prompts
- System design questions require **trade-off analysis**, not just solutions
- Code should demonstrate **framework-level thinking**, not one-off scripts
- You should articulate why you chose one approach over alternatives`,
      codeExample: `// Senior Developer builds reusable frameworks, not one-off triggers
// Example: A Trigger Framework that all triggers use

// 1. The TriggerHandler base class
public virtual class TriggerHandler {
    // Static map to prevent recursion
    private static Map<String, Boolean> hasRun = new Map<String, Boolean>();
    
    public void run() {
        String handlerName = String.valueOf(this).substring(0, String.valueOf(this).indexOf(':'));
        
        // Prevent recursive execution
        if (hasRun.containsKey(handlerName)) return;
        hasRun.put(handlerName, true);
        
        if (Trigger.isBefore) {
            if (Trigger.isInsert) beforeInsert(Trigger.new);
            if (Trigger.isUpdate) beforeUpdate(Trigger.new, Trigger.oldMap);
            if (Trigger.isDelete) beforeDelete(Trigger.old);
        }
        if (Trigger.isAfter) {
            if (Trigger.isInsert) afterInsert(Trigger.new);
            if (Trigger.isUpdate) afterUpdate(Trigger.new, Trigger.oldMap);
            if (Trigger.isDelete) afterDelete(Trigger.old);
        }
    }
    
    // Virtual methods — override only what you need
    protected virtual void beforeInsert(List<SObject> newRecords) {}
    protected virtual void beforeUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap) {}
    protected virtual void beforeDelete(List<SObject> oldRecords) {}
    protected virtual void afterInsert(List<SObject> newRecords) {}
    protected virtual void afterUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap) {}
    protected virtual void afterDelete(List<SObject> oldRecords) {}
}

// 2. Concrete handler for Account
public class AccountTriggerHandler extends TriggerHandler {
    protected override void beforeInsert(List<SObject> newRecords) {
        List<Account> accounts = (List<Account>) newRecords;
        AccountService.validateDuplicates(accounts);
        AccountService.setDefaults(accounts);
    }
    
    protected override void afterUpdate(List<SObject> newRecords, Map<Id, SObject> oldMap) {
        List<Account> accounts = (List<Account>) newRecords;
        Map<Id, Account> oldAccounts = (Map<Id, Account>) oldMap;
        AccountService.syncRelatedContacts(accounts, oldAccounts);
    }
}

// 3. Thin trigger (1 line — all logic in handler)
// trigger AccountTrigger on Account (before insert, before update, after update) {
//     new AccountTriggerHandler().run();
// }

// 4. Service layer — reusable business logic
public class AccountService {
    public static void validateDuplicates(List<Account> accounts) {
        Set<String> names = new Set<String>();
        for (Account a : accounts) {
            names.add(a.Name);
        }
        
        List<Account> existing = [
            SELECT Name FROM Account WHERE Name IN :names
        ];
        
        Set<String> existingNames = new Set<String>();
        for (Account a : existing) {
            existingNames.add(a.Name);
        }
        
        for (Account a : accounts) {
            if (existingNames.contains(a.Name)) {
                a.addError('Duplicate account name: ' + a.Name);
            }
        }
    }
    
    public static void setDefaults(List<Account> accounts) {
        for (Account a : accounts) {
            if (a.Industry == null) a.Industry = 'Other';
            if (a.Rating == null) a.Rating = 'Warm';
        }
    }
    
    public static void syncRelatedContacts(
        List<Account> newAccounts, Map<Id, Account> oldAccounts
    ) {
        // Sync mailing address changes to related contacts
        List<Contact> contactsToUpdate = new List<Contact>();
        Set<Id> changedAccountIds = new Set<Id>();
        
        for (Account a : newAccounts) {
            Account oldAcc = oldAccounts.get(a.Id);
            if (a.BillingCity != oldAcc.BillingCity || 
                a.BillingState != oldAcc.BillingState) {
                changedAccountIds.add(a.Id);
            }
        }
        
        if (!changedAccountIds.isEmpty()) {
            // Handle in async to avoid DML limits in complex transactions
            ContactSyncQueueable job = new ContactSyncQueueable(changedAccountIds);
            System.enqueueJob(job);
        }
    }
}`,
      exercise: `**Senior Developer Growth Exercises:**
1. Build a complete trigger framework from scratch with recursion prevention and bypass capability
2. Design a service layer pattern for a complex multi-object business process
3. Create a reusable error logging framework that captures Apex exceptions to a custom object
4. Architect a solution for syncing data between Salesforce and an ERP system
5. Write an RFC (Request for Comments) document proposing a major refactor of existing triggers
6. Design a governor limit monitoring dashboard using custom objects and scheduled jobs
7. Build a CI/CD pipeline using SFDX, Git, and GitHub Actions
8. Create coding standards documentation for your team
9. Design a multi-org data synchronization strategy using Platform Events
10. Lead a code review of a junior developer's trigger — write constructive feedback`,
      commonMistakes: [
        "Thinking 'senior' means just more years of experience — it's about architectural thinking, mentorship, and cross-team influence",
        "Not building reusable frameworks — writing one-off triggers for each object instead of a shared trigger framework",
        "Ignoring the declarative layer — senior developers should know when Flows are better than Apex, even if they prefer code",
        "Not considering the order of execution — triggers, flows, validation rules, and process builders all interact in a specific order",
        "Failing to mentor — senior developers who don't grow others are not demonstrating leadership"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What differentiates a Senior Salesforce Developer from a mid-level developer?",
          a: "**Senior-level signals:** (1) **Architectural ownership** — designs solutions across objects and systems, not just individual features. (2) **Framework thinking** — builds reusable trigger frameworks, service layers, and utility patterns. (3) **Governor limit mastery** — proactively designs around limits, not reactively debugging them. (4) **Technical leadership** — establishes coding standards, leads code reviews, mentors juniors. (5) **Cross-functional influence** — partners with architects and admins, translates business to technical. (6) **Production ownership** — owns incident response, root cause analysis, and monitoring."
        },
        {
          type: "scenario",
          q: "You inherit a Salesforce org with 47 individual triggers, no framework, and frequent governor limit failures. How do you approach this?",
          a: "**Phased approach:** (1) **Audit** — catalog all 47 triggers, identify which objects have multiple triggers (order of execution issue), document business logic. (2) **Framework** — implement a trigger handler framework (like the one shown) with recursion prevention and bypass switches. (3) **Prioritize** — start migrating triggers on objects with governor limit failures first. (4) **Service Layer** — extract business logic into service classes, triggers become thin dispatchers. (5) **Test Coverage** — write comprehensive tests for each migrated trigger. (6) **Deploy Incrementally** — migrate 3-5 triggers per sprint, validate in sandbox. (7) **Standards** — document the new pattern and train the team. Expected timeline: 2-3 months for a team of 3."
        },
        {
          type: "conceptual",
          q: "Explain the Salesforce Order of Execution for a record save.",
          a: "When a record is saved: (1) Load original record from database (updates). (2) Load new field values from request. (3) System validation rules (required fields, field types). (4) **Before triggers** execute. (5) Custom validation rules. (6) **Duplicate rules**. (7) Record saved to database (not committed). (8) **After triggers** execute. (9) Assignment rules. (10) Auto-response rules. (11) Workflow rules (legacy). (12) Flows (after-save). (13) Escalation rules. (14) Roll-up summary fields calculated. (15) **DML committed.** Understanding this is critical for debugging — validation errors after before-trigger changes, or re-triggered logic from workflow field updates."
        },
        {
          type: "tricky",
          q: "Why should you use 'with sharing' vs 'without sharing' in Apex classes?",
          a: "'**with sharing**' enforces the running user's record-level security (sharing rules, OWD, role hierarchy). '**without sharing**' runs in system context — the user can access all records. **Best practice:** Always use 'with sharing' by default for security. Use 'without sharing' only when you explicitly need system-level access (e.g., a utility class that counts all records for reporting). Classes that don't declare either inherit the sharing context of the calling class. **Critical in interviews:** If a trigger calls a class 'with sharing', SOQL queries in that class respect the running user's access, which can cause unexpected 'no records found' errors."
        }
      ]
    },
    {
      id: "sf-technical-architect-path",
      title: "Technical Architect Expectations",
      explanation: `A **Salesforce Technical Architect (TA)** is the most senior technical role in the Salesforce ecosystem. The TA owns the **end-to-end technical vision** for enterprise Salesforce implementations.

**What differentiates a Technical Architect from a Senior Developer:**

1. **Enterprise-Wide Vision**
   - Designs solutions spanning multiple Salesforce orgs and external systems
   - Makes build/buy/partner decisions for the entire platform
   - Owns the technical roadmap aligned with business strategy
   - Evaluates AppExchange packages vs. custom development at scale

2. **System Design Mastery**
   - Designs multi-org architectures (hub-and-spoke, federated)
   - Architects data models that scale to hundreds of millions of records
   - Designs integration patterns handling millions of daily transactions
   - Plans disaster recovery and business continuity for Salesforce

3. **Security & Compliance Architecture**
   - Designs organization-wide security models (OWD, sharing, encryption)
   - Architects for compliance (GDPR, HIPAA, SOX)
   - Implements field-level encryption strategies using Salesforce Shield
   - Reviews and approves security architecture for all customizations

4. **Stakeholder Leadership**
   - Presents technical strategies to C-level executives
   - Translates complex technical constraints into business impact language
   - Mediates between business desires and platform limitations
   - Champions platform best practices across the organization

5. **Interview Structure for Architects:**
   The CTA (Certified Technical Architect) board review is the most challenging Salesforce certification:
   - **Scenario Presentation** — Given a complex business scenario, design a complete solution
   - **Whiteboard Design** — Present your architecture to a panel of CTAs
   - **Deep-Dive Q&A** — Panel challenges every design decision
   - **Trade-off Defense** — Must articulate why alternatives were rejected
   - Duration: ~3 hours of intense technical evaluation

**Career progression timeline (typical):**
\`\`\`
Year 1-2: Junior Developer → Platform Developer I cert
Year 2-4: Developer → Platform Developer II cert
Year 4-6: Senior Developer → Application Architect certs
Year 6-8: Lead Developer / Solution Architect
Year 8-12: Technical Architect → CTA certification
\`\`\``,
      codeExample: `// Architect-level thinking: Designing an enterprise integration layer
// This shows the KIND of code an architect designs (but delegates implementation)

// 1. Enterprise Integration Service — Architect designs the pattern
public class IntegrationOrchestrator {
    
    // Strategy pattern for different integration types
    private static Map<String, IntegrationStrategy> strategies = 
        new Map<String, IntegrationStrategy>{
            'REST' => new RestIntegrationStrategy(),
            'SOAP' => new SoapIntegrationStrategy(),
            'PLATFORM_EVENT' => new PlatformEventStrategy()
        };
    
    // Architect designs the contract
    public interface IntegrationStrategy {
        IntegrationResult execute(IntegrationRequest request);
        Boolean supportsRetry();
        Integer getMaxRetries();
    }
    
    // Orchestration with retry, circuit breaker, and logging
    public static IntegrationResult process(IntegrationRequest request) {
        IntegrationStrategy strategy = strategies.get(request.integrationType);
        
        if (strategy == null) {
            throw new IntegrationException(
                'Unknown integration type: ' + request.integrationType
            );
        }
        
        IntegrationResult result;
        Integer attempts = 0;
        Integer maxRetries = strategy.supportsRetry() ? strategy.getMaxRetries() : 0;
        
        while (attempts <= maxRetries) {
            try {
                result = strategy.execute(request);
                logIntegration(request, result, attempts);
                return result;
            } catch (CalloutException e) {
                attempts++;
                if (attempts > maxRetries) {
                    result = new IntegrationResult(false, e.getMessage());
                    logIntegration(request, result, attempts);
                    // Queue for async retry via Platform Event
                    publishRetryEvent(request);
                }
            }
        }
        return result;
    }
    
    private static void logIntegration(
        IntegrationRequest req, IntegrationResult res, Integer attempts
    ) {
        Integration_Log__c log = new Integration_Log__c(
            Endpoint__c = req.endpoint,
            Request_Body__c = req.body?.left(131072), // Field limit
            Response_Body__c = res.responseBody?.left(131072),
            Status__c = res.success ? 'Success' : 'Failed',
            Attempts__c = attempts,
            Timestamp__c = Datetime.now()
        );
        insert log; // In production, use async logging
    }
    
    private static void publishRetryEvent(IntegrationRequest request) {
        Integration_Retry__e event = new Integration_Retry__e(
            Payload__c = JSON.serialize(request),
            Retry_Count__c = 0
        );
        EventBus.publish(event);
    }
}

// The architect doesn't just write code — they design:
// - Error handling strategy (retry, dead letter queue, alerting)
// - Monitoring (custom object for logs, dashboard for failures)
// - Security (named credentials, certificate management)
// - Scalability (async processing, platform events for decoupling)
// - Compliance (PII masking in logs, encryption in transit)`,
      exercise: `**Architect-Level Practice:**
1. Design a multi-org Salesforce architecture for a global enterprise with regional data requirements
2. Create an integration architecture document for connecting Salesforce to SAP, Workday, and a custom data warehouse
3. Design a data model for a healthcare CRM that handles HIPAA compliance
4. Architect a high-volume data migration strategy for 500M records
5. Present a "build vs. buy" analysis for 3 AppExchange packages vs. custom development
6. Design a disaster recovery plan for a business-critical Salesforce implementation
7. Create a security architecture review checklist covering OWD, sharing, encryption, and API access
8. Design an event-driven architecture using Platform Events and Change Data Capture
9. Write a technical strategy document for migrating from Classic to Lightning Experience
10. Practice a mock CTA board review — present a solution to peers and defend your decisions`,
      commonMistakes: [
        "Designing solutions without considering governor limits at scale — an architecture that works for 10K records may fail at 10M",
        "Ignoring the total cost of ownership — custom code requires ongoing maintenance; AppExchange solutions may have licensing costs but lower maintenance",
        "Over-engineering — adding complexity (middleware, custom frameworks) when simpler Salesforce-native solutions exist",
        "Not considering data archival strategy — production orgs grow; without archival, performance degrades over years",
        "Ignoring change management — the best architecture fails if users don't adopt it"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "A global company with 50,000 Salesforce users across 12 countries needs a single view of customer data. They currently have 6 separate orgs. How would you architect this?",
          a: "**Approach:** (1) **Assessment** — catalog data in all 6 orgs, identify overlapping customer records. (2) **Architecture options:** (a) Org consolidation into 1-2 orgs with territory management — simplest but risky migration. (b) Hub-and-spoke with a master data management (MDM) system — each regional org syncs to a central MDM. (c) Salesforce Connect with external objects — real-time cross-org visibility without data duplication. (3) **Recommendation:** Hub-and-spoke with Salesforce-to-Salesforce or MuleSoft integration. Central org holds the golden customer record; regional orgs sync relevant data. (4) **Data governance:** Define who owns the customer record, conflict resolution rules, sync frequency. (5) **Compliance:** GDPR for EU data — may require EU-based data residency, affecting org geography."
        },
        {
          type: "conceptual",
          q: "What is the difference between a Solution Architect and a Technical Architect in Salesforce?",
          a: "**Solution Architect** focuses on a specific project or implementation — designs the object model, automation, integrations for that project scope. **Technical Architect** owns the entire platform vision across all projects — sets standards, defines the integration strategy, manages technical debt, approves architectural decisions, and ensures all solutions align with the long-term platform roadmap. The CTA typically oversees multiple Solution Architects and ensures enterprise-wide consistency."
        },
        {
          type: "scenario",
          q: "You're asked to migrate an org with 200 custom objects and 500M records to a new org. How do you approach this?",
          a: "**Phased approach:** (1) **Discovery** — document all 200 objects, relationships, automation, integrations. Identify technical debt to leave behind. (2) **Architecture** — design the target org's data model (opportunity to optimize). Plan metadata deployment order (dependencies). (3) **Metadata migration** — deploy using SFDX packages in dependency order. (4) **Data migration strategy:** For 500M records, use a tiered approach: (a) Reference data first (picklists, record types). (b) Parent objects next (Accounts, Contacts). (c) Child objects (Opportunities, Cases) in batches. (d) Use Bulk API 2.0 with parallel processing. (e) Plan for 2-4 week data migration window. (5) **Validation** — record counts, relationship integrity, automation testing. (6) **Cutover** — delta sync for records changed during migration, DNS cutover, user communication."
        }
      ]
    },
    {
      id: "sf-interview-structure",
      title: "Interview Structure & Expectations by Level",
      explanation: `Understanding how Salesforce interviews are structured at different levels is critical for targeted preparation.

**Developer-Level Interview (1-4 years experience):**
\`\`\`
Round 1: Technical Screening (45 min)
  - Apex fundamentals, SOQL, triggers
  - Governor limits awareness
  - Basic LWC knowledge

Round 2: Coding Exercise (60 min)
  - Write Apex code on a shared editor
  - Implement a trigger with bulkification
  - Write test classes

Round 3: Platform Knowledge (45 min)
  - Security model, sharing rules
  - Declarative vs. programmatic
  - Deployment processes

Round 4: Behavioral (30 min)
  - Project examples
  - Problem-solving approach
  - Team collaboration
\`\`\`

**Senior Developer Interview (4-8 years experience):**
\`\`\`
Round 1: Architecture & Design (60 min)
  - Design a solution for a business scenario
  - Object model, automation, integration design
  - Trade-off discussions

Round 2: Advanced Apex (60 min)
  - Complex coding challenge
  - Async Apex patterns
  - Performance optimization

Round 3: Integration & Platform Events (45 min)
  - REST/SOAP API design
  - Event-driven architecture
  - Error handling and retry patterns

Round 4: Technical Leadership (45 min)
  - Code review scenarios
  - Mentoring examples
  - Technical decision-making

Round 5: Behavioral & Culture (30 min)
  - Leadership without authority
  - Conflict resolution
  - Stakeholder management
\`\`\`

**Technical Architect Interview (8+ years experience):**
\`\`\`
Round 1: System Design (90 min)
  - Enterprise-scale Salesforce solution design
  - Multi-org architecture
  - Integration architecture for 5+ systems

Round 2: Security & Data Architecture (60 min)
  - Enterprise security model design
  - Large data volume strategy
  - Compliance architecture

Round 3: Whiteboard Defense (60 min)
  - Present your design to a panel
  - Defend every decision
  - Respond to "what if" challenges

Round 4: Case Study (60 min)
  - Given a real-world scenario with constraints
  - Design, present, and iterate
  - Budget and timeline considerations

Round 5: Leadership & Strategy (45 min)
  - Technical roadmap ownership
  - Cross-team influence
  - Vendor management
\`\`\`

**Key insight:** As you move up levels, the focus shifts from **"can you code?"** to **"can you design?"** to **"can you lead and decide?"**`,
      codeExample: `// Interview preparation: Common coding challenges at each level

// DEVELOPER LEVEL — Write a trigger to prevent duplicate Contacts
trigger PreventDuplicateContact on Contact (before insert, before update) {
    Set<String> emails = new Set<String>();
    for (Contact c : Trigger.new) {
        if (c.Email != null) emails.add(c.Email.toLowerCase());
    }
    
    if (!emails.isEmpty()) {
        Map<String, Contact> existingMap = new Map<String, Contact>();
        for (Contact c : [
            SELECT Id, Email FROM Contact 
            WHERE Email IN :emails
        ]) {
            existingMap.put(c.Email.toLowerCase(), c);
        }
        
        for (Contact c : Trigger.new) {
            if (c.Email != null) {
                Contact existing = existingMap.get(c.Email.toLowerCase());
                if (existing != null && existing.Id != c.Id) {
                    c.addError('A contact with this email already exists.');
                }
            }
        }
    }
}

// SENIOR LEVEL — Design a flexible validation framework
public class ValidationEngine {
    public interface IValidator {
        ValidationResult validate(SObject record);
    }
    
    public class ValidationResult {
        public Boolean isValid;
        public String errorMessage;
        public String fieldName;
        
        public ValidationResult(Boolean valid, String msg, String field) {
            this.isValid = valid;
            this.errorMessage = msg;
            this.fieldName = field;
        }
    }
    
    private List<IValidator> validators = new List<IValidator>();
    
    public ValidationEngine addValidator(IValidator v) {
        validators.add(v);
        return this; // Fluent interface
    }
    
    public List<ValidationResult> validate(SObject record) {
        List<ValidationResult> results = new List<ValidationResult>();
        for (IValidator v : validators) {
            ValidationResult r = v.validate(record);
            if (!r.isValid) results.add(r);
        }
        return results;
    }
}

// Usage
// ValidationEngine engine = new ValidationEngine()
//     .addValidator(new EmailFormatValidator())
//     .addValidator(new DuplicateCheckValidator())
//     .addValidator(new RequiredFieldValidator('Phone'));
// List<ValidationResult> errors = engine.validate(myContact);`,
      exercise: `**Interview Preparation Exercises:**
1. Practice a 60-minute mock interview with a peer — have them ask Apex questions while you code on a plain editor
2. Prepare 5 STAR stories (Situation, Task, Action, Result) for behavioral rounds
3. Design 3 different Salesforce solutions on a whiteboard in 30 minutes each
4. Write down every governor limit and its value from memory
5. Practice explaining your most complex Salesforce project in exactly 3 minutes
6. Research the company you're interviewing with — how do they use Salesforce?
7. Prepare questions to ask your interviewer about their Salesforce architecture
8. Practice writing Apex without IDE autocomplete (use a plain text editor)
9. Time yourself solving a coding challenge — senior-level target is 25 minutes
10. Record yourself explaining a system design and watch it back for improvement`,
      commonMistakes: [
        "Not calibrating your preparation to the interview level — studying Apex syntax for an architect interview wastes time",
        "Ignoring behavioral rounds — at senior and architect levels, behavioral rounds have veto power",
        "Not practicing whiteboard/verbal communication — you need to explain your thinking clearly while coding",
        "Over-preparing for one area and ignoring others — interviews test breadth AND depth",
        "Not asking clarifying questions — jumping into a solution without understanding requirements is a red flag at any level"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What certifications should a Salesforce Developer pursue and in what order?",
          a: "**Recommended progression:** (1) **Platform Developer I** (PD1) — fundamental Apex, SOQL, triggers, testing. (2) **Platform Developer II** (PD2) — advanced Apex, integration, performance. (3) **Platform App Builder** — declarative tools, data model design. (4) **JavaScript Developer I** — LWC, modern JavaScript. (5) **Sharing and Visibility Designer** — security model deep dive. (6) **Data Architecture and Management Designer** — large data volume. (7) **Integration Architect** — enterprise integration patterns. (8) **Application Architect** (supercredential combining designer certs). (9) **System Architect** (supercredential). (10) **Certified Technical Architect (CTA)** — the pinnacle."
        },
        {
          type: "scenario",
          q: "You're in an interview and the interviewer asks you to design something you've never built before. What do you do?",
          a: "**Don't panic — this is the point.** Interviewers want to see your problem-solving process, not a rehearsed answer. (1) **Acknowledge** — 'I haven't built this specific solution, but let me walk through my approach.' (2) **Clarify** — ask questions about requirements, scale, constraints. (3) **Decompose** — break the problem into components you DO understand. (4) **Map to patterns** — relate unknown components to known patterns. (5) **Design iteratively** — start with a high-level architecture, then drill into critical areas. (6) **State assumptions** — be explicit about what you're assuming. (7) **Discuss trade-offs** — show you understand there are multiple valid approaches."
        },
        {
          type: "conceptual",
          q: "How does the Salesforce Developer interview differ from a general software engineer interview?",
          a: "**Key differences:** (1) **Platform-specific** — you must know governor limits, bulkification, multi-tenant constraints. These don't exist in standard software engineering. (2) **Declarative knowledge** — interviewers expect you to know when NOT to write code. (3) **Security model** — Salesforce's sharing model is unique; general security knowledge isn't enough. (4) **No algorithm-heavy DSA** — unlike FAANG, Salesforce interviews focus on platform mastery, not LeetCode. (5) **Deployment knowledge** — metadata-driven deployment is a core competency. (6) **CRM domain** — understanding Sales Cloud, Service Cloud, and CRM concepts is expected."
        }
      ]
    },
    {
      id: "sf-certification-progression",
      title: "Certification & Career Progression Roadmap",
      explanation: `Salesforce certifications are the **industry standard** for validating expertise. Unlike many tech certifications, Salesforce certs are **highly valued by employers** and often directly influence hiring decisions and compensation.

**Certification tiers and purpose:**

**Tier 1: Foundation (0-2 years)**
- **Salesforce Administrator** — Platform fundamentals, declarative tools
- **Platform Developer I (PD1)** — Apex basics, triggers, SOQL, testing
- **Platform App Builder** — Data modeling, automation, security basics

**Tier 2: Specialist (2-5 years)**
- **Platform Developer II (PD2)** — Advanced Apex, integrations, performance
- **JavaScript Developer I** — LWC, modern JavaScript, web standards
- **Experience Cloud Consultant** — Community/portal development

**Tier 3: Designer (5-8 years)**
- **Sharing and Visibility Designer** — Security model architecture
- **Data Architecture and Management Designer** — Large data volume
- **Integration Architecture Designer** — Enterprise integration patterns

**Tier 4: Architect (6-10 years)**
- **Application Architect** — Supercredential (combines designer certs)
- **System Architect** — Supercredential (infrastructure focus)
- **B2B/B2C Solution Architect** — Commerce-specific

**Tier 5: Pinnacle (10+ years)**
- **Certified Technical Architect (CTA)** — The most prestigious Salesforce certification. Board review format. Pass rate ~5-10%.

**Salary impact (approximate US market):**
\`\`\`
Admin: $75K-$100K
PD1: $90K-$120K
PD2: $120K-$160K
Application Architect: $160K-$200K
CTA: $200K-$350K+
\`\`\`

**Maintenance requirements:**
- All certifications require **annual maintenance modules** (Trailhead)
- Three release cycles per year (Spring, Summer, Winter)
- If maintenance is not completed, certification status becomes "Expired"
- Re-earning requires retaking the exam

**Study strategy:**
1. **Trailhead** — Salesforce's free learning platform (badges, superbadges)
2. **Focus on Hands-on** — Trailhead playgrounds and developer orgs
3. **Practice exams** — Use official practice tests and platforms like FocusOnForce
4. **Study groups** — Join local Salesforce user groups and online communities
5. **Superbadges** — Complete relevant superbadges; they mirror real-world scenarios`,
      codeExample: `// Certification prep: Key concepts tested in PD1 and PD2

// PD1 — Bulkification (most frequently tested concept)
public class OpportunityService {
    // BAD — Not bulkified (fails PD1 exam question)
    public static void updateAccountRevenue_BAD(List<Opportunity> opps) {
        for (Opportunity opp : opps) {
            Account acc = [SELECT AnnualRevenue FROM Account WHERE Id = :opp.AccountId];
            acc.AnnualRevenue = (acc.AnnualRevenue == null ? 0 : acc.AnnualRevenue) + opp.Amount;
            update acc; // DML inside loop!
        }
    }
    
    // GOOD — Bulkified (correct PD1 answer)
    public static void updateAccountRevenue_GOOD(List<Opportunity> opps) {
        // 1. Collect all Account IDs
        Set<Id> accountIds = new Set<Id>();
        for (Opportunity opp : opps) {
            if (opp.AccountId != null) accountIds.add(opp.AccountId);
        }
        
        // 2. Query once
        Map<Id, Account> accountMap = new Map<Id, Account>(
            [SELECT Id, AnnualRevenue FROM Account WHERE Id IN :accountIds]
        );
        
        // 3. Calculate in memory
        for (Opportunity opp : opps) {
            Account acc = accountMap.get(opp.AccountId);
            if (acc != null) {
                acc.AnnualRevenue = (acc.AnnualRevenue == null ? 0 : acc.AnnualRevenue) 
                    + opp.Amount;
            }
        }
        
        // 4. Single DML operation
        update accountMap.values();
    }
}

// PD2 — Advanced concepts: Queueable chaining, dynamic Apex

// Queueable with chaining (PD2 level)
public class DataCleanupQueueable implements Queueable {
    private List<String> objectsToClean;
    private Integer currentIndex;
    
    public DataCleanupQueueable(List<String> objects, Integer startIndex) {
        this.objectsToClean = objects;
        this.currentIndex = startIndex;
    }
    
    public void execute(QueueableContext context) {
        String objectName = objectsToClean[currentIndex];
        
        // Clean up old records for current object
        String query = 'SELECT Id FROM ' + objectName + 
            ' WHERE CreatedDate < LAST_N_DAYS:365 LIMIT 10000';
        List<SObject> oldRecords = Database.query(query);
        
        if (!oldRecords.isEmpty()) {
            Database.delete(oldRecords, false); // AllOrNone = false
        }
        
        // Chain to next object if more remain
        if (currentIndex + 1 < objectsToClean.size()) {
            System.enqueueJob(
                new DataCleanupQueueable(objectsToClean, currentIndex + 1)
            );
        }
    }
}

// Dynamic Apex (PD2 topic)
public class DynamicQueryBuilder {
    public static List<SObject> search(
        String objectName, 
        Map<String, Object> filters,
        Integer limitCount
    ) {
        String query = 'SELECT Id, Name FROM ' + 
            String.escapeSingleQuotes(objectName) + ' WHERE ';
        
        List<String> conditions = new List<String>();
        for (String field : filters.keySet()) {
            Object value = filters.get(field);
            if (value instanceof String) {
                conditions.add(field + ' = \\'' + 
                    String.escapeSingleQuotes((String)value) + '\\'');
            } else {
                conditions.add(field + ' = ' + value);
            }
        }
        
        query += String.join(conditions, ' AND ');
        query += ' LIMIT ' + limitCount;
        
        return Database.query(query);
    }
}`,
      exercise: `**Certification Preparation Exercises:**
1. Sign up for a Salesforce Developer Edition org (free) and complete 5 Superbadges
2. Take the official PD1 practice exam and score your results — target 80%+ before the real exam
3. Complete the Apex Specialist Superbadge on Trailhead
4. Build a complete application (data model, triggers, LWC, tests) in a Developer org
5. Study the Salesforce release notes for the current release — exams often test new features
6. Join the Trailblazer community and participate in study groups
7. Complete the Advanced Apex Specialist Superbadge (PD2 preparation)
8. Write flashcards for all governor limits, sharing keywords, and Apex annotations
9. Practice 50 PD1-level multiple choice questions daily for 2 weeks
10. Schedule your first certification exam — having a deadline forces focused preparation`,
      commonMistakes: [
        "Studying only theory without hands-on practice — certifications test practical knowledge, not memorization",
        "Skipping the Administrator cert — even for developers, admin fundamentals (security model, automation) are heavily tested in PD1",
        "Not maintaining certifications — expired certs look worse than no certs on a resume",
        "Over-relying on brain dumps — Salesforce regularly rotates questions; understanding concepts is more reliable than memorizing answers",
        "Waiting until you feel 'ready' — schedule the exam first, then prepare with a deadline"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Which Salesforce certifications are most valued by employers for a developer role?",
          a: "For developers: (1) **Platform Developer I** — table stakes; almost required for any Salesforce dev role. (2) **Platform Developer II** — signals senior-level competency; significantly increases market value. (3) **JavaScript Developer I** — increasingly important with LWC adoption. (4) **Platform App Builder** — shows you understand declarative tools (clicks vs. code). Beyond these, **Sharing and Visibility Designer** and **Integration Architecture Designer** are highly valued for senior/architect roles. Multiple certifications compound — a developer with PD1 + PD2 + App Builder commands 20-30% higher compensation than PD1 alone."
        },
        {
          type: "conceptual",
          q: "What's the difference between the CTA certification and all other Salesforce certifications?",
          a: "All other Salesforce certs are **multiple-choice exams** (60-minute online proctored). The CTA is a **live board review**: (1) You receive a complex business scenario 2 weeks in advance. (2) You design a complete enterprise architecture. (3) You present your solution to a panel of existing CTAs for 30 minutes. (4) The panel grills you for 30 minutes with deep-dive questions and 'what-if' challenges. (5) Pass rate is estimated at 5-10%. (6) There are only ~350 CTAs worldwide. It's the highest designation in the Salesforce ecosystem and directly correlates with $200K+ compensation."
        }
      ]
    }
  ]
};

export default sfPhase1;
