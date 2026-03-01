const sfPhase13 = {
  id: "phase-13",
  title: "Phase 13: Real-World Projects & Case Studies",
  emoji: "🏢",
  description: "Enterprise Salesforce project scenarios — complete system design exercises, data migration projects, performance optimization case studies, and end-to-end implementation.",
  topics: [
    {
      id: "sf-enterprise-case-studies",
      title: "Enterprise Implementation Case Studies",
      explanation: `Real-world Salesforce projects test your ability to combine all skills — architecture, Apex, Flows, integration, security, and performance — into cohesive solutions. These case studies mirror the types of problems you'll face in senior developer and architect interviews.

**Case Study 1: Global ERP Integration**
A manufacturing company with 50,000+ products needs to sync order data between Salesforce (CRM) and SAP (ERP) in real-time.

Architecture:
- Platform Events for real-time order creation notifications
- MuleSoft as middleware for data transformation (Salesforce format ↔ SAP IDoc)
- Batch Apex for nightly full reconciliation sync
- Named Credentials for OAuth authentication to MuleSoft
- Error handling with retry queue and dead letter processing
- Custom error dashboard for operations team monitoring

**Case Study 2: Multi-Region CRM Consolidation**
A company operates in 15 countries. Each country currently has its own CRM. Consolidate to a single Salesforce org.

Architecture:
- Single org with Record Types per region (different processes)
- Territory Management for geographic assignment
- Multi-currency with dated exchange rates
- Shield Platform Encryption for EU data (GDPR)
- Experience Cloud portal per region (separate branding)
- Division-based sharing (OWD = Private, sharing rules per region)
- Data migration: 50M records using Bulk API + ETL tool

**Case Study 3: High-Volume B2C Service Platform**
An e-commerce company processes 100,000 customer service cases per month.

Architecture:
- Omni-Channel routing with skill-based assignment
- Einstein Bots for first-line deflection (reduce volume 30%)
- Knowledge Base with Experience Cloud self-service portal
- Case auto-escalation based on SLA tiers
- Platform Events for real-time order status integration
- Big Objects for archiving cases older than 2 years
- Custom indexes on Case fields for query performance`,
      codeExample: `// Case Study Implementation — Order Management System

// Complete Order Management with ERP integration
public class OrderManagementService {
    
    // Use case: Customer places order → validate → create in SF → sync to ERP
    public static Order__c processOrder(OrderRequest request) {
        Savepoint sp = Database.setSavepoint();
        
        try {
            // 1. Validate order
            validateOrder(request);
            
            // 2. Calculate pricing
            Decimal totalPrice = calculatePricing(
                request.lineItems, request.discountCode
            );
            
            // 3. Create order in Salesforce
            Order__c order = createOrder(request, totalPrice);
            
            // 4. Create line items
            List<Order_Line_Item__c> lineItems = createLineItems(
                order.Id, request.lineItems
            );
            
            // 5. Update account statistics
            updateAccountStats(request.accountId, totalPrice);
            
            // 6. Publish event for ERP sync (async, decoupled)
            publishOrderEvent(order, lineItems);
            
            return order;
            
        } catch (Exception e) {
            Database.rollback(sp);
            ErrorLogger.log(e, 'OrderManagementService.processOrder');
            throw e;
        }
    }
    
    private static void validateOrder(OrderRequest request) {
        if (request.lineItems == null || request.lineItems.isEmpty()) {
            throw new OrderException('Order must have at least one line item');
        }
        
        // Check product availability
        Set<Id> productIds = new Set<Id>();
        for (LineItemRequest li : request.lineItems) {
            productIds.add(li.productId);
        }
        
        Map<Id, Product2> products = new Map<Id, Product2>(
            [SELECT Id, Name, IsActive, Family 
             FROM Product2 WHERE Id IN :productIds]
        );
        
        for (LineItemRequest li : request.lineItems) {
            Product2 product = products.get(li.productId);
            if (product == null || !product.IsActive) {
                throw new OrderException('Product not found or inactive: ' + li.productId);
            }
            if (li.quantity <= 0) {
                throw new OrderException('Quantity must be positive');
            }
        }
    }
    
    private static Decimal calculatePricing(
        List<LineItemRequest> items, String discountCode
    ) {
        Decimal total = 0;
        for (LineItemRequest li : items) {
            total += li.unitPrice * li.quantity;
        }
        
        // Apply discount
        if (String.isNotBlank(discountCode)) {
            Discount_Code__c discount = DiscountService.validate(discountCode);
            if (discount != null) {
                total *= (1 - discount.Percentage__c / 100);
            }
        }
        
        return total;
    }
    
    private static Order__c createOrder(OrderRequest request, Decimal total) {
        Order__c order = new Order__c(
            Account__c = request.accountId,
            Order_Date__c = Date.today(),
            Total_Amount__c = total,
            Status__c = 'Pending',
            Payment_Method__c = request.paymentMethod,
            Shipping_Address__c = request.shippingAddress,
            External_Reference__c = generateOrderRef()
        );
        insert order;
        return order;
    }
    
    private static List<Order_Line_Item__c> createLineItems(
        Id orderId, List<LineItemRequest> items
    ) {
        List<Order_Line_Item__c> lineItems = new List<Order_Line_Item__c>();
        for (Integer i = 0; i < items.size(); i++) {
            lineItems.add(new Order_Line_Item__c(
                Order__c = orderId,
                Product__c = items[i].productId,
                Quantity__c = items[i].quantity,
                Unit_Price__c = items[i].unitPrice,
                Line_Number__c = i + 1
            ));
        }
        insert lineItems;
        return lineItems;
    }
    
    private static void publishOrderEvent(Order__c order, List<Order_Line_Item__c> items) {
        Order_Event__e event = new Order_Event__e(
            Order_Id__c = order.Id,
            Account_Id__c = order.Account__c,
            Total_Amount__c = order.Total_Amount__c,
            Status__c = order.Status__c,
            Event_Type__c = 'ORDER_CREATED',
            Line_Item_Count__c = items.size()
        );
        EventBus.publish(event);
    }
    
    private static String generateOrderRef() {
        return 'ORD-' + String.valueOf(Datetime.now().getTime()).right(10);
    }
    
    // Request classes
    public class OrderRequest {
        public Id accountId;
        public List<LineItemRequest> lineItems;
        public String discountCode;
        public String paymentMethod;
        public String shippingAddress;
    }
    
    public class LineItemRequest {
        public Id productId;
        public Integer quantity;
        public Decimal unitPrice;
    }
    
    public class OrderException extends Exception {}
}`,
      exercise: `**Real-World Project Exercises:**
1. Design and implement a complete Order Management System (objects, Apex, Flows, API)
2. Build an ERP integration sync with error handling, retry, and reconciliation
3. Create a data migration plan for importing 5M records from a legacy CRM
4. Implement a multi-region security model with division-based sharing
5. Design a high-volume case management system for 100K cases/month
6. Build a customer self-service portal with Experience Cloud and Knowledge
7. Create an end-to-end CI/CD pipeline for a team of 5 developers
8. Implement a real-time dashboard using Platform Events and LWC
9. Design a data archival strategy using Big Objects for 5+ year old records
10. Build a complete CPQ solution: product configuration, pricing rules, quote generation`,
      commonMistakes: [
        "Designing without scalability in mind — always ask 'what happens when this has 10x the data?' during design phase",
        "Not involving stakeholders in architecture decisions — technical architecture must align with business priorities",
        "Skipping the data model design phase — jumping into code without a complete ERD leads to rework and data quality issues",
        "Not planning for errors in integration — every integration fails eventually. Design retry queues, dead letter processing, and monitoring from day one",
        "Not documenting architecture decisions — the reason WHY you chose a pattern is as important as the pattern itself"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a Salesforce solution for a company with 500 sales reps, 50,000 accounts, and integration with SAP for order processing.",
          a: "**Architecture:** **Data Model:** Standard Account, Contact, Opportunity + custom Order__c with Order_Line_Item__c (MD). External_Id__c on Account for SAP mapping. **Security:** OWD Private for Accounts/Opportunities. Role Hierarchy by region. Territory Management for account assignment. **Integration:** Named Credentials for SAP auth. Queueable Apex for real-time order sync. Batch Apex for nightly reconciliation. Platform Events for order status updates from SAP. **Performance:** Custom indexes on Account.External_Id__c, Opportunity.CloseDate. Skinny table request for Opportunity if >1M records. **Automation:** Before-save Flow for Opportunity defaults. After-save trigger for order creation. Scheduled Flow for stale pipeline notifications. **Monitoring:** Error_Log__c for integration failures. Dashboard for sync health. Circuit breaker for SAP downtime."
        }
      ]
    }
  ]
};

export default sfPhase13;
