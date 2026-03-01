const sfPhase7 = {
  id: "phase-7",
  title: "Phase 7: DevOps & SFDX",
  emoji: "🚀",
  description: "Master SFDX CLI, scratch orgs, source-driven development, CI/CD pipelines, version control, packaging, deployment strategies, and Salesforce DevOps best practices.",
  topics: [
    {
      id: "sf-sfdx-source-development",
      title: "SFDX & Source-Driven Development",
      explanation: `**Salesforce DX (SFDX)** is the modern development lifecycle for Salesforce. It introduces source-driven development, scratch orgs, and CLI-based workflows that align with industry-standard DevOps practices.

**Key SFDX concepts:**

1. **Source Format** — Metadata stored as granular files in Git
   - Classes, triggers, LWC components, custom objects as individual files
   - Version-controlled in Git (not in an org)
   - Enables code review, branching, merge workflows

2. **Scratch Orgs** — Disposable development environments
   - Created from a definition file (project-scratch-def.json)
   - Include only the features and settings you need
   - Last up to 30 days (configurable)
   - Each developer gets their own isolated environment

3. **Dev Hub** — The org that manages scratch orgs
   - Controls scratch org limits and settings
   - Required for scratch org creation
   - Usually your production org or a dedicated org

4. **Package Development** — Modular deployment
   - Unlocked Packages: for internal org development
   - Managed Packages: for ISV distribution (AppExchange)
   - Package versions are immutable and deployable

5. **CLI Commands** (essential):
\`\`\`bash
sf org create scratch      — Create a scratch org
sf project deploy start    — Deploy source to an org
sf project retrieve start  — Retrieve metadata from org
sf apex run                — Execute anonymous Apex
sf data import tree        — Import test data
sf org open                — Open the org in browser
sf package create          — Create a package
sf package version create  — Create a package version
\`\`\`

**Project structure:**
\`\`\`
my-project/
├── sfdx-project.json        — Project configuration
├── config/
│   └── project-scratch-def.json — Scratch org definition
├── force-app/
│   └── main/
│       └── default/
│           ├── classes/       — Apex classes
│           ├── triggers/      — Apex triggers
│           ├── lwc/           — Lightning Web Components
│           ├── aura/          — Aura components
│           ├── objects/       — Custom objects & fields
│           ├── permissionsets/ — Permission sets
│           └── layouts/       — Page layouts
├── scripts/
│   └── apex/                  — Anonymous Apex scripts
└── data/                      — Test data (JSON)
\`\`\``,
      codeExample: `// SFDX Commands & Configuration

// 1. sfdx-project.json — Project configuration
{
    "packageDirectories": [
        {
            "path": "force-app",
            "default": true,
            "package": "MyApp",
            "versionName": "ver 1.0",
            "versionNumber": "1.0.0.NEXT"
        }
    ],
    "name": "my-salesforce-project",
    "namespace": "",
    "sfdcLoginUrl": "https://login.salesforce.com",
    "sourceApiVersion": "59.0"
}

// 2. project-scratch-def.json — Scratch org definition
{
    "orgName": "My Dev Org",
    "edition": "Developer",
    "features": [
        "EnableSetPasswordInApi",
        "Communities",
        "ServiceCloud",
        "SalesCloud"
    ],
    "settings": {
        "lightningExperienceSettings": {
            "enableS1DesktopEnabled": true
        },
        "mobileSettings": {
            "enableS1EncryptedStoragePref2": false
        },
        "securitySettings": {
            "passwordPolicies": {
                "enableSetPasswordInApi": true
            }
        }
    }
}

// 3. Common SFDX workflow commands (bash)
// # Authenticate to Dev Hub
// sf org login web --set-default-dev-hub --alias DevHub
//
// # Create a scratch org
// sf org create scratch \\
//   --definition-file config/project-scratch-def.json \\
//   --set-default \\
//   --alias my-dev-org \\
//   --duration-days 14
//
// # Push source to scratch org
// sf project deploy start
//
// # Pull changes from scratch org
// sf project retrieve start
//
// # Run all tests
// sf apex run test --synchronous --code-coverage --result-format human
//
// # Open scratch org in browser
// sf org open
//
// # Import test data
// sf data import tree --files data/Account.json data/Contact.json
//
// # Execute anonymous Apex
// sf apex run --file scripts/apex/init-data.apex
//
// # Create a package version
// sf package version create \\
//   --package MyApp \\
//   --installation-key test1234 \\
//   --wait 20
//
// # Deploy to sandbox/production
// sf project deploy start \\
//   --target-org ProductionOrg \\
//   --test-level RunSpecifiedTests \\
//   --tests MyTestClass
//
// # Validate deployment (dry run)
// sf project deploy start \\
//   --target-org ProductionOrg \\
//   --dry-run \\
//   --test-level RunLocalTests

// 4. Data import file format (Account.json for tree import)
{
    "records": [
        {
            "attributes": {
                "type": "Account",
                "referenceId": "AccRef1"
            },
            "Name": "Test Corp",
            "Industry": "Technology",
            "AnnualRevenue": 5000000
        }
    ]
}`,
      exercise: `**SFDX Practice:**
1. Set up a new SFDX project from scratch with proper folder structure
2. Create a scratch org definition file with specific features enabled
3. Build a complete development workflow: create scratch org → deploy → test → retrieve
4. Create test data files (JSON) and import them into a scratch org
5. Write an anonymous Apex script to initialize data in a new scratch org
6. Set up an Unlocked Package and create a package version
7. Deploy to a sandbox using the CLI with specific test level
8. Validate a deployment (dry run) against production
9. Set up a .forceignore file to exclude specific metadata from deployment
10. Document your team's branching strategy (Git) for Salesforce development`,
      commonMistakes: [
        "Not using source control (Git) — every Salesforce project should be in Git. Org-based development without source control leads to lost changes and conflicts",
        "Creating scratch orgs without proper definition files — missing features in the scratch org definition causes deployment failures that don't happen in sandbox",
        "Not running tests before deployment — production deployments require 75% coverage. Always validate with --dry-run first",
        "Deploying directly to production without a sandbox validation — always deploy to a full sandbox first, then promote to production",
        "Committing sensitive data (credentials, API keys) to Git — use .gitignore and .forceignore. Store secrets in Named Credentials or environment variables"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is Salesforce DX and how does it change the development workflow?",
          a: "SFDX modernizes Salesforce development: (1) **Source-driven:** Metadata lives in Git, not the org. Source of truth is the repository. (2) **Scratch orgs:** Disposable dev environments created from code. Each developer gets isolated orgs. (3) **CLI-based:** All operations via command line — scriptable, automatable. (4) **Package development:** Modular deployment via Unlocked/Managed Packages. (5) **CI/CD ready:** Git + CLI + scratch orgs = automated testing and deployment pipelines. **Workflow change:** Old: develop in sandbox → deploy change set. New: develop in scratch org → commit to Git → CI runs tests → deploy via CLI."
        },
        {
          type: "scenario",
          q: "How would you set up a CI/CD pipeline for a Salesforce project?",
          a: "**Pipeline stages:** (1) **Developer:** Works in scratch org, commits to feature branch. (2) **Pull Request:** CI creates scratch org → deploys source → runs tests → reports coverage. (3) **Integration:** Merge to develop → deploy to QA sandbox → run all tests. (4) **UAT:** Merge to main → deploy to UAT sandbox → stakeholder testing. (5) **Production:** Tag release → validate deployment (dry-run) → deploy with RunLocalTests. **Tools:** GitHub Actions / Jenkins / Azure DevOps + SFDX CLI. **Key practices:** Automated scratch org creation, test data seeding, code coverage gates (>85%), mandatory code review, deployment validation before merge."
        }
      ]
    },
    {
      id: "sf-deployment-packaging",
      title: "Deployment Strategies & Packaging",
      explanation: `Deployment is how you move your code and configuration from development to production. Understanding different deployment methods and when to use each is critical for enterprise development.

**Deployment methods:**

1. **Change Sets** (Legacy)
   - Point-and-click deployment between related orgs
   - Manual selection of components
   - No version control, no rollback
   - Limited: one-way, no dependency tracking
   - Still used in some enterprise orgs

2. **SFDX CLI Deployment** (Modern)
   - \`sf project deploy start\` — deploy source format
   - Supports test level specification
   - Dry-run validation before actual deploy
   - Scriptable, can be part of CI/CD

3. **Metadata API** (Programmatic)
   - Lower-level API for deployment
   - Used by tools like ANT, Jenkins plugins
   - Package.xml manifest defines components

4. **Unlocked Packages** (Recommended)
   - Modular deployment units
   - Versioned, immutable
   - Dependency tracking
   - Upgrade and rollback support

5. **Managed Packages** (ISV)
   - For AppExchange distribution
   - Namespace isolation
   - IP protection
   - Upgrade paths for customers

**Deployment test levels:**
\`\`\`
NoTestRun        — No tests (sandbox only)
RunSpecifiedTests — Run specific test classes
RunLocalTests     — Run all non-managed tests
RunAllTestsInOrg  — Run ALL tests including managed
\`\`\`

**Deployment best practices:**
- Always validate (dry-run) before deploying to production
- Deploy during low-traffic hours
- Have a rollback plan (destructive changes manifest)
- Test in full-copy sandbox before production
- Use deployment validation windows for large orgs
- Document all deployment steps and dependencies`,
      codeExample: `// Deployment Configuration & Scripts

// 1. package.xml — Manifest for Metadata API deployment
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>AccountController</members>
        <members>OpportunityService</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>AccountTrigger</members>
        <name>ApexTrigger</name>
    </types>
    <types>
        <members>accountDetailCard</members>
        <members>contactList</members>
        <name>LightningComponentBundle</name>
    </types>
    <types>
        <members>Account.My_Custom_Field__c</members>
        <name>CustomField</name>
    </types>
    <version>59.0</version>
</Package>

// 2. destructiveChanges.xml — For removing components
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>DeprecatedClass</members>
        <name>ApexClass</name>
    </types>
    <version>59.0</version>
</Package>

// 3. CI/CD Pipeline Script (GitHub Actions example)
// .github/workflows/salesforce-ci.yml
name: Salesforce CI/CD
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install SFDX
        run: npm install @salesforce/cli --global
      
      - name: Authenticate
        run: |
          echo "\${{ secrets.SFDX_AUTH_URL }}" > auth.txt
          sf org login sfdx-url --sfdx-url-file auth.txt --alias target-org
      
      - name: Deploy (Validate Only)
        run: |
          sf project deploy start \\
            --target-org target-org \\
            --dry-run \\
            --test-level RunLocalTests \\
            --wait 30
      
      - name: Check Code Coverage
        run: |
          sf apex run test \\
            --target-org target-org \\
            --code-coverage \\
            --result-format json > test-results.json

  deploy:
    needs: validate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install & Auth
        run: |
          npm install @salesforce/cli --global
          echo "\${{ secrets.PROD_AUTH_URL }}" > auth.txt
          sf org login sfdx-url --sfdx-url-file auth.txt --alias prod
      
      - name: Deploy to Production
        run: |
          sf project deploy start \\
            --target-org prod \\
            --test-level RunLocalTests \\
            --wait 60

// 4. Deployment validation script
// scripts/validate-deployment.sh
#!/bin/bash
set -e

echo "=== Validating Deployment ==="

# Check test coverage
COVERAGE=$(sf apex run test --synchronous --code-coverage --json | jq '.result.summary.orgWideCoverage' -r)
echo "Current coverage: $COVERAGE"

MIN_COVERAGE="80%"
if [ "$COVERAGE" \\< "$MIN_COVERAGE" ]; then
  echo "ERROR: Coverage $COVERAGE is below minimum $MIN_COVERAGE"
  exit 1
fi

# Validate deployment
sf project deploy start --dry-run --test-level RunLocalTests --wait 30

echo "=== Validation Passed ==="`,
      exercise: `**Deployment Practice:**
1. Create a Change Set in a sandbox and deploy it to another sandbox
2. Write a package.xml manifest for a complete feature (classes, triggers, LWC, objects)
3. Set up a CI/CD pipeline using GitHub Actions with scratch org creation and testing
4. Create an Unlocked Package and install it in a target org
5. Write a destructiveChanges.xml to remove deprecated components
6. Deploy with different test levels and compare execution times
7. Set up a full deployment pipeline: feature branch → QA → UAT → Production
8. Write a pre-deployment validation script that checks coverage and component counts
9. Create a rollback strategy for a complex deployment
10. Document your team's release management process with detailed steps`,
      commonMistakes: [
        "Deploying to production without sandbox validation — always test in a full copy sandbox first",
        "Not specifying test level for production deployments — RunLocalTests is required for production. Forgetting causes deployment failure",
        "Using Change Sets for complex deployments — Change Sets don't handle dependencies well. Use SFDX CLI or packages for anything beyond simple changes",
        "Not having a rollback plan — some deployments can't be undone (data changes, deleted fields). Always plan for rollback before deploying",
        "Deploying during business hours — production deployments should happen during maintenance windows to minimize user impact"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Compare Change Sets, SFDX CLI deployment, and Unlocked Packages. When would you use each?",
          a: "**Change Sets:** Legacy, point-and-click. One-way between connected orgs. No version control, no rollback. Use for: simple changes in orgs without source control. **SFDX CLI:** Modern, command-line. Deploy source format from Git. Supports test levels, dry-run, CI/CD. Use for: most development teams with source control. **Unlocked Packages:** Modular, versioned deployment units. Dependency tracking, upgrade/rollback support. Use for: enterprise teams needing modular architecture, ISVs building distributable components. **Recommendation:** SFDX CLI for most teams, Unlocked Packages for large/multi-team orgs, avoid Change Sets for anything complex."
        }
      ]
    }
  ]
};

export default sfPhase7;
