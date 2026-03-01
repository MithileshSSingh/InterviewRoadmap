const sfPhase2 = {
  id: "phase-2",
  title: "Phase 2: Salesforce Platform Fundamentals",
  emoji: "🏗️",
  description: "Deep dive into Salesforce's multi-tenant architecture, metadata-driven platform, data modeling, relationships, security model, and enterprise configuration best practices.",
  topics: [
    {
      id: "sf-multi-tenant-architecture",
      title: "Multi-Tenant Architecture & Metadata-Driven Platform",
      explanation: `Salesforce runs on a **multi-tenant architecture** — thousands of organizations (tenants) share the same physical infrastructure, application code, and database instance. Understanding this is fundamental to every design decision you make.

**How multi-tenancy works:**
1. **Shared infrastructure** — All customers run on the same servers, same database clusters, same application code
2. **Logical data separation** — Each org's data is isolated via an OrgId partition. You can never accidentally access another org's data
3. **Metadata-driven customization** — Your "custom objects," "custom fields," and "page layouts" are all stored as metadata rows in shared tables, not as new database columns
4. **Governor limits** — Because resources are shared, Salesforce enforces strict limits per transaction to prevent any one tenant from monopolizing resources

**The metadata-driven model:**
Instead of creating a new database table when you create a custom object, Salesforce stores your object definition as metadata. The actual data is stored in shared tables with generic columns (like Value0, Value1, etc). When you query your custom object, the platform dynamically maps your field names to the underlying generic columns.

\`\`\`
Traditional app:  CREATE TABLE Invoices (id INT, amount DECIMAL, ...)
Salesforce:       INSERT INTO CustomEntityDefinition (OrgId, ObjectName, ...) 
                  VALUES ('00D...', 'Invoice__c', ...)
\`\`\`

**Why this matters for developers:**
- **Performance** — Your SOQL queries are translated to highly optimized SQL with OrgId filters. Poorly designed queries affect everyone on the instance.
- **Governor limits** — You get 100 SOQL queries, 150 DML statements, etc. per transaction because you're sharing resources.
- **No raw SQL** — You can't write SQL. SOQL is a constrained query language that prevents expensive operations (no arbitrary JOINs, no full table scans without selective filters).
- **Automatic upgrades** — Salesforce pushes 3 releases per year (Spring, Summer, Winter). Your customizations must survive these upgrades.

**Instance architecture:**
- **Pod** — A pod is a cluster of servers hosting multiple orgs. Example: NA44, EU18, AP15
- **Instance** — Your org runs on a specific instance (e.g., na44.salesforce.com)
- **Trust site** — status.salesforce.com shows real-time health of all instances

🏢 **Enterprise impact:** When a shared instance has performance issues, ALL orgs on that instance are affected. This is why Salesforce is extremely protective of query performance and enforces governor limits so strictly.`,
      codeExample: `// Understanding multi-tenancy through governor limits
// Every line of Apex runs within strict resource constraints

public class GovernorLimitDemo {
    
    // Check current governor limit consumption
    public static void showLimits() {
        System.debug('SOQL Queries: ' + Limits.getQueries() + 
            ' / ' + Limits.getLimitQueries());
        System.debug('DML Statements: ' + Limits.getDmlStatements() + 
            ' / ' + Limits.getLimitDmlStatements());
        System.debug('DML Rows: ' + Limits.getDmlRows() + 
            ' / ' + Limits.getLimitDmlRows());
        System.debug('CPU Time: ' + Limits.getCpuTime() + 
            'ms / ' + Limits.getLimitCpuTime() + 'ms');
        System.debug('Heap Size: ' + Limits.getHeapSize() + 
            ' / ' + Limits.getLimitHeapSize());
        System.debug('Callouts: ' + Limits.getCallouts() + 
            ' / ' + Limits.getLimitCallouts());
    }
    
    // This code demonstrates WHY governor limits exist
    // BAD: This would crush a shared database
    public static void antiPattern() {
        // This trigger processes 200 records (bulk insert)
        // Without governor limits, this would execute:
        //   200 SOQL queries × 200 DML operations = 40,000 database ops
        //   On a shared instance with 10,000 orgs = potential meltdown
        
        // for (Account a : Trigger.new) {
        //     List<Contact> contacts = [SELECT Id FROM Contact 
        //         WHERE AccountId = :a.Id]; // SOQL in loop!
        //     for (Contact c : contacts) {
        //         c.MailingCity = a.BillingCity;
        //         update c; // DML in loop!
        //     }
        // }
    }
    
    // GOOD: Respects multi-tenant architecture
    public static void bulkifiedPattern(List<Account> accounts) {
        // Collect all account IDs (in-memory operation — no limits)
        Set<Id> accountIds = new Set<Id>();
        for (Account a : accounts) {
            accountIds.add(a.Id);
        }
        
        // ONE query for all contacts across all accounts
        List<Contact> allContacts = [
            SELECT Id, AccountId, MailingCity 
            FROM Contact 
            WHERE AccountId IN :accountIds
        ];
        
        // Build a map for efficient lookup
        Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
        for (Contact c : allContacts) {
            if (!contactsByAccount.containsKey(c.AccountId)) {
                contactsByAccount.put(c.AccountId, new List<Contact>());
            }
            contactsByAccount.get(c.AccountId).add(c);
        }
        
        // Apply changes in memory
        List<Contact> contactsToUpdate = new List<Contact>();
        for (Account a : accounts) {
            List<Contact> relatedContacts = contactsByAccount.get(a.Id);
            if (relatedContacts != null) {
                for (Contact c : relatedContacts) {
                    c.MailingCity = a.BillingCity;
                    contactsToUpdate.add(c);
                }
            }
        }
        
        // ONE DML operation for all contacts
        if (!contactsToUpdate.isEmpty()) {
            update contactsToUpdate;
        }
        
        // Result: 1 SOQL + 1 DML instead of N × M
    }
}`,
      exercise: `**Deep-Dive Exercises:**
1. Log into your Developer org and check which instance you're on (Setup > Company Information)
2. Create a custom object and then use Tooling API to find how it's stored as metadata
3. Write an Apex class that outputs all current governor limit values using the Limits class
4. Design a process that would hit the 100 SOQL limit and then refactor it to use 1 query
5. Research the Salesforce Trust site (trust.salesforce.com) — find your instance's uptime history
6. Explain why Salesforce doesn't allow arbitrary SQL JOINs in SOQL
7. Calculate the maximum number of records you can process in a single synchronous transaction
8. Research how Salesforce handles schema changes in a multi-tenant database
9. Investigate what happens when an org on your instance triggers a runaway process
10. Compare Salesforce's multi-tenant model to AWS single-tenant (dedicated) instances`,
      commonMistakes: [
        "Thinking each org has its own database — ALL orgs on an instance share the same physical database with logical data separation via OrgId",
        "Ignoring governor limits during development because your dev org has small data — production might have millions of records being processed in bulk",
        "Not understanding why SOQL is limited — it's not a limitation of Apex, it's protecting the shared infrastructure from expensive queries",
        "Assuming your org runs in isolation — other orgs on the same instance compete for the same resources",
        "Not monitoring instance health — production issues can be caused by Salesforce infrastructure, not just your code"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain Salesforce's multi-tenant architecture and why governor limits exist.",
          a: "Salesforce uses a **shared-infrastructure multi-tenant model**: thousands of orgs run on the same servers and database. Data is logically separated by OrgId. Custom objects are stored as metadata rows, not separate database tables. **Governor limits exist because resources are shared** — if one org runs a SOQL query that locks a table for 10 seconds, it affects every org on that instance. Limits ensure fair resource allocation: 100 SOQL queries, 150 DML statements, 10-second CPU time, etc. per transaction. This architecture enables Salesforce to deliver 3 automatic upgrades per year to all customers simultaneously."
        },
        {
          type: "tricky",
          q: "How does Salesforce store custom fields in its multi-tenant database?",
          a: "Custom fields are NOT stored as actual database columns. Salesforce uses a **polymorphic column approach**: the physical database has generic columns (Value0, Value1, ... up to ~800). When you create a custom field, Salesforce creates a metadata entry mapping your field name to one of these columns. When you query the field, the platform dynamically maps it. This means: (1) Adding a field doesn't require ALTER TABLE (instant, no downtime). (2) Different orgs use different columns in the same table. (3) Indexing is handled via separate index tables, not database indexes. (4) There's a limit on custom fields per object (~500 for most objects)."
        },
        {
          type: "scenario",
          q: "Your Salesforce org is experiencing slow performance. How do you diagnose whether it's your code or the platform?",
          a: "**Systematic diagnosis:** (1) Check **trust.salesforce.com** for your instance — is there a reported incident? (2) Review **Apex Execution Logs** — check if transactions are hitting near-limit SOQL counts or CPU time. (3) Use **Debug Logs** with FINER level to identify slow SOQL queries. (4) Check the **API Usage** page — are you near daily API limits? (5) Review **Setup Audit Trail** — did someone deploy new automation? (6) Use **Query Plan** tool in Developer Console to check query selectivity. (7) Monitor **event monitoring** logs for long-running transactions. If instance health is fine, the issue is likely: unselective queries, trigger recursion, or excessive automation on the same object."
        }
      ]
    },
    {
      id: "sf-objects-relationships",
      title: "Standard & Custom Objects, Relationships",
      explanation: `Every Salesforce solution starts with the **data model**. Understanding objects, fields, and relationships is the foundation of all Salesforce development.

**Standard Objects:**
Salesforce ships with ~200 standard objects. The most critical:
- **Account** — Companies/organizations (the center of most data models)
- **Contact** — People associated with accounts
- **Opportunity** — Sales deals (pipeline tracking)
- **Lead** — Unqualified prospects (convert to Account + Contact + Opportunity)
- **Case** — Support tickets/issues
- **Task / Event** — Activities (calls, meetings, to-dos)
- **User** — System users (not the same as Contact)

**Custom Objects:**
Created to store data specific to your business. Named with \`__c\` suffix.
- Example: \`Invoice__c\`, \`Project__c\`, \`TimeEntry__c\`
- Can have up to ~500 custom fields
- Support all relationship types
- Can participate in sharing, triggers, flows, and Lightning pages

**Relationship Types:**

1. **Lookup Relationship** — Loose association
   - Child can exist without parent
   - No cascade delete (configurable)
   - Sharing is independent
   - Maximum 40 lookups per object
   - Example: Contact → Account (Contact can exist without Account)

2. **Master-Detail Relationship** — Tight parent-child
   - Child cannot exist without parent
   - Cascade delete (deleting parent deletes all children)
   - Child inherits parent's sharing/security
   - Roll-up summary fields available on parent
   - Maximum 2 master-detail per object
   - Example: OpportunityLineItem → Opportunity

3. **Junction Object** — Many-to-many
   - A custom object with TWO master-detail relationships
   - Creates a many-to-many relationship between two objects
   - Inherits sharing from the primary master (first master-detail created)
   - Example: Student__c ←→ Class_Enrollment__c ←→ Course__c

4. **Hierarchical Relationship** — Self-referencing (User object only)
   - Example: User.ManagerId → User

5. **External Lookup** — References external data sources
   - Used with Salesforce Connect and external objects

**Data modeling best practices:**
- Start with standard objects before creating custom ones
- Use Master-Detail when you need cascade delete and roll-up summaries
- Use Lookup when objects need independent lifecycle
- Junction objects for many-to-many (no native M:M support)
- Keep object relationships shallow (3-4 levels max for query performance)
- Plan for large data volumes from the start`,
      codeExample: `// Working with objects and relationships in Apex

// Creating records with relationships
public class DataModelExamples {
    
    // 1. Creating parent-child records (Account → Contact)
    public static void createAccountWithContacts() {
        // Create parent
        Account corp = new Account(
            Name = 'Acme Corporation',
            Industry = 'Technology',
            BillingCity = 'San Francisco'
        );
        insert corp;
        
        // Create children with relationship
        List<Contact> contacts = new List<Contact>{
            new Contact(
                FirstName = 'John', 
                LastName = 'Doe',
                AccountId = corp.Id,  // Lookup relationship
                Email = 'john@acme.com'
            ),
            new Contact(
                FirstName = 'Jane', 
                LastName = 'Smith',
                AccountId = corp.Id,
                Email = 'jane@acme.com'
            )
        };
        insert contacts;
    }
    
    // 2. Querying across relationships
    public static void queryRelationships() {
        // Parent-to-child (subquery) — "Get account and its contacts"
        List<Account> accounts = [
            SELECT Name, Industry,
                (SELECT FirstName, LastName, Email 
                 FROM Contacts  // Child relationship name
                 WHERE Email != null
                 ORDER BY LastName)
            FROM Account
            WHERE Industry = 'Technology'
            LIMIT 10
        ];
        
        // Child-to-parent (dot notation) — "Get contact and its account info"
        List<Contact> contacts = [
            SELECT FirstName, LastName,
                Account.Name,           // Parent field
                Account.Industry,       // Navigate up the relationship
                Account.Owner.Name      // Navigate multiple levels
            FROM Contact
            WHERE Account.Industry = 'Technology'
        ];
        
        // Working with results
        for (Account acc : accounts) {
            System.debug('Account: ' + acc.Name);
            for (Contact c : acc.Contacts) {  // Access child records
                System.debug('  Contact: ' + c.FirstName + ' ' + c.LastName);
            }
        }
    }
    
    // 3. Junction Object pattern (Many-to-Many)
    // Student__c <---> Course_Enrollment__c <---> Course__c
    public static void createManyToMany() {
        // Assume Student__c and Course__c already exist
        // Create junction records
        List<Course_Enrollment__c> enrollments = new List<Course_Enrollment__c>();
        
        // Enroll student in multiple courses
        for (Id courseId : courseIds) {
            enrollments.add(new Course_Enrollment__c(
                Student__c = studentId,         // Master-Detail 1
                Course__c = courseId,            // Master-Detail 2
                Enrollment_Date__c = Date.today(),
                Status__c = 'Active'
            ));
        }
        insert enrollments;
    }
    
    // 4. Dynamic relationship queries
    public static List<SObject> getRelatedRecords(
        Id parentId, String childObject, String relationshipField
    ) {
        String query = 'SELECT Id, Name FROM ' + 
            String.escapeSingleQuotes(childObject) + 
            ' WHERE ' + String.escapeSingleQuotes(relationshipField) + 
            ' = :parentId';
        return Database.query(query);
    }
    
    // 5. Schema Describe — inspect relationships at runtime
    public static void describeRelationships(String objectName) {
        Schema.DescribeSObjectResult objDescribe = 
            Schema.getGlobalDescribe().get(objectName).getDescribe();
        
        // Get all child relationships
        List<Schema.ChildRelationship> children = objDescribe.getChildRelationships();
        for (Schema.ChildRelationship child : children) {
            System.debug('Child Object: ' + child.getChildSObject());
            System.debug('Relationship Name: ' + child.getRelationshipName());
            System.debug('Field: ' + child.getField());
        }
    }
}`,
      exercise: `**Data Modeling Practice:**
1. Design a data model for a university system: Students, Courses, Professors, Departments, Enrollments
2. Create a Junction Object to model many-to-many relationships between Products and Orders
3. Write SOQL queries that traverse: parent-to-child, child-to-parent, and across junction objects
4. Use Schema.DescribeSObjectResult to list all relationships on the Account object
5. Create a trigger on a child object that updates a field on the parent (simulating a roll-up on a lookup)
6. Design an ERD (Entity Relationship Diagram) for a project management app with 8+ objects
7. Compare lookup vs master-detail: create both and test what happens when you delete the parent
8. Build a hierarchical relationship on a custom object (self-referencing lookup)
9. Write a batch Apex job that reparents 100,000 Contact records from one Account to another
10. Investigate the maximum number of relationship levels you can traverse in a single SOQL query (5)`,
      commonMistakes: [
        "Using lookup when master-detail is needed — if you need cascade delete or roll-up summary fields, you must use master-detail",
        "Creating too many master-detail relationships — each object can have at most 2 master-detail relationships",
        "Not understanding cascade delete implications — deleting a parent in master-detail deletes ALL children permanently",
        "Forgetting that junction objects inherit sharing from the PRIMARY master — the first master-detail relationship created determines the sharing context",
        "Querying too many relationship levels — SOQL supports up to 5 levels of parent traversal and 1 level of child subquery"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between Lookup and Master-Detail relationships in Salesforce?",
          a: "**Lookup:** (1) Loose coupling — child can exist without parent. (2) No cascade delete by default. (3) Independent sharing/security. (4) No roll-up summary fields. (5) Up to 40 per object. **Master-Detail:** (1) Tight coupling — child cannot exist without parent. (2) Cascade delete — deleting parent deletes all children. (3) Child inherits parent's sharing/security settings. (4) Roll-up summary fields available (COUNT, SUM, MIN, MAX). (5) Maximum 2 per object. **When to use:** Master-Detail when records are meaningless without the parent (e.g., Order Line Items). Lookup when records have independent lifecycle (e.g., Contact can exist without Account)."
        },
        {
          type: "scenario",
          q: "How would you implement a many-to-many relationship between Projects and Employees?",
          a: "Salesforce doesn't support native many-to-many relationships. Use a **Junction Object pattern**: Create a custom object `Project_Assignment__c` with two master-detail relationships: one to `Project__c` and one to `Employee__c`. This junction object can also store relationship-specific data like Role, Start_Date, Hours_Allocated. The primary master (first MD created) controls sharing. SOQL query: `SELECT Project__r.Name, Employee__r.Name FROM Project_Assignment__c`. This is the standard Salesforce pattern for M:M relationships."
        },
        {
          type: "tricky",
          q: "Can you convert a Lookup relationship to Master-Detail? What are the requirements?",
          a: "Yes, but with conditions: (1) **All existing child records must have a value in the lookup field** — no null/blank values allowed. (2) The org must not already have 2 master-detail relationships on that object. (3) You cannot convert if the child object already has a roll-up summary field defined. (4) **You cannot convert Master-Detail to Lookup if roll-up summary fields exist** on the parent referencing that relationship — delete them first. To convert in production with null values: run a batch job to populate the lookup field for all records first, then convert."
        },
        {
          type: "conceptual",
          q: "What are External Lookup relationships and when would you use them?",
          a: "External Lookups link a standard or custom object to an **External Object** (data from an external system accessed via Salesforce Connect / OData). Use cases: (1) Your CRM accounts need to reference inventory data stored in SAP without importing it into Salesforce. (2) Order records need to link to shipping data in an external warehouse system. (3) Contacts need to see HR data stored in Workday. External Objects appear like native objects in the UI but query data in real-time from external systems. The relationship uses an External ID field as the key instead of a Salesforce Id."
        }
      ]
    },
    {
      id: "sf-record-types-page-layouts",
      title: "Record Types, Page Layouts & Schema",
      explanation: `**Record Types** allow you to offer different business processes, picklist values, and page layouts for the same object. They're a critical tool for building enterprise-grade solutions that serve multiple business units.

**Record Types — when and why:**
- Different divisions sell different products using the same Opportunity object
- Support teams handle different case categories with different fields
- Multiple countries have different compliance fields on the Account object

**How Record Types work:**
1. Each record type maps to a **Page Layout** (which fields the user sees)
2. Each record type can have different **picklist values** (e.g., different Status options)
3. Record types are assigned to **Profiles** — users only see record types assigned to their profile
4. Record types create different **record creation flows** (different fields presented)
5. Records store their record type in the \`RecordTypeId\` field

**Page Layouts:**
Define the arrangement of fields, related lists, buttons, and components on a record page. Key capabilities:
- Control field visibility and read-only status
- Arrange fields in sections (1 or 2 columns)
- Add related lists (child records)
- Add custom buttons and links
- Include Visualforce pages or Lightning components
- **Important:** Page layouts control field visibility in the UI, NOT field-level security. FLS is separate.

**Lightning Record Pages:**
Modern alternative to Page Layouts using Lightning App Builder:
- Drag-and-drop component placement
- Device-specific layouts (desktop, tablet, phone)
- Dynamic visibility rules (show components conditionally)
- Support for custom Lightning Web Components
- Can override standard page layouts

**Schema Builder:**
Visual tool for designing data models:
- Drag-and-drop object and field creation
- Visual relationship mapping
- Real-time schema visualization
- Useful for documentation and planning

**Enterprise considerations:**
- Plan record types during data modeling, not as an afterthought
- Record type changes in production require careful migration (existing records)
- Page layout changes are metadata — deploy via change sets or SFDX
- Lightning Record Pages offer more flexibility than classic page layouts
- Consider record type impacts on reporting and dashboards`,
      codeExample: `// Working with Record Types in Apex

public class RecordTypeUtils {
    
    // 1. Get Record Type Id by Developer Name (best practice)
    public static Id getRecordTypeId(String objectName, String devName) {
        // Use Schema.SObjectType for reliable, cache-friendly access
        return Schema.getGlobalDescribe()
            .get(objectName)
            .getDescribe()
            .getRecordTypeInfosByDeveloperName()
            .get(devName)
            .getRecordTypeId();
    }
    
    // 2. Create records with specific Record Types
    public static void createCases() {
        Id supportRT = getRecordTypeId('Case', 'Support_Case');
        Id bugRT = getRecordTypeId('Case', 'Bug_Report');
        
        List<Case> cases = new List<Case>{
            new Case(
                Subject = 'Login Issue',
                RecordTypeId = supportRT,
                Priority = 'Medium',
                Status = 'New'
            ),
            new Case(
                Subject = 'Button not working',
                RecordTypeId = bugRT,
                Priority = 'High',
                Status = 'Open'  // Different picklist for bug reports
            )
        };
        insert cases;
    }
    
    // 3. Query and filter by Record Type
    public static List<Case> getCasesByType(String recordTypeName) {
        return [
            SELECT Id, Subject, Status, Priority, RecordType.Name
            FROM Case
            WHERE RecordType.DeveloperName = :recordTypeName
            AND Status != 'Closed'
            ORDER BY CreatedDate DESC
        ];
    }
    
    // 4. Get available Record Types for current user
    public static List<Schema.RecordTypeInfo> getAvailableRecordTypes(
        String objectName
    ) {
        List<Schema.RecordTypeInfo> available = new List<Schema.RecordTypeInfo>();
        Map<String, Schema.RecordTypeInfo> rtMap = 
            Schema.getGlobalDescribe()
                .get(objectName)
                .getDescribe()
                .getRecordTypeInfosByDeveloperName();
        
        for (Schema.RecordTypeInfo rti : rtMap.values()) {
            if (rti.isAvailable() && !rti.isMaster()) {
                available.add(rti);
            }
        }
        return available;
    }
    
    // 5. Dynamically assign Record Type based on criteria
    public static void assignRecordTypes(List<Case> cases) {
        Id supportRT = getRecordTypeId('Case', 'Support_Case');
        Id bugRT = getRecordTypeId('Case', 'Bug_Report');
        Id featureRT = getRecordTypeId('Case', 'Feature_Request');
        
        for (Case c : cases) {
            if (c.Type == 'Bug') {
                c.RecordTypeId = bugRT;
            } else if (c.Type == 'Feature Request') {
                c.RecordTypeId = featureRT;
            } else {
                c.RecordTypeId = supportRT;
            }
        }
    }
    
    // 6. Page Layout assignment query 
    // (useful for understanding which layout a user sees)
    public static void checkLayoutAssignment() {
        // In Apex, you can't directly query page layout assignments
        // But you can use the Metadata API or Tooling API
        // Instead, use Record Type + Profile combination logic
        
        // Determine what record types the running user can access
        Schema.DescribeSObjectResult caseDescribe = Case.SObjectType.getDescribe();
        Map<Id, Schema.RecordTypeInfo> rtById = caseDescribe.getRecordTypeInfosById();
        
        for (Id rtId : rtById.keySet()) {
            Schema.RecordTypeInfo info = rtById.get(rtId);
            System.debug(info.getName() + ' — Available: ' + info.isAvailable() + 
                ', Default: ' + info.isDefaultRecordTypeMapping());
        }
    }
}`,
      exercise: `**Record Type & Layout Exercises:**
1. Create 3 Record Types for the Case object: Support, Bug, Feature Request — each with different picklist values
2. Create different Page Layouts for each Record Type with different field arrangements
3. Build a Lightning Record Page with dynamic visibility (show components based on record type)
4. Write Apex that creates records with specific Record Types using Developer Name (not hard-coded IDs)
5. Write a SOQL query that groups cases by RecordType.Name and counts them
6. Design a migration script that changes Record Types for 50,000 existing records
7. Create a formula field that displays different text based on the Record Type
8. Test what happens when a user tries to create a record with a Record Type not assigned to their Profile
9. Build a complete Lightning page with custom LWC components that change based on Record Type
10. Document all Record Types in your org and their Page Layout assignments`,
      commonMistakes: [
        "Hard-coding Record Type IDs — IDs differ between sandbox and production. Always use DeveloperName to look up IDs at runtime",
        "Confusing Page Layout field visibility with Field-Level Security — Page Layouts only affect UI display; FLS controls actual read/write access to the field at the API level",
        "Creating too many Record Types — each one requires its own Page Layout, picklist value set, and testing. Start with 2-3 max per object",
        "Not considering Record Type impact on data migration — when importing data, you must specify RecordTypeId or the default is used, which may not be correct",
        "Forgetting that Record Types are assigned to Profiles — if you add a new Record Type, users won't see it until you assign it to their Profile"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are Record Types and when would you use them?",
          a: "Record Types allow you to offer different business processes, picklist values, and page layouts for the same object. **Use cases:** (1) Different Case types need different fields (Support vs Bug vs Feature). (2) Different countries need different Account fields for compliance. (3) Different sales teams sell different products using Opportunity. **How they work:** Each Record Type maps to a Page Layout and can restrict picklist values. They're assigned to Profiles, so different user groups see different record creation experiences. Records store RecordTypeId, which you can filter on in SOQL, reports, and triggers."
        },
        {
          type: "tricky",
          q: "What's the difference between Page Layout field visibility and Field-Level Security (FLS)?",
          a: "**Page Layouts** control what fields appear in the **UI** — visibility, ordering, read-only display. They do NOT control data access. **Field-Level Security (FLS)** controls whether a user can **read or write** a field's data at the API/system level. FLS is the actual security layer. Example: If FLS grants read access but the Page Layout hides the field, the user can still access the field via API, reports, or SOQL. **Best practice:** Use FLS for security (who CAN access), Page Layouts for UX (what they SEE). Always set FLS first, then arrange Page Layouts."
        }
      ]
    },
    {
      id: "sf-profiles-permissions-security",
      title: "Profiles, Permission Sets, Role Hierarchy & Sharing",
      explanation: `The Salesforce **security model** is one of the most critical topics for interviews and enterprise architecture. It operates on a principle of **least privilege** — start with the most restrictive access and open up selectively.

**The security layer stack (evaluated from top to bottom):**
\`\`\`
1. Organization-Wide Defaults (OWD)     ← Most restrictive baseline
2. Role Hierarchy                        ← Opens access upward  
3. Sharing Rules                         ← Opens access laterally
4. Manual Sharing                        ← One-off record sharing
5. Apex Managed Sharing                  ← Programmatic sharing
6. Teams                                ← Opportunity/Account teams
7. Territory Management                  ← Geographic/account-based
\`\`\`

**Organization-Wide Defaults (OWD):**
Sets the **baseline** access level for each object across the entire org:
- **Private** — Users can only see their own records (most restrictive)
- **Public Read Only** — All users can see all records but only edit their own
- **Public Read/Write** — All users can see and edit all records
- **Controlled by Parent** — Child object inherits parent's sharing (Master-Detail only)

**Rule:** Always set OWD to the most restrictive level needed, then use sharing rules to open access.

**Profiles:**
Define what a user **can do** — the baseline permissions:
- Object permissions (CRUD — Create, Read, Update, Delete)
- Field-Level Security (which fields are visible/editable)
- App access, tab visibility
- Login hours, IP restrictions
- Page Layout assignments
- Record Type access

**Permission Sets & Permission Set Groups:**
Add **additional** permissions on top of Profiles:
- Grant extra object/field access without changing the Profile
- Stackable — a user can have multiple Permission Sets
- Permission Set Groups — bundle Permission Sets for easy assignment
- **Best practice:** Use minimal Profiles + Permission Sets for flexibility

**Role Hierarchy:**
Controls **record-level access** based on organizational structure:
- Users higher in the hierarchy can see records owned by users below them (if OWD is Private)
- Does NOT control object-level permissions (that's Profiles)
- Mirrors the org chart (CEO → VP → Manager → Rep)

**Sharing Rules:**
Open access **laterally** across the hierarchy:
- **Criteria-Based** — Share records matching criteria (e.g., share all Cases with Status = 'Escalated')
- **Owner-Based** — Share records owned by one role/group with another
- Share with public groups, roles, or roles and subordinates

**When sharing rules aren't enough — Apex Managed Sharing:**
For complex sharing logic that can't be expressed declaratively, use programmatic sharing via Apex:
- Insert \`Share\` records (e.g., \`AccountShare\`, \`CustomObject__Share\`)
- Set access level: Read, Edit, All
- Set row cause: 'Manual' or custom Apex sharing reason`,
      codeExample: `// Salesforce Security Model in Apex

public class SecurityModelExamples {
    
    // 1. with sharing vs without sharing
    public with sharing class SecureService {
        // This class respects the running user's record-level security
        public List<Account> getAccounts() {
            // Only returns accounts the user has access to
            return [SELECT Id, Name FROM Account LIMIT 100];
        }
    }
    
    public without sharing class SystemService {
        // This class runs in system context — sees ALL records
        // Use carefully! Only when you need system-level access
        public Integer countAllAccounts() {
            return [SELECT COUNT() FROM Account];
        }
    }
    
    // 2. Checking Field-Level Security before DML
    public static void updateWithFLS(Account acc, String fieldName, Object value) {
        Schema.DescribeFieldResult field = Schema.SObjectType.Account
            .fields.getMap().get(fieldName).getDescribe();
        
        if (!field.isUpdateable()) {
            throw new SecurityException(
                'Insufficient access to field: ' + fieldName
            );
        }
        
        acc.put(fieldName, value);
        update acc;
    }
    
    // Security.stripInaccessible (Winter '20+) — preferred method
    public static List<Account> getAccountsSecure() {
        List<Account> accounts = [
            SELECT Id, Name, Phone, AnnualRevenue, Industry
            FROM Account LIMIT 100
        ];
        
        // Strip fields the user doesn't have access to
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.READABLE, accounts
        );
        
        return (List<Account>) decision.getRecords();
        // Fields the user can't read are automatically removed
    }
    
    // 3. Apex Managed Sharing — programmatic record sharing
    public static void shareAccountWithUser(Id accountId, Id userId) {
        AccountShare share = new AccountShare();
        share.AccountId = accountId;
        share.UserOrGroupId = userId;
        share.AccountAccessLevel = 'Edit';   // Read, Edit, All
        share.OpportunityAccessLevel = 'Read'; // Required for Account shares
        share.RowCause = Schema.AccountShare.RowCause.Manual;
        
        Database.SaveResult sr = Database.insert(share, false);
        if (!sr.isSuccess()) {
            System.debug('Sharing failed: ' + sr.getErrors()[0].getMessage());
        }
    }
    
    // 4. Custom object sharing (Apex Sharing Reasons)
    public static void shareCustomRecord(Id recordId, Id groupId) {
        // For custom objects, the share object is ObjectName__Share
        Project__Share share = new Project__Share();
        share.ParentId = recordId;
        share.UserOrGroupId = groupId;
        share.AccessLevel = 'Edit';
        share.RowCause = 'Team_Access__c'; // Custom Apex Sharing Reason
        
        insert share;
    }
    
    // 5. Checking permissions programmatically
    public static Map<String, Boolean> checkUserPermissions(String objectName) {
        Schema.DescribeSObjectResult objDescribe = 
            Schema.getGlobalDescribe().get(objectName).getDescribe();
        
        return new Map<String, Boolean>{
            'isAccessible' => objDescribe.isAccessible(),
            'isCreateable' => objDescribe.isCreateable(),
            'isUpdateable' => objDescribe.isUpdateable(),
            'isDeletable' => objDescribe.isDeletable()
        };
    }
    
    // 6. Running code as a specific user (for testing)
    @isTest
    static void testWithLimitedUser() {
        // Create a user with limited permissions
        Profile limitedProfile = [
            SELECT Id FROM Profile WHERE Name = 'Standard User'
        ];
        User limitedUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Email = 'test@example.com',
            Username = 'test@example.com.sandbox',
            ProfileId = limitedProfile.Id,
            Alias = 'tuser',
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US'
        );
        insert limitedUser;
        
        // Run test as the limited user
        System.runAs(limitedUser) {
            try {
                List<Account> accounts = [SELECT Id, Name FROM Account];
                // Should only see records shared with this user
                System.assert(true, 'Query executed successfully');
            } catch (Exception e) {
                System.assert(false, 'User should be able to query accounts');
            }
        }
    }
}`,
      exercise: `**Security Model Exercises:**
1. Set the OWD for Account to Private and observe how visibility changes for different users
2. Create a Role Hierarchy with 4 levels and test record visibility at each level
3. Create a Criteria-Based Sharing Rule that shares escalated Cases with the Management group
4. Write Apex Managed Sharing to programmatically share records based on custom criteria
5. Create a Permission Set that grants access to a sensitive field and assign it to a user
6. Use Security.stripInaccessible() to safely return data respecting FLS
7. Write test classes using System.runAs() to verify security at different access levels
8. Design a security model for a healthcare org (HIPAA — patients can only see their own records)
9. Document the complete security model for your org: OWD, Roles, Sharing Rules, Permission Sets
10. Create an Apex class that audits which users have access to a specific record and why`,
      commonMistakes: [
        "Setting OWD to Public Read/Write for all objects — this is the most common security mistake. Start with Private and open up selectively",
        "Confusing Profile permissions (CRUD) with record-level security (OWD + Sharing) — a user can have Read permission on Account but still not see specific records if OWD is Private",
        "Not testing security with System.runAs() — your code works as an admin but fails for standard users because of FLS or sharing restrictions",
        "Using 'without sharing' when not necessary — this bypasses ALL record-level security and should only be used for system-level operations",
        "Forgetting that Apex runs in system context by default — without 'with sharing' keyword, Apex ignores record-level security, which is a security vulnerability"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the Salesforce security model layers from most restrictive to most permissive.",
          a: "**Layer stack:** (1) **OWD (Organization-Wide Defaults)** — sets the baseline. Private = most restrictive. (2) **Role Hierarchy** — opens access upward. Managers see their reports' records. (3) **Sharing Rules** — opens access laterally. Criteria-based or owner-based. (4) **Manual Sharing** — one-off sharing by record owners. (5) **Apex Managed Sharing** — programmatic sharing for complex rules. (6) **Teams** — Account/Opportunity team members get access. (7) **Territory Management** — geographic or account-based access. **Key principle:** You can only OPEN access from the OWD baseline, never restrict below it (except with Restriction Rules in newer releases)."
        },
        {
          type: "scenario",
          q: "A sales rep can see Accounts but not Opportunities owned by reps in other territories. How do you configure this?",
          a: "**Configuration:** (1) Set Account OWD to **Public Read Only** (all reps can see all accounts). (2) Set Opportunity OWD to **Private** (reps only see their own opportunities). (3) Create a **Role Hierarchy** mirroring the sales org (VP → Regional Manager → Rep). VPs see all their region's opportunities via hierarchy. (4) Create **Criteria-Based Sharing Rules** if cross-region visibility is needed (e.g., share all Enterprise opportunities with the Enterprise team). (5) Use **Territory Management** if geographic assignment is complex. (6) Assign **Permission Sets** for users who need broader access (e.g., sales operations team)."
        },
        {
          type: "tricky",
          q: "What is the difference between 'with sharing', 'without sharing', and 'inherited sharing' in Apex?",
          a: "**'with sharing'** — Enforces the running user's record-level security (OWD + sharing rules + role hierarchy). **'without sharing'** — Runs in system context, ignoring ALL record-level security. Use sparingly for system-level operations. **'inherited sharing'** (new) — Inherits the sharing context of the calling class. If called from 'with sharing', it runs with sharing. If called from 'without sharing', it runs without. **Default behavior:** Classes without any sharing keyword default to 'without sharing' (system context). **Best practice:** Always explicitly declare 'with sharing' unless you have a specific reason for system context. In triggers, code runs as the triggering user but in system context by default."
        }
      ]
    }
  ]
};

export default sfPhase2;
