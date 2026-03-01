const sfPhase9 = {
  id: "phase-9",
  title: "Phase 9: Design Patterns & Architecture",
  emoji: "🏛️",
  description: "Enterprise design patterns for Salesforce: Trigger frameworks, Service Layer, Domain Layer, Selector Layer, Unit of Work, Strategy pattern, and SOLID principles applied to Apex.",
  topics: [
    {
      id: "sf-enterprise-design-patterns",
      title: "Enterprise Design Patterns in Apex",
      explanation: `Design patterns in Salesforce go beyond academic theory — they solve real problems of code organization, testability, and maintainability in enterprise orgs with millions of records and dozens of developers.

**The Apex Enterprise Patterns (Andrew Fawcett's framework):**

1. **Service Layer** — Business logic entry point
   - Contains use cases and orchestration logic
   - Called by triggers, LWC, REST APIs, Batch
   - Manages transactions and error handling
   - Example: \`OpportunityService.closeDeals(oppIds)\`

2. **Domain Layer** — Object-specific business rules
   - Encapsulates validation, defaults, calculations per SObject
   - Triggered by DML operations
   - Contains before/after trigger logic
   - Example: \`Opportunities.validate(records)\`

3. **Selector Layer** — Query encapsulation
   - All SOQL queries for an object in one class
   - Enforces security (with sharing, FLS)
   - Cacheable, testable, reusable
   - Example: \`AccountsSelector.getByIds(ids)\`

4. **Unit of Work** — Transaction management
   - Collects all DML operations and executes in optimal order
   - Handles parent-child insert ordering
   - Single commit point for transaction
   - Example: \`uow.registerNew(account); uow.commitWork();\`

**SOLID Principles in Apex:**
\`\`\`
S — Single Responsibility: Each class does one thing
O — Open/Closed: Extend via inheritance, don't modify existing code
L — Liskov Substitution: Subtypes must be substitutable for base types
I — Interface Segregation: Small, focused interfaces
D — Dependency Inversion: Depend on abstractions, not implementations
\`\`\`

**Common Salesforce Design Patterns:**
- **Strategy Pattern** — Swap algorithms at runtime (different pricing strategies)
- **Factory Pattern** — Create objects without specifying exact class
- **Facade Pattern** — Simplified interface to complex subsystems
- **Observer Pattern** — Platform Events / trigger-based notifications
- **Singleton Pattern** — Single instance per transaction (static variables)`,
      codeExample: `// Enterprise Design Patterns Implementation

// 1. SERVICE LAYER — Business logic orchestration
public with sharing class OpportunityService {
    
    // Public API — called by triggers, LWC, REST, Batch
    public static void closeDeals(Set<Id> opportunityIds) {
        // Query via Selector
        List<Opportunity> opps = OpportunitiesSelector.getByIds(opportunityIds);
        
        // Apply domain logic
        Opportunities domain = new Opportunities(opps);
        domain.validateForClose();
        domain.calculateFinalAmounts();
        
        // Register changes via Unit of Work
        fflib_ISObjectUnitOfWork uow = Application.UnitOfWork.newInstance();
        
        for (Opportunity opp : opps) {
            opp.StageName = 'Closed Won';
            opp.CloseDate = Date.today();
            uow.registerDirty(opp);
            
            // Create follow-up task
            Task followUp = new Task(
                Subject = 'Post-close follow-up: ' + opp.Name,
                WhatId = opp.Id,
                OwnerId = opp.OwnerId,
                ActivityDate = Date.today().addDays(7)
            );
            uow.registerNew(followUp);
        }
        
        uow.commitWork(); // Single DML commit
    }
    
    public static void applyDiscount(Set<Id> oppIds, Decimal discountPercent) {
        List<Opportunity> opps = OpportunitiesSelector.getByIds(oppIds);
        Opportunities domain = new Opportunities(opps);
        domain.applyDiscount(discountPercent);
        update opps;
    }
}

// 2. DOMAIN LAYER — Object-specific business rules
public class Opportunities {
    private List<Opportunity> records;
    
    public Opportunities(List<Opportunity> records) {
        this.records = records;
    }
    
    // Validation
    public void validateForClose() {
        for (Opportunity opp : records) {
            if (opp.Amount == null || opp.Amount <= 0) {
                opp.addError('Amount must be positive to close');
            }
            if (opp.ContactId == null) {
                opp.addError('Primary Contact required to close');
            }
        }
    }
    
    // Business calculation
    public void calculateFinalAmounts() {
        for (Opportunity opp : records) {
            if (opp.Discount_Percent__c != null) {
                opp.Amount = opp.Amount * (1 - opp.Discount_Percent__c / 100);
            }
        }
    }
    
    // Apply discount
    public void applyDiscount(Decimal percent) {
        for (Opportunity opp : records) {
            opp.Discount_Percent__c = percent;
            opp.Amount = opp.Amount * (1 - percent / 100);
        }
    }
}

// 3. SELECTOR LAYER — Query encapsulation
public inherited sharing class OpportunitiesSelector {
    
    private static final List<String> DEFAULT_FIELDS = new List<String>{
        'Id', 'Name', 'StageName', 'Amount', 'CloseDate',
        'AccountId', 'OwnerId', 'ContactId', 'Discount_Percent__c'
    };
    
    public static List<Opportunity> getByIds(Set<Id> ids) {
        return Database.query(
            'SELECT ' + String.join(DEFAULT_FIELDS, ', ') +
            ' FROM Opportunity WHERE Id IN :ids'
        );
    }
    
    public static List<Opportunity> getByAccountIds(Set<Id> accountIds) {
        return Database.query(
            'SELECT ' + String.join(DEFAULT_FIELDS, ', ') +
            ' FROM Opportunity WHERE AccountId IN :accountIds' +
            ' ORDER BY CloseDate DESC'
        );
    }
    
    public static List<Opportunity> getOpenByOwner(Id ownerId) {
        return Database.query(
            'SELECT ' + String.join(DEFAULT_FIELDS, ', ') +
            ' FROM Opportunity WHERE OwnerId = :ownerId' +
            ' AND IsClosed = false ORDER BY CloseDate ASC'
        );
    }
}

// 4. STRATEGY PATTERN — Swappable business logic
public interface IPricingStrategy {
    Decimal calculatePrice(Opportunity opp);
}

public class StandardPricing implements IPricingStrategy {
    public Decimal calculatePrice(Opportunity opp) {
        return opp.Amount; // No discount
    }
}

public class EnterprisePricing implements IPricingStrategy {
    public Decimal calculatePrice(Opportunity opp) {
        Decimal discount = opp.Amount > 100000 ? 0.15 : 0.05;
        return opp.Amount * (1 - discount);
    }
}

public class PartnerPricing implements IPricingStrategy {
    public Decimal calculatePrice(Opportunity opp) {
        return opp.Amount * 0.70; // 30% partner discount
    }
}

// Usage
public class PricingService {
    public static Decimal getPrice(Opportunity opp, String channel) {
        IPricingStrategy strategy;
        
        switch on channel {
            when 'Standard' { strategy = new StandardPricing(); }
            when 'Enterprise' { strategy = new EnterprisePricing(); }
            when 'Partner' { strategy = new PartnerPricing(); }
            when else { strategy = new StandardPricing(); }
        }
        
        return strategy.calculatePrice(opp);
    }
}

// 5. FACTORY PATTERN — Dynamic handler creation
public class TriggerHandlerFactory {
    
    private static Map<Schema.SObjectType, Type> handlerRegistry = 
        new Map<Schema.SObjectType, Type>{
            Account.SObjectType => AccountTriggerHandler.class,
            Contact.SObjectType => ContactTriggerHandler.class,
            Opportunity.SObjectType => OpportunityTriggerHandler.class
        };
    
    public static ITriggerHandler getHandler(Schema.SObjectType objType) {
        Type handlerType = handlerRegistry.get(objType);
        if (handlerType == null) {
            throw new TriggerException('No handler registered for: ' + objType);
        }
        return (ITriggerHandler) handlerType.newInstance();
    }
}`,
      exercise: `**Design Pattern Practice:**
1. Implement a Service-Domain-Selector architecture for the Account object
2. Build a Strategy pattern for different notification channels (Email, SMS, Slack)
3. Create a Factory that dynamically instantiates trigger handlers based on SObject type
4. Implement the Unit of Work pattern for a transaction inserting parent and child records
5. Apply SOLID principles to refactor a 500-line trigger handler into separate classes
6. Build a Facade that simplifies a complex integration with 5 external services
7. Implement dependency injection in Apex using interfaces and factory methods
8. Create a Singleton pattern for a configuration cache that persists throughout a transaction
9. Build a Domain-Driven Design model for a healthcare patient management system
10. Code review a colleague's implementation and recommend design pattern improvements`,
      commonMistakes: [
        "Over-engineering simple code — not every class needs 5 layers. Use patterns when complexity warrants them",
        "Mixing query logic into service/domain classes — all SOQL should be in Selectors for reusability and security enforcement",
        "Not using interfaces for dependency injection — concrete class dependencies make testing difficult. Always depend on abstractions",
        "Ignoring Apex's limitations when applying Java patterns — Apex lacks generics, has limited reflection, and has governor limits. Adapt patterns accordingly",
        "Creating too many small classes — the Apex class limit per org is ~6,000. Balance class count with maintainability"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Describe the Apex Enterprise Patterns (Service, Domain, Selector) and why they matter.",
          a: "**Service Layer:** Public entry point for business operations. Called by triggers, LWC, APIs, Batch. Contains orchestration logic, NOT field-level rules. Example: `OrderService.placeOrder(items)`. **Domain Layer:** Object-specific business rules — validation, defaults, calculations. Encapsulates what an Opportunity 'knows about itself'. **Selector Layer:** All SOQL for an object in one class. Enforces FLS/CRUD, provides consistent field lists, enables caching. **Why they matter:** (1) Testability — mock Selectors in tests. (2) Reusability — Service methods called from anywhere. (3) Maintainability — changes isolated to relevant layer. (4) Security — Selectors enforce access. (5) Scalability — clear boundaries prevent spaghetti code."
        },
        {
          type: "scenario",
          q: "You inherit a 2,000-line trigger handler. How do you refactor it?",
          a: "**Step-by-step refactoring:** (1) **Analyze:** Read the entire handler. Map responsibilities: validation, queries, calculations, DML, callouts. (2) **Extract Selectors:** Move all SOQL into `ObjectSelector` classes. Each method returns records for a specific use case. (3) **Extract Domain:** Move validation and field-level logic into a Domain class. (4) **Extract Services:** Move multi-object orchestration into Service classes. (5) **Introduce patterns:** Strategy for conditional logic, Factory for dynamic handlers. (6) **Write tests FIRST:** Before refactoring, write tests that verify current behavior. (7) **Refactor incrementally:** Extract one method at a time, verify tests pass. (8) **Result:** Handler becomes ~50 lines delegating to Service methods."
        }
      ]
    },
    {
      id: "sf-architecture-scalability",
      title: "Scalable Architecture & System Design",
      explanation: `Designing scalable Salesforce solutions is an architect-level competency. This involves data modeling for growth, multi-org strategies, event-driven architecture, and performance at scale.

**Architecture decision areas:**

1. **Single-Org vs Multi-Org**
   - Single: Simpler, shared data, one governance structure
   - Multi: Data isolation, different compliance needs, M&A
   - Hybrid: Salesforce Connect to bridge orgs

2. **Event-Driven Architecture (EDA)**
   - Decouple components via events
   - Platform Events for Salesforce-to-Salesforce
   - CDC for external system sync
   - Benefits: loose coupling, independent scaling, resilience

3. **Microservices with Salesforce**
   - Salesforce Functions (compute)
   - External services via Named Credentials
   - MuleSoft as API gateway
   - Heroku for custom compute

4. **Data Architecture at Scale**
   - Skinny tables for wide objects
   - Big Objects for archival
   - External Objects for federated queries
   - Custom indexes for query performance

5. **Multi-Tenant Design Considerations**
   - All design must work within governor limits
   - Sharing model impacts performance at scale
   - Metadata-driven customization over code
   - Configuration over customization principle

**Architecture review framework:**
\`\`\`
1. Business requirements → Data volume estimates
2. Security & compliance → OWD, encryption needs
3. Integration landscape → Number of systems, data flow
4. Performance targets → Response times, throughput
5. Scalability plan → Growth projections, limit analysis
\`\`\``,
      codeExample: `// Scalable Architecture Patterns

// 1. Configuration-Driven Architecture
// Use Custom Metadata Types instead of hard-coded values
public class ConfigurableProcessor {
    
    public static void processRecords(List<SObject> records, String processType) {
        // Read configuration from Custom Metadata
        List<Process_Config__mdt> configs = [
            SELECT Handler_Class__c, Is_Active__c, Execution_Order__c
            FROM Process_Config__mdt
            WHERE Process_Type__c = :processType
            AND Is_Active__c = true
            ORDER BY Execution_Order__c ASC
        ];
        
        for (Process_Config__mdt config : configs) {
            // Dynamic handler instantiation
            Type handlerType = Type.forName(config.Handler_Class__c);
            if (handlerType != null) {
                IProcessor handler = (IProcessor) handlerType.newInstance();
                handler.process(records);
            }
        }
    }
    
    public interface IProcessor {
        void process(List<SObject> records);
    }
}

// 2. Feature Flags using Custom Metadata
public class FeatureFlags {
    
    private static Map<String, Feature_Flag__mdt> flags;
    
    static {
        flags = new Map<String, Feature_Flag__mdt>();
        for (Feature_Flag__mdt flag : [
            SELECT DeveloperName, Is_Enabled__c, Rollout_Percentage__c
            FROM Feature_Flag__mdt
        ]) {
            flags.put(flag.DeveloperName, flag);
        }
    }
    
    public static Boolean isEnabled(String featureName) {
        Feature_Flag__mdt flag = flags.get(featureName);
        if (flag == null) return false;
        
        if (flag.Rollout_Percentage__c != null && flag.Rollout_Percentage__c < 100) {
            // Percentage-based rollout
            Integer hash = Math.abs(UserInfo.getUserId().hashCode());
            return Math.mod(hash, 100) < flag.Rollout_Percentage__c;
        }
        
        return flag.Is_Enabled__c;
    }
}

// Usage in code:
// if (FeatureFlags.isEnabled('New_Pricing_Engine')) {
//     NewPricingEngine.calculate(opp);
// } else {
//     LegacyPricing.calculate(opp);
// }

// 3. Multi-Org Data Architecture
public class CrossOrgDataService {
    
    // Using Salesforce Connect / External Objects
    // External_Account__x maps to Account in another org
    
    public static List<External_Account__x> getExternalAccounts(String industry) {
        return [
            SELECT ExternalId, Name__c, Industry__c, Revenue__c
            FROM External_Account__x
            WHERE Industry__c = :industry
            LIMIT 100
        ];
    }
    
    // Org-to-Org sync via Named Credentials
    @future(callout=true)
    public static void syncToSecondaryOrg(Set<Id> accountIds) {
        List<Account> accounts = [
            SELECT Id, Name, Industry, AnnualRevenue
            FROM Account WHERE Id IN :accountIds
        ];
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Secondary_Org/services/apexrest/api/accounts');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(accounts));
        
        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            System.debug('Sync failed: ' + res.getBody());
        }
    }
}`,
      exercise: `**Architecture Practice:**
1. Design a data model for a multi-business-unit org (separate products, shared customers)
2. Implement Feature Flags using Custom Metadata Types with percentage-based rollout
3. Create a configuration-driven processor that dynamically loads handlers
4. Design a multi-org architecture for a company with US and EU data residency requirements
5. Build an event-driven architecture connecting 3 Salesforce components via Platform Events
6. Design a Large Data Volume strategy for an org projected to reach 10M records in 2 years
7. Create an architecture decision document comparing single-org vs multi-org for a merger
8. Implement a canary release strategy for Apex code changes
9. Design a disaster recovery plan for a mission-critical Salesforce implementation
10. Build a technical debt tracking system using Custom Metadata`,
      commonMistakes: [
        "Defaulting to multi-org when single-org would work — multi-org adds complexity for data sharing and integration. Start with single-org unless there's a specific reason (compliance, isolation)",
        "Not considering governor limits in architecture decisions — every architectural component shares the same transaction limits when triggered synchronously",
        "Over-customizing when configuration works — Custom Metadata Types, Flow, and declarative tools are often more maintainable than Apex",
        "Not planning for scale from the start — retroactively fixing performance for LDV is much harder than designing for it",
        "Ignoring the 3 releases per year — Salesforce pushes updates 3 times/year. Your architecture must survive automatic platform upgrades"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your company is acquiring another company that also uses Salesforce. How do you approach the architecture?",
          a: "**Phase 1 — Assessment:** (1) Inventory both orgs: objects, customizations, integrations, data volumes. (2) Identify overlapping data (shared customers, products). (3) Assess compliance requirements (do both need separate data residency?). **Phase 2 — Decision:** (a) **Merge into one org** if: same business model, shared customers, no compliance barriers. (b) **Keep separate** if: different industries, regulatory requirements, temporary until integration. (c) **Hybrid** if: shared customer view needed but independent operations. **Phase 3 — Implementation:** For single org: data migration plan, field mapping, permission realignment. For multi-org: Salesforce Connect for cross-org visibility, shared Master Data Management, unified reporting via CRM Analytics."
        }
      ]
    }
  ]
};

export default sfPhase9;
