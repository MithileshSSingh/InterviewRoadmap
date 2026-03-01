const sfPhase14 = {
  id: "phase-14",
  title: "Phase 14: Interview Simulation & Career Growth",
  emoji: "🎯",
  description: "Technical interview preparation — mock interview questions, system design exercises, whiteboard coding, behavioral questions, and strategies for Developer, Senior, and Architect interviews.",
  topics: [
    {
      id: "sf-interview-preparation",
      title: "Technical Interview Strategy & Mock Questions",
      explanation: `Salesforce interviews vary significantly by level. Understanding the format, expectations, and preparation strategy for each level is critical for career advancement.

**Interview formats by level:**

**Developer (0-3 years):**
\`\`\`
Round 1: Technical screening (Apex basics, SOQL, triggers)
Round 2: Coding challenge (live coding or take-home)
Round 3: Platform knowledge (objects, security, Flows)
Round 4: Cultural fit / team match
\`\`\`

**Senior Developer (3-7 years):**
\`\`\`
Round 1: Deep technical (governor limits, async, performance)
Round 2: Architecture discussion (integration, LDV, multi-tenant)
Round 3: Code review exercise (review and improve existing code)
Round 4: System design (whiteboard solution for a business scenario)
Round 5: Leadership / behavioral
\`\`\`

**Technical Architect (7+ years):**
\`\`\`
Round 1: Architecture deep dive (multi-org, integration patterns)
Round 2: System design (enterprise-scale solution, 60 min)
Round 3: CTA-style scenario (mock CTA review board)
Round 4: Stakeholder management (communicate tech to non-tech)
Round 5: Executive presentation (defend architecture decisions)
\`\`\`

**Preparation strategy:**
1. **Build projects** — Nothing beats hands-on experience. Build 2-3 complete projects.
2. **Trailhead** — Complete Superbadges (Apex Specialist, Data Integration, LWC)
3. **Certifications** — Platform Developer I & II, Application Architect
4. **Practice** — Explain concepts out loud (rubber duck technique)
5. **Mock interviews** — Practice with peers or mentors
6. **System design** — Practice designing systems on a whiteboard

**Common interview themes:**
1. Governor limits and bulkification (asked at ALL levels)
2. Security model (sharing, FLS, OWD)
3. Integration patterns (REST, Platform Events, middleware)
4. Trigger best practices (framework, recursion, order of execution)
5. LWC lifecycle and communication patterns
6. Performance optimization (LDV, query selectivity, caching)`,
      codeExample: `// Interview Coding Exercises

// 1. CLASSIC: Write a bulkified trigger
// Prompt: "Write a trigger that updates the Account's total revenue 
//          when Opportunities are inserted or updated."

trigger OpportunityTrigger on Opportunity (after insert, after update) {
    // Collect affected Account IDs
    Set<Id> accountIds = new Set<Id>();
    for (Opportunity opp : Trigger.new) {
        if (opp.AccountId != null) {
            accountIds.add(opp.AccountId);
        }
    }
    // Also check old values for reparented opps
    if (Trigger.isUpdate) {
        for (Opportunity opp : Trigger.old) {
            if (opp.AccountId != null) {
                accountIds.add(opp.AccountId);
            }
        }
    }
    
    if (accountIds.isEmpty()) return;
    
    // Aggregate opportunity amounts per account
    Map<Id, Decimal> revenueByAccount = new Map<Id, Decimal>();
    for (AggregateResult ar : [
        SELECT AccountId, SUM(Amount) totalAmount
        FROM Opportunity
        WHERE AccountId IN :accountIds
        AND StageName = 'Closed Won'
        GROUP BY AccountId
    ]) {
        revenueByAccount.put(
            (Id) ar.get('AccountId'), 
            (Decimal) ar.get('totalAmount')
        );
    }
    
    // Update accounts
    List<Account> accountsToUpdate = new List<Account>();
    for (Id accId : accountIds) {
        accountsToUpdate.add(new Account(
            Id = accId,
            Total_Revenue__c = revenueByAccount.containsKey(accId) 
                ? revenueByAccount.get(accId) : 0
        ));
    }
    update accountsToUpdate;
}

// 2. CODE REVIEW: Find and fix all issues in this code
// Prompt: "Review this code and identify all problems"

/*
 BUGGY CODE (find the issues):

 trigger CaseTrigger on Case (after insert) {
     for (Case c : Trigger.new) {
         Account acc = [SELECT Id, Name FROM Account WHERE Id = :c.AccountId];
         c.Description = 'Account: ' + acc.Name;
         update c;
         
         EmailService.sendEmail(c.ContactEmail, 'Case Created', c.Subject);
         
         Task t = new Task();
         t.WhatId = c.Id;
         t.Subject = 'Follow up';
         insert t;
     }
 }

 ISSUES:
 1. SOQL inside loop — will fail at 101 records
 2. DML inside loop (update c) — will fail at 151 records
 3. Cannot modify Trigger.new in after trigger (read-only)
 4. DML inside loop (insert t) — another DML per iteration
 5. Email in loop — will hit email invocation limit
 6. No null check on AccountId
 7. No error handling
 8. Single trigger, should use handler pattern
*/

// FIXED VERSION:
public class CaseTriggerHandler {
    
    public static void handleAfterInsert(List<Case> cases) {
        // Collect data
        Set<Id> accountIds = new Set<Id>();
        for (Case c : cases) {
            if (c.AccountId != null) accountIds.add(c.AccountId);
        }
        
        // Query once
        Map<Id, Account> accounts = new Map<Id, Account>(
            [SELECT Id, Name FROM Account WHERE Id IN :accountIds]
        );
        
        // Process
        List<Case> casesToUpdate = new List<Case>();
        List<Task> tasksToCreate = new List<Task>();
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        
        for (Case c : cases) {
            // Update case description
            Account acc = accounts.get(c.AccountId);
            if (acc != null) {
                casesToUpdate.add(new Case(
                    Id = c.Id,
                    Description = 'Account: ' + acc.Name
                ));
            }
            
            // Create follow-up task
            tasksToCreate.add(new Task(
                WhatId = c.Id,
                Subject = 'Follow up on case: ' + c.CaseNumber,
                ActivityDate = Date.today().addDays(1)
            ));
        }
        
        // DML once each
        if (!casesToUpdate.isEmpty()) update casesToUpdate;
        if (!tasksToCreate.isEmpty()) insert tasksToCreate;
    }
}

// 3. SYSTEM DESIGN: Design a Lead scoring system
// Prompt: "Design a system that scores Leads based on behavior and demographics"

public class LeadScoringEngine {
    
    // Configuration-driven scoring via Custom Metadata
    public static void scoreLeads(List<Lead> leads) {
        // Load scoring rules from Custom Metadata
        List<Lead_Score_Rule__mdt> rules = [
            SELECT Category__c, Field_Name__c, Operator__c, 
                   Value__c, Points__c
            FROM Lead_Score_Rule__mdt
            WHERE Is_Active__c = true
        ];
        
        for (Lead lead : leads) {
            Integer score = 0;
            
            for (Lead_Score_Rule__mdt rule : rules) {
                if (evaluateRule(lead, rule)) {
                    score += (Integer) rule.Points__c;
                }
            }
            
            lead.Lead_Score__c = score;
            lead.Score_Grade__c = getGrade(score);
        }
    }
    
    private static Boolean evaluateRule(Lead lead, Lead_Score_Rule__mdt rule) {
        Object fieldValue = lead.get(rule.Field_Name__c);
        if (fieldValue == null) return false;
        
        String valueStr = String.valueOf(fieldValue);
        
        switch on rule.Operator__c {
            when 'equals' { return valueStr == rule.Value__c; }
            when 'contains' { return valueStr.contains(rule.Value__c); }
            when 'not_empty' { return String.isNotBlank(valueStr); }
            when else { return false; }
        }
    }
    
    private static String getGrade(Integer score) {
        if (score >= 80) return 'A';
        if (score >= 60) return 'B';
        if (score >= 40) return 'C';
        if (score >= 20) return 'D';
        return 'F';
    }
}`,
      exercise: `**Interview Preparation Exercises:**
1. Practice explaining: "What happens when a user clicks Save on an Account?" (Order of Execution)
2. Mock interview: Answer 10 Apex fundamentals questions in 20 minutes
3. Code review exercise: Find and fix 10 bugs in a provided trigger
4. System design exercise: Design a CRM system for a SaaS company on a whiteboard (45 min)
5. Behavioral: Prepare STAR stories for 5 scenarios (disagreement, failure, leadership, deadline, learning)
6. Live coding: Write a bulkified trigger with test class in 30 minutes
7. Architecture: Present a multi-cloud solution proposal to a mock business audience
8. Debug exercise: Given a debug log, identify the root cause of a governor limit exception
9. Complete the Apex Specialist Superbadge on Trailhead
10. Conduct a mock CTA review board with a peer (present architecture for a scenario)`,
      commonMistakes: [
        "Jumping into coding without understanding the problem — always ask clarifying questions first. Interviewers evaluate your problem-solving approach",
        "Not practicing out loud — knowing the answer in your head is different from articulating it clearly under interview pressure",
        "Focusing only on coding — senior interviews are 50% architecture and communication. Practice system design and stakeholder communication",
        "Not asking about requirements and constraints — in system design interviews, always ask about scale (users, data volume), performance requirements, and budget",
        "Over-engineering interview answers — start simple, then add complexity. Show you understand the tradeoffs between simple and complex solutions"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Walk me through the Order of Execution when a record is saved in Salesforce.",
          a: "**Salesforce Order of Execution:** (1) Load original record (or initialize defaults for new records). (2) Load new field values from request. (3) Execute **before-save Flows** (Record-Triggered). (4) Execute system validation rules (required fields, field format). (5) Execute **before triggers**. (6) Execute custom validation rules. (7) Save record to database (but don't commit). (8) Execute **after triggers**. (9) Execute assignment rules. (10) Execute auto-response rules. (11) Execute **after-save Flows** (Record-Triggered). (12) Execute entitlement rules. (13) Execute roll-up summary field calculations. (14) Execute cross-object workflow rules. (15) Execute post-commit logic (sending emails, etc.). (16) **Commit** all DML to database."
        },
        {
          type: "scenario",
          q: "Design a system for a ride-sharing company to track drivers, riders, trips, and payments on Salesforce.",
          a: "**Data Model:** Driver__c (license, vehicle, rating), Rider__c (linked to Contact), Trip__c (MD to Driver, Lookup to Rider — start/end location, status, fare), Payment__c (MD to Trip). **Security:** OWD Private. Drivers see only their trips. Riders see only their trips. Operations team (role) sees all. **Automation:** Before-save Flow: calculate estimated fare based on distance. After-save trigger: match rider requests with available drivers (custom matching algorithm in Apex). Platform Events: real-time trip status updates to driver and rider mobile apps. Scheduled Flow: daily settlement calculations for driver payouts. **Integration:** Google Maps API via Named Credentials for distance calculation. Payment gateway (Stripe) via Queueable callouts. **Scale:** 10K trips/day → Big Objects for archiving trips older than 1 year. Custom indexes on Trip__c(Status__c, Driver__c, Start_Time__c)."
        },
        {
          type: "tricky",
          q: "You're given 30 seconds to explain to a VP of Sales why a feature request will take 3 sprints instead of 1.",
          a: "**The 30-second pitch:** 'The feature you described — automatic territory reassignment — touches our core data security model. If we do this in one sprint, we risk breaking visibility for all 500 sales reps. Here's the safe approach: Sprint 1 — build and test the reassignment logic in sandbox with your data. Sprint 2 — pilot with one region (50 reps), measure impact, get feedback. Sprint 3 — roll out to all regions with kill-switch for safety. This approach protects your team's pipeline visibility and gives us a rollback plan if anything goes wrong.' **Why this works:** Acknowledges the business need, explains risk in business terms, shows concrete plan, demonstrates safety thinking."
        }
      ]
    },
    {
      id: "sf-career-growth-certifications",
      title: "Certification Roadmap & Career Strategy",
      explanation: `Strategic career planning for Salesforce professionals — certifications, specializations, and the path from Developer to Technical Architect.

**Certification Progression Path:**

**Foundation (Year 1):**
- Salesforce Certified Administrator
- Platform App Builder
- Platform Developer I

**Core Development (Year 2-3):**
- Platform Developer II (advanced Apex)
- JavaScript Developer I (LWC focus)
- Data Architecture and Management Designer

**Specialization (Year 3-5):**
- Integration Architecture Designer
- Identity and Access Management Architect
- Development Lifecycle and Deployment Architect
- Sharing and Visibility Architect

**Apex (Year 5+):**
- Application Architect (combo: Data + Sharing + Integration)
- System Architect (combo: Identity + Dev Lifecycle + Integration)
- **Certified Technical Architect (CTA)** — The pinnacle

**CTA Preparation (12+ months):**
The CTA is the most prestigious Salesforce certification. It involves:
1. **Written exam** — Multiple choice on architecture
2. **Review board** — Present a solution to a complex business scenario in front of a panel of CTAs
3. You have 45 minutes to design and present a solution
4. The panel asks probing questions about your design decisions
5. Pass rate: ~5-10%

**Career growth strategies:**
1. **Build a portfolio** — Open-source contributions, blog posts, Trailhead badges
2. **Specialize** — Choose a domain (Healthcare, Financial Services, Integration)
3. **Speak** — Present at Dreamforce, local user groups, webinars
4. **Contribute** — Answer questions on Salesforce Stack Exchange, Trailblazer Community
5. **Certify strategically** — Get certs that align with your target role
6. **Network** — Join Salesforce MVP program, attend community events

**Salary expectations (US market):**
\`\`\`
Junior Developer:        $80K - $110K
Developer:              $100K - $140K
Senior Developer:       $130K - $170K
Lead / Principal:       $150K - $200K
Solution Architect:     $160K - $220K
Technical Architect:    $180K - $280K
CTA:                    $200K - $350K+
\`\`\`

**High-demand specializations:**
1. MuleSoft integration
2. CPQ (Configure, Price, Quote)
3. Marketing Cloud / Data Cloud
4. Industry Cloud (Health, Financial Services)
5. Salesforce AI (Einstein, Data Cloud)`,
      codeExample: `// Skills Assessment — Self-Evaluation Code Challenges

// LEVEL 1: Developer Fundamentals
// Can you write this from memory?

// Challenge: Bulkified trigger with test class
public class AccountTriggerHandlerTest {
    
    @TestSetup
    static void setup() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            accounts.add(new Account(Name = 'Test Account ' + i));
        }
        insert accounts;
    }
    
    @isTest
    static void testBulkInsert() {
        List<Contact> contacts = new List<Contact>();
        List<Account> accounts = [SELECT Id FROM Account];
        
        for (Account acc : accounts) {
            contacts.add(new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                AccountId = acc.Id
            ));
        }
        
        Test.startTest();
        insert contacts; // Should not hit governor limits
        Test.stopTest();
        
        System.assertEquals(200, [SELECT COUNT() FROM Contact]);
    }
}

// LEVEL 2: Senior Developer
// Can you explain and implement these patterns?

// Trigger Framework + Service Layer + Error Handling
// (See Phase 3b and Phase 9 for full implementations)

// LEVEL 3: Architect
// Can you design this on a whiteboard?

// Challenge: Design a real-time notification system
// Requirements:
// - 10,000 users
// - Notifications for: deal approvals, SLA breaches, territory changes
// - Multi-channel: in-app, email, mobile push
// - Configurable per user (opt-in/opt-out)
// - Audit trail for all notifications

// Architecture sketch:
// 1. Notification_Template__c — configurable templates
// 2. User_Notification_Pref__c — per-user channel preferences
// 3. Platform Event: Notification_Event__e — published by triggers/flows
// 4. Event subscriber trigger → routes to channels:
//    a. In-app: Custom Notification API
//    b. Email: Messaging.SingleEmailMessage
//    c. Mobile push: Firebase via Named Credential callout
// 5. Notification_Log__c — audit trail
// 6. LWC component: empApi subscriber for real-time in-app display
// 7. Notification dashboard: read/unread counts, history

// Self-Assessment Checklist
// Developer Level:
// [ ] Write bulkified triggers
// [ ] SOQL/SOSL mastery
// [ ] Test classes with 85%+ coverage
// [ ] Basic LWC components
// [ ] Understand security model basics
//
// Senior Developer Level:
// [ ] Trigger framework implementation
// [ ] Async Apex (all 4 patterns)
// [ ] Integration (REST API, Named Credentials)
// [ ] Advanced LWC (wire, communication, LMS)
// [ ] Performance optimization
// [ ] SFDX / CI/CD
//
// Architect Level:
// [ ] Enterprise design patterns
// [ ] Multi-org architecture
// [ ] LDV management
// [ ] Security architecture (Shield, GDPR)
// [ ] Integration architecture (middleware, ESB)
// [ ] System design (whiteboard exercises)
// [ ] Stakeholder communication`,
      exercise: `**Career Growth Exercises:**
1. Complete 3 Trailhead Superbadges relevant to your target role
2. Write a blog post explaining a complex Salesforce concept (governor limits, sharing model)
3. Contribute 10 answers on Salesforce Stack Exchange
4. Build a portfolio project: complete CRM application (data model, Apex, LWC, integration)
5. Practice the CTA mock review board: present a solution to the following: "Design a CRM for a global insurance company"
6. Create a 12-month certification study plan targeting your next 3 certifications
7. Practice system design: spend 45 minutes designing a solution, record yourself presenting it
8. Mentor a junior developer — teaching solidifies your own understanding
9. Build and deploy an AppExchange-ready managed package
10. Attend or present at a Salesforce community event (user group, Dreamforce)`,
      commonMistakes: [
        "Collecting certifications without practical experience — certifications open doors, but interviews test real skills. Build projects alongside studying",
        "Staying in your comfort zone — if you only do triggers and Apex, you won't grow into architecture roles. Push into LWC, integration, and security",
        "Not networking within the Salesforce ecosystem — the Salesforce job market is heavily referral-based. Active community participation opens opportunities",
        "Studying for CTA too early — the CTA requires deep enterprise experience. Most successful candidates have 8-15 years of experience",
        "Ignoring soft skills — at the senior and architect level, communication, stakeholder management, and presentation skills are as important as technical skills"
      ],
      interviewQuestions: [
        {
          type: "behavioral",
          q: "Tell me about a time you made a technical decision that had significant business impact.",
          a: "**STAR Format:** **Situation:** Our Salesforce org had been growing rapidly — 2M+ Account records — and our sales team was experiencing 15-second page load times. **Task:** I was asked to diagnose and fix the performance issues within 2 weeks before quarterly business review. **Action:** I analyzed debug logs and found non-selective queries in 3 trigger handlers. I proposed: (1) Custom indexes on 4 frequently filtered fields (submitted to Salesforce Support). (2) Refactored trigger handlers from 3 separate to 1 unified framework. (3) Moved non-critical processing to Queueable Apex. (4) Implemented caching for frequently accessed configuration data. **Result:** Page load times dropped from 15 seconds to under 2 seconds. We identified this improved sales rep productivity by ~20 minutes per day. The approach was adopted as a standard pattern for all future development."
        },
        {
          type: "scenario",
          q: "You disagree with a solution architect's integration approach. How do you handle it?",
          a: "**Professional approach:** (1) **Understand their perspective first** — ask questions to understand their reasoning and constraints I might not be aware of. (2) **Prepare data** — build a proof of concept or analysis showing the tradeoffs. For example, if they propose synchronous REST callouts and I believe Platform Events would be better, I'd show: latency comparison, governor limit impact, failure handling differences. (3) **Present alternatives, not objections** — 'Here's another approach that might address the scalability concern...' not 'Your approach won't work.' (4) **Focus on business outcomes** — frame the discussion in terms of reliability, cost, and user experience, not technical preference. (5) **Defer gracefully** — if the team decides to go with their approach, document my concerns constructively and monitor for the issues I predicted."
        }
      ]
    }
  ]
};

export default sfPhase14;
