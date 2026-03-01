const sfPhase6 = {
  id: "phase-6",
  title: "Phase 6: Data Management & Advanced Security",
  emoji: "🔐",
  description: "Master large data volume management, data migration strategies, field-level security, encryption, Shield Platform Encryption, compliance (GDPR/HIPAA), and data archival.",
  topics: [
    {
      id: "sf-large-data-volumes",
      title: "Large Data Volume Management",
      explanation: `Enterprise Salesforce orgs often have millions of records. Understanding how to manage large data volumes (LDV) while maintaining performance is a senior/architect-level skill.

**When is data "large"?**
- Standard objects: >1 million records
- Custom objects: >500K records
- Any object where queries start timing out or hitting governor limits

**LDV optimization strategies:**

1. **Skinny Tables** (request from Salesforce Support)
   - A copy of a table with only the frequently queried fields
   - Dramatically improves query performance on wide objects
   - Maintained automatically by the platform

2. **Custom Indexes** (request from Salesforce Support)
   - Standard indexes: Id, Name, OwnerId, RecordTypeId, CreatedDate, SystemModstamp
   - Custom indexes: Any custom field can be indexed
   - Two-column indexes for complex WHERE clauses
   - External ID fields are automatically indexed

3. **Query Optimization**
   - Always use selective filters (indexed fields in WHERE)
   - Avoid leading wildcards: \`LIKE '%term'\` prevents index use
   - Use \`LIMIT\` and pagination
   - Filter early, process late

4. **Data Skew**
   - Account Data Skew: One account with millions of child records
   - Ownership Skew: One user owns millions of records
   - Lookup Skew: Many records pointing to same parent
   - **Impact:** Lock contention, sharing recalculation delays

5. **Archival Strategies**
   - Move old data to \`Big Objects\` (for Salesforce storage)
   - Archive to external systems (data warehouse)
   - Use \`External Objects\` for on-demand access to archived data
   - Implement soft deletes (IsArchived flag) for business logic

**Storage limits:**
- Data storage: Based on edition + per-user allocation
- File storage: Separate allocation for attachments/files
- Big Objects: Separate, higher-capacity storage`,
      codeExample: `// Large Data Volume Patterns

public class LargeDataVolumeService {
    
    // 1. Efficient pagination with query locator
    public static List<Account> getAccountsPage(Integer pageSize, Integer offset) {
        return [
            SELECT Id, Name, Industry, CreatedDate
            FROM Account
            WHERE Industry != null  // Selective filter
            ORDER BY CreatedDate DESC
            LIMIT :pageSize
            OFFSET :offset
        ];
    }
    
    // 2. Chunked processing for LDV
    public static void processLargeDataSet() {
        // Use Batch Apex for millions of records
        Database.executeBatch(new LargeAccountBatch(), 200);
    }
    
    // 3. Avoiding data skew in lookups
    public static void distributeLoad(List<Case> cases) {
        // BAD: All cases assigned to one queue
        // GOOD: Distribute across multiple queues
        List<Group> queues = [
            SELECT Id FROM Group WHERE Type = 'Queue' AND Name LIKE 'Support_%'
        ];
        
        if (queues.isEmpty()) return;
        
        Integer queueIndex = 0;
        for (Case c : cases) {
            c.OwnerId = queues[Math.mod(queueIndex, queues.size())].Id;
            queueIndex++;
        }
    }
    
    // 4. Using Big Objects for archival
    // Big Object definition (metadata)
    // Customer_Interaction__b with fields:
    //   Account_Id__c (Text, Index 1)
    //   Interaction_Date__c (DateTime, Index 2)
    //   Description__c (Text)
    
    public static void archiveTooBigObject(List<Customer_Interaction__c> records) {
        List<Customer_Interaction__b> bigObjRecords = new List<Customer_Interaction__b>();
        
        for (Customer_Interaction__c rec : records) {
            bigObjRecords.add(new Customer_Interaction__b(
                Account_Id__c = rec.Account__c,
                Interaction_Date__c = rec.Interaction_Date__c,
                Description__c = rec.Description__c
            ));
        }
        
        // Async insert into Big Object
        Database.insertImmediate(bigObjRecords);
        
        // Delete from standard object
        delete records;
    }
    
    // 5. Selective query example with custom index
    public static List<Account> selectiveQuery(String industry, Date createdAfter) {
        // This query is selective because:
        // - Industry can be indexed (request custom index)
        // - CreatedDate is auto-indexed
        // Both conditions filter >90% of records
        return [
            SELECT Id, Name, Industry, AnnualRevenue
            FROM Account
            WHERE Industry = :industry           // Indexed field
            AND CreatedDate > :createdAfter       // Auto-indexed
            ORDER BY Name
            LIMIT 2000
        ];
    }
}

// 6. Batch for LDV processing
public class LargeAccountBatch implements Database.Batchable<SObject> {
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        // QueryLocator can retrieve up to 50 MILLION records
        return Database.getQueryLocator([
            SELECT Id, Name, Industry, Last_Review_Date__c
            FROM Account
            WHERE Last_Review_Date__c < LAST_N_DAYS:365
            OR Last_Review_Date__c = null
        ]);
    }
    
    public void execute(Database.BatchableContext bc, List<Account> scope) {
        for (Account acc : scope) {
            acc.Last_Review_Date__c = Date.today();
            acc.Review_Status__c = 'Pending';
        }
        Database.update(scope, false); // Partial success
    }
    
    public void finish(Database.BatchableContext bc) {
        System.debug('Batch complete');
    }
}`,
      exercise: `**LDV Practice:**
1. Create a custom object with 100,000+ records and test query performance
2. Use the Query Plan tool in Developer Console to analyze query selectivity
3. Implement pagination for a list view that handles 1M+ records
4. Design a data archival strategy using Big Objects for a 5+ year old data
5. Identify and fix data skew in your org (Account skew, Ownership skew)
6. Request custom indexes from Salesforce (or simulate the effect with External IDs)
7. Write a Batch Apex job that processes 500,000 records in 200-record chunks
8. Implement a search that works efficiently on objects with 1M+ records
9. Design a data management strategy for an org that adds 100K records per month
10. Build a dashboard that monitors record counts, storage usage, and query performance`,
      commonMistakes: [
        "Using SOQL OFFSET for deep pagination — OFFSET has a 2,000 limit. For deep pagination, use WHERE Id > :lastId ORDER BY Id pattern",
        "Not requesting custom indexes on frequently queried fields — without indexes, queries on 1M+ record objects will time out or fail",
        "Creating lookup relationships to widely-shared records (data skew) — one Account with 10M Contacts causes lock contention on every Contact update",
        "Not planning for data growth — an object that's fine at 100K records may fail at 1M. Design for 10x your current volume",
        "Using SOQL for text search on LDV — SOQL LIKE queries don't use indexes with leading wildcards. Use SOSL (search index) instead"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What strategies do you use for managing large data volumes in Salesforce?",
          a: "**Performance:** (1) Custom indexes on filtered fields. (2) Skinny tables for wide objects. (3) Selective SOQL queries. (4) SOSL for text search. **Processing:** (5) Batch Apex for bulk operations (50M records via QueryLocator). (6) Chunked processing (200 records per execute). **Archival:** (7) Big Objects for structured archival. (8) External Objects for accessing archived data. **Skew prevention:** (9) Distribute ownership across users/queues. (10) Avoid single-parent records with millions of children. **Monitoring:** Query Plan tool, debug logs, Salesforce Optimizer."
        },
        {
          type: "tricky",
          q: "What is data skew and how does it affect Salesforce performance?",
          a: "Data skew occurs when data distribution is heavily unbalanced. **Three types:** (1) **Account skew** — one Account has millions of child records (Contacts, Opportunities). Causes: sharing recalculation on every child update, record locking. (2) **Ownership skew** — one User owns millions of records. Causes: role hierarchy-based sharing recalculation cascades. (3) **Lookup skew** — many records point to the same parent via lookup. Causes: lock contention when multiple updates target the same parent. **Fix:** Distribute data across multiple parent records, use queues for ownership, avoid single-point-of-reference patterns."
        }
      ]
    },
    {
      id: "sf-shield-security-compliance",
      title: "Shield Platform Encryption & Compliance",
      explanation: `Salesforce Shield is a set of enterprise security features for highly regulated industries. Understanding Shield, encryption, and compliance requirements (GDPR, HIPAA, PCI-DSS) is essential for architect-level roles.

**Salesforce Shield components:**

1. **Platform Encryption** — Encrypts data at rest
   - Encrypts field values in the database
   - Supports: text, email, phone, URL, textarea, date, datetime, number, currency
   - Data is encrypted with AES-256
   - Key management: Salesforce-managed or customer-managed (BYOK)
   - **Impact:** Some features limited (formula fields, SOQL filtering on encrypted fields)

2. **Event Monitoring** — Track user activity
   - Login events, API calls, report exports, page views
   - Transaction Security policies (real-time alerts)
   - Event log files (30-day retention, BigQuery/Splunk export)

3. **Field Audit Trail** — Extended data retention
   - Track field changes for up to 10 years
   - Standard audit trail only tracks 20 fields × 18 months
   - Critical for regulatory compliance

**GDPR (General Data Protection Regulation):**
- Right to access: Users can request their data
- Right to erasure: Must delete personal data on request
- Data portability: Export data in machine-readable format
- Consent tracking: Record and manage user consent
- Salesforce features: Individual object, Data Privacy fields, consent management

**HIPAA (Health Insurance Portability and Accountability Act):**
- Encrypt PHI (Protected Health Information) at rest and in transit
- Audit trail for all PHI access
- Business Associate Agreement (BAA) with Salesforce
- Restrict access using FLS, sharing rules, Shield encryption

**Apex Security Best Practices:**
- Always use \`with sharing\` by default
- Check FLS before DML: \`Security.stripInaccessible()\`
- Check CRUD before operations: \`isAccessible()\`, \`isCreateable()\`
- Never expose sensitive data in debug logs
- Use Shield encryption for PII/PHI fields`,
      codeExample: `// Security & Compliance Patterns

public with sharing class ComplianceService {
    
    // 1. CRUD/FLS enforcement
    public static List<Account> getAccountsSecure() {
        // Check object-level access
        if (!Schema.SObjectType.Account.isAccessible()) {
            throw new SecurityException('No access to Account object');
        }
        
        List<Account> accounts = [
            SELECT Id, Name, Phone, Industry, AnnualRevenue
            FROM Account LIMIT 100
        ];
        
        // Strip fields the user can't access (FLS)
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.READABLE, accounts
        );
        
        return (List<Account>) decision.getRecords();
    }
    
    // 2. Secure DML with FLS
    public static void updateAccountSecure(Account acc) {
        // Check update permission
        if (!Schema.SObjectType.Account.isUpdateable()) {
            throw new SecurityException('No update access to Account');
        }
        
        // Strip fields the user can't update
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.UPDATABLE, new List<Account>{acc}
        );
        
        update decision.getRecords();
    }
    
    // 3. GDPR — Right to Erasure
    public static void handleErasureRequest(String email) {
        // Find all records related to this person
        List<Contact> contacts = [
            SELECT Id, AccountId FROM Contact WHERE Email = :email
        ];
        List<Lead> leads = [
            SELECT Id FROM Lead WHERE Email = :email
        ];
        
        // Anonymize or delete based on business requirements
        for (Contact c : contacts) {
            c.FirstName = 'REDACTED';
            c.LastName = 'REDACTED';
            c.Email = null;
            c.Phone = null;
            c.MailingStreet = null;
        }
        update contacts;
        
        if (!leads.isEmpty()) {
            delete leads;
        }
        
        // Log the erasure for compliance
        insert new Privacy_Request_Log__c(
            Request_Type__c = 'Erasure',
            Subject_Email__c = email,
            Processed_Date__c = Datetime.now(),
            Records_Affected__c = contacts.size() + leads.size()
        );
    }
    
    // 4. Data export for portability (GDPR Right to Access)
    public static String exportPersonalData(String email) {
        Contact contact = [
            SELECT FirstName, LastName, Email, Phone, 
                   MailingAddress, Account.Name
            FROM Contact WHERE Email = :email LIMIT 1
        ];
        
        Map<String, Object> exportData = new Map<String, Object>{
            'name' => contact.FirstName + ' ' + contact.LastName,
            'email' => contact.Email,
            'phone' => contact.Phone,
            'company' => contact.Account?.Name,
            'exportDate' => Datetime.now().format()
        };
        
        return JSON.serializePretty(exportData);
    }
    
    // 5. Audit trail logging
    public static void logSensitiveAccess(Id recordId, String action) {
        insert new Audit_Log__c(
            Record_Id__c = recordId,
            Action__c = action,
            User__c = UserInfo.getUserId(),
            Timestamp__c = Datetime.now(),
            IP_Address__c = Auth.SessionManagement.getCurrentSession()?.get('SourceIp')
        );
    }
    
    // 6. Encryption-aware code
    public static void handleEncryptedFields() {
        // When Shield Platform Encryption is enabled:
        // - Cannot filter on encrypted fields in SOQL WHERE
        // - Cannot use encrypted fields in ORDER BY
        // - Formula fields referencing encrypted fields are limited
        
        // Pattern: Query by non-encrypted field, then filter in Apex
        List<Contact> allContacts = [
            SELECT Id, FirstName, LastName, SSN__c  // SSN__c is encrypted
            FROM Contact
            WHERE AccountId = :accountId
        ];
        
        // Filter encrypted field in Apex (not SOQL)
        Contact match = null;
        for (Contact c : allContacts) {
            if (c.SSN__c == targetSSN) {
                match = c;
                break;
            }
        }
    }
}`,
      exercise: `**Security & Compliance Practice:**
1. Implement CRUD and FLS checks using Security.stripInaccessible() for all object operations
2. Build a GDPR erasure service that anonymizes personal data across 5 objects
3. Create a data export feature that generates a JSON file of all personal data for a contact
4. Design a consent management system using custom objects (Consent__c)
5. Implement audit logging for all accesses to sensitive fields (SSN, DOB, medical records)
6. Enable Shield Platform Encryption on 3 fields and verify SOQL filtering limitations
7. Write test classes that verify FLS enforcement using System.runAs with restricted profiles
8. Create an Event Monitoring dashboard using Shield Event Log data
9. Design a data retention policy: which data to keep, archive, or delete based on age
10. Build a compliance report that shows all users who accessed sensitive records in the last 30 days`,
      commonMistakes: [
        "Not enforcing FLS in Apex — Apex runs in system context by default. Without explicit CRUD/FLS checks, all fields are accessible regardless of user permissions",
        "Trying to filter SOQL on encrypted fields — Shield encryption prevents WHERE clause filtering. Query by non-encrypted fields and filter in Apex",
        "Logging PII in debug logs — debug logs may be accessible to admins. Never log SSN, credit cards, passwords, or health data",
        "Hard-deleting GDPR-protected data without audit trail — always log what was deleted, when, and why for compliance audits",
        "Assuming 'with sharing' enforces FLS — 'with sharing' only enforces record-level security (OWD/sharing rules). FLS requires explicit checks with Security.stripInaccessible()"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is Salesforce Shield and when would you use it?",
          a: "Shield is a security add-on for regulated industries. **3 components:** (1) **Platform Encryption** — AES-256 encryption at rest for sensitive fields. Customer-managed keys (BYOK) available. Use for: SSN, credit cards, health data. (2) **Event Monitoring** — Detailed logs of user activity (logins, API calls, exports). Transaction Security policies for real-time alerts. Use for: security monitoring, compliance audits. (3) **Field Audit Trail** — Track field changes for 10 years (vs 18 months standard). Use for: regulatory compliance (SOX, HIPAA). **When to use:** HIPAA (healthcare), PCI-DSS (financial), GDPR (EU), SOX (public companies), any industry with strict data protection requirements."
        },
        {
          type: "scenario",
          q: "A European customer requests their data be deleted under GDPR. How do you handle this in Salesforce?",
          a: "**GDPR Erasure Process:** (1) **Identify:** Query all objects containing the individual's PII (Contact, Lead, Case, ActivityHistory, custom objects) using email/name. (2) **Assess:** Determine if any data must be retained for legal reasons (financial records, regulatory holds). (3) **Anonymize:** For records that can't be deleted (e.g., Opportunities needed for revenue reporting), replace PII with 'REDACTED'. (4) **Delete:** Delete records that can be fully removed (Lead, Activities). (5) **Audit:** Log the erasure request, what was deleted/anonymized, processing date. (6) **Confirm:** Notify the requester within 30 days. (7) **Technical:** Use Apex batch to process across all objects. Check data in reports, list views, recycle bin. Verify data is removed from backups (Salesforce retains backups for limited time)."
        }
      ]
    }
  ]
};

export default sfPhase6;
