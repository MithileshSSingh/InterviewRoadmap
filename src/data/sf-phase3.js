const sfPhase3 = {
  id: "phase-3",
  title: "Phase 3: Apex Programming Mastery",
  emoji: "⚡",
  description: "Deep dive into Apex programming — syntax, data types, SOQL/SOSL, DML operations, collections, bulkification, governor limits, exception handling, triggers, and async processing.",
  topics: [
    {
      id: "sf-apex-fundamentals",
      title: "Apex Syntax, Data Types & Collections",
      explanation: `**Apex** is Salesforce's proprietary, strongly-typed, object-oriented programming language. It runs on the Salesforce servers (not client-side) and is specifically designed for the multi-tenant environment.

**Key characteristics:**
- **Java-like syntax** — if you know Java, Apex feels familiar
- **Strongly typed** — all variables must be declared with types
- **Governor-limit-aware** — designed to run within strict resource constraints
- **Database-integrated** — SOQL/SOSL and DML are first-class citizens
- **Cloud-executed** — runs on Salesforce servers, not client machines

**Primitive Data Types:**
\`\`\`
Integer    — 32-bit whole numbers
Long       — 64-bit whole numbers  
Double     — 64-bit floating point
Decimal    — Arbitrary precision (for currency)
String     — Text (no character limit in Apex, but fields have limits)
Boolean    — true/false
Date       — Date without time
Datetime   — Date with time
Time       — Time without date
Id         — 18-character Salesforce record ID
Blob       — Binary data
\`\`\`

**Collections (the workhorses of Apex):**

1. **List** — Ordered collection (allows duplicates)
   - Indexed by integer position (0-based)
   - Most common collection for processing records
   - \`List<Account> accounts = new List<Account>();\`

2. **Set** — Unordered collection of UNIQUE elements
   - Automatically deduplicates
   - Fast lookup (O(1) contains check)
   - \`Set<Id> accountIds = new Set<Id>();\`

3. **Map** — Key-value pairs (unique keys)
   - O(1) lookup by key
   - The most powerful collection for bulkification
   - \`Map<Id, Account> accountMap = new Map<Id, Account>();\`
   - Can be initialized directly from SOQL: \`new Map<Id, Account>([SELECT ...])\`

**Why Maps are critical:**
In bulkified code, you constantly need to look up related data. Without Maps, you'd need nested loops (O(n²)). Maps give you O(1) lookups, keeping your code performant within governor limits.

**SObject — the universal data type:**
All Salesforce records are SObjects. \`Account\`, \`Contact\`, \`CustomObject__c\` are all subtypes of SObject. You can use SObject generically for dynamic code.`,
      codeExample: `// Apex Fundamentals — Data Types & Collections

public class ApexFundamentals {
    
    // Primitive types
    public static void primitiveExamples() {
        Integer count = 42;
        Long bigNumber = 2147483648L;
        Double pi = 3.14159;
        Decimal price = 99.99;  // Use Decimal for money!
        String name = 'Salesforce Developer';
        Boolean isActive = true;
        Date today = Date.today();
        Datetime now = Datetime.now();
        Id accountId = '001000000000001';  // 15 or 18 char
        
        // String methods
        String upper = name.toUpperCase();
        Boolean hasForce = name.contains('force');
        String[] parts = name.split(' ');
        String formatted = String.format('Hello {0}, today is {1}', 
            new List<Object>{name, today});
    }
    
    // LIST — Ordered, allows duplicates
    public static void listExamples() {
        // Declaration & initialization
        List<String> fruits = new List<String>{'Apple', 'Banana', 'Cherry'};
        
        // Common operations
        fruits.add('Date');                    // Add to end
        fruits.add(1, 'Avocado');            // Insert at index
        String first = fruits.get(0);         // Access by index
        fruits.set(0, 'Apricot');            // Replace at index
        Integer size = fruits.size();          // Count
        Boolean has = fruits.contains('Banana'); // Check existence
        fruits.sort();                         // Sort in place
        fruits.remove(0);                      // Remove by index
        
        // List of SObjects (most common usage)
        List<Account> accounts = [SELECT Id, Name FROM Account LIMIT 10];
        
        // Iterate
        for (Account acc : accounts) {
            System.debug(acc.Name);
        }
        
        // List initialization from SOQL
        List<Contact> contacts = [
            SELECT Id, FirstName, LastName, Email
            FROM Contact
            WHERE AccountId IN :accountIds
        ];
    }
    
    // SET — Unordered, unique values only
    public static void setExamples() {
        Set<String> uniqueCities = new Set<String>();
        uniqueCities.add('San Francisco');
        uniqueCities.add('New York');
        uniqueCities.add('San Francisco');  // Ignored — already exists!
        System.assertEquals(2, uniqueCities.size());
        
        // Most common pattern: collecting IDs for bulk queries
        Set<Id> accountIds = new Set<Id>();
        for (Contact c : contacts) {
            if (c.AccountId != null) {
                accountIds.add(c.AccountId);
            }
        }
        
        // Use Set in SOQL WHERE IN clause
        List<Account> relatedAccounts = [
            SELECT Id, Name FROM Account WHERE Id IN :accountIds
        ];
        
        // Set operations
        Set<String> setA = new Set<String>{'A', 'B', 'C'};
        Set<String> setB = new Set<String>{'B', 'C', 'D'};
        setA.retainAll(setB);  // Intersection: {'B', 'C'}
        // setA.addAll(setB);  // Union
        // setA.removeAll(setB); // Difference
    }
    
    // MAP — Key-value pairs (THE critical collection)
    public static void mapExamples() {
        // Basic Map
        Map<String, Integer> wordCount = new Map<String, Integer>();
        wordCount.put('apex', 5);
        wordCount.put('soql', 3);
        Integer count = wordCount.get('apex'); // 5
        Boolean hasKey = wordCount.containsKey('soql'); // true
        Set<String> allKeys = wordCount.keySet();
        List<Integer> allValues = wordCount.values();
        
        // ⭐ THE MOST IMPORTANT PATTERN: Map from SOQL
        // Initialize Map<Id, SObject> directly from query
        Map<Id, Account> accountMap = new Map<Id, Account>(
            [SELECT Id, Name, Industry FROM Account WHERE Industry = 'Technology']
        );
        
        // Now O(1) lookup by ID!
        Account acc = accountMap.get(someAccountId);
        
        // Map for parent lookup in triggers
        Map<Id, Account> parentAccounts = new Map<Id, Account>(
            [SELECT Id, Name FROM Account WHERE Id IN :accountIds]
        );
        
        for (Contact c : Trigger.new) {
            Account parentAcc = parentAccounts.get(c.AccountId);
            if (parentAcc != null) {
                // Use parent data without additional queries
                System.debug('Contact belongs to: ' + parentAcc.Name);
            }
        }
        
        // Map with complex keys
        Map<String, List<Contact>> contactsByCity = new Map<String, List<Contact>>();
        for (Contact c : contacts) {
            String city = c.MailingCity;
            if (!contactsByCity.containsKey(city)) {
                contactsByCity.put(city, new List<Contact>());
            }
            contactsByCity.get(city).add(c);
        }
    }
    
    // SObject — generic record type
    public static void sObjectExamples() {
        // Generic SObject usage
        SObject record = new Account(Name = 'Test');
        record.put('Industry', 'Technology');  // Dynamic field access
        String name = (String) record.get('Name');
        
        // Get the SObject type
        Schema.SObjectType objType = record.getSObjectType();
        System.debug(objType); // Account
        
        // Cast to specific type
        if (record instanceof Account) {
            Account acc = (Account) record;
            System.debug(acc.Name);
        }
    }
}`,
      exercise: `**Apex Fundamentals Practice:**
1. Write a method that takes a List<String> and returns a Map<String, Integer> counting character frequency
2. Given a List of Contacts, build a Map<Id, List<Contact>> grouping contacts by AccountId
3. Write a method that deduplicates a List<String> while preserving order (use Set + List)
4. Create a method that merges two Map<String, Integer> objects, summing values for duplicate keys
5. Write a utility that converts a List<SObject> to a Map<String, SObject> using any specified field as the key
6. Implement a simple stack (LIFO) using a List
7. Write a method that finds the intersection of two List<Id> collections
8. Build a frequency counter that returns the top N most common values from a List
9. Write a method that takes generic SObject records and populates a specified field
10. Create a batch-safe collection splitter that breaks a List into chunks of N items`,
      commonMistakes: [
        "Using Double or Float for currency calculations — always use Decimal to avoid floating-point precision errors",
        "Not initializing collections before use — 'List<Account> accounts;' is null, not empty. Always use 'new List<Account>()'",
        "Forgetting that Map.get() returns null for missing keys — always check containsKey() or handle null returns",
        "Using List.contains() for large lookups — O(n) per call. Use a Set for O(1) lookups when checking membership",
        "Not understanding that Apex Strings are compared case-sensitively by default — use .equalsIgnoreCase() or .toLowerCase() for case-insensitive comparison"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the three collection types in Apex and when do you use each?",
          a: "**List** — Ordered, allows duplicates. Use for: processing SOQL results, iterating records in order, DML operations (insert/update lists). **Set** — Unordered, unique values only. Use for: collecting IDs for WHERE IN clauses, deduplication, fast O(1) membership checks. **Map** — Key-value pairs with unique keys. Use for: O(1) record lookup by Id, grouping records by a field, building parent-child relationships without additional queries. **Most important:** Map<Id, SObject> initialized from SOQL is the cornerstone of bulkified code."
        },
        {
          type: "coding",
          q: "Write a method that groups a list of Contacts by their MailingState and returns a Map.",
          a: "```apex\npublic static Map<String, List<Contact>> groupByState(List<Contact> contacts) {\n    Map<String, List<Contact>> result = new Map<String, List<Contact>>();\n    for (Contact c : contacts) {\n        String state = c.MailingState != null ? c.MailingState : 'Unknown';\n        if (!result.containsKey(state)) {\n            result.put(state, new List<Contact>());\n        }\n        result.get(state).add(c);\n    }\n    return result;\n}\n```"
        },
        {
          type: "tricky",
          q: "What's the difference between == and .equals() for Strings in Apex?",
          a: "In Apex, **== is case-insensitive** for Strings (unlike Java where == checks reference equality). So 'ABC' == 'abc' is TRUE. **.equals() does not exist** as a method on String in Apex. Use == for case-insensitive comparison and use .equalsIgnoreCase() explicitly when you want to be clear about intent. For case-sensitive comparison, use String.equals() or compareTo(). This is a common gotcha for Java developers transitioning to Apex."
        }
      ]
    },
    {
      id: "sf-soql-sosl",
      title: "SOQL & SOSL Deep Dive",
      explanation: `**SOQL (Salesforce Object Query Language)** and **SOSL (Salesforce Object Search Language)** are the two ways to retrieve data in Apex. Understanding their differences, performance characteristics, and optimization techniques is critical for every Salesforce developer.

**SOQL vs SOSL:**
\`\`\`
SOQL:
- Queries ONE object at a time (with relationships)
- Structured query: SELECT fields FROM object WHERE conditions
- Returns exact matches
- Can traverse relationships (parent-to-child, child-to-parent)
- 100 queries per synchronous transaction / 200 async
- Up to 50,000 rows returned

SOSL:
- Searches ACROSS MULTIPLE objects simultaneously
- Text-based search: FIND 'search term' IN ALL FIELDS
- Returns approximate matches (search index)
- Searches across all text-searchable fields
- 20 searches per transaction
- Up to 2,000 rows returned
\`\`\`

**SOQL essentials:**
- **WHERE clauses** — filter records (=, !=, >, <, IN, LIKE, NOT IN)
- **ORDER BY** — sort results (ASC/DESC)
- **LIMIT / OFFSET** — pagination
- **GROUP BY / HAVING** — aggregate queries (COUNT, SUM, AVG, MIN, MAX)
- **Relationship queries** — traverse parent (dot notation) and child (subquery)
- **Date literals** — TODAY, LAST_N_DAYS:30, THIS_QUARTER, etc.
- **Polymorphic queries** — TYPEOF for querying relationships that can reference multiple objects

**Query optimization:**
Salesforce maintains custom indexes on certain fields. Your WHERE clause must be **selective** — meaning it uses an indexed field that filters out at least 90% of records. Non-selective queries on large objects (>100K records) will fail.

**Indexed fields (automatic):**
- Id, Name, OwnerId, CreatedDate, SystemModstamp
- Lookup and Master-Detail relationship fields
- Custom fields marked as "External ID" or "Unique"

**SOQL anti-patterns to avoid:**
1. Queries inside loops (governor limit violation)
2. SELECT * equivalent (SELECT all fields — wastes heap and query time)
3. Non-selective queries on large objects
4. Not using bind variables (SOQL injection risk)`,
      codeExample: `// SOQL & SOSL Mastery

public class QueryExamples {
    
    // 1. Basic SOQL with filters and ordering
    public static List<Account> getActiveAccounts() {
        return [
            SELECT Id, Name, Industry, AnnualRevenue, CreatedDate
            FROM Account
            WHERE Industry = 'Technology'
            AND AnnualRevenue > 1000000
            AND CreatedDate = THIS_YEAR
            ORDER BY AnnualRevenue DESC
            LIMIT 50
        ];
    }
    
    // 2. Relationship queries — Parent-to-Child (subquery)
    public static List<Account> getAccountsWithContacts() {
        return [
            SELECT Name, Industry,
                (SELECT FirstName, LastName, Email, Title
                 FROM Contacts
                 WHERE Email != null
                 ORDER BY LastName ASC
                 LIMIT 5)
            FROM Account
            WHERE Industry = 'Technology'
            LIMIT 10
        ];
        // Access child records:
        // for (Account acc : results) {
        //     for (Contact c : acc.Contacts) { ... }
        // }
    }
    
    // 3. Relationship queries — Child-to-Parent (dot notation)
    public static List<Contact> getContactsWithAccountInfo() {
        return [
            SELECT FirstName, LastName, 
                Account.Name,          // Parent field
                Account.Industry,      // Navigate up
                Account.Owner.Name     // Multiple levels up
            FROM Contact
            WHERE Account.Industry = 'Technology'
        ];
    }
    
    // 4. Aggregate queries
    public static void aggregateExamples() {
        // COUNT
        Integer totalAccounts = [SELECT COUNT() FROM Account];
        
        // GROUP BY with aggregates
        List<AggregateResult> byIndustry = [
            SELECT Industry, COUNT(Id) cnt, SUM(AnnualRevenue) totalRev
            FROM Account
            WHERE Industry != null
            GROUP BY Industry
            HAVING COUNT(Id) > 5
            ORDER BY COUNT(Id) DESC
        ];
        
        for (AggregateResult ar : byIndustry) {
            String industry = (String) ar.get('Industry');
            Integer count = (Integer) ar.get('cnt');
            Decimal revenue = (Decimal) ar.get('totalRev');
            System.debug(industry + ': ' + count + ' accounts, $' + revenue);
        }
    }
    
    // 5. Dynamic SOQL (useful for configurable queries)
    public static List<SObject> dynamicQuery(
        String objectName,
        List<String> fields,
        String whereClause,
        Integer limitCount
    ) {
        String query = 'SELECT ' + String.join(fields, ', ') +
            ' FROM ' + String.escapeSingleQuotes(objectName);
        
        if (String.isNotBlank(whereClause)) {
            query += ' WHERE ' + whereClause;
        }
        
        query += ' LIMIT ' + limitCount;
        
        return Database.query(query);
    }
    
    // 6. SOSL — Search across multiple objects
    public static void searchExamples() {
        // SOSL searches across objects
        List<List<SObject>> results = [
            FIND 'Acme*' IN ALL FIELDS
            RETURNING 
                Account(Id, Name, Industry WHERE Industry = 'Technology'),
                Contact(Id, FirstName, LastName, Email),
                Opportunity(Id, Name, Amount, StageName)
            LIMIT 20
        ];
        
        List<Account> accounts = (List<Account>) results[0];
        List<Contact> contacts = (List<Contact>) results[1];
        List<Opportunity> opps = (List<Opportunity>) results[2];
        
        System.debug('Found ' + accounts.size() + ' accounts');
        System.debug('Found ' + contacts.size() + ' contacts');
    }
    
    // 7. Date literals and filtering
    public static List<Opportunity> getRecentOpportunities() {
        return [
            SELECT Name, StageName, CloseDate, Amount
            FROM Opportunity
            WHERE CloseDate = THIS_QUARTER
            AND StageName NOT IN ('Closed Won', 'Closed Lost')
            AND Amount > 50000
            ORDER BY CloseDate ASC
        ];
    }
    
    // 8. Bind variables (prevent SOQL injection)
    public static List<Account> safeQuery(String searchName) {
        // GOOD — bind variable (safe from injection)
        String safeName = '%' + searchName + '%';
        return [SELECT Id, Name FROM Account WHERE Name LIKE :safeName];
        
        // BAD — string concatenation (SOQL injection vulnerable!)
        // String query = 'SELECT Id FROM Account WHERE Name LIKE \'%'
        //     + searchName + '%\'';
        // return Database.query(query);
    }
    
    // 9. Query performance — using selective filters
    public static List<Account> performantQuery() {
        // SELECTIVE — uses indexed field (Id, Name, lookups, External IDs)
        return [
            SELECT Id, Name FROM Account 
            WHERE Name = 'Acme Corporation'  // Name is indexed
            LIMIT 1
        ];
        
        // NON-SELECTIVE — scans all records (fails on large objects)
        // SELECT Id FROM Account WHERE Description LIKE '%enterprise%'
        // Description is NOT indexed — full table scan!
    }
    
    // 10. FOR UPDATE — record locking
    public static void lockRecords() {
        List<Account> accounts = [
            SELECT Id, Name, AnnualRevenue
            FROM Account
            WHERE Id = :accountId
            FOR UPDATE  // Locks the record to prevent concurrent modification
        ];
        // Other transactions trying to update this record will wait
        accounts[0].AnnualRevenue += 50000;
        update accounts;
    }
}`,
      exercise: `**SOQL/SOSL Mastery Exercises:**
1. Write a SOQL query that returns Accounts with their Opportunities and Contacts in a single query
2. Write an aggregate query that shows total Opportunity Amount by Stage, grouped by Account Industry
3. Use SOSL to search for 'John' across Account, Contact, and Lead objects simultaneously
4. Write a dynamic SOQL builder that accepts a Map of field→value filters and constructs a WHERE clause
5. Query all Contacts where the Account was created in the last 30 days (child-to-parent with date literal)
6. Write a SOQL query that uses OFFSET for pagination (page 3, 25 records per page)
7. Use FOR UPDATE in a query and explain when locking is necessary
8. Write a query that finds all Accounts with NO related Contacts (anti-join pattern)
9. Build a reusable query class that handles pagination, sorting, and filtering dynamically
10. Use the Query Plan tool in Developer Console to analyze query selectivity for 5 different queries`,
      commonMistakes: [
        "Writing SOQL inside loops — this is the #1 cause of governor limit failures. Always query once, build a Map, then iterate",
        "Not using bind variables in dynamic SOQL — String.escapeSingleQuotes helps but bind variables are the proper protection against SOQL injection",
        "Selecting all fields (SELECT *) — Apex doesn't support *, but developers query too many fields, wasting heap. Query only what you need",
        "Using LIKE with leading wildcards on large objects — '%searchterm%' prevents index usage and causes non-selective query errors",
        "Not understanding SOQL vs SOSL — SOQL is for structured queries on known objects; SOSL is for text search across multiple objects"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the difference between SOQL and SOSL? When would you use each?",
          a: "**SOQL:** Queries a single object with relationships. Exact matches. 100 queries/transaction. 50,000 rows max. Use when: you know which object and fields to query, need exact filtering, need relationship traversal. **SOSL:** Searches across multiple objects simultaneously using a search index. Approximate matches. 20 searches/transaction. 2,000 rows max. Use when: searching user input across multiple objects (like a global search), need fuzzy matching, don't know which object contains the data. **Key difference:** SOQL is SQL-like structured querying; SOSL is text-based searching."
        },
        {
          type: "tricky",
          q: "What makes a SOQL query 'selective' and why does it matter?",
          a: "A query is 'selective' when its WHERE clause uses an **indexed field** that filters out enough records (>90% filtered for standard indexes, >80% for custom indexes). **Indexed fields:** Id, Name, RecordTypeId, OwnerId, CreatedDate, lookup/master-detail fields, External ID fields, and custom indexed fields. **Why it matters:** Non-selective queries on objects with >100K records will throw a 'non-selective query' exception. The Salesforce query optimizer checks selectivity before executing. **The fix:** Add indexed fields to your WHERE clause, request custom indexes from Salesforce support for frequently queried fields."
        },
        {
          type: "coding",
          q: "Write a SOQL query to find Accounts that have at least 3 Closed Won Opportunities worth more than $100K total.",
          a: "```apex\nList<AggregateResult> results = [\n    SELECT AccountId, COUNT(Id) oppCount, SUM(Amount) totalAmount\n    FROM Opportunity\n    WHERE StageName = 'Closed Won'\n    GROUP BY AccountId\n    HAVING COUNT(Id) >= 3 AND SUM(Amount) > 100000\n];\n\nSet<Id> accountIds = new Set<Id>();\nfor (AggregateResult ar : results) {\n    accountIds.add((Id) ar.get('AccountId'));\n}\n\nList<Account> accounts = [\n    SELECT Id, Name, Industry\n    FROM Account\n    WHERE Id IN :accountIds\n];\n```"
        }
      ]
    },
    {
      id: "sf-dml-operations",
      title: "DML Operations & Database Methods",
      explanation: `**DML (Data Manipulation Language)** operations are how you create, update, and delete records in Salesforce. Understanding the nuances between DML statements and Database methods is essential.

**DML Statements (simple):**
\`\`\`
insert records;      — Create new records
update records;      — Modify existing records
upsert records;      — Insert or update (based on external ID or record ID)
delete records;      — Soft delete (goes to Recycle Bin)
undelete records;    — Restore from Recycle Bin
merge records;       — Merge duplicate records
\`\`\`

**Database Methods (advanced):**
\`\`\`
Database.insert(records, allOrNone)
Database.update(records, allOrNone)
Database.upsert(records, externalIdField, allOrNone)
Database.delete(records, allOrNone)
Database.undelete(records, allOrNone)
\`\`\`

**Key difference — allOrNone parameter:**
- DML statements: **All or nothing** (one failure rolls back everything)
- Database methods with \`allOrNone = false\`: **Partial success** (successful records are committed, failed ones return errors)

**Governor limits for DML:**
- 150 DML statements per transaction
- 10,000 total DML rows per transaction
- These are cumulative across all operations in the transaction

**Upsert — the powerful hybrid:**
Upsert checks if the record exists:
- If it has an Id → update
- If it doesn't → insert
- Can also match on External ID fields (useful for integration)

**Best practices:**
1. Collect all records in a List, then perform ONE DML operation
2. Use Database methods with \`allOrNone = false\` for bulk operations where partial success is acceptable
3. Always handle DmlException in try-catch blocks
4. Use \`Database.SaveResult\` to check individual record outcomes
5. Consider using \`Database.setSavepoint()\` and \`Database.rollback()\` for transaction control`,
      codeExample: `// DML Operations — Complete Guide

public class DMLExamples {
    
    // 1. Basic DML statements
    public static void basicDML() {
        // INSERT
        Account acc = new Account(Name = 'Acme Corp', Industry = 'Technology');
        insert acc;
        System.debug('New Account Id: ' + acc.Id); // Id populated after insert
        
        // UPDATE
        acc.AnnualRevenue = 5000000;
        update acc;
        
        // UPSERT — Insert or Update based on External ID
        Account upsertAcc = new Account(
            External_Id__c = 'EXT-001',  // External ID field
            Name = 'Upserted Account',
            Industry = 'Finance'
        );
        upsert upsertAcc External_Id__c; // Match on External_Id__c
        
        // DELETE (soft delete — goes to Recycle Bin)
        delete acc;
        
        // UNDELETE (restore from Recycle Bin)
        undelete acc;
    }
    
    // 2. Bulk DML (proper pattern)
    public static void bulkDML(List<Contact> newContacts) {
        // GOOD — Single DML for entire list
        insert newContacts; // Handles up to 10,000 records
        
        // BAD — DML inside loop (hits 150 DML limit at 150 records)
        // for (Contact c : newContacts) {
        //     insert c; // ❌ Each iteration is 1 DML statement!
        // }
    }
    
    // 3. Database methods with partial success
    public static void partialSuccessDML(List<Account> accounts) {
        // allOrNone = false: successful records are saved,
        // failed records return errors
        Database.SaveResult[] results = Database.insert(accounts, false);
        
        List<Account> successRecords = new List<Account>();
        List<String> errorMessages = new List<String>();
        
        for (Integer i = 0; i < results.size(); i++) {
            Database.SaveResult sr = results[i];
            if (sr.isSuccess()) {
                successRecords.add(accounts[i]);
            } else {
                for (Database.Error err : sr.getErrors()) {
                    errorMessages.add(
                        'Record [' + i + '] ' + accounts[i].Name + 
                        ': ' + err.getMessage() + 
                        ' (Fields: ' + err.getFields() + ')'
                    );
                }
            }
        }
        
        System.debug('Inserted: ' + successRecords.size());
        System.debug('Errors: ' + errorMessages.size());
        for (String msg : errorMessages) {
            System.debug('ERROR: ' + msg);
        }
    }
    
    // 4. Upsert with External ID (integration pattern)
    public static void upsertFromExternalSystem(List<Map<String, Object>> externalData) {
        List<Account> accountsToUpsert = new List<Account>();
        
        for (Map<String, Object> data : externalData) {
            accountsToUpsert.add(new Account(
                External_Id__c = (String) data.get('externalId'),
                Name = (String) data.get('name'),
                Industry = (String) data.get('industry'),
                AnnualRevenue = (Decimal) data.get('revenue')
            ));
        }
        
        // Upsert matches on External_Id__c
        // - If External_Id__c exists → UPDATE
        // - If External_Id__c doesn't exist → INSERT
        Database.UpsertResult[] results = Database.upsert(
            accountsToUpsert, Account.External_Id__c, false
        );
        
        for (Database.UpsertResult ur : results) {
            if (ur.isSuccess()) {
                if (ur.isCreated()) {
                    System.debug('INSERTED: ' + ur.getId());
                } else {
                    System.debug('UPDATED: ' + ur.getId());
                }
            }
        }
    }
    
    // 5. Transaction control with Savepoints
    public static void transactionControl() {
        Savepoint sp = Database.setSavepoint();
        
        try {
            Account acc = new Account(Name = 'Test Transaction');
            insert acc;
            
            Contact con = new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                AccountId = acc.Id
            );
            insert con;
            
            // Simulate a failure
            if (someCondition) {
                throw new CustomException('Business rule violated');
            }
            
            // If we get here, both records are committed
        } catch (Exception e) {
            // Rollback BOTH insert operations
            Database.rollback(sp);
            System.debug('Transaction rolled back: ' + e.getMessage());
        }
    }
    
    // 6. Merge — Combine duplicate records
    public static void mergeDuplicates(Id masterAccountId, Id duplicateAccountId) {
        Account master = [SELECT Id FROM Account WHERE Id = :masterAccountId];
        Account duplicate = [SELECT Id FROM Account WHERE Id = :duplicateAccountId];
        
        // Merge transfers all child records (Contacts, Opportunities, etc.)
        // from duplicate to master, then deletes the duplicate
        merge master duplicate;
        
        // Can merge up to 3 records at once
        // merge master new List<Account>{dup1, dup2};
    }
    
    // 7. Mixed DML — System and Setup objects
    // You CANNOT mix DML on setup objects (User, Profile, PermissionSet)
    // with non-setup objects (Account, Contact) in the same transaction
    public static void handleMixedDML() {
        // This would FAIL:
        // Account acc = new Account(Name = 'Test');
        // insert acc;
        // User u = [SELECT Id FROM User LIMIT 1];
        // u.LastName = 'Updated';
        // update u; // ❌ MIXED_DML_OPERATION error!
        
        // SOLUTION: Use @future or System.runAs()
        // Or separate the operations into different transactions
    }
}`,
      exercise: `**DML Practice Exercises:**
1. Write a method that inserts 500 Account records in a single DML operation and verify the count
2. Implement a partial-success insert that logs all errors to a custom Error_Log__c object
3. Use Database.setSavepoint() to implement a multi-step operation with rollback on any failure
4. Write an upsert operation that syncs data from an external system using External ID
5. Implement a merge operation that combines 3 duplicate Contacts into one master record
6. Handle the Mixed DML Operation error — insert a User and an Account in the same test method
7. Write a method that deletes records and then undeletes them, verifying data integrity
8. Create a utility that performs bulk updates in chunks of 200 to handle lists larger than 10,000
9. Write error handling that captures Database.Error details and creates human-readable error messages
10. Implement an "undo" feature using Savepoints that rolls back the last 3 operations`,
      commonMistakes: [
        "Performing DML inside loops — 'insert record;' inside a for-loop hits the 150 DML statement limit. Always collect records in a List and do one DML outside the loop",
        "Not handling DML exceptions — a single bad record in 'insert records;' rolls back ALL records. Use Database.insert(records, false) for partial success",
        "Mixing setup and non-setup DML — inserting a User and an Account in the same transaction throws MIXED_DML_OPERATION. Separate them with @future or System.runAs()",
        "Not checking Database.SaveResult — always iterate results to log errors, especially with allOrNone = false",
        "Exceeding the 10,000 DML rows limit — if you need to update more than 10,000 records, use Batch Apex"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the difference between DML statements and Database methods in Apex?",
          a: "**DML statements** (insert, update, etc.) are **all-or-nothing** — if any record fails, the entire operation rolls back and throws a DmlException. **Database methods** (Database.insert, etc.) accept an `allOrNone` parameter. With `allOrNone = false`, successful records are committed and failed records return error details in SaveResult. **When to use:** Use DML statements when all records must succeed together (transactional integrity). Use Database methods when partial success is acceptable (bulk data loads, integration syncs)."
        },
        {
          type: "tricky",
          q: "What is the 'Mixed DML Operation' error and how do you resolve it?",
          a: "This error occurs when you perform DML on **setup objects** (User, Group, GroupMember, PermissionSet) and **non-setup objects** (Account, Contact, custom objects) in the same transaction. Salesforce prevents this because setup object changes affect security, which could invalidate sharing calculations mid-transaction. **Solutions:** (1) Use `@future` method to perform one DML type asynchronously. (2) In tests, use `System.runAs()` to create a new transaction context. (3) Use Platform Events to decouple the operations. (4) Use Queueable Apex to chain the operations."
        },
        {
          type: "scenario",
          q: "You need to update 50,000 records. How do you handle this within governor limits?",
          a: "The 10,000 DML rows limit prevents updating 50,000 records in one transaction. **Solution: Batch Apex.** Implement the `Database.Batchable` interface with a scope size of 200 (default). The batch framework automatically processes records in chunks, each in its own transaction. Each chunk gets its own governor limits. Code: `Database.executeBatch(new MyBatchClass(), 200);` This processes 250 batches of 200 records. For simpler cases, you can also use Queueable chaining (process 10,000, then enqueue the next batch)."
        }
      ]
    },
    {
      id: "sf-bulkification-governor-limits",
      title: "Bulkification & Governor Limits Mastery",
      explanation: `**Bulkification** is the most important concept in Salesforce development. It means writing code that efficiently handles 1 record or 200 records (or 10,000 in batch) with the same resource consumption pattern.

**Why 200?** When records are saved via Data Loader, API, or trigger re-firing, up to 200 records are processed in a single transaction (the chunk size). Your trigger fires ONCE for all 200 records, not 200 times.

**The Bulkification Pattern:**
\`\`\`
1. Collect — Gather all needed data (IDs, field values) from Trigger.new
2. Query — Execute SOQL ONCE with collected data (WHERE IN :ids)
3. Map — Build Map<Id, SObject> for O(1) lookups
4. Process — Iterate and apply logic using the Map
5. DML — Execute DML ONCE with all modified records
\`\`\`

**Governor Limits — Complete Reference:**
\`\`\`
                              Synchronous    Asynchronous
SOQL Queries                      100            200
SOQL Rows Retrieved            50,000         50,000
DML Statements                   150            150
DML Rows                       10,000         10,000
CPU Time                     10,000ms       60,000ms
Heap Size                        6 MB          12 MB
Callouts                        100            100
Future Methods                   50             50 (from batch)
Queueable Jobs                   50             1 (from another queueable)
Email Invocations                10             10
SOSL Searches                    20             20
\`\`\`

**Why limits are per-transaction, not per-trigger:**
If a trigger on Account causes a trigger on Contact, and that causes a trigger on Task, ALL of those triggers share the SAME transaction's governor limits. This cascade effect is the #1 cause of limit failures in enterprise orgs.

**Optimization techniques:**
1. **Lazy loading** — Don't query data you might not need
2. **Selective queries** — Use indexed fields in WHERE clauses
3. **Query once, Map forever** — Build Maps from SOQL, then reference in loops
4. **Bulk collect** — Accumulate records to update, then DML once
5. **Short-circuit** — Exit early if no records meet your criteria`,
      codeExample: `// Bulkification — The Complete Pattern

public class BulkificationMastery {
    
    // ❌ NON-BULKIFIED (fails in production)
    public static void antiPattern(List<Opportunity> opps) {
        for (Opportunity opp : opps) {
            // SOQL in loop — 200 records = 200 queries (limit is 100!)
            Account acc = [SELECT Name, Industry FROM Account WHERE Id = :opp.AccountId];
            
            // DML in loop — 200 records = 200 DML statements (limit is 150!)
            opp.Description = 'Account: ' + acc.Name;
            update opp;
            
            // Callout in loop — not even possible (must be after DML)
        }
        // With 200 records: 200 SOQL + 200 DML = GOVERNOR LIMIT EXCEPTION
    }
    
    // ✅ BULKIFIED (production-ready)
    public static void bestPractice(List<Opportunity> opps) {
        // Step 1: COLLECT — Gather all Account IDs
        Set<Id> accountIds = new Set<Id>();
        for (Opportunity opp : opps) {
            if (opp.AccountId != null) {
                accountIds.add(opp.AccountId);
            }
        }
        
        // Step 2: QUERY ONCE — Single SOQL for all accounts
        // Step 3: MAP — Build Map for O(1) lookups
        Map<Id, Account> accountMap = new Map<Id, Account>(
            [SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds]
        );
        // Only 1 SOQL query used, regardless of how many opportunities
        
        // Step 4: PROCESS — Apply business logic using the Map
        List<Opportunity> oppsToUpdate = new List<Opportunity>();
        for (Opportunity opp : opps) {
            Account acc = accountMap.get(opp.AccountId);
            if (acc != null) {
                opp.Description = 'Account: ' + acc.Name;
                oppsToUpdate.add(opp);
            }
        }
        
        // Step 5: DML ONCE — Single update for all modified records
        if (!oppsToUpdate.isEmpty()) {
            update oppsToUpdate;
        }
        // Total: 1 SOQL + 1 DML, regardless of record count
    }
    
    // Advanced: Handling multiple related objects
    public static void complexBulkification(List<Opportunity> opps) {
        // Collect ALL needed IDs upfront
        Set<Id> accountIds = new Set<Id>();
        Set<Id> ownerIds = new Set<Id>();
        
        for (Opportunity opp : opps) {
            accountIds.add(opp.AccountId);
            ownerIds.add(opp.OwnerId);
        }
        
        // Query related data in PARALLEL (2 queries, not 2N)
        Map<Id, Account> accounts = new Map<Id, Account>(
            [SELECT Id, Name, Industry, OwnerId FROM Account WHERE Id IN :accountIds]
        );
        Map<Id, User> owners = new Map<Id, User>(
            [SELECT Id, Name, Email FROM User WHERE Id IN :ownerIds]
        );
        
        // Process with O(1) lookups
        List<Task> tasksToCreate = new List<Task>();
        for (Opportunity opp : opps) {
            if (opp.Amount > 100000) {
                Account acc = accounts.get(opp.AccountId);
                User owner = owners.get(opp.OwnerId);
                
                tasksToCreate.add(new Task(
                    WhatId = opp.Id,
                    OwnerId = opp.OwnerId,
                    Subject = 'High-value opp: ' + acc?.Name,
                    Description = 'Assigned to: ' + owner?.Name,
                    ActivityDate = Date.today().addDays(7)
                ));
            }
        }
        
        if (!tasksToCreate.isEmpty()) {
            insert tasksToCreate;
        }
        // Total: 2 SOQL + 1 DML for ANY number of records
    }
    
    // Monitoring governor limit consumption
    public static void monitorLimits() {
        System.debug('=== Governor Limit Usage ===');
        System.debug('SOQL: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
        System.debug('DML: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());
        System.debug('DML Rows: ' + Limits.getDmlRows() + '/' + Limits.getLimitDmlRows());
        System.debug('CPU: ' + Limits.getCpuTime() + 'ms/' + Limits.getLimitCpuTime() + 'ms');
        System.debug('Heap: ' + Limits.getHeapSize() + '/' + Limits.getLimitHeapSize());
        System.debug('SOQL Rows: ' + Limits.getQueryRows() + '/' + Limits.getLimitQueryRows());
    }
    
    // Preventing trigger recursion
    public class RecursionGuard {
        private static Set<Id> processedIds = new Set<Id>();
        
        public static Boolean hasProcessed(Id recordId) {
            return processedIds.contains(recordId);
        }
        
        public static void markProcessed(Id recordId) {
            processedIds.add(recordId);
        }
        
        public static void markProcessed(Set<Id> recordIds) {
            processedIds.addAll(recordIds);
        }
        
        public static void reset() {
            processedIds.clear();
        }
    }
}`,
      exercise: `**Bulkification & Limits Exercises:**
1. Take a non-bulkified trigger and refactor it using the Collect→Query→Map→Process→DML pattern
2. Write a trigger that handles 200 records while using only 2 SOQL queries and 1 DML statement
3. Create a stress test that inserts 200 records via Data Loader and verify your trigger handles it
4. Write a debugging utility that logs governor limit consumption at key points in your code
5. Implement a recursion guard that prevents triggers from re-processing the same records
6. Refactor a trigger cascade (Account→Contact→Case) to stay within limits
7. Write code that intentionally exceeds each governor limit and handle the exceptions gracefully
8. Design a batch process that handles 1 million records without hitting any limits
9. Create a before-trigger that validates records against complex criteria using only 1 SOQL query
10. Benchmark your code: measure SOQL, DML, and CPU usage for processing 1, 50, and 200 records`,
      commonMistakes: [
        "Writing code that works for 1 record and assuming it works for 200 — always test with bulk data (200 records minimum)",
        "Not recognizing cascading triggers — a trigger on Account that updates Contacts fires the Contact trigger, sharing the same limits",
        "Using Limits class for flow control — checking limits to decide whether to query is an anti-pattern; it means your code isn't properly bulkified",
        "Not accounting for existing automation — your trigger shares limits with Flows, Process Builders, and other triggers on the same object",
        "Ignoring CPU time limits — even with perfect SOQL/DML optimization, complex logic in large loops can exceed the 10-second CPU limit"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does bulkification mean in Salesforce and why is it important?",
          a: "Bulkification means writing code that efficiently handles 1 to 200+ records with constant resource consumption. **Why it's important:** When records are saved via API, Data Loader, or trigger cascades, up to 200 records are processed in a single transaction. The pattern: (1) Collect needed data from all records. (2) Query once with WHERE IN. (3) Build Maps for O(1) lookups. (4) Process in a loop using Maps. (5) DML once. Without bulkification, processing 200 records = 200 SOQL queries + 200 DML statements → governor limit exception in production."
        },
        {
          type: "coding",
          q: "Refactor this code to be bulkified: for each Contact in Trigger.new, query the Account and update the Contact's description with the Account name.",
          a: "```apex\n// Bulkified solution\ntrigger ContactTrigger on Contact (before insert, before update) {\n    // 1. Collect Account IDs\n    Set<Id> accIds = new Set<Id>();\n    for (Contact c : Trigger.new) {\n        if (c.AccountId != null) accIds.add(c.AccountId);\n    }\n    \n    // 2. Query once + build Map\n    Map<Id, Account> accMap = new Map<Id, Account>(\n        [SELECT Id, Name FROM Account WHERE Id IN :accIds]\n    );\n    \n    // 3. Process using Map (before trigger — no DML needed)\n    for (Contact c : Trigger.new) {\n        Account acc = accMap.get(c.AccountId);\n        if (acc != null) {\n            c.Description = 'Account: ' + acc.Name;\n        }\n    }\n}\n// Total: 1 SOQL, 0 DML (before trigger modifies in place)\n```"
        },
        {
          type: "scenario",
          q: "Your org has triggers on Account, Contact, Opportunity, and Task. A user updates an Account and it cascades through all triggers. You're getting governor limit errors. How do you diagnose and fix?",
          a: "**Diagnosis:** (1) Enable debug logging for the user. (2) Set Apex log level to FINEST. (3) Reproduce the error. (4) Analyze the debug log for: total SOQL queries (which trigger uses the most), total DML, CPU time, and identify which trigger in the cascade consumes limits. **Common fixes:** (1) Implement a trigger framework with bypass switches — disable unnecessary triggers during cascades. (2) Add recursion guards to prevent re-processing. (3) Move non-critical logic to @future or Queueable (gets its own limits). (4) Replace trigger logic with before-trigger field updates (no DML needed). (5) Consider combining triggers using a handler framework."
        }
      ]
    },
    {
      id: "sf-exception-handling",
      title: "Exception Handling in Apex",
      explanation: `Robust exception handling is what separates production-grade code from prototype code. In Salesforce, exceptions can come from DML failures, callout errors, governor limit violations, and business logic errors.

**Exception hierarchy:**
\`\`\`
Exception (base class)
├── DmlException         — DML operation failures
├── QueryException       — SOQL issues (too many rows, etc.)
├── CalloutException     — HTTP callout failures
├── JSONException        — JSON parsing errors
├── MathException        — Division by zero, etc.
├── NullPointerException — Accessing null reference
├── LimitException       — Governor limit exceeded (CANNOT be caught!)
├── TypeException        — Invalid type casting
├── ListException        — List index out of bounds
├── SObjectException     — SObject field access issues
└── CustomException      — Your own exception classes
\`\`\`

**Critical rule:** \`LimitException\` (governor limit exceeded) **CANNOT be caught** in try-catch. Once a limit is hit, the entire transaction is rolled back. This is by design — you must prevent limits, not catch them.

**Best practices:**
1. Catch specific exceptions, not generic Exception
2. Always log exception details (message, stack trace, line number)
3. Use custom exceptions for business logic errors
4. Never swallow exceptions silently (empty catch blocks)
5. Consider creating an Error_Log__c object for persistent error tracking
6. Use addError() on SObject for user-facing validation errors`,
      codeExample: `// Exception Handling — Production Patterns

public class ExceptionHandlingExamples {
    
    // 1. Basic try-catch patterns
    public static void basicHandling() {
        try {
            Account acc = [SELECT Id, Name FROM Account WHERE Name = 'Nonexistent' LIMIT 1];
        } catch (QueryException e) {
            System.debug('Query failed: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Unexpected error: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Type: ' + e.getTypeName());
        } finally {
            // Always executes — cleanup code
            System.debug('Query attempt completed');
        }
    }
    
    // 2. DML Exception handling
    public static void handleDMLErrors(List<Account> accounts) {
        Database.SaveResult[] results = Database.insert(accounts, false);
        
        List<Error_Log__c> errorLogs = new List<Error_Log__c>();
        
        for (Integer i = 0; i < results.size(); i++) {
            if (!results[i].isSuccess()) {
                for (Database.Error err : results[i].getErrors()) {
                    errorLogs.add(new Error_Log__c(
                        Object_Name__c = 'Account',
                        Record_Name__c = accounts[i].Name,
                        Error_Message__c = err.getMessage(),
                        Status_Code__c = String.valueOf(err.getStatusCode()),
                        Fields__c = String.valueOf(err.getFields()),
                        Timestamp__c = Datetime.now(),
                        Class_Name__c = 'ExceptionHandlingExamples.handleDMLErrors'
                    ));
                }
            }
        }
        
        if (!errorLogs.isEmpty()) {
            insert errorLogs; // Log errors to custom object
        }
    }
    
    // 3. Custom Exception classes
    public class BusinessLogicException extends Exception {}
    public class IntegrationException extends Exception {}
    public class ValidationException extends Exception {
        public String fieldName;
        
        public ValidationException(String field, String message) {
            this(message);
            this.fieldName = field;
        }
    }
    
    public static void useCustomExceptions(Account acc) {
        if (acc.AnnualRevenue == null || acc.AnnualRevenue < 0) {
            throw new ValidationException(
                'AnnualRevenue', 
                'Annual revenue must be a positive number'
            );
        }
        
        if (acc.Industry == 'Restricted') {
            throw new BusinessLogicException(
                'Cannot create accounts in the Restricted industry'
            );
        }
    }
    
    // 4. Trigger-safe error handling (addError)
    public static void triggerValidation(List<Account> accounts) {
        // addError() shows error to user WITHOUT throwing an exception
        // It prevents the individual record from being saved
        for (Account acc : accounts) {
            if (String.isBlank(acc.Name)) {
                acc.addError('Account name cannot be blank');
            }
            if (acc.AnnualRevenue != null && acc.AnnualRevenue < 0) {
                acc.AnnualRevenue.addError('Revenue cannot be negative');
                // Field-level error — shows on the specific field
            }
        }
        // Other valid records in the batch WILL still be saved
    }
    
    // 5. Error logging framework (enterprise pattern)
    public class ErrorLogger {
        private static List<Error_Log__c> pendingLogs = new List<Error_Log__c>();
        
        public static void log(Exception e, String context) {
            pendingLogs.add(new Error_Log__c(
                Error_Message__c = e.getMessage(),
                Stack_Trace__c = e.getStackTraceString()?.left(32000),
                Class_Name__c = context,
                Error_Type__c = e.getTypeName(),
                Line_Number__c = e.getLineNumber(),
                Timestamp__c = Datetime.now(),
                User__c = UserInfo.getUserId()
            ));
        }
        
        public static void log(String message, String context, String severity) {
            pendingLogs.add(new Error_Log__c(
                Error_Message__c = message,
                Class_Name__c = context,
                Severity__c = severity,
                Timestamp__c = Datetime.now(),
                User__c = UserInfo.getUserId()
            ));
        }
        
        // Call at the end of your transaction
        public static void flush() {
            if (!pendingLogs.isEmpty()) {
                // Use 'without sharing' to ensure logs are always saved
                Database.insert(pendingLogs, false);
                pendingLogs.clear();
            }
        }
    }
    
    // 6. Retryable operations
    public static HttpResponse callWithRetry(String endpoint, Integer maxRetries) {
        Integer attempts = 0;
        Exception lastException;
        
        while (attempts < maxRetries) {
            try {
                HttpRequest req = new HttpRequest();
                req.setEndpoint(endpoint);
                req.setMethod('GET');
                req.setTimeout(120000); // 2 minutes
                
                HttpResponse res = new Http().send(req);
                
                if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
                    return res;
                }
                
                if (res.getStatusCode() >= 500) {
                    // Server error — retry
                    attempts++;
                    continue;
                }
                
                // Client error — don't retry
                throw new IntegrationException(
                    'API error ' + res.getStatusCode() + ': ' + res.getBody()
                );
                
            } catch (CalloutException e) {
                lastException = e;
                attempts++;
                ErrorLogger.log(e, 'callWithRetry attempt ' + attempts);
            }
        }
        
        throw new IntegrationException(
            'Failed after ' + maxRetries + ' attempts: ' + lastException?.getMessage()
        );
    }
}`,
      exercise: `**Exception Handling Exercises:**
1. Create a custom Error_Log__c object with fields for message, stack trace, severity, class name, and timestamp
2. Build an ErrorLogger utility class that captures exceptions and writes to Error_Log__c
3. Write a trigger that validates records using addError() with both record-level and field-level errors
4. Implement a retry mechanism for HTTP callouts with exponential backoff
5. Write a test class that verifies exceptions are thrown for invalid input (use try-catch in tests)
6. Create a custom exception hierarchy: AppException → BusinessException, IntegrationException, ValidationException
7. Handle DmlException in a bulk insert and report which specific records failed and why
8. Write a batch Apex job with comprehensive error handling in start(), execute(), and finish()
9. Implement a circuit breaker pattern that stops calling an external API after 3 consecutive failures
10. Create a dashboard that shows error trends from your Error_Log__c object`,
      commonMistakes: [
        "Catching LimitException — it CANNOT be caught. Once a governor limit is exceeded, the entire transaction rolls back. Prevent limits, don't try to catch them",
        "Empty catch blocks (swallowing exceptions) — 'catch (Exception e) {}' hides errors and makes debugging impossible. Always log or rethrow",
        "Using generic Exception catch for everything — catch specific exceptions first (DmlException, CalloutException) so you can handle each appropriately",
        "Not using addError() in triggers — throwing exceptions in after-triggers causes ALL records to fail. Use addError() to fail individual records",
        "Not logging the stack trace — e.getMessage() alone is often insufficient for debugging. Always log e.getStackTraceString() and e.getLineNumber()"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Can you catch a LimitException in Apex? Why or why not?",
          a: "**No.** LimitException CANNOT be caught in a try-catch block. When a governor limit is exceeded (e.g., 101st SOQL query), the entire transaction is immediately rolled back with no opportunity to catch or handle the exception. **Why:** By design, Salesforce ensures that no tenant can consume more than their fair share of shared resources. If you could catch LimitException, code could potentially continue consuming resources beyond limits. The only way to handle governor limits is to **prevent them** through bulkification, efficient architecture, and monitoring via the Limits class."
        },
        {
          type: "tricky",
          q: "What's the difference between throwing an exception vs using addError() in a trigger?",
          a: "**throw new Exception()** in a trigger causes the ENTIRE operation to fail — all 200 records in the batch are rolled back, and the user sees a generic error. **addError()** marks individual records as failed while allowing other records in the batch to succeed. Example: In a 200-record batch, if record #150 fails validation, `addError()` only fails record #150, and the other 199 records are saved. This is much more user-friendly and is the correct pattern for validation in triggers."
        }
      ]
    }
  ]
};

export default sfPhase3;
