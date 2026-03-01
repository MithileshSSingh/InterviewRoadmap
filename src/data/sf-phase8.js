const sfPhase8 = {
  id: "phase-8",
  title: "Phase 8: Governor Limits & Performance Optimization",
  emoji: "⚙️",
  description: "Deep mastery of all governor limits, performance profiling, query optimization, Apex optimization patterns, caching strategies, and enterprise-scale performance architecture.",
  topics: [
    {
      id: "sf-governor-limits-complete",
      title: "Complete Governor Limits Reference & Strategies",
      explanation: `While we covered basic governor limits in Phase 3, this section provides the **complete reference** with advanced optimization strategies that senior developers and architects need.

**Complete Governor Limits Table:**
\`\`\`
Limit                         Synchronous    Asynchronous
────────────────────────────  ────────────   ────────────
SOQL queries                      100            200
SOQL rows retrieved            50,000         50,000
DML statements                   150            150
DML rows                       10,000         10,000
Heap size                        6 MB          12 MB
CPU time                     10,000ms       60,000ms
Callouts                        100            100
Callout timeout (single)        120s           120s
Callout timeout (total)         120s           120s
Future invocations               50             0 (from batch)
Queueable invocations            50             1
Email invocations                10             10
SOSL searches                    20             20
Event publishing               150            150
QueryLocator rows               N/A         50,000,000
\`\`\`

**Platform-level limits (per 24 hours):**
\`\`\`
API calls          — Based on edition (Enterprise: 100,000/day + 1,000/user)
Batch Apex         — 250,000 execute() invocations per 24 hours
Scheduled Apex     — 100 scheduled jobs
Platform Events    — Based on entitlement (default: 250K/hour)
Storage            — Data storage + File storage (per edition)
\`\`\`

**Advanced optimization patterns:**

1. **Lazy evaluation** — Don't compute or query until absolutely necessary
2. **Memoization** — Cache computed results in static variables within a transaction
3. **Query consolidation** — Combine multiple queries into one with OR conditions
4. **Selective processing** — Skip records that don't meet criteria before querying
5. **Asynchronous offloading** — Move heavy processing to Queueable/Batch

**The governor limit hierarchy of concern:**
\`\`\`
1. SOQL queries (100)    — Most commonly hit, hardest to fix retroactively
2. CPU time (10s)        — Complex logic + large datasets
3. DML statements (150)  — Secondary operations and cascading triggers
4. Heap size (6MB)       — Large query results or string processing
5. SOQL rows (50,000)    — Processing too many records at once
\`\`\``,
      codeExample: `// Advanced Governor Limit Optimization

public class PerformanceOptimization {
    
    // 1. MEMOIZATION — Cache within transaction
    private static Map<Id, Account> accountCache = new Map<Id, Account>();
    
    public static Account getAccountCached(Id accountId) {
        if (!accountCache.containsKey(accountId)) {
            accountCache.put(accountId, [
                SELECT Id, Name, Industry, OwnerId 
                FROM Account WHERE Id = :accountId
            ]);
        }
        return accountCache.get(accountId);
    }
    
    // Bulk cache loading
    public static void preloadAccounts(Set<Id> accountIds) {
        // Remove already-cached IDs
        accountIds.removeAll(accountCache.keySet());
        
        if (!accountIds.isEmpty()) {
            Map<Id, Account> newAccounts = new Map<Id, Account>(
                [SELECT Id, Name, Industry, OwnerId 
                 FROM Account WHERE Id IN :accountIds]
            );
            accountCache.putAll(newAccounts);
        }
    }
    
    // 2. QUERY CONSOLIDATION — Reduce SOQL count
    
    // BAD: 3 separate queries
    // List<Account> techAccounts = [SELECT Id FROM Account WHERE Industry = 'Tech'];
    // List<Account> finAccounts = [SELECT Id FROM Account WHERE Industry = 'Finance'];
    // List<Account> healthAccounts = [SELECT Id FROM Account WHERE Industry = 'Health'];
    
    // GOOD: 1 consolidated query
    public static Map<String, List<Account>> getAccountsByIndustries(
        Set<String> industries
    ) {
        List<Account> allAccounts = [
            SELECT Id, Name, Industry 
            FROM Account 
            WHERE Industry IN :industries
        ];
        
        // Group in memory (free — no SOQL cost)
        Map<String, List<Account>> result = new Map<String, List<Account>>();
        for (Account acc : allAccounts) {
            if (!result.containsKey(acc.Industry)) {
                result.put(acc.Industry, new List<Account>());
            }
            result.get(acc.Industry).add(acc);
        }
        return result;
    }
    
    // 3. SELECTIVE PROCESSING — Skip unnecessary work
    public static void optimizedTriggerHandler(
        List<Opportunity> newOpps, 
        Map<Id, Opportunity> oldMap
    ) {
        // Step 1: Filter to only records that actually changed
        List<Opportunity> stageChanged = new List<Opportunity>();
        List<Opportunity> amountChanged = new List<Opportunity>();
        
        for (Opportunity opp : newOpps) {
            Opportunity oldOpp = oldMap.get(opp.Id);
            
            if (opp.StageName != oldOpp.StageName) {
                stageChanged.add(opp);
            }
            if (opp.Amount != oldOpp.Amount) {
                amountChanged.add(opp);
            }
        }
        
        // Step 2: Only query/process if there are relevant changes
        if (!stageChanged.isEmpty()) {
            processStageChanges(stageChanged);
        }
        if (!amountChanged.isEmpty()) {
            processAmountChanges(amountChanged);
        }
        // If nothing changed? 0 SOQL, 0 DML — no limits consumed
    }
    
    // 4. HEAP OPTIMIZATION — Process large datasets efficiently
    public static Integer countMatchingRecords(String criteria) {
        // BAD: Loads all records into heap
        // List<Account> all = [SELECT Id FROM Account WHERE ...];
        // return all.size(); // Could be 50,000 records in heap!
        
        // GOOD: Use COUNT() — returns integer, not records
        return [SELECT COUNT() FROM Account WHERE Industry = :criteria];
    }
    
    // Process without loading all into memory
    public static void processWithIterator() {
        // For loop with SOQL — processes in chunks of 200, not all at once
        for (List<Account> chunk : [
            SELECT Id, Name, Industry FROM Account WHERE Industry = 'Technology'
        ]) {
            // Each chunk is 200 records max
            // Previous chunk is garbage collected
            processChunk(chunk);
        }
        // Heap never holds more than 200 records at a time
    }
    
    // 5. CPU OPTIMIZATION — Avoid O(n²) patterns
    public static void optimizedMatching(
        List<Contact> contacts, List<Account> accounts
    ) {
        // BAD: O(n × m) nested loop
        // for (Contact c : contacts) {
        //     for (Account a : accounts) {
        //         if (c.AccountId == a.Id) { ... }
        //     }
        // }
        
        // GOOD: O(n + m) with Map
        Map<Id, Account> accountMap = new Map<Id, Account>(accounts);
        for (Contact c : contacts) {
            Account a = accountMap.get(c.AccountId);
            if (a != null) {
                // O(1) lookup instead of O(m)
            }
        }
    }
    
    // 6. MONITORING — Proactive limit checking
    public static void checkLimitsWarning() {
        Integer queriesUsed = Limits.getQueries();
        Integer queriesMax = Limits.getLimitQueries();
        
        if (queriesUsed > queriesMax * 0.8) {
            System.debug(LoggingLevel.WARN, 
                'WARNING: SOQL usage at ' + queriesUsed + '/' + queriesMax + 
                ' (' + (queriesUsed * 100 / queriesMax) + '%)');
        }
        
        Integer cpuUsed = Limits.getCpuTime();
        Integer cpuMax = Limits.getLimitCpuTime();
        
        if (cpuUsed > cpuMax * 0.7) {
            System.debug(LoggingLevel.WARN, 
                'WARNING: CPU time at ' + cpuUsed + 'ms/' + cpuMax + 'ms');
        }
    }
}`,
      exercise: `**Governor Limit Mastery Exercises:**
1. Write a utility class that provides memoized queries with automatic cache invalidation
2. Consolidate 5 separate SOQL queries into 1 using dynamic SOQL and Maps
3. Implement selective processing in a trigger that skips records where relevant fields haven't changed
4. Write a heap-efficient processor using the SOQL for-loop pattern for 100K+ records
5. Create a limit monitoring decorator that logs limit consumption before and after method calls
6. Optimize a method from O(n²) to O(n) using Maps
7. Design a limits budget for a complex transaction with 5 triggers and 3 Flows on the same save
8. Write a test that verifies your code stays within 50% of governor limits with 200 records
9. Implement query consolidation: merge parent and child queries into one with subquery
10. Build a governor limit dashboard that shows typical consumption patterns`,
      commonMistakes: [
        "Checking Limits class for flow control — if you need to check if you're close to limits, your code isn't properly bulkified. Fix the root cause",
        "Not accounting for other automation sharing the transaction — your trigger shares limits with Flows, Process Builders, and other triggers on the same object",
        "Optimizing prematurely — profile first, optimize second. The bottleneck might not be where you think",
        "Caching too aggressively — static variable caches persist for the entire transaction but consume heap. Clear caches when no longer needed",
        "Not using SOQL for-loop for large datasets — regular SOQL loads all results into heap. For-loop processes in 200-record chunks"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "You have a complex transaction with 3 triggers, 2 Flows, and 1 Process Builder all firing on the same Account save. How do you manage governor limits?",
          a: "**Understanding:** All automations share the SAME transaction — one pool of 100 SOQL, 150 DML, etc. **Strategy:** (1) **Audit** — Document what each automation does (SOQL count, DML count). Create a 'limits budget' spreadsheet. (2) **Consolidate triggers** — One trigger per object with handler framework. Eliminate redundant queries. (3) **Migrate flows** — Convert Process Builders (legacy) to Flows. Consider converting simple Flows to before triggers (no DML cost). (4) **Bulkify everything** — Ensure all automations handle 200 records. (5) **Offload** — Move non-critical logic to @future/Queueable (separate transaction). (6) **Monitor** — Add limits logging to identify the biggest consumers."
        },
        {
          type: "tricky",
          q: "What's the difference between synchronous and asynchronous governor limits?",
          a: "Async methods (@future, Queueable, Batch execute()) get **higher limits:** 200 SOQL (vs 100), 12MB heap (vs 6MB), 60s CPU (vs 10s). **Why:** Async runs in the background without blocking users, so Salesforce allows more resources. **Key implication:** When your synchronous trigger is near limits, offload work to a Queueable job. But be careful — Queueable has its own limits: only 1 chained Queueable in production (vs 50 from synchronous), and batch jobs are limited to 5 concurrent. **Batch Apex start()** has a special limit: QueryLocator can return up to 50 MILLION records."
        }
      ]
    },
    {
      id: "sf-performance-profiling",
      title: "Performance Profiling & Debug Logs",
      explanation: `Performance profiling is how you identify bottlenecks, optimize slow queries, and ensure your Salesforce solution scales. Understanding debug logs, the Developer Console, and profiling tools is essential.

**Debug Logs — your primary profiling tool:**
\`\`\`
Log Categories:
  Database   — SOQL queries, DML operations  
  Workflow   — Flow/PB/Workflow rule execution
  Validation — Validation rule evaluation
  Callout    — HTTP callout details
  Apex_Code  — Apex execution, variable values
  System     — System-level operations
  
Log Levels:
  NONE → ERROR → WARN → INFO → DEBUG → FINE → FINER → FINEST
\`\`\`

**The Query Plan Tool:**
Available in the Developer Console (Query Editor → Query Plan), it shows:
- Whether your query is selective
- Which index (if any) will be used
- Estimated number of rows
- Cost comparison of different query plans

**Performance Anti-Patterns:**
1. **Non-selective queries on LDV objects** — Full table scans
2. **SOQL in loops** — N queries instead of 1
3. **Trigger recursion** — Same trigger firing multiple times
4. **Formula field chains** — Complex formulas on related objects
5. **Roll-up summary on LDV** — Recalculating across millions of records
6. **Complex sharing rules** — Excessive sharing recalculation

**Salesforce Optimizer:**
A free tool that analyzes your org and provides recommendations:
- Unused custom fields, objects, and automations
- Complex business processes
- Data model issues
- Performance bottlenecks`,
      codeExample: `// Performance Profiling Techniques

public class PerformanceProfiling {
    
    // 1. Custom timer for profiling
    public class Timer {
        private Long startTime;
        private String label;
        
        public Timer(String label) {
            this.label = label;
            this.startTime = System.currentTimeMillis();
        }
        
        public Long stop() {
            Long elapsed = System.currentTimeMillis() - this.startTime;
            System.debug(LoggingLevel.INFO, 
                '[PERF] ' + label + ': ' + elapsed + 'ms');
            return elapsed;
        }
    }
    
    // 2. Method profiling wrapper
    public static void profileMethod() {
        Timer overallTimer = new Timer('overallProcess');
        
        // Profile query
        Timer queryTimer = new Timer('accountQuery');
        List<Account> accounts = [
            SELECT Id, Name, Industry, 
                (SELECT Id, LastName FROM Contacts)
            FROM Account 
            WHERE Industry = 'Technology'
            LIMIT 1000
        ];
        queryTimer.stop();
        
        // Profile processing
        Timer processTimer = new Timer('dataProcessing');
        Map<String, Integer> contactCounts = new Map<String, Integer>();
        for (Account acc : accounts) {
            contactCounts.put(acc.Name, acc.Contacts.size());
        }
        processTimer.stop();
        
        // Profile DML
        Timer dmlTimer = new Timer('dmlUpdate');
        List<Account> toUpdate = new List<Account>();
        for (Account acc : accounts) {
            acc.Description = 'Contacts: ' + acc.Contacts.size();
            toUpdate.add(acc);
        }
        update toUpdate;
        dmlTimer.stop();
        
        // Overall
        Long total = overallTimer.stop();
        
        // Log limit consumption
        System.debug(LoggingLevel.INFO, '[PERF] Limits consumed:');
        System.debug(LoggingLevel.INFO, 
            '  SOQL: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
        System.debug(LoggingLevel.INFO, 
            '  DML: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());
        System.debug(LoggingLevel.INFO, 
            '  CPU: ' + Limits.getCpuTime() + 'ms/' + Limits.getLimitCpuTime() + 'ms');
        System.debug(LoggingLevel.INFO, 
            '  Heap: ' + Limits.getHeapSize() + '/' + Limits.getLimitHeapSize());
    }
    
    // 3. Query optimization analysis
    public static void analyzeQueryPerformance() {
        // Selective query — uses index
        Timer t1 = new Timer('Selective (Name index)');
        List<Account> r1 = [
            SELECT Id FROM Account WHERE Name = 'Acme' LIMIT 1
        ];
        t1.stop();
        
        // Non-selective query — full scan
        Timer t2 = new Timer('Non-selective (Description)');
        List<Account> r2 = [
            SELECT Id FROM Account WHERE Description != null LIMIT 1000
        ];
        t2.stop();
        
        // Optimized with indexed filter + non-indexed filter
        Timer t3 = new Timer('Optimized (indexed + filter)');
        List<Account> r3 = [
            SELECT Id FROM Account 
            WHERE CreatedDate = THIS_YEAR  // Indexed — narrows first
            AND Description != null        // Non-indexed — filters second
            LIMIT 1000
        ];
        t3.stop();
    }
    
    // 4. Platform Cache for repeat queries
    // Requires Platform Cache allocation in org
    public static List<Account> getCachedAccounts(String key) {
        // Check cache first
        Cache.OrgPartition orgPart = Cache.Org.getPartition('local.CachePartition');
        
        List<Account> cached = (List<Account>) orgPart.get(key);
        if (cached != null) {
            System.debug('Cache HIT for: ' + key);
            return cached;
        }
        
        System.debug('Cache MISS for: ' + key);
        List<Account> accounts = [
            SELECT Id, Name, Industry FROM Account LIMIT 100
        ];
        
        // Store in cache (TTL: 3600 seconds = 1 hour)
        orgPart.put(key, accounts, 3600);
        
        return accounts;
    }
    
    // 5. Debug log configuration (for team setup)
    // Setup → Debug Logs → New → Select User → Set levels:
    // Database: FINE (see all SOQL)
    // Apex_Code: DEBUG (see execution flow)
    // Workflow: INFO (see automation)
    // System: WARN (reduce noise)
    // Validation: INFO
    
    // 6. Analyzing debug log output
    // Look for patterns:
    // SOQL_EXECUTE_BEGIN — each query with bind values
    // SOQL_EXECUTE_END — rows returned, time
    // DML_BEGIN / DML_END — DML operations
    // CODE_UNIT_STARTED / CODE_UNIT_FINISHED — trigger/class entry/exit
    // LIMIT_USAGE_FOR_NS — cumulative limit consumption
}`,
      exercise: `**Performance Profiling Practice:**
1. Create a Timer utility class and profile the execution time of different operations
2. Use the Developer Console to analyze debug logs for a complex transaction
3. Use the Query Plan tool to compare selectivity of 5 different SOQL queries
4. Set up Platform Cache and measure the performance improvement for repeated queries
5. Profile a trigger with 200 records and identify the bottleneck (SOQL, CPU, or DML)
6. Run the Salesforce Optimizer and implement the top 5 recommendations
7. Create a performance test that measures operation time with 1, 50, 100, and 200 records
8. Analyze a debug log to trace a trigger cascade (Account → Contact → Task)
9. Build a custom performance monitoring object that logs transaction metrics
10. Write a load test using Data Loader to simulate production-scale data volumes`,
      commonMistakes: [
        "Setting debug log levels too high (FINEST for everything) — this slows performance and makes logs unreadable. Use FINE for Database, DEBUG for Apex, WARN for everything else",
        "Profiling in development with small data — performance issues only appear with production-scale data. Always test with realistic volumes",
        "Not using the Query Plan tool — guessing at query performance instead of using the tool that tells you exactly what's happening",
        "Ignoring the 'CUMULATIVE_LIMIT_USAGE' section in debug logs — this section shows total limit consumption across the entire transaction, including all triggers and automations",
        "Optimizing without measuring — always profile first. The actual bottleneck is often not what you expect"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you profile and optimize a slow Salesforce transaction?",
          a: "**Step-by-step:** (1) **Enable debug logs** for the affected user with Database:FINE, Apex:DEBUG. (2) **Reproduce** the slow operation. (3) **Analyze the log:** Look for repeated SOQL_EXECUTE (queries in loops), high CPU_TIME, large DML operations. Check CUMULATIVE_LIMIT_USAGE at the end. (4) **Use Query Plan** for slow SOQL — check index usage and selectivity. (5) **Identify bottleneck:** Usually SOQL count > CPU time > heap size. (6) **Optimize:** Bulkify queries, add custom indexes, move logic to async, consolidate triggers. (7) **Verify:** Re-profile and compare before/after metrics. (8) **Monitor:** Set up ongoing performance logging."
        },
        {
          type: "scenario",
          q: "A user reports that saving an Account takes 15 seconds. How do you diagnose this?",
          a: "**Diagnosis:** (1) Enable debug log for the user (Apex:FINE, Database:FINE). (2) Have user save the account. (3) Analyze the log for time-consuming operations. **Common causes:** (a) Multiple triggers with SOQL in loops — look for repeated SOQL_EXECUTE. (b) Complex Flow/Process Builder automations — check Workflow section. (c) Sharing recalculation — large role hierarchies or sharing rules. (d) Roll-up summary recalculation on parent — if Account has MD children. (e) Validation rules with cross-object queries. (f) External callouts blocking save. **Fix:** Based on the cause: bulkify triggers, simplify automations, move callouts to @future, optimize sharing model."
        }
      ]
    }
  ]
};

export default sfPhase8;
