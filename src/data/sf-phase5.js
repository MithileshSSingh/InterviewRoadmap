const sfPhase5 = {
  id: "phase-5",
  title: "Phase 5: Integration & Enterprise Architecture",
  emoji: "🔌",
  description: "Master REST/SOAP APIs, OAuth flows, Named Credentials, callouts, Platform Events, Change Data Capture, middleware patterns, and enterprise integration architecture.",
  topics: [
    {
      id: "sf-rest-soap-apis",
      title: "REST & SOAP APIs",
      explanation: `Salesforce provides extensive API capabilities for both consuming (callouts from Salesforce) and exposing (custom APIs) data and functionality.

**Inbound APIs (external systems calling Salesforce):**
- **REST API** — Standard CRUD on Salesforce records via HTTP (JSON/XML)
- **SOAP API** — Enterprise-grade XML-based API
- **Bulk API 2.0** — For large data operations (millions of records)
- **Composite API** — Multiple operations in a single request
- **Tooling API** — Metadata operations (deployments, describe)
- **Streaming API** — Push notifications (PushTopic, CDC, Platform Events)
- **GraphQL API** — Query exactly the fields you need (newer)

**Outbound (Salesforce calling external systems):**
- **HTTP Callouts** — Apex HttpRequest/HttpResponse
- **Named Credentials** — Secure credential management
- **External Services** — Low-code API integration
- **Outbound Messaging** — Legacy SOAP-based notifications

**Custom REST APIs in Apex:**
You can expose your own REST endpoints using \`@RestResource\`:
- Custom URL: \`/services/apexrest/your-endpoint\`
- Supports GET, POST, PUT, PATCH, DELETE
- Full control over request/response format
- Respects sharing and security settings

**Governor limits for APIs:**
- 100 callouts per transaction
- 120-second cumulative callout timeout
- 6MB request/response size per callout
- API calls count against daily API limits (based on edition)`,
      codeExample: `// REST & SOAP Integration

// 1. Making HTTP Callouts from Apex
public class ExternalApiService {
    
    // GET request
    public static String getExternalData(String endpoint) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Accept', 'application/json');
        req.setTimeout(30000); // 30 seconds
        
        HttpResponse res = new Http().send(req);
        
        if (res.getStatusCode() == 200) {
            return res.getBody();
        } else {
            throw new CalloutException(
                'API Error: ' + res.getStatusCode() + ' — ' + res.getBody()
            );
        }
    }
    
    // POST request with JSON body
    public static Map<String, Object> createExternalRecord(Map<String, Object> data) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:External_CRM/api/v1/customers');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(data));
        req.setTimeout(60000);
        
        HttpResponse res = new Http().send(req);
        
        if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
            return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        } else {
            throw new CalloutException('Create failed: ' + res.getBody());
        }
    }
    
    // Using Named Credentials (best practice for auth)
    public static String callWithNamedCredential() {
        HttpRequest req = new HttpRequest();
        // Named Credential handles authentication automatically
        req.setEndpoint('callout:My_External_System/api/data');
        req.setMethod('GET');
        
        HttpResponse res = new Http().send(req);
        return res.getBody();
    }
}

// 2. Custom REST API (exposing Apex as API)
@RestResource(urlMapping='/api/accounts/*')
global with sharing class AccountRestApi {
    
    @HttpGet
    global static List<Account> getAccounts() {
        RestRequest req = RestContext.request;
        String searchTerm = req.params.get('search');
        
        if (String.isNotBlank(searchTerm)) {
            String search = '%' + searchTerm + '%';
            return [
                SELECT Id, Name, Industry, AnnualRevenue 
                FROM Account WHERE Name LIKE :search LIMIT 50
            ];
        }
        return [SELECT Id, Name, Industry FROM Account LIMIT 100];
    }
    
    @HttpPost
    global static Account createAccount() {
        RestRequest req = RestContext.request;
        Map<String, Object> body = (Map<String, Object>) 
            JSON.deserializeUntyped(req.requestBody.toString());
        
        Account acc = new Account(
            Name = (String) body.get('name'),
            Industry = (String) body.get('industry')
        );
        insert acc;
        
        RestContext.response.statusCode = 201;
        return acc;
    }
    
    @HttpPut
    global static Account updateAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substringAfterLast('/');
        
        Map<String, Object> body = (Map<String, Object>) 
            JSON.deserializeUntyped(req.requestBody.toString());
        
        Account acc = new Account(Id = accountId);
        if (body.containsKey('name')) acc.Name = (String) body.get('name');
        if (body.containsKey('industry')) acc.Industry = (String) body.get('industry');
        update acc;
        
        return [SELECT Id, Name, Industry FROM Account WHERE Id = :accountId];
    }
    
    @HttpDelete
    global static void deleteAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substringAfterLast('/');
        delete [SELECT Id FROM Account WHERE Id = :accountId];
        RestContext.response.statusCode = 204;
    }
}

// 3. Callout from Trigger (must use @future)
public class TriggerCalloutService {
    
    @future(callout=true)
    public static void syncToErp(Set<Id> accountIds) {
        List<Account> accounts = [
            SELECT Id, Name, Industry, BillingCity 
            FROM Account WHERE Id IN :accountIds
        ];
        
        for (Account acc : accounts) {
            HttpRequest req = new HttpRequest();
            req.setEndpoint('callout:ERP_System/api/customers');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(JSON.serialize(new Map<String, Object>{
                'sfId' => acc.Id,
                'name' => acc.Name,
                'industry' => acc.Industry
            }));
            
            try {
                HttpResponse res = new Http().send(req);
                if (res.getStatusCode() != 200) {
                    ErrorLogger.log('ERP sync failed for ' + acc.Id + 
                        ': ' + res.getBody(), 'TriggerCalloutService', 'ERROR');
                }
            } catch (Exception e) {
                ErrorLogger.log(e, 'TriggerCalloutService.syncToErp');
            }
        }
        ErrorLogger.flush();
    }
}`,
      exercise: `**Integration Practice:**
1. Create a custom REST API that supports GET, POST, PUT, DELETE for a custom object
2. Write an Apex class that makes a GET callout to a public API and parses the JSON response
3. Set up a Named Credential for an external system and use it in a callout
4. Implement a @future(callout=true) method called from a trigger to sync data externally
5. Build a Bulk API integration that imports 50,000 records from a CSV
6. Create a Composite API request that creates an Account and its Contacts in one API call
7. Write a test class with HttpCalloutMock for all your callout methods
8. Design an error handling and retry strategy for failed API callouts
9. Implement rate limiting to stay within daily API call limits
10. Build a real-time sync using Change Data Capture + External API callouts`,
      commonMistakes: [
        "Making callouts from triggers without @future — synchronous callouts in triggers are not allowed. Use @future(callout=true) or Queueable with Database.AllowsCallouts",
        "Not using Named Credentials — hard-coding credentials in Apex is a security vulnerability and fails security reviews",
        "Ignoring callout governor limits — 100 callouts per transaction, 120-second total timeout. Plan for limits in bulk scenarios",
        "Not writing HttpCalloutMock tests — callouts cannot be made in test context. Without mocks, your code has 0% test coverage for callout logic",
        "Not handling HTTP error responses — checking only for 200 misses 201, 204, and other valid success codes. Check for ranges (200-299)"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are Named Credentials and why should you use them?",
          a: "Named Credentials store authentication credentials (username/password, OAuth tokens, certificates) securely in Salesforce metadata. **Why use them:** (1) **Security** — credentials are encrypted, never in code. (2) **Environment portability** — different credentials in sandbox vs production without code changes. (3) **No Remote Site Setting needed** — Named Credentials automatically whitelist the endpoint. (4) **Auto-authentication** — handles OAuth token refresh automatically. (5) **Security review compliance** — AppExchange and enterprise reviews require Named Credentials."
        },
        {
          type: "scenario",
          q: "You need to make a callout from a trigger. How do you handle this?",
          a: "Callouts cannot be made synchronously from triggers (mixed DML restriction). **Solutions:** (1) **@future(callout=true)** — simplest. Pass record IDs as Set<Id>, re-query inside the future method. Limitation: max 50 future calls/transaction, no chaining. (2) **Queueable with Database.AllowsCallouts** — more control. Accepts SObject params, can chain, returns Job ID. (3) **Platform Events** — publish an event from the trigger, subscribe with a trigger on the event that makes the callout. Best for decoupling. **Best practice:** Queueable for most cases. Platform Events for complex/decoupled scenarios."
        }
      ]
    },
    {
      id: "sf-oauth-authentication",
      title: "OAuth & Authentication Flows",
      explanation: `Understanding OAuth and authentication is critical for integration architecture. Salesforce supports multiple OAuth flows for different scenarios.

**OAuth 2.0 Flows in Salesforce:**

1. **Web Server Flow (Authorization Code)** — Most common for web apps
   - User redirected to Salesforce login
   - App receives authorization code
   - App exchanges code for access token + refresh token
   - Use for: Web applications with server-side logic

2. **User-Agent Flow (Implicit)** — For client-side apps
   - Access token returned directly in URL fragment
   - No refresh token
   - Use for: Single-page apps, mobile apps (legacy)

3. **JWT Bearer Token Flow** — Server-to-server (no user interaction)
   - App uses a private key to sign a JWT
   - Salesforce validates and returns an access token
   - Use for: Backend integrations, CI/CD, automated processes

4. **Client Credentials Flow** — Machine-to-machine
   - App uses client ID + secret to get a token
   - No user context — runs as an integration user
   - Use for: System integrations, data sync

5. **Device Flow** — For devices with limited input
   - Device displays a code, user authorizes on another device
   - Use for: IoT devices, CLI tools

6. **Refresh Token Flow** — Renew expired access tokens
   - Use refresh token to get a new access token
   - Avoids re-authentication

**Connected Apps:**
To use OAuth, you must create a Connected App in Salesforce that defines:
- Consumer Key (Client ID)
- Consumer Secret (Client Secret)
- Callback URL
- OAuth Scopes (api, refresh_token, web, etc.)
- IP restrictions and policies

**Security best practices:**
- Always use HTTPS
- Store tokens securely (never in client-side code)
- Use the minimum required OAuth scopes
- Implement token rotation and refresh
- Monitor Connected App usage in Setup`,
      codeExample: `// OAuth & Authentication Patterns

// 1. JWT Bearer Token Flow (Server-to-Server)
public class JwtAuthService {
    
    private static final String TOKEN_ENDPOINT = 'https://login.salesforce.com/services/oauth2/token';
    private static final String CONSUMER_KEY = 'your_connected_app_consumer_key';
    
    public static String getAccessToken() {
        // In production, use Named Credentials instead of manual JWT
        
        // Build JWT claims
        Map<String, Object> claims = new Map<String, Object>{
            'iss' => CONSUMER_KEY,
            'sub' => 'integration@company.com',
            'aud' => 'https://login.salesforce.com',
            'exp' => String.valueOf(
                Datetime.now().addMinutes(5).getTime() / 1000
            )
        };
        
        // In real implementation, sign with certificate
        // String jwt = createSignedJwt(claims, certificate);
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(TOKEN_ENDPOINT);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setBody(
            'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer' +
            '&assertion=' + EncodingUtil.urlEncode('jwt_token_here', 'UTF-8')
        );
        
        HttpResponse res = new Http().send(req);
        Map<String, Object> response = (Map<String, Object>) 
            JSON.deserializeUntyped(res.getBody());
        
        return (String) response.get('access_token');
    }
}

// 2. Making authenticated calls to another Salesforce org
public class CrossOrgService {
    
    public static List<Map<String, Object>> queryExternalOrg(String soql) {
        // Use Named Credential for auth
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Other_Salesforce_Org/services/data/v59.0/query?q=' + 
            EncodingUtil.urlEncode(soql, 'UTF-8'));
        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');
        
        HttpResponse res = new Http().send(req);
        
        Map<String, Object> result = (Map<String, Object>) 
            JSON.deserializeUntyped(res.getBody());
        
        return (List<Map<String, Object>>) 
            (List<Object>) result.get('records');
    }
}

// 3. Custom REST API with proper authentication check
@RestResource(urlMapping='/api/v1/secure/*')
global with sharing class SecureRestApi {
    
    @HttpGet
    global static ResponseWrapper getData() {
        // The @RestResource automatically validates OAuth tokens
        // No manual auth check needed — Salesforce handles it
        
        // But you should check permissions
        if (!Schema.SObjectType.Account.isAccessible()) {
            RestContext.response.statusCode = 403;
            return new ResponseWrapper(false, 'Insufficient permissions');
        }
        
        List<Account> accounts = [
            SELECT Id, Name, Industry FROM Account LIMIT 10
        ];
        
        return new ResponseWrapper(true, accounts);
    }
    
    global class ResponseWrapper {
        public Boolean success;
        public Object data;
        public String message;
        
        public ResponseWrapper(Boolean success, Object data) {
            this.success = success;
            this.data = data;
        }
        
        public ResponseWrapper(Boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }
}`,
      exercise: `**OAuth & Authentication Practice:**
1. Create a Connected App in your developer org and configure OAuth scopes
2. Use Postman to authenticate via Web Server Flow and make API calls
3. Set up a JWT Bearer Token flow for server-to-server integration
4. Create a Named Credential that handles OAuth token refresh automatically
5. Build a custom REST API and test authentication with different user profiles
6. Implement a token management service that caches and refreshes access tokens
7. Set up IP restrictions on a Connected App and test access from different IPs
8. Create a Canvas app that uses signed request authentication
9. Configure OAuth policies: token lifetime, refresh token rotation, admin pre-authorization
10. Audit Connected App usage using Setup → Connected App OAuth Usage`,
      commonMistakes: [
        "Storing access tokens in custom settings or fields — tokens should be managed by Named Credentials, not stored in data",
        "Not implementing refresh token logic — access tokens expire. Without refresh logic, integrations break",
        "Using the same Connected App for all environments — create separate Connected Apps for dev/sandbox/production",
        "Granting too broad OAuth scopes — 'full' scope gives complete access. Use minimum required scopes (api, refresh_token)",
        "Not monitoring Connected App usage — unauthorized access can go undetected without monitoring"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the different OAuth flows in Salesforce and when to use each.",
          a: "**Web Server (Auth Code):** User-facing web apps. User logs in → code → token exchange. Most secure for web. **JWT Bearer:** Server-to-server. No user interaction. App signs JWT with certificate. Use for: automated integrations, CI/CD. **Client Credentials:** Machine-to-machine. Client ID + Secret → token. No user context. Use for: backend services. **Device Flow:** Limited-input devices. Device shows code, user authorizes elsewhere. **Refresh Token:** Renew expired tokens without re-auth. **Key decision:** User involved? → Web Server or Device. No user? → JWT or Client Credentials."
        }
      ]
    },
    {
      id: "sf-integration-patterns",
      title: "Enterprise Integration Patterns & Middleware",
      explanation: `Enterprise Salesforce implementations rarely exist in isolation — they integrate with ERP (SAP, Oracle), HRIS (Workday), marketing (Marketo, HubSpot), and custom systems. Understanding integration patterns is an architect-level competency.

**Core Integration Patterns:**

1. **Request-Reply (Synchronous)**
   - Salesforce calls external system and waits for response
   - Use for: Real-time data lookup, address validation, credit check
   - Limitation: 120-second timeout, blocks the user

2. **Fire-and-Forget (Asynchronous)**
   - Salesforce sends data and doesn't wait for response
   - Use for: Logging, notifications, non-critical syncs
   - Implement via: @future, Queueable, Platform Events

3. **Batch Data Sync**
   - Scheduled bulk data transfer between systems
   - Use for: Nightly data warehouse sync, mass updates
   - Implement via: Batch Apex + callouts, Bulk API

4. **Event-Driven (Pub/Sub)**
   - Systems react to events published by other systems
   - Use for: Real-time sync, change notification, decoupled architecture
   - Implement via: Platform Events, Change Data Capture, webhooks

5. **Data Virtualization**
   - Access external data without importing it
   - Use for: Real-time external data access, large datasets
   - Implement via: Salesforce Connect (OData), External Objects

**Middleware considerations:**
- **MuleSoft** — Salesforce's preferred middleware (Salesforce owns MuleSoft)
- **Benefits:** API management, data transformation, error handling, monitoring
- **When to use middleware:** Multiple systems (3+), complex transformations, need for guaranteed delivery, regulatory compliance

**Integration Architecture Decision Framework:**
\`\`\`
Volume?    → High → Bulk API / Batch Apex
Timing?    → Real-time → Request-Reply / Events
Direction? → Inbound → REST API / Platform Events
             Outbound → Callouts / @future
Complexity? → High → Middleware (MuleSoft)
             Low → Direct point-to-point
\`\`\``,
      codeExample: `// Enterprise Integration Patterns

// 1. Request-Reply Pattern (Synchronous)
public class AddressValidationService {
    
    public static AddressResult validateAddress(String street, String city, String state) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Address_Validator/validate');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(new Map<String, String>{
            'street' => street,
            'city' => city,
            'state' => state
        }));
        req.setTimeout(10000); // 10-second timeout for real-time
        
        HttpResponse res = new Http().send(req);
        
        if (res.getStatusCode() == 200) {
            return (AddressResult) JSON.deserialize(res.getBody(), AddressResult.class);
        }
        throw new CalloutException('Address validation failed');
    }
    
    public class AddressResult {
        public Boolean isValid;
        public String standardizedAddress;
        public String zipCode;
    }
}

// 2. Fire-and-Forget Pattern (Async)
public class ErpSyncService {
    
    @future(callout=true)
    public static void syncOrderToErp(Set<Id> orderIds) {
        List<Order> orders = [
            SELECT Id, OrderNumber, TotalAmount, Account.Name
            FROM Order WHERE Id IN :orderIds
        ];
        
        for (Order ord : orders) {
            try {
                HttpRequest req = new HttpRequest();
                req.setEndpoint('callout:ERP_System/api/orders');
                req.setMethod('POST');
                req.setHeader('Content-Type', 'application/json');
                req.setBody(JSON.serialize(new Map<String, Object>{
                    'orderNumber' => ord.OrderNumber,
                    'amount' => ord.TotalAmount,
                    'customer' => ord.Account.Name
                }));
                
                HttpResponse res = new Http().send(req);
                logResult(ord.Id, res);
            } catch (Exception e) {
                logError(ord.Id, e);
            }
        }
    }
    
    private static void logResult(Id orderId, HttpResponse res) {
        insert new Integration_Log__c(
            Record_Id__c = orderId,
            Status__c = res.getStatusCode() < 300 ? 'Success' : 'Failed',
            Response_Code__c = res.getStatusCode(),
            Response_Body__c = res.getBody()?.left(131072)
        );
    }
    
    private static void logError(Id orderId, Exception e) {
        insert new Integration_Log__c(
            Record_Id__c = orderId,
            Status__c = 'Error',
            Error_Message__c = e.getMessage()
        );
    }
}

// 3. Batch Data Sync Pattern
public class NightlyDataSyncBatch implements 
    Database.Batchable<SObject>, Database.AllowsCallouts, Database.Stateful {
    
    private Integer successCount = 0;
    private Integer failCount = 0;
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name, Industry, AnnualRevenue, 
                   External_Id__c, Last_Sync__c
            FROM Account
            WHERE LastModifiedDate > :getLastSyncTime()
        ]);
    }
    
    public void execute(Database.BatchableContext bc, List<Account> scope) {
        // Transform to external format
        List<Map<String, Object>> externalRecords = new List<Map<String, Object>>();
        for (Account acc : scope) {
            externalRecords.add(new Map<String, Object>{
                'sfId' => acc.Id,
                'name' => acc.Name,
                'industry' => acc.Industry,
                'revenue' => acc.AnnualRevenue
            });
        }
        
        // Send batch to external system
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Data_Warehouse/api/bulk/customers');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(externalRecords));
        req.setTimeout(120000);
        
        try {
            HttpResponse res = new Http().send(req);
            if (res.getStatusCode() == 200) {
                successCount += scope.size();
                // Update sync timestamp
                for (Account acc : scope) {
                    acc.Last_Sync__c = Datetime.now();
                }
                update scope;
            } else {
                failCount += scope.size();
            }
        } catch (Exception e) {
            failCount += scope.size();
        }
    }
    
    public void finish(Database.BatchableContext bc) {
        // Send summary notification
        System.debug('Sync complete. Success: ' + successCount + ', Failed: ' + failCount);
    }
    
    private Datetime getLastSyncTime() {
        List<Integration_Config__c> configs = [
            SELECT Last_Sync_Time__c FROM Integration_Config__c 
            WHERE Name = 'NightlySync' LIMIT 1
        ];
        return configs.isEmpty() ? Datetime.now().addDays(-1) : configs[0].Last_Sync_Time__c;
    }
}

// 4. Event-Driven Pattern (Pub/Sub)
// See Phase 3b for Platform Events implementation

// 5. Retry pattern with exponential backoff
public class RetryableCallout {
    
    public static HttpResponse callWithRetry(
        HttpRequest req, Integer maxRetries
    ) {
        Integer retryDelay = 1000; // Start with 1 second
        
        for (Integer attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                HttpResponse res = new Http().send(req);
                
                if (res.getStatusCode() < 500) {
                    return res; // Success or client error — don't retry
                }
                
                // Server error — retry with backoff
                if (attempt < maxRetries) {
                    // Note: Apex doesn't have sleep(). In real implementation,
                    // use Queueable chaining for delayed retry
                    System.debug('Retry attempt ' + (attempt + 1) + 
                        ' after ' + retryDelay + 'ms');
                }
            } catch (CalloutException e) {
                if (attempt == maxRetries) throw e;
            }
            retryDelay *= 2; // Exponential backoff
        }
        throw new CalloutException('Max retries exceeded');
    }
}`,
      exercise: `**Integration Pattern Practice:**
1. Implement a Request-Reply pattern for real-time address validation
2. Build a Fire-and-Forget sync from Opportunities to an external CRM
3. Create a Batch job that syncs changed records nightly to a data warehouse
4. Design an event-driven integration using Platform Events and an external subscriber
5. Implement a retry mechanism with exponential backoff for failed callouts
6. Create an Integration_Log custom object and build logging for all callout operations
7. Design a multi-system integration architecture diagram (Salesforce + ERP + HRIS)
8. Implement a circuit breaker pattern that stops calling a failing API after 5 failures
9. Build a webhook receiver — external system calls your custom REST API when data changes
10. Design failure handling: dead letter queue, alerting, manual retry interface`,
      commonMistakes: [
        "Using synchronous callouts for non-critical operations — blocks the user. Use async (Platform Events, Queueable) for fire-and-forget scenarios",
        "Not implementing retry logic — network failures are inevitable. Always design for retry with backoff",
        "Point-to-point integration for 5+ systems — creates a spaghetti architecture. Use middleware (MuleSoft) for complex integrations",
        "Not logging integration operations — without logs, debugging production integration failures is nearly impossible",
        "Ignoring rate limits on external APIs — sending 10,000 requests per minute to an API with a 100/min limit causes cascading failures"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the main integration patterns for Salesforce and when would you use each?",
          a: "**Request-Reply (Sync):** Real-time lookup/validation. User waits for response. 120s timeout. **Fire-and-Forget (Async):** Non-critical updates. No response needed. @future/Queueable/Events. **Batch Sync:** Nightly bulk transfers. Millions of records. Batch Apex + Bulk API. **Event-Driven:** Real-time reactions. Platform Events/CDC. Decoupled producers and consumers. **Data Virtualization:** Access without import. Salesforce Connect/External Objects. **Decision factors:** latency requirements, data volume, fault tolerance, coupling tolerance."
        },
        {
          type: "scenario",
          q: "You need to integrate Salesforce with SAP, Workday, and a custom data warehouse. How would you architect this?",
          a: "**Hub-and-spoke with MuleSoft:** (1) **MuleSoft as the integration hub** — all systems connect to MuleSoft, not directly to each other. (2) **Salesforce → MuleSoft:** Platform Events for real-time changes, Batch API for nightly bulk sync. (3) **MuleSoft → SAP:** SAP connector for order/inventory data. Transform Salesforce format to SAP IDocs. (4) **MuleSoft → Workday:** REST API for employee data sync. Handle HR data sensitivity (PII masking). (5) **MuleSoft → Data Warehouse:** Batch jobs for analytical data. (6) **Benefits:** Centralized monitoring, reusable transformations, guaranteed delivery, error handling. (7) **Alternative without MuleSoft:** Direct point-to-point, but exponentially more complex with 3+ systems."
        }
      ]
    }
  ]
};

export default sfPhase5;
