const sfPhase12 = {
  id: "phase-12",
  title: "Phase 12: Salesforce Clouds & Products",
  emoji: "☁️",
  description: "Overview of Salesforce's major clouds and products — Sales Cloud, Service Cloud, Experience Cloud, Marketing Cloud, Analytics, and industry-specific solutions for enterprise architecture.",
  topics: [
    {
      id: "sf-sales-service-cloud",
      title: "Sales Cloud & Service Cloud Architecture",
      explanation: `Understanding Salesforce's core clouds is essential for any developer or architect. Most enterprise orgs use Sales Cloud, Service Cloud, or both.

**Sales Cloud — Key Features:**
- **Lead Management** — Lead capture, scoring, assignment, conversion
- **Opportunity Management** — Pipeline tracking, forecasting, stage progression
- **Account & Contact Management** — 360° customer view
- **Products & Price Books** — Catalog, pricing tiers, discounts
- **Quotes & Orders** — CPQ (Configure, Price, Quote)
- **Forecasting** — Revenue forecasting, collaborative, customizable
- **Einstein AI** — Lead scoring, opportunity insights, activity capture

**Service Cloud — Key Features:**
- **Case Management** — Multi-channel case creation, assignment, escalation
- **Knowledge Base** — Article management, search, versioning
- **Omni-Channel** — Route work to agents based on capacity and skill
- **Service Console** — Multi-tab workspace for productivity
- **Entitlements & SLAs** — Service level tracking, milestones
- **Field Service** — Scheduling, dispatch, mobile worker app
- **Einstein Bots** — AI-powered chat bots

**Developer considerations for each cloud:**

Sales Cloud development:
- Custom Lead scoring and assignment rules
- Complex CPQ automation (price calculation, approval workflows)
- Opportunity stage management triggers
- Revenue recognition automation
- Sales analytics dashboards

Service Cloud development:
- Custom case assignment algorithms
- SLA monitoring and escalation triggers
- Knowledge article management
- Omni-Channel customization
- Customer portal (Experience Cloud)
- Chat bot integration

**Architecture patterns by cloud:**
\`\`\`
Sales:    Lead → Account + Contact + Opportunity → Quote → Order
Service:  Case → Escalation → Knowledge → Resolution → Survey
Combined: Account → Contacts → Opportunities + Cases + Activities
\`\`\``,
      codeExample: `// Sales Cloud & Service Cloud Development Patterns

// 1. Lead Conversion with custom logic
public class LeadConversionService {
    
    public static Database.LeadConvertResult convertLead(
        Id leadId, Id accountId, Boolean createOpportunity
    ) {
        Lead lead = [
            SELECT Id, FirstName, LastName, Company, Email, Status
            FROM Lead WHERE Id = :leadId
        ];
        
        Database.LeadConvert lc = new Database.LeadConvert();
        lc.setLeadId(leadId);
        
        if (accountId != null) {
            lc.setAccountId(accountId); // Merge into existing account
        }
        
        if (!createOpportunity) {
            lc.setDoNotCreateOpportunity(true);
        }
        
        lc.setConvertedStatus('Qualified');
        
        Database.LeadConvertResult result = Database.convertLead(lc);
        
        if (result.isSuccess()) {
            // Post-conversion logic
            Id newAccountId = result.getAccountId();
            Id newContactId = result.getContactId();
            Id newOppId = result.getOpportunityId();
            
            System.debug('Converted: Account=' + newAccountId + 
                ', Contact=' + newContactId + ', Opp=' + newOppId);
        }
        
        return result;
    }
}

// 2. Case Auto-Assignment and Escalation
public class CaseAutomationService {
    
    // Auto-assign cases based on criteria
    public static void assignCases(List<Case> cases) {
        // Load assignment rules
        Map<String, Id> queuesBySkill = new Map<String, Id>();
        for (Group q : [SELECT Id, Name FROM Group WHERE Type = 'Queue' 
            AND Name LIKE 'Support_%']) {
            queuesBySkill.put(q.Name, q.Id);
        }
        
        for (Case c : cases) {
            String priority = c.Priority;
            String product = c.Product__c;
            
            // Route to appropriate queue
            if (priority == 'Critical') {
                c.OwnerId = queuesBySkill.get('Support_Tier3');
            } else if (product == 'Enterprise') {
                c.OwnerId = queuesBySkill.get('Support_Enterprise');
            } else {
                c.OwnerId = queuesBySkill.get('Support_General');
            }
        }
    }
    
    // SLA monitoring
    public static void checkSLABreaches() {
        List<Case> breachedCases = [
            SELECT Id, CaseNumber, Priority, OwnerId, CreatedDate
            FROM Case
            WHERE Status != 'Closed'
            AND Priority = 'High'
            AND CreatedDate < :Datetime.now().addHours(-4)
            AND Escalated__c = false
        ];
        
        for (Case c : breachedCases) {
            c.Escalated__c = true;
            c.Priority = 'Critical';
        }
        
        if (!breachedCases.isEmpty()) {
            update breachedCases;
        }
    }
}

// 3. Opportunity Forecasting
public class ForecastService {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Decimal> getQuarterlyForecast(Id userId) {
        List<AggregateResult> pipeline = [
            SELECT StageName, SUM(Amount) totalAmount, 
                   SUM(ExpectedRevenue) weightedAmount
            FROM Opportunity
            WHERE OwnerId = :userId
            AND CloseDate = THIS_QUARTER
            AND IsClosed = false
            GROUP BY StageName
        ];
        
        Decimal committed = 0;
        Decimal bestCase = 0;
        Decimal pipeline_total = 0;
        
        for (AggregateResult ar : pipeline) {
            String stage = (String) ar.get('StageName');
            Decimal total = (Decimal) ar.get('totalAmount');
            Decimal weighted = (Decimal) ar.get('weightedAmount');
            
            if (stage == 'Negotiation' || stage == 'Proposal') {
                committed += weighted;
            }
            bestCase += total;
            pipeline_total += weighted;
        }
        
        // Add closed won
        Decimal closedWon = 0;
        AggregateResult[] won = [
            SELECT SUM(Amount) total FROM Opportunity
            WHERE OwnerId = :userId
            AND CloseDate = THIS_QUARTER
            AND StageName = 'Closed Won'
        ];
        if (won[0].get('total') != null) {
            closedWon = (Decimal) won[0].get('total');
        }
        
        return new Map<String, Decimal>{
            'closedWon' => closedWon,
            'committed' => committed,
            'bestCase' => bestCase,
            'pipeline' => pipeline_total
        };
    }
}`,
      exercise: `**Salesforce Cloud Practice:**
1. Build a complete Lead-to-Opportunity conversion flow with custom field mapping
2. Create a Case auto-assignment system using custom matching criteria
3. Implement SLA monitoring with automatic escalation after 4 hours
4. Build a sales forecasting dashboard showing pipeline by stage and quarter
5. Create a Knowledge Base article management system with versions and approval
6. Implement Omni-Channel routing for a support team with 3 skill groups
7. Build a customer portal using Experience Cloud with case submission
8. Create a CPQ flow that configures product bundles and calculates pricing
9. Implement a Chatter-based case collaboration system
10. Design a complete CRM architecture combining Sales and Service Cloud`,
      commonMistakes: [
        "Not leveraging standard Sales/Service Cloud features before customizing — many requirements can be met with configuration (assignment rules, escalation rules, approval processes)",
        "Ignoring Lead conversion mapping — custom fields on Lead must be mapped to Account, Contact, and Opportunity during conversion. Unmapped fields are lost",
        "Over-architecting case routing — start with standard assignment rules and queues before building complex custom routing",
        "Not considering Omni-Channel capacity — routing work to agents without checking their capacity leads to uneven workloads",
        "Building custom forecasting when standard Forecasting works — Salesforce's built-in forecasting handles most use cases with configuration"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Describe the Lead Conversion process in Salesforce. What happens technically when a Lead is converted?",
          a: "When a Lead is converted, Salesforce: (1) Creates an **Account** (or merges into existing). (2) Creates a **Contact** (or merges into existing). (3) Optionally creates an **Opportunity**. (4) Maps Lead fields to Account, Contact, and Opportunity fields based on Lead Field Mapping. (5) Sets Lead Status to converted value. (6) The Lead record is marked as converted (IsConverted = true) and becomes read-only. (7) All Activities (Tasks/Events) are transferred to the Contact. (8) Campaign Member associations are preserved. (9) **Triggers fire:** Lead before/after update triggers AND Account/Contact/Opportunity insert triggers all fire. (10) Custom field values not mapped are LOST — always verify mappings."
        },
        {
          type: "scenario",
          q: "A company needs to handle 5,000 support cases per day with different SLAs based on customer tier. How do you architect this?",
          a: "**Architecture:** (1) **Entitlements:** Create Entitlement Processes for each tier (Platinum: 2hr response, Gold: 4hr, Silver: 8hr). Link to Account via Service Contract. (2) **Case assignment:** Omni-Channel routing based on Priority + Product skills. Queues for each skill group. (3) **Escalation:** Flow monitors SLA milestones. Auto-escalate to Tier 2 queue when response time breached. (4) **Knowledge:** Surface relevant articles during case creation to enable self-service. (5) **Portal:** Experience Cloud for customer self-service (reduces case volume). (6) **Automation:** Before-save Flow for default values. After-save Flow for notifications. Scheduled Flow for daily SLA breach reports. (7) **Scale:** 5,000 cases/day = ~35K/week. Design indexes on Status, Priority, OwnerId for query performance."
        }
      ]
    },
    {
      id: "sf-experience-cloud-analytics",
      title: "Experience Cloud, Analytics & AI",
      explanation: `Beyond Sales and Service, Salesforce offers specialized clouds and products that developers need to understand for enterprise solutions.

**Experience Cloud (formerly Community Cloud):**
- Build portals, forums, and sites for external users
- Customer portals, partner portals, help centers
- Uses Lightning Web Components and Aura
- Guest user access (unauthenticated)
- Full CRM integration (cases, knowledge, orders)
- Custom authentication and branding

**CRM Analytics (formerly Tableau CRM / Einstein Analytics):**
- Advanced analytics and BI built on Salesforce data
- Dashboards, lenses, and datasets
- SAQL (Salesforce Analytics Query Language)
- Predictive analytics with Einstein Discovery
- Embeddable in Lightning pages

**Einstein AI Features:**
- **Einstein Lead Scoring** — ML-based lead prioritization
- **Einstein Opportunity Scoring** — Win probability prediction
- **Einstein Activity Capture** — Auto-log emails and events
- **Einstein Bots** — Conversational AI for Service
- **Einstein Prediction Builder** — Custom predictions (no code)
- **Einstein Next Best Action** — Recommendations engine
- **Einstein GPT / Copilot** — Generative AI for CRM

**Industry Clouds:**
- **Health Cloud** — Patient management, care plans, health timelines
- **Financial Services Cloud** — Wealth management, banking
- **Manufacturing Cloud** — Sales agreements, account forecasting
- **Education Cloud** — Admissions, student success
- **Nonprofit Cloud** — Fundraising, program management

**Developer impact:**
Understanding these clouds helps architects make technology decisions:
- Does the requirement call for a standard cloud feature or custom development?
- Which cloud combinations solve the business need?
- How do clouds interact in a multi-cloud org?`,
      codeExample: `// Experience Cloud & Analytics Development

// 1. Experience Cloud — Guest User handling
public without sharing class GuestUserService {
    
    // Methods for guest (unauthenticated) users need 'without sharing'
    // because guest users have minimal permissions
    
    @AuraEnabled
    public static Case submitSupportCase(
        String name, String email, String subject, String description
    ) {
        // Create case from portal
        Case newCase = new Case(
            Subject = subject,
            Description = description,
            SuppliedName = name,
            SuppliedEmail = email,
            Status = 'New',
            Origin = 'Portal',
            RecordTypeId = getRecordTypeId('Case', 'Portal_Case')
        );
        insert newCase;
        return newCase;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Knowledge__kav> searchKnowledge(String searchTerm) {
        if (String.isBlank(searchTerm) || searchTerm.length() < 3) {
            return new List<Knowledge__kav>();
        }
        
        String search = '%' + searchTerm + '%';
        return [
            SELECT Id, Title, Summary, UrlName, ArticleNumber
            FROM Knowledge__kav
            WHERE PublishStatus = 'Online'
            AND Language = 'en_US'
            AND (Title LIKE :search OR Summary LIKE :search)
            LIMIT 10
        ];
    }
    
    private static Id getRecordTypeId(String obj, String devName) {
        return Schema.getGlobalDescribe().get(obj)
            .getDescribe().getRecordTypeInfosByDeveloperName()
            .get(devName).getRecordTypeId();
    }
}

// 2. Einstein Prediction — Custom predictions via API
public class EinsteinPredictionService {
    
    // Call Einstein Prediction Builder predictions
    @AuraEnabled
    public static Decimal getChurnProbability(Id accountId) {
        // Einstein Prediction Builder creates fields on the object
        Account acc = [
            SELECT Id, Name, Churn_Prediction__c, Churn_Score__c
            FROM Account WHERE Id = :accountId
        ];
        
        return acc.Churn_Score__c; // 0-100 probability
    }
    
    // Einstein Next Best Action
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getRecommendations(Id recordId) {
        // Recommendations are configured declaratively
        // Access programmatically via ConnectApi
        
        // Simplified example
        List<Map<String, String>> recommendations = new List<Map<String, String>>();
        
        Account acc = [
            SELECT Industry, AnnualRevenue, Last_Contact_Date__c
            FROM Account WHERE Id = :recordId
        ];
        
        if (acc.Last_Contact_Date__c < Date.today().addDays(-90)) {
            recommendations.add(new Map<String, String>{
                'action' => 'Schedule Check-in',
                'reason' => 'No contact in 90+ days',
                'priority' => 'High'
            });
        }
        
        if (acc.AnnualRevenue > 1000000 && acc.Industry == 'Technology') {
            recommendations.add(new Map<String, String>{
                'action' => 'Offer Enterprise Package',
                'reason' => 'High-value tech account',
                'priority' => 'Medium'
            });
        }
        
        return recommendations;
    }
}

// 3. CRM Analytics — SAQL query example
// SAQL (Salesforce Analytics Query Language)
// Used in CRM Analytics (Tableau CRM) dashboards
//
// q = load "Opportunities";
// q = filter q by 'StageName' in ["Closed Won", "Negotiation"];
// q = group q by 'Account.Industry';
// q = foreach q generate 'Account.Industry' as 'Industry',
//     sum('Amount') as 'Total_Revenue',
//     count() as 'Deal_Count',
//     avg('Amount') as 'Avg_Deal_Size';
// q = order q by 'Total_Revenue' desc;
// q = limit q 20;`,
      exercise: `**Salesforce Clouds Practice:**
1. Build a customer portal using Experience Cloud with case submission and knowledge search
2. Create a partner portal with deal registration and lead sharing
3. Set up Einstein Lead Scoring and analyze the scoring model
4. Build a CRM Analytics dashboard showing sales performance metrics
5. Create an Einstein Bot for common support questions
6. Configure Einstein Next Best Action recommendations for sales
7. Build a custom Experience Cloud page with LWC components
8. Set up Einstein Discovery to find patterns in your Opportunity data
9. Create a multi-cloud solution combining Sales, Service, and Experience Cloud
10. Design an architecture for an industry cloud (Healthcare or Financial Services)`,
      commonMistakes: [
        "Not understanding guest user security in Experience Cloud — guest users bypass many security controls. Always use 'without sharing' deliberately and validate inputs",
        "Over-customizing when standard cloud features exist — check if Einstein, Flow, or standard features solve the problem before writing Apex",
        "Not considering license costs — each cloud has licensing implications. Architecture decisions must consider license models",
        "Building custom AI when Einstein features exist — Einstein Prediction Builder, Lead Scoring, and Next Best Action cover many ML use cases without custom code",
        "Ignoring mobile in Experience Cloud — portals must be responsive. Test on mobile devices early"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is Experience Cloud and how does it differ from a standard Salesforce org?",
          a: "Experience Cloud (formerly Communities) allows you to build external-facing portals and sites for customers, partners, and employees. **Key differences:** (1) **External users** — People outside your company access it with Community licenses (cheaper than full CRM licenses). (2) **Guest access** — Unauthenticated users can view public content. (3) **Sharing is critical** — External users should only see their own data. Sharing sets and sharing rules control access. (4) **Custom branding** — Full control over look and feel. (5) **Same platform** — Uses the same objects (Case, Account, etc.) but with restricted access. (6) **Use cases:** Customer support portal, partner deal registration, knowledge base, self-service."
        },
        {
          type: "scenario",
          q: "A retail company wants AI-powered product recommendations for their sales team. How do you implement this?",
          a: "**Approach:** (1) **Einstein Next Best Action** — Configure recommendation strategies declaratively. Define recommendations based on: product affinity, purchase history, account segment. (2) **Einstein Discovery** — Analyze historical Opportunity data to find patterns (which products sell together, which customer segments buy what). (3) **LWC Component** — Build a custom component that displays recommendations on the Account/Opportunity page using the NBA API. (4) **Data enrichment** — Ensure Account and Opportunity records have complete product and industry data for better predictions. (5) **Feedback loop** — Track which recommendations sales reps accept/reject to improve the model. **No custom ML needed** — Einstein's declarative tools handle most recommendation use cases."
        }
      ]
    }
  ]
};

export default sfPhase12;
