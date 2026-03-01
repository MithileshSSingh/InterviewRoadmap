const sfPhase10 = {
  id: "phase-10",
  title: "Phase 10: Debugging & Production Troubleshooting",
  emoji: "🔍",
  description: "Master debugging tools, debug logs, Developer Console, error handling patterns, production incident management, monitoring, and troubleshooting strategies for enterprise Salesforce orgs.",
  topics: [
    {
      id: "sf-debugging-tools",
      title: "Debugging Tools & Techniques",
      explanation: `Effective debugging in Salesforce requires mastering multiple tools — debug logs, Developer Console, VS Code debugging, and monitoring tools.

**Debugging tools:**

1. **Debug Logs**
   - Configure via Setup → Debug Logs
   - Set log levels per category (Database, Apex, Workflow, etc.)
   - Each log has a size limit (5MB for Developer Console, 20MB total)
   - Persist for 24 hours (or until overwritten)
   - Critical sections: SOQL_EXECUTE, DML_BEGIN, USER_DEBUG, LIMIT_USAGE

2. **Developer Console**
   - Execute anonymous Apex
   - View and analyze debug logs
   - Query Plan tool for SOQL optimization
   - Test runner with code coverage
   - Performance profiling via timeline

3. **VS Code with Salesforce Extensions**
   - Replay Debugger — step through debug logs
   - ISV Debugger — real-time debugging (ISV only)
   - Apex Test Sidebar — run/debug tests
   - SOQL Builder — visual query construction

4. **Monitoring & Alerting**
   - Event Monitoring (Shield) — user activity tracking
   - Apex Exception Emails — automatic error notifications
   - Custom error logging — Error_Log__c custom object
   - Health Check — security scanning
   - Salesforce Optimizer — org health analysis

**Debug log anatomy:**
\`\`\`
EXECUTION_STARTED         — Transaction begins
CODE_UNIT_STARTED         — Trigger/class entry
SOQL_EXECUTE_BEGIN/END    — Each SOQL query with timing
DML_BEGIN/END             — Each DML operation
USER_DEBUG                — System.debug() output
VARIABLE_SCOPE_BEGIN/END  — Variable values (FINER level)
LIMIT_USAGE_FOR_NS        — Governor limit consumption
CUMULATIVE_LIMIT_USAGE    — Total limits used in transaction
EXECUTION_FINISHED        — Transaction complete
\`\`\``,
      codeExample: `// Debugging Patterns & Techniques

public class DebuggingService {
    
    // 1. Structured debug logging
    public static void debugLog(String className, String methodName, String message) {
        System.debug(LoggingLevel.INFO, 
            '[' + className + '.' + methodName + '] ' + message);
    }
    
    public static void debugLog(String className, String methodName, 
        String message, Object data) {
        System.debug(LoggingLevel.INFO, 
            '[' + className + '.' + methodName + '] ' + message + 
            ' | Data: ' + JSON.serialize(data));
    }
    
    // 2. Transaction-level debugging
    public static void debugTransaction(String context) {
        System.debug(LoggingLevel.INFO, '=== Transaction Debug: ' + context + ' ===');
        System.debug(LoggingLevel.INFO, 'User: ' + UserInfo.getUserId());
        System.debug(LoggingLevel.INFO, 'SOQL: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
        System.debug(LoggingLevel.INFO, 'DML: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());
        System.debug(LoggingLevel.INFO, 'CPU: ' + Limits.getCpuTime() + 'ms/' + Limits.getLimitCpuTime() + 'ms');
        System.debug(LoggingLevel.INFO, 'Heap: ' + Limits.getHeapSize() + '/' + Limits.getLimitHeapSize());
    }
    
    // 3. Conditional debugging (avoid heap in production)
    private static Boolean isDebugEnabled = false;
    
    public static void enableDebug() { isDebugEnabled = true; }
    
    public static void conditionalDebug(String message, Object data) {
        if (isDebugEnabled) {
            System.debug(LoggingLevel.DEBUG, message + ': ' + JSON.serialize(data));
        }
    }
    
    // 4. Error tracking with custom object
    public static void logError(Exception e, String context) {
        try {
            insert new Error_Log__c(
                Class_Name__c = context,
                Error_Message__c = e.getMessage()?.left(255),
                Stack_Trace__c = e.getStackTraceString()?.left(32000),
                Error_Type__c = e.getTypeName(),
                Line_Number__c = e.getLineNumber(),
                User__c = UserInfo.getUserId(),
                Timestamp__c = Datetime.now(),
                Transaction_Id__c = Request.getCurrent().getRequestId()
            );
        } catch (Exception logError) {
            System.debug(LoggingLevel.ERROR, 'Failed to log error: ' + logError.getMessage());
        }
    }
    
    // 5. Trigger debugging — trace what triggered the execution
    public static void debugTriggerContext() {
        System.debug(LoggingLevel.INFO, '=== Trigger Context ===');
        System.debug(LoggingLevel.INFO, 'isBefore: ' + Trigger.isBefore);
        System.debug(LoggingLevel.INFO, 'isAfter: ' + Trigger.isAfter);
        System.debug(LoggingLevel.INFO, 'isInsert: ' + Trigger.isInsert);
        System.debug(LoggingLevel.INFO, 'isUpdate: ' + Trigger.isUpdate);
        System.debug(LoggingLevel.INFO, 'isDelete: ' + Trigger.isDelete);
        System.debug(LoggingLevel.INFO, 'size: ' + Trigger.size);
        System.debug(LoggingLevel.INFO, 'new: ' + (Trigger.new != null ? Trigger.new.size() : 0));
        System.debug(LoggingLevel.INFO, 'old: ' + (Trigger.old != null ? Trigger.old.size() : 0));
    }
    
    // 6. Anonymous Apex debugging scripts
    // Execute in Developer Console → Execute Anonymous
    
    // Quick data check
    // List<Account> accs = [SELECT Id, Name, Industry FROM Account LIMIT 5];
    // System.debug(JSON.serializePretty(accs));
    
    // Test a specific method
    // try {
    //     OpportunityService.closeDeals(new Set<Id>{'006xxxxxxxxxxxx'});
    //     System.debug('SUCCESS');
    // } catch (Exception e) {
    //     System.debug('ERROR: ' + e.getMessage());
    //     System.debug('STACK: ' + e.getStackTraceString());
    // }
    
    // Check sharing visibility
    // List<AccountShare> shares = [
    //     SELECT AccountId, UserOrGroupId, AccountAccessLevel, RowCause
    //     FROM AccountShare WHERE AccountId = '001xxxxxxxxxxxx'
    // ];
    // System.debug(JSON.serializePretty(shares));
}`,
      exercise: `**Debugging Practice:**
1. Set up debug logs for your user and analyze a complex transaction (trigger → flow → trigger)
2. Use the Developer Console Timeline to identify the slowest operation in a transaction
3. Write a structured logging utility that captures class, method, and context
4. Create an Error_Log__c object and build an error tracking system
5. Use Anonymous Apex to reproduce and debug a specific production issue
6. Set up the VS Code Replay Debugger to step through a captured debug log
7. Build a debugging dashboard that shows error trends over time
8. Implement conditional debugging that can be toggled per user via Custom Setting
9. Write a script that audits all sharing rules affecting a specific record
10. Create a production monitoring alert that fires when error rates exceed thresholds`,
      commonMistakes: [
        "Leaving System.debug statements in production code — they consume CPU time and heap even if no one reads the logs. Use conditional debugging or remove before deploy",
        "Debug log size truncation — logs over 5MB are truncated. Reduce log levels for categories you don't need (set to WARN or NONE)",
        "Not using structured log format — random debug messages are impossible to search. Always include class name, method name, and context",
        "Debugging production with FINEST level — this generates massive logs and can impact org performance. Use INFO/DEBUG for production",
        "Not checking CUMULATIVE_LIMIT_USAGE — the section at the end of debug logs shows total limit consumption, including all triggers and automations"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What tools and techniques do you use to debug Salesforce issues?",
          a: "**Tools:** (1) **Debug Logs:** Set categories (Database:FINE, Apex:DEBUG) to trace queries, DML, and code flow. (2) **Developer Console:** Execute Anonymous Apex, Query Plan tool, Timeline profiling. (3) **VS Code Replay Debugger:** Step through captured logs. (4) **Error logging:** Custom Error_Log__c object for persistent error tracking. **Techniques:** (5) Structured logging with class/method context. (6) Conditional debugging toggled per user. (7) Transaction ID tracking for correlating related logs. (8) Governor limit monitoring at key checkpoints. **Production:** Event Monitoring for user activity, Apex Exception Emails for alerts, org health monitoring."
        },
        {
          type: "scenario",
          q: "Users report intermittent errors when saving Accounts. How do you investigate?",
          a: "**Systematic investigation:** (1) **Reproduce:** Get exact error message, user, time, and record. (2) **Check Error_Log__c** for recent errors (if implemented). (3) **Enable debug log** for the affected user. (4) **Have user reproduce** while logging is active. (5) **Analyze log:** Search for EXCEPTION or FATAL. Check SOQL count (near 100?), CPU time (near 10s?), DML (near 150?). (6) **Check recent deployments** (Setup Audit Trail) — did new code/automation deploy? (7) **Check platform** (trust.salesforce.com) — instance issues? (8) **Intermittent clues:** If only fails sometimes, check: data skew (specific accounts), sharing recalculation, concurrent updates (lock contention), or volume-dependent triggers."
        }
      ]
    },
    {
      id: "sf-production-incident-management",
      title: "Production Incident Management",
      explanation: `Managing production incidents in enterprise Salesforce requires a systematic approach — from detection through resolution to post-mortem. This is a critical skill for senior developers and architects.

**Incident severity levels:**
\`\`\`
P1 — Critical: System down, all users affected, data loss risk
P2 — High: Major feature broken, business impact, workaround exists
P3 — Medium: Feature degraded, limited users affected
P4 — Low: Minor issue, cosmetic, no business impact
\`\`\`

**Incident response process:**
1. **Detection** — Alerts, user reports, monitoring
2. **Triage** — Severity assessment, team notification
3. **Investigation** — Debug logs, error logs, deployment history
4. **Resolution** — Hotfix, rollback, configuration change
5. **Communication** — Stakeholder updates, user notification
6. **Post-Mortem** — Root cause analysis, prevention measures

**Common production issues:**
1. Governor limit exceptions (new code hitting limits with production data)
2. Sharing calculation delays (large role changes)
3. Integration failures (external system changes)
4. Record locking (concurrent updates to same records)
5. Performance degradation (non-selective queries with growing data)

**Rollback strategies:**
- **Metadata rollback:** Deploy previous version from Git
- **Data rollback:** Restore from backup (limited Salesforce support)
- **Feature toggle:** Disable via Custom Metadata / Feature Flag
- **Destructive changes:** Remove problematic components`,
      codeExample: `// Production Incident Management Patterns

// 1. Feature Kill Switch
public class FeatureKillSwitch {
    
    // Uses Custom Setting for instant toggle (no deployment needed)
    public static Boolean isFeatureEnabled(String featureName) {
        Kill_Switch__c settings = Kill_Switch__c.getInstance();
        
        switch on featureName {
            when 'NewPricingEngine' { return settings.New_Pricing__c; }
            when 'AutoEscalation' { return settings.Auto_Escalation__c; }
            when 'ExternalSync' { return settings.External_Sync__c; }
            when else { return true; } // Default: enabled
        }
    }
}

// In trigger handler:
// if (FeatureKillSwitch.isFeatureEnabled('NewPricingEngine')) {
//     PricingService.calculate(opps);
// }

// 2. Circuit Breaker for External Integrations
public class CircuitBreaker {
    // Track failures in Custom Setting (persists across transactions)
    
    public static Boolean isOpen(String serviceName) {
        Circuit_Breaker__c cb = Circuit_Breaker__c.getInstance(serviceName);
        if (cb == null) return false;
        
        // Open circuit if too many failures
        if (cb.Failure_Count__c >= cb.Max_Failures__c) {
            // Check cooldown period
            if (cb.Last_Failure__c != null && 
                cb.Last_Failure__c.addMinutes((Integer)cb.Cooldown_Minutes__c) > Datetime.now()) {
                return true; // Circuit is open — skip calls
            }
            // Cooldown expired — reset and try again
            resetCircuit(serviceName);
        }
        return false;
    }
    
    public static void recordFailure(String serviceName) {
        Circuit_Breaker__c cb = Circuit_Breaker__c.getOrgDefaults();
        // In production, update the specific service's settings
        System.debug('Circuit breaker: ' + serviceName + ' failure recorded');
    }
    
    public static void resetCircuit(String serviceName) {
        System.debug('Circuit breaker: ' + serviceName + ' reset');
    }
}

// 3. Incident alert notification
public class IncidentAlert {
    
    public static void raiseAlert(String severity, String message, String context) {
        // Log to custom object
        insert new Incident_Log__c(
            Severity__c = severity,
            Message__c = message,
            Context__c = context,
            Timestamp__c = Datetime.now(),
            Resolved__c = false
        );
        
        // Send email alert for P1/P2
        if (severity == 'P1' || severity == 'P2') {
            sendAlertEmail(severity, message, context);
        }
        
        // Publish Platform Event for real-time monitoring
        EventBus.publish(new Incident_Event__e(
            Severity__c = severity,
            Message__c = message,
            Context__c = context
        ));
    }
    
    private static void sendAlertEmail(String severity, String msg, String ctx) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new List<String>{
            'oncall@company.com', 'sf-admin@company.com'
        });
        mail.setSubject('[' + severity + '] Salesforce Production Alert');
        mail.setPlainTextBody(
            'Severity: ' + severity + '\\n' +
            'Message: ' + msg + '\\n' +
            'Context: ' + ctx + '\\n' +
            'Time: ' + Datetime.now().format() + '\\n' +
            'Org: ' + URL.getOrgDomainUrl().toExternalForm()
        );
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
    }
}`,
      exercise: `**Incident Management Practice:**
1. Create a Kill_Switch__c Custom Setting with toggles for 5 features
2. Implement a Circuit Breaker for an external API integration
3. Build an Incident_Log__c object with severity, status, and resolution tracking
4. Create a Platform Event that fires on P1/P2 incidents for real-time monitoring
5. Design a rollback procedure for a failed production deployment
6. Write a post-mortem template document for Salesforce production incidents
7. Set up Apex Exception Email alerts for your production org
8. Create a monitoring dashboard showing incident trends and MTTR (mean time to resolution)
9. Simulate a governor limit failure in sandbox and practice the investigation process
10. Design an on-call rotation system for Salesforce production support`,
      commonMistakes: [
        "Not having kill switches for new features — without them, the only rollback option is a full redeployment, which takes hours",
        "Deploying to production on Friday afternoon — follow change management best practices: deploy during low-traffic hours, not before weekends",
        "Not testing with production-data volumes — code works in sandbox (1K records) but fails in production (1M records)",
        "No rollback plan — every production deployment should have a documented rollback procedure before it starts",
        "Not logging errors persistently — debug logs expire in 24 hours. Without an Error_Log__c, production errors are lost"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Production users are getting 'Too many SOQL queries' errors when saving Opportunities. How do you handle this incident?",
          a: "**Immediate (P2 response):** (1) Check Setup Audit Trail — did new code deploy recently? Check last 24-48 hours. (2) Enable debug logs for an affected user. (3) Have them reproduce while logging. (4) Analyze log: search for SOQL_EXECUTE_BEGIN — which class/trigger is consuming queries? Count total queries. **Investigation:** (5) Check if a new Flow/Process Builder was deployed. (6) Check if there are cascading triggers (Opportunity → OpportunityLineItem → PricebookEntry). (7) Check if data volume changed (did a bulk load run?). **Resolution:** (8) If new code: hotfix or feature toggle off. (9) If existing code with new data volume: bulkify the offending logic. (10) If automation cascade: consolidate or move logic to async. **Prevention:** Add limits monitoring to the trigger, implement budget alerts."
        }
      ]
    }
  ]
};

export default sfPhase10;
