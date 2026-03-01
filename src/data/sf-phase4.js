const sfPhase4 = {
  id: "phase-4",
  title: "Phase 4: Lightning Web Components (LWC)",
  emoji: "⚡",
  description: "Master Lightning Web Components — lifecycle, wire service, Apex integration, component communication, custom events, Lightning Data Service, and performance optimization.",
  topics: [
    {
      id: "sf-lwc-fundamentals",
      title: "LWC Architecture & Lifecycle",
      explanation: `**Lightning Web Components (LWC)** is Salesforce's modern UI framework built on web standards (Custom Elements, Shadow DOM, Templates). It replaced the proprietary Aura framework and aligns with the broader web development ecosystem.

**Why LWC over Aura:**
1. **Web Standards** — LWC uses native browser APIs (Custom Elements v1, Shadow DOM)
2. **Better Performance** — No proprietary framework overhead; compiles to native browser code
3. **Modern JavaScript** — ES6+ classes, modules, decorators, promises
4. **Smaller bundle size** — Only polyfills what the browser doesn't support
5. **Easier to learn** — Web developers can pick it up with minimal Salesforce-specific knowledge

**LWC file structure:**
\`\`\`
myComponent/
├── myComponent.html    — Template (HTML)
├── myComponent.js      — Controller (JavaScript)
├── myComponent.css     — Styles (scoped via Shadow DOM)
└── myComponent.js-meta.xml — Configuration (where the component can be used)
\`\`\`

**Component Lifecycle:**
\`\`\`
1. constructor()       — Component instance created (don't access DOM)
2. connectedCallback() — Component inserted into DOM (fetch data here)
3. renderedCallback()  — Component rendered/re-rendered (careful: runs often)
4. disconnectedCallback() — Component removed from DOM (cleanup here)
5. errorCallback(error, stack) — Error boundary (catch child errors)
\`\`\`

**Key decorators:**
- \`@api\` — Public property (parent-to-child communication)
- \`@track\` — Tracked property (reactivity — deprecated in latest, all fields are reactive)
- \`@wire\` — Wire adapter (reactive data fetching from Apex or LDS)

**Reactivity:**
LWC uses a reactive system — when a property's value changes, the template re-renders automatically. All class fields are reactive by default in latest LWC. Objects and arrays need immutable update patterns (spread operator).`,
      codeExample: `<!-- LWC Component — Account Detail Card -->
<!-- accountDetailCard.html -->
<template>
    <lightning-card title={cardTitle} icon-name="standard:account">
        <div class="slds-p-around_medium">
            <template if:true={isLoading}>
                <lightning-spinner alternative-text="Loading..." size="small">
                </lightning-spinner>
            </template>
            
            <template if:false={isLoading}>
                <template if:true={account}>
                    <div class="slds-grid slds-gutters">
                        <div class="slds-col slds-size_1-of-2">
                            <p class="slds-text-heading_small">{account.Name}</p>
                            <p class="slds-text-body_regular">
                                Industry: {account.Industry}
                            </p>
                            <p class="slds-text-body_regular">
                                Revenue: {formattedRevenue}
                            </p>
                        </div>
                        <div class="slds-col slds-size_1-of-2">
                            <lightning-badge label={account.Industry}></lightning-badge>
                        </div>
                    </div>
                    
                    <!-- Child component communication -->
                    <c-contact-list 
                        account-id={recordId}
                        oncontactselected={handleContactSelected}>
                    </c-contact-list>
                </template>
                
                <template if:true={error}>
                    <p class="slds-text-color_error">{error}</p>
                </template>
            </template>
        </div>
        
        <div slot="actions">
            <lightning-button 
                label="Edit" 
                onclick={handleEdit}
                variant="brand">
            </lightning-button>
        </div>
    </lightning-card>
</template>

// accountDetailCard.js
import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_INDUSTRY from '@salesforce/schema/Account.Industry';
import ACCOUNT_REVENUE from '@salesforce/schema/Account.AnnualRevenue';

const FIELDS = [ACCOUNT_NAME, ACCOUNT_INDUSTRY, ACCOUNT_REVENUE];

export default class AccountDetailCard extends LightningElement {
    @api recordId; // Public property — set by parent or record page
    
    // Wire adapter — reactively fetches data when recordId changes
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount;
    
    // Lifecycle hooks
    connectedCallback() {
        console.log('Component connected to DOM, recordId:', this.recordId);
    }
    
    renderedCallback() {
        // Careful: this runs after EVERY render
        // Use a flag to run logic only once
    }
    
    disconnectedCallback() {
        // Cleanup — remove event listeners, etc.
    }
    
    errorCallback(error, stack) {
        // Error boundary — catches errors from child components
        console.error('Child component error:', error.message, stack);
    }
    
    // Getters (computed properties)
    get account() {
        return this.wiredAccount.data ? this.wiredAccount.data.fields : null;
    }
    
    get isLoading() {
        return !this.wiredAccount.data && !this.wiredAccount.error;
    }
    
    get error() {
        return this.wiredAccount.error?.body?.message;
    }
    
    get cardTitle() {
        const name = this.account ? this.account.Name.value : 'Account';
        return 'Account: ' + name;
    }
    
    get formattedRevenue() {
        const rev = this.account?.AnnualRevenue?.value;
        return rev ? new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        }).format(rev) : 'N/A';
    }
    
    // Event handlers
    handleEdit() {
        // Dispatch custom event to parent
        this.dispatchEvent(new CustomEvent('edit', {
            detail: { recordId: this.recordId }
        }));
    }
    
    handleContactSelected(event) {
        // Handle event from child component
        const contactId = event.detail.contactId;
        this.dispatchEvent(new ShowToastEvent({
            title: 'Contact Selected',
            message: 'Selected contact: ' + contactId,
            variant: 'success'
        }));
    }
}

<!-- accountDetailCard.js-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__RecordPage</target>
        <target>lightning__AppPage</target>
        <target>lightning__HomePage</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordPage">
            <objects>
                <object>Account</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>`,
      exercise: `**LWC Fundamentals Practice:**
1. Build an LWC that displays Account details using the @wire decorator and getRecord
2. Implement all lifecycle hooks (constructor, connectedCallback, renderedCallback, disconnectedCallback) and log when each fires
3. Create a component with @api properties that accepts data from a parent
4. Build a search component with debounced input and real-time results
5. Create an error boundary using errorCallback that displays a friendly error message
6. Implement conditional rendering with if:true/if:false and for:each loops
7. Build a component with computed properties (getters) that format currency and dates
8. Create a form component using lightning-input with validation
9. Deploy your LWC to a Record Page using Lightning App Builder
10. Write Jest tests for your LWC component`,
      commonMistakes: [
        "Accessing DOM in constructor() — the DOM isn't available yet. Use connectedCallback() or renderedCallback()",
        "Heavy operations in renderedCallback() — it runs after EVERY render. Use a boolean flag to run initialization logic only once",
        "Forgetting that @api properties are read-only inside the component — you can't reassign them. Copy to a local variable if you need to modify",
        "Mutating objects/arrays directly instead of using spread — reactive updates require new object references: this.items = [...this.items, newItem]",
        "Not setting isExposed=true in the meta XML — the component won't appear in Lightning App Builder without it"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the LWC component lifecycle hooks and when each is called.",
          a: "**constructor()** — Called when the component is created. Can't access DOM or public properties (not set yet). Call super(). Set initial state. **connectedCallback()** — Called when inserted into DOM. The component is in the document. Fetch data, start listeners. Fires multiple times if component is moved. **renderedCallback()** — Called after EVERY render/re-render. Use cautiously with a flag for one-time logic. Useful for imperative DOM manipulation after render. **disconnectedCallback()** — Called when removed from DOM. Clean up listeners, cancel subscriptions. **errorCallback(error, stack)** — Called when descendant component throws error. Error boundary pattern."
        },
        {
          type: "tricky",
          q: "What is the difference between @api, @track, and regular properties in LWC?",
          a: "**@api** — Makes a property PUBLIC (parent can set it). Read-only within the component itself. Used for parent-to-child communication. **@track** — DEPRECATED in newer versions. Previously required for deep reactivity (objects/arrays). Now all properties are reactive by default for primitives. For objects/arrays, still need immutable updates. **Regular properties** — Reactive by default for primitives. Private to the component. Reassigning triggers re-render. Object mutation does NOT trigger re-render — use spread operator."
        },
        {
          type: "coding",
          q: "How do you pass data from a child LWC to a parent LWC?",
          a: "Use **Custom Events**: Child dispatches an event, parent listens. ```javascript\n// Child (contactList.js)\nthis.dispatchEvent(new CustomEvent('contactselected', {\n    detail: { contactId: selectedId, contactName: name },\n    bubbles: false, // default\n    composed: false // doesn't cross shadow DOM\n}));\n\n// Parent (accountDetail.html)\n// <c-contact-list oncontactselected={handleContactSelected}>\n\n// Parent (accountDetail.js)\nhandleContactSelected(event) {\n    const { contactId, contactName } = event.detail;\n    console.log('Selected:', contactName);\n}\n```"
        }
      ]
    },
    {
      id: "sf-lwc-wire-apex",
      title: "Wire Service & Apex Integration",
      explanation: `The **Wire Service** is LWC's reactive data binding mechanism. It connects your component to Salesforce data sources — either Lightning Data Service (LDS) adapters or custom Apex methods.

**Wire Service fundamentals:**
- Uses the \`@wire\` decorator to bind to a data source
- Automatically re-fetches data when input parameters change (reactive binding with \`$\` prefix)
- Caches data client-side (LDS cache) for performance
- Returns \`{ data, error }\` — always check both

**Two ways to call Apex from LWC:**

1. **Wire (reactive)** — Automatic, declarative
   - Data fetches automatically when inputs change
   - Results are cached and shared across components
   - Cannot pass complex objects as parameters
   - Best for: data display, read operations

2. **Imperative (manual)** — Explicit, controlled  
   - You call the method manually (on button click, etc.)
   - You handle the Promise (then/catch or async/await)
   - Can pass complex objects
   - Best for: DML operations, conditional fetching, user-triggered actions

**Apex method requirements for LWC:**
- Must be \`@AuraEnabled\` (not \`@RemoteAction\`)
- For wire: must be \`@AuraEnabled(cacheable=true)\` — read-only, no DML
- Must be \`static\`
- Parameters must match wire/imperative call exactly

**Lightning Data Service (LDS):**
Built-in wire adapters that don't require custom Apex:
- \`getRecord\` — Read a single record
- \`getRecords\` — Read multiple records
- \`createRecord\` — Create a record
- \`updateRecord\` — Update a record
- \`deleteRecord\` — Delete a record
- \`getObjectInfo\` — Get object metadata
- \`getPicklistValues\` — Get picklist options`,
      codeExample: `// Wire Service & Apex Integration

// === APEX CONTROLLER ===
// AccountController.cls
public with sharing class AccountController {
    
    // Cacheable — for @wire (read-only, no DML)
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String searchTerm) {
        String searchKey = '%' + searchTerm + '%';
        return [
            SELECT Id, Name, Industry, AnnualRevenue, CreatedDate
            FROM Account
            WHERE Name LIKE :searchKey
            ORDER BY Name
            LIMIT 20
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsByAccount(Id accountId) {
        return [
            SELECT Id, FirstName, LastName, Email, Phone, Title
            FROM Contact
            WHERE AccountId = :accountId
            ORDER BY LastName
        ];
    }
    
    // Non-cacheable — for imperative calls (DML operations)
    @AuraEnabled
    public static Account createAccount(String name, String industry) {
        Account acc = new Account(Name = name, Industry = industry);
        insert acc;
        return acc;
    }
    
    @AuraEnabled
    public static void updateAccountIndustry(Id accountId, String industry) {
        Account acc = new Account(Id = accountId, Industry = industry);
        update acc;
    }
}

// === LWC — WIRE SERVICE ===
// accountSearch.js
import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getContactsByAccount from '@salesforce/apex/AccountController.getContactsByAccount';
import createAccount from '@salesforce/apex/AccountController.createAccount';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AccountSearch extends LightningElement {
    searchTerm = '';
    selectedAccountId;
    
    // === WIRE — Reactive data fetching ===
    
    // Wire to Apex method (re-queries when searchTerm changes)
    @wire(getAccounts, { searchTerm: '$searchTerm' })
    wiredAccounts; // { data: [...], error: {...} }
    
    // Wire with hold reference for refresh
    _wiredContactsResult;
    contacts;
    contactsError;
    
    @wire(getContactsByAccount, { accountId: '$selectedAccountId' })
    wiredContacts(result) {
        this._wiredContactsResult = result; // Hold ref for refreshApex
        const { data, error } = result;
        if (data) {
            this.contacts = data;
            this.contactsError = undefined;
        } else if (error) {
            this.contactsError = error.body.message;
            this.contacts = undefined;
        }
    }
    
    // Getters
    get accounts() {
        return this.wiredAccounts.data || [];
    }
    
    get hasAccounts() {
        return this.accounts.length > 0;
    }
    
    get isLoading() {
        return !this.wiredAccounts.data && !this.wiredAccounts.error;
    }
    
    // === EVENT HANDLERS ===
    
    handleSearchChange(event) {
        // Debounce search input
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
            this.searchTerm = event.target.value;
            // Wire automatically re-fetches when searchTerm changes
        }, 300);
    }
    
    handleAccountSelect(event) {
        this.selectedAccountId = event.currentTarget.dataset.id;
        // Wire automatically fetches contacts for new accountId
    }
    
    // === IMPERATIVE APEX CALL ===
    
    async handleCreateAccount() {
        const nameInput = this.template.querySelector('[data-id="name"]');
        const industryInput = this.template.querySelector('[data-id="industry"]');
        
        try {
            const newAccount = await createAccount({
                name: nameInput.value,
                industry: industryInput.value
            });
            
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Account created: ' + newAccount.Name,
                variant: 'success'
            }));
            
            // Refresh the wired data to include new account
            await refreshApex(this.wiredAccounts);
            
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error'
            }));
        }
    }
    
    // Refresh wired contacts after an update
    async refreshContacts() {
        await refreshApex(this._wiredContactsResult);
    }
}

// === LIGHTNING DATA SERVICE (No Apex needed) ===
// recordEditor.js
import { LightningElement, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ID_FIELD from '@salesforce/schema/Account.Id';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class RecordEditor extends LightningElement {
    @api recordId;
    
    async handleUpdateIndustry(event) {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[INDUSTRY_FIELD.fieldApiName] = event.target.value;
        
        try {
            await updateRecord({ fields });
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Industry updated!',
                variant: 'success'
            }));
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error'
            }));
        }
    }
}`,
      exercise: `**Wire Service Practice:**
1. Create an Apex controller with @AuraEnabled(cacheable=true) methods and wire them to an LWC
2. Build a search component that uses wire with reactive parameters ($ prefix)
3. Implement both wire and imperative Apex calls in the same component
4. Use refreshApex() to refresh wired data after a DML operation
5. Build a CRUD component using only Lightning Data Service (no custom Apex)
6. Create a component that uses getPicklistValues to dynamically populate a dropdown
7. Implement error handling for both wire and imperative calls with user-friendly messages
8. Build a data table using lightning-datatable with wire-connected data
9. Create a component that chains multiple Apex calls (fetch accounts, then contacts for selected)
10. Write Jest tests that mock wire adapters and Apex calls`,
      commonMistakes: [
        "Using @wire with non-cacheable Apex methods — wire requires @AuraEnabled(cacheable=true). Cacheable methods cannot perform DML",
        "Forgetting the $ prefix for reactive wire parameters — @wire(getAccounts, { searchTerm: 'searchTerm' }) is a literal string, not reactive. Use '$searchTerm'",
        "Not holding a reference for refreshApex — you need to store the raw wire result to call refreshApex(this._wiredResult) later",
        "Performing DML in a cacheable method — cacheable=true enforces read-only. Use imperative calls for create/update/delete",
        "Not handling both data and error from wire results — wire always returns { data, error }. Check both to handle loading and error states"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between wire and imperative Apex calls in LWC?",
          a: "**Wire:** Declarative, reactive. Data fetches automatically when reactive parameters change. Results are cached by LDS. Method must be @AuraEnabled(cacheable=true) — read-only, no DML. Best for displaying data. **Imperative:** Manual, controlled. You call the method explicitly (await apexMethod()). Can perform DML. You handle the Promise. Best for create/update/delete and user-triggered actions. **Key:** Wire is for reads; imperative is for writes. Wire caches; imperative doesn't."
        },
        {
          type: "tricky",
          q: "What is refreshApex and when do you need it?",
          a: "**refreshApex(wiredResult)** forces a re-fetch of wired data from the server, bypassing the LDS cache. **When needed:** After performing a DML operation (imperative Apex), the wire cache is stale — it still shows old data. Call refreshApex to get fresh data. **Critical:** You must store the raw wire result reference (not just the .data) to pass to refreshApex. Pattern: `wiredHandler(result) { this._wiredResult = result; }` then `refreshApex(this._wiredResult);`"
        }
      ]
    },
    {
      id: "sf-lwc-communication",
      title: "Component Communication & Custom Events",
      explanation: `Component communication is essential for building modular, reusable LWC components. There are four main patterns:

**1. Parent → Child: @api Properties**
Parent passes data down to child via public properties.

**2. Child → Parent: Custom Events**
Child dispatches events, parent listens with on-prefixed handlers.

**3. Unrelated Components: Lightning Message Service (LMS)**
Publish/subscribe messaging across the DOM — components don't need a parent-child relationship.

**4. Sibling Communication:**
- Via shared parent (child A → event → parent → @api → child B)
- Via LMS (publish/subscribe)
- Via Platform Events (empApi for real-time)

**Custom Events — the standard pattern:**
\`\`\`javascript
// Child dispatches
this.dispatchEvent(new CustomEvent('itemselected', {
    detail: { id: '001xxx', name: 'Acme' },
    bubbles: false,   // Only reaches immediate parent
    composed: false   // Doesn't cross Shadow DOM boundary
}));

// Parent listens (in template)
// <c-child-component onitemselected={handleSelection}></c-child-component>
\`\`\`

**Lightning Message Service (LMS):**
For communication between components that don't share a parent-child relationship. Works across Aura, LWC, and Visualforce.

**Event bubbling considerations:**
- \`bubbles: false\` (default) — event only reaches the immediate parent
- \`bubbles: true\` — event bubbles up the DOM tree
- \`composed: true\` — event crosses Shadow DOM boundaries
- Use bubbles/composed cautiously — they create tight coupling`,
      codeExample: `// Component Communication Patterns

// === 1. PARENT TO CHILD — @api Properties ===

// Parent template
// <c-child-card account-name={selectedName} record-count={count}></c-child-card>

// childCard.js
import { LightningElement, api } from 'lwc';

export default class ChildCard extends LightningElement {
    @api accountName; // Set by parent
    @api recordCount; // Set by parent
    
    // Public method — parent can call this
    @api
    resetState() {
        this.internalState = 'default';
    }
    
    // Note: @api properties are READ-ONLY inside the component
    // Copy to internal variable if you need to modify
    internalState = 'default';
}

// Parent calling child method
// parentComponent.js
// const child = this.template.querySelector('c-child-card');
// child.resetState();

// === 2. CHILD TO PARENT — Custom Events ===

// contactList.js (Child)
import { LightningElement, api, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

export default class ContactList extends LightningElement {
    @api accountId;
    contacts = [];
    
    @wire(getContacts, { accountId: '$accountId' })
    wiredContacts({ data, error }) {
        if (data) this.contacts = data;
    }
    
    handleSelect(event) {
        const contactId = event.currentTarget.dataset.id;
        const contact = this.contacts.find(c => c.Id === contactId);
        
        // Dispatch custom event to parent
        this.dispatchEvent(new CustomEvent('contactselected', {
            detail: {
                contactId: contact.Id,
                contactName: contact.FirstName + ' ' + contact.LastName,
                email: contact.Email
            }
        }));
    }
}

// accountPage.js (Parent)
// <c-contact-list 
//     account-id={recordId}
//     oncontactselected={handleContactSelected}>
// </c-contact-list>

// handleContactSelected(event) {
//     const { contactId, contactName, email } = event.detail;
//     this.selectedContact = { contactId, contactName, email };
// }

// === 3. UNRELATED COMPONENTS — Lightning Message Service ===

// First, create a Message Channel (metadata XML)
// messageChannels/Record_Selected.messageChannel-meta.xml
// <?xml version="1.0" encoding="UTF-8"?>
// <LightningMessageChannel xmlns="http://soap.sforce.com/2006/04/metadata">
//     <masterLabel>Record Selected</masterLabel>
//     <isExposed>true</isExposed>
//     <lightningMessageFields>
//         <fieldName>recordId</fieldName>
//         <description>The selected record ID</description>
//     </lightningMessageFields>
//     <lightningMessageFields>
//         <fieldName>recordName</fieldName>
//     </lightningMessageFields>
// </LightningMessageChannel>

// Publisher component
import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED from '@salesforce/messageChannel/Record_Selected__c';

export default class RecordPublisher extends LightningElement {
    @wire(MessageContext)
    messageContext;
    
    handleRecordClick(event) {
        const payload = {
            recordId: event.currentTarget.dataset.id,
            recordName: event.currentTarget.dataset.name
        };
        publish(this.messageContext, RECORD_SELECTED, payload);
    }
}

// Subscriber component (can be ANYWHERE on the page)
import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED from '@salesforce/messageChannel/Record_Selected__c';

export default class RecordSubscriber extends LightningElement {
    selectedRecordId;
    selectedRecordName;
    subscription = null;
    
    @wire(MessageContext)
    messageContext;
    
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            RECORD_SELECTED,
            (message) => this.handleMessage(message)
        );
    }
    
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
    
    handleMessage(message) {
        this.selectedRecordId = message.recordId;
        this.selectedRecordName = message.recordName;
    }
}

// === 4. REAL-TIME EVENTS — empApi (Platform Events in LWC) ===
import { LightningElement } from 'lwc';
import { subscribe as empSubscribe, unsubscribe as empUnsubscribe,
    onError } from 'lightning/empApi';

export default class RealTimeNotifications extends LightningElement {
    channelName = '/event/Order_Event__e';
    subscription = {};
    
    connectedCallback() {
        this.handleSubscribe();
        this.registerErrorListener();
    }
    
    handleSubscribe() {
        empSubscribe(this.channelName, -1, (response) => {
            // Handle incoming Platform Event
            const eventData = response.data.payload;
            console.log('New order event:', eventData);
            // Update UI, show notification, etc.
        }).then(sub => {
            this.subscription = sub;
        });
    }
    
    registerErrorListener() {
        onError((error) => {
            console.error('EMP API error:', error);
        });
    }
    
    disconnectedCallback() {
        empUnsubscribe(this.subscription);
    }
}`,
      exercise: `**Component Communication Practice:**
1. Build a parent-child component pair using @api properties and custom events
2. Create a sibling communication pattern through a shared parent
3. Implement Lightning Message Service for two unrelated components on the same page
4. Build a real-time notification component using empApi (Platform Events in LWC)
5. Create a master-detail UI: selecting an account shows contacts, selecting a contact shows details
6. Implement a pub/sub pattern for 3 components that react to the same event
7. Build a component that exposes a public @api method for the parent to call
8. Create a search component that publishes results via LMS to a map/chart component
9. Handle complex event data (arrays of objects) in custom events
10. Write Jest tests for component communication (mock events, verify handlers)`,
      commonMistakes: [
        "Using bubbles:true and composed:true without understanding the implications — events crossing Shadow DOM boundaries create tight coupling and make debugging harder",
        "Not unsubscribing from LMS or empApi in disconnectedCallback — causes memory leaks and ghost event handlers",
        "Passing mutable objects in event.detail — the receiver can modify the original data. Use Object.freeze() or spread for immutability",
        "Using querySelector to communicate between components — this is fragile. Use @api properties, events, or LMS instead",
        "Forgetting that LMS requires a Message Channel metadata XML file — it must be deployed to the org before the components can use it"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the different ways LWC components can communicate with each other?",
          a: "**4 patterns:** (1) **Parent → Child: @api properties** — parent passes data via attributes. Also @api methods that parent can call. (2) **Child → Parent: Custom Events** — child dispatches CustomEvent, parent listens with onEventName handler. Detail property carries data. (3) **Unrelated: Lightning Message Service** — publish/subscribe pattern. Works across LWC, Aura, and VF. Requires a Message Channel (metadata). (4) **Real-time: empApi** — subscribe to Platform Events for real-time server push. Use for live dashboards, notifications, collaborative features."
        },
        {
          type: "scenario",
          q: "You have a record list component and a map component on the same Lightning page. They're not related. How do you make selecting a record highlight its location on the map?",
          a: "Use **Lightning Message Service (LMS)**: (1) Create a Message Channel (e.g., `Record_Selected__c`) with fields for recordId, latitude, longitude. (2) In the list component, publish a message when a record is selected. (3) In the map component, subscribe to the channel and update the map marker. **Why LMS:** The components don't share a parent, so events and @api won't work. LMS provides decoupled pub/sub communication across any components on the page."
        }
      ]
    },
    {
      id: "sf-lwc-performance-aura",
      title: "LWC Performance & Aura Legacy Understanding",
      explanation: `Optimizing LWC performance and understanding the Aura legacy are important for enterprise Salesforce projects. Many orgs still have Aura components that coexist with LWC.

**LWC Performance Optimization:**

1. **Minimize Apex calls**
   - Use Lightning Data Service (LDS) when possible — it caches and shares data
   - Use \`@AuraEnabled(cacheable=true)\` for read operations
   - Avoid redundant calls — check if data already exists

2. **Efficient rendering**
   - Use \`if:true/if:false\` to conditionally render — removed elements don't consume DOM resources
   - For long lists, use virtual scrolling or pagination (lightning-datatable handles this)
   - Avoid deep nested iterations in templates

3. **Data optimization**
   - Query only needed fields in Apex (SELECT Id, Name — not all fields)
   - Use pagination for large datasets
   - Implement lazy loading for related data
   - Use \`getRecord\` with specific fields, not \`getRecord\` with layout

4. **JavaScript optimization**
   - Debounce user input (search, resize handlers)
   - Use \`requestAnimationFrame\` for smooth animations
   - Avoid blocking the main thread with heavy computation
   - Use Web Workers for CPU-intensive tasks

**Aura Components — Legacy Understanding:**
Aura is the older Salesforce UI framework. Key differences from LWC:
\`\`\`
Feature         | Aura                    | LWC
----------------|-------------------------|-------------------
Standards       | Proprietary framework   | Web Standards
Performance     | Higher overhead         | Native browser APIs
Syntax          | XML markup + JS         | HTML + JS classes
Data binding    | Two-way by default      | One-way (explicit)  
Events          | Application/Component   | DOM CustomEvents
Learning curve  | Salesforce-specific     | Standard web dev
Future          | Maintenance mode        | Active development
\`\`\`

**Coexistence:**
- LWC can be used INSIDE Aura components (but not vice versa)
- They share Lightning Message Service for communication
- Migration strategy: wrap LWC in Aura wrappers where needed
- New development should ALWAYS use LWC

**LWC Security:**
- Shadow DOM provides style and DOM encapsulation
- \`@api\` properties are the only public surface
- CSP (Content Security Policy) restricts inline scripts
- \`locker\` service restricts DOM access to your component's shadow tree
- Use \`lightning/navigation\` for URL navigation (never window.open directly)`,
      codeExample: `// LWC Performance Best Practices

// 1. Debounced Search — Avoids excessive Apex calls
import { LightningElement, wire } from 'lwc';
import searchAccounts from '@salesforce/apex/AccountController.getAccounts';

export default class OptimizedSearch extends LightningElement {
    searchTerm = '';
    _debounceTimer;
    
    // Wire only fires when searchTerm changes (debounced)
    @wire(searchAccounts, { searchTerm: '$searchTerm' })
    accounts;
    
    handleSearchInput(event) {
        window.clearTimeout(this._debounceTimer);
        const value = event.target.value;
        
        // Only search after user stops typing for 300ms
        this._debounceTimer = setTimeout(() => {
            this.searchTerm = value;
        }, 300);
    }
}

// 2. Pagination — Don't load all records at once
import { LightningElement, wire } from 'lwc';
import getAccountsPage from '@salesforce/apex/AccountController.getAccountsPage';

export default class PaginatedList extends LightningElement {
    currentPage = 1;
    pageSize = 25;
    totalRecords = 0;
    accounts = [];
    
    @wire(getAccountsPage, { 
        pageNumber: '$currentPage', 
        pageSize: '$pageSize' 
    })
    wiredAccounts({ data, error }) {
        if (data) {
            this.accounts = data.records;
            this.totalRecords = data.totalCount;
        }
    }
    
    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }
    
    get isFirstPage() { return this.currentPage === 1; }
    get isLastPage() { return this.currentPage >= this.totalPages; }
    
    handlePrevious() { this.currentPage--; }
    handleNext() { this.currentPage++; }
}

// 3. Aura Wrapper for LWC (Legacy coexistence)
// This allows using an LWC inside an Aura context
// auraWrapper.cmp
// <aura:component implements="flexipage:availableForAllPageTypes">
//     <aura:attribute name="recordId" type="String" />
//     <c:myLwcComponent record-id="{!v.recordId}" />
// </aura:component>

// 4. Lazy Loading — Load data only when needed
import { LightningElement, api } from 'lwc';
import getDetails from '@salesforce/apex/AccountController.getAccountDetails';

export default class LazyDetail extends LightningElement {
    @api recordId;
    details;
    isExpanded = false;
    hasLoaded = false;
    
    async handleExpand() {
        this.isExpanded = !this.isExpanded;
        
        // Only fetch data on first expand
        if (this.isExpanded && !this.hasLoaded) {
            try {
                this.details = await getDetails({ accountId: this.recordId });
                this.hasLoaded = true;
            } catch (error) {
                console.error('Failed to load details:', error);
            }
        }
    }
}

// 5. Virtual Scrolling concept for large lists
// lightning-datatable handles this automatically:
// <lightning-datatable
//     key-field="id"
//     data={accounts}
//     columns={columns}
//     enable-infinite-loading
//     onloadmore={loadMoreData}
//     show-row-number-column>
// </lightning-datatable>`,
      exercise: `**LWC Performance & Aura Practice:**
1. Build a search component with debounced input (300ms delay before Apex call)
2. Implement client-side pagination for a list of 1000+ records
3. Create a lazy-loading component that only fetches data when the user expands a section
4. Build an infinite scroll component using lightning-datatable onloadmore
5. Wrap an LWC inside an Aura component for backward compatibility
6. Measure component load time using the Performance tab in Chrome DevTools
7. Optimize a component that makes 5 separate Apex calls to use 1-2 calls instead
8. Implement a caching strategy using browser sessionStorage for non-sensitive data
9. Create a component that handles 10,000 rows without browser freezing
10. Migrate a simple Aura component to LWC and compare performance`,
      commonMistakes: [
        "Loading all records at once — 10,000 records will freeze the browser. Always paginate or use virtual scrolling",
        "Not debouncing search input — every keystroke fires a wire call, wasting Apex calls and causing flickering UI",
        "Creating Aura components for new features — all new development should use LWC unless you need Aura-specific features (e.g., certain ISV packaging requirements)",
        "Fetching data in renderedCallback — it fires after every re-render, causing infinite loops of fetch → render → fetch. Use connectedCallback or wire instead",
        "Not using Lightning Data Service when possible — LDS caches data and shares it across components. Custom Apex should only be used for complex queries LDS can't handle"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the key differences between Aura and LWC? Why should new projects use LWC?",
          a: "**Aura:** Proprietary framework, higher overhead, XML markup, two-way data binding, application/component events, Salesforce-specific learning. **LWC:** Built on web standards (Custom Elements, Shadow DOM), native performance, HTML + JS classes, one-way data flow, standard DOM events, transferable skills. **Why LWC:** (1) 30-50% better performance (no framework overhead). (2) Standard web skills transfer. (3) Active Salesforce investment. (4) Smaller bundle sizes. (5) Better security (Shadow DOM encapsulation). Aura is in maintenance mode — only bug fixes, no new features."
        },
        {
          type: "scenario",
          q: "Your LWC component displays a table of 50,000 records and the page is very slow. How do you optimize it?",
          a: "**Multi-layered optimization:** (1) **Server-side:** Add LIMIT and OFFSET to the Apex query. Return only 25-50 records per page. Add search/filter to reduce dataset server-side. (2) **Component:** Use `lightning-datatable` with `enable-infinite-loading` — it virtualizes the DOM, only rendering visible rows. (3) **Pagination:** Show page controls, load data on demand. (4) **Caching:** Use @AuraEnabled(cacheable=true) so LDS caches results. (5) **Lazy loading:** Load detail data only when user clicks a row. (6) **Debounce:** Add 300ms debounce to search/filter inputs. **Result:** Render 50 rows instead of 50,000; load more on scroll."
        }
      ]
    }
  ]
};

export default sfPhase4;
