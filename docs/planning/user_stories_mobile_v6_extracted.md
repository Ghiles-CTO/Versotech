# User Stories Extract (Mobile V6)

Source: `User_stories_Verso_Capital_mobile_V6 (1).xlsx`

Notes:
- This file is generated from the Excel sheets; Excel row numbers are preserved as `Row N`.
- Some rows in the workbook have empty `User stories` cells (kept only when `--include-blank-story-rows` is used).

## 0. Enablers

- Excel `max_row`: 96 (header row + data rows)
- Extracted rows: 77 (excluding blank `User stories` cells)
- Blank `User stories` rows skipped: 18 (first: 5, 33, 34, 35, 36, 37, 38, 39, 53, 54, 63, 64, 70, 71, 72, 73, 74, 96)

### 0.1 — MVP: Digital Signature (MVP: Y)

#### 0.1.1 — Signature specimen

- (Row 2) As a User, I want to save Signature Specimen in the User profile

#### 0.1.2 — Sign document

- (Row 3) As a User, I want to digitally sign documents directly from the APP (i.e. Docusign API)

#### 0.1.3 — Archive

- (Row 4) As a CEO, I want to archive digitally signed document

### 0.2 — MVP: Dataroom (MVP: Y)

#### 0.2.1 — Identity management

- (Row 6) As a User, I want to access the dataroom by being pre-authenticated from the APP (Single Sign-on from the APP sign-on) without switching to another APP
- (Row 7) As a CEO, I want to block access to specific user(s)
- (Row 8) As a CEO, I want to grant access to specific user(s)

#### 0.2.2 — Privacy

- (Row 9) As a CEO,  want to hide the User(s) who have access to each dataroom made available to User(s) having signed a NDA on the APP
- (Row 10) As a CEO, I want to view the User(s) who were granted access to each dataroom

#### 0.2.3 — Access rights (view, edit, download, upload)

- (Row 11) As a CEO, I want to view the access rights per User(s) and per Opportunity(ies)
- (Row 12) As a CEO, I want to change the access rights per User(s) and per Opportunity(ies)
- (Row 13) As a CEO, I want to upload documents in the Cloud
- (Row 14) As a User, I want to view the files in the dataroom (by default access)
- (Row 15) As a User, I want to request the possibility to download file(s) or folder(s)
- (Row 16) As a CEO, I want to allow specific User(s) to download specific file(s) or folder(s)
- (Row 17) As a CEO, I want to block specific User(s) to download specific file(s) or folder(s)

#### 0.2.4 — Reporting

- (Row 18) As a CEO, I want to view or download all logs per User (please see Box logs example)
- (Row 19) As a CEO, I want to view or download all logs per Opportunity (please see Box logs example)
- (Row 20) As a CEO, I want to save all logs to a file (please see Box logs example)

### 0.3 — Saas B2C Subscription (MVP: N)

#### 0.3.1 — SaaS B2C Pricing Model

- (Row 21) As a CEO, I want to charge recurring fees to specific User(s)
- (Row 22) As a User,  I want to view the different subscription options
- (Row 23) As a User,  I want to purchase a subscription
- (Row 24) As a User, I want to receive an e-mail confirming my subscription to confirm it was correctly processed
- (Row 25) As a User, I want to be able to update my payment information, in order to continue my subscription.
- (Row 26) As a User, I want to be able to cancel my subscription.
- (Row 27) As a User, I want to receive an e-mail confirming my subscription cancellation, in order to be sure I won't be billed again.
- (Row 28) As a User, I want to receive an e-mail reminding me my subscription is about to be renewed, in order to give me time to cancel if I wish.
- (Row 29) As a User, I want to receive an e-mail confirming my subscription renewal, in order to be sure the purchase occurred

#### 0.3.2 — Payment

- (Row 30) As a CEO, I want to process recurring monthly payments, in order to generate revenue.
- (Row 31) As a CEO, I want to process recurring annual payments, in order to generate revenue.
- (Row 32) As a User, I want to view when payment is due and when payment has been processed.

### 0.4 — Billing & Invoicing (MVP: N)

#### 0.4.1 — SaaS B2C

- (Row 40) As a CEO, I want to initiate the billing cycle and record the first date of billing cycle.
- (Row 41) As a CEO, I want to offer free trial fee for any new User during a period of time.
- (Row 42) As a CEO, I want to offer discounted trial fee for any User during a period of time.
- (Row 43) As a CEO, I want to offer discounted trial fee for specific User for a period of time.
- (Row 44) As a User, I want to be notified that I have benefited for the trial offer.
- (Row 45) As a User, I want to be notified how many days are left on the trial period.
- (Row 46) As a CEO, I want to process payment at billing cycle date.
- (Row 47) As a CEO, I want to issue invoice after payment is confirmed.
- (Row 48) As a CEO, I wand to archive invoices per User.
- (Row 49) As a User, I wand to view my next payment date.
- (Row 50) As a User, I want to view the date when I can cancel my subscription.
- (Row 51) As a User, I want to cancel my subscription when it is possible and be notified when the cancellation will be effective.
- (Row 52) As a User, I want to view and download my invoices.

### 0.5 — Growth marketing (MVP: N)

#### 0.5.1 — Engagement

- (Row 55) As a CEO, I want to welcome new Users with personnalization messages.
- (Row 56) As a User, I want to select the main features I am interested in and view corresponding demo.
- (Row 57) As a User, I want to skip the welcome path.
- (Row 58) As a CEO, I want to propose to new features at specific points in time
- (Row 59) As a User, I want to view new features demo at specific points in time
- (Row 60) As a CEO, I want to propose specific User(s) to view VIP Investment Opportunities.
- (Row 61) As a User, I want to view VIP Investment Opportunity details. (including dataroom etc…)
- (Row 62) As a User, I want to skip VIP Investment Opportunity.

#### 0.5.3 — Deep linking

- (Row 65) As a CEO, I want to automatically generate a secured deep link to welcome new user to join VERSO APP
- (Row 66) As a User, I can click on the deep link to download the APP in an APP store and create my account on VERSO APP based on prefilled information entered in the APP before the generation of the deep link.

#### 0.5.4 — Monetization

- (Row 67) As a CEO, I want to be able to have different trial fee options to be tested to specific User segments.
- (Row 68) As a CEO, I want to view the conversation rate of the different trial fee options tested by specific User segments.

#### 0.5.5 — Analytics

- (Row 69) As a CEO, I want to view the most common steps to the different experience journeys in the APP.

### 0.8 — KYC & AML (MVP: N)

#### 0.8.1 — Collection

- (Row 75) As a CEO, I want to collect KYC and AML documents as individual or entity

#### 0.8.2 — Update

- (Row 76) As a CEO, I want to remind investors to share KYC and AML documents as individual or entity
- (Row 77) As a User, I receive a notification to update my KYC and AML documents due to expiry or new regulation requirements.
- (Row 78) As a User, I update my KYC and AML documents in an easy and straightforward way.

### 0.9 — Content Management (MVP: N)

#### 0.9.1 — Webinar

- (Row 79) As a CEO, I want to extract/ upload list of Users who registred and/ or participate to a specific webinar (First Name, Last Name, email address and mobile number)
- (Row 80) As a CEO, I want to upload Webinars recorded videos in the Opportunity description
- (Row 81) As a CEO, I want to notify Users that a new Webinar will be organized on a specific Opportunity
- (Row 82) As a CEO, I want to advise Users to register to a Webinar organized by VERSO
- (Row 83) As a CEO, I want to notify Users that the recording of a Webinar organized by VERSO is available in a specific path in the corresponding opportunity space with a direct link to view it. (different notifications whether they participated to the webinar or not)
- (Row 84) As a Client, I want to register to a webinar organized by VERSO

#### 0.9.2 — News

- (Row 85) As a CEO, I want to share News about VERSO
- (Row 86) As a CEO, I want to share News about any company where Users have invested

#### 0.9.3 — Announcements

- (Row 87) As a CEO, I want to share that an Investment Opportunity is now available
- (Row 88) As a CEO, I want to notify Investors who signed a NDA that an Investment Opportunity is available for 10 days only.
- (Row 89) As a CEO, I want to notify Investors who signed a NDA that an Investment Opportunity is available for 48H only.
- (Row 90) As a CEO, I want to share that an Investment Opportunity is now closed

#### 0.9.4 — Performance Update

- (Row 91) As a CEO, I want to analyse Conversion statistics per Opportunity and per User on a specific time period.
- (Row 92) As a CEO, I want to analyse Redemption statistics per Opportunity and per User on a specific time period.
- (Row 93) As a CEO, I want to analyse the Engagement on specific content updloaded in the platform such as webinars etc…

### 1 — Security (MVP: Y)

#### 1.1 — Screen capture Blocked

- (Row 94) As a User, I cannot capture screen shot of any screen on the APP or any documents available from the APP.

#### 1.2 — V2: Document encryption & DRM Security

- (Row 95) As a User, all my documents stored in the platform are protected with cryptographic keys (a password, public key or token) so that I could be sure that nobody can open them without the corresponding decryption keys (the same password, private key, token).

## 1.CEO

- Excel `max_row`: 229 (header row + data rows)
- Extracted rows: 228 (excluding blank `User stories` cells)

### 1.1 — User profiles

#### 1.1.1 — Create investor

- (Row 2) I want to create profile for Investor (individual/entity)
- (Row 3) I want to share link to invite investor to create profile with logins and credentials
- (Row 4) I want to share a batch of invitations to a set of investors with logins and credentials
- (Row 5) I want to automatically generate a reminder if the investor has not created his/ her profile within 24H

#### 1.1.2 — Create Arranger

- (Row 6) I want to create profile for Arranger (individual/entity)
- (Row 7) I want to automatically generate a reminder if the User has not created his/ her profile within 24H

#### 1.1.3 — Create Lawyer

- (Row 8) I want to create profile for Lawyer (individual/entity)
- (Row 9) I want to automatically generate a reminder if the User has not created his/ her profile within 24H

#### 1.1.4 — Create Partner

- (Row 10) I want to create profile for Partner (individual/entity)

#### 1.1.5 — Create Commercial Partner

- (Row 11) I want to create profile for Commercial Partner (individual/entity)

#### 1.1.6 — Create Introducer

- (Row 12) I want to create profile for Introducer (individual/entity)

#### 1.1.7 — User Approval

- (Row 13) I want to see list of pending approval Users
- (Row 14) I want to edit user profile informations under approval
- (Row 15) I want to display pending User profile information for review
- (Row 16) I want to generate a notification to Users for missing informations / documents / proofs under approval
- (Row 17) I want to keep the User profile on hold as I couldn't collect all informations
- (Row 18) I want to approve User profile
- (Row 19) I want to reject User profile

#### 1.1.8. — Manage user profile

- (Row 20) I want to view list of approved users (investor/ arranger / partner / commercial partner / introducer / lawyer)
- (Row 21) I want to display User profile details
- (Row 22) I want to view assigned opportunity(ies) to selected investor(s)
- (Row 23) I want to view list of signed NDA with opportunity for each investor profile
- (Row 24) I want to view list of signed NDA with opportunity for each introducer profile
- (Row 25) I want to view the dispatched Investment Opportunities per Investor
- (Row 26) I want to view the dispatched Investment Opportunities per Partner
- (Row 27) I want to view the dispatched Investment Opportunities per Commercial Partner
- (Row 28) I want to view the dispatched Investment Opportunities per Introducer
- (Row 29) I want to view list of pending subcription packs with status per investor
- (Row 30) I want to view list of subcsription packs on investor profile
- (Row 31) I want to "blacklist" one User (investor/ arranger / partner / commercial partner / introducer / lawyer)
- (Row 32) I want to enable functionalities per User, per Vehicle and/ or per Opportunity
- (Row 33) I want to shift User (investor/ arranger / partner / commercial partner / introducer / lawyer) from the blacklist into the white list

### 1.2 — Manage Opportunity

#### 1.2.1 — Create opportunity description

- (Row 34) I want to creating a new opportunity
- (Row 35) I want to update the opportunity description
- (Row 36) I want to create fees model for selected partners & introducers
  There can be several fees model for one partner / introducer.
- (Row 37) I want to update fees model for selected partners & introducers
  There can be several fees model for one partner / introducer.
- (Row 38) I want to send fees model to selected partners. (There can be several fees model for one partner) during dispatch of IO by CEO when partner is assigned to IO or at any point in time when the IO has been created.
- (Row 39) I want to send fees model to selected introducers
  (There can be several fees model for one introducer.)
- (Row 40) I want to update an existing Introducer Agreement
- (Row 41) Automatic reminder to approve Introducer Agreement
- (Row 42) I want to receive notification that Approval of the Introducer Agreement by Introducer(s).
- (Row 43) I want to receive notification that the Introducer Agreement was REJECTED by Introducer(s).
- (Row 44) I want to digitally sign the approved Introducer agreement after approval received by Introducer
- (Row 45) Automatic reminder to sign Introducer Agreement
- (Row 46) I want to send a reminder to sign Introducer Agreement to selected introducers
- (Row 47) I want to receive notification that electronic signature was completed by Introducer(s).
- (Row 48) MVP: I want to enter and share fees model to selected Commercial partners in the APP. (There can be several fees model for one partner.) for information.
  V2: I want to send fees model to selected Commercial partners. (There can be several fees model for one partner.)
- (Row 49) MVP: I want to update an existing Placement Fee Summary
  V2: I want to update an existing Placement Agreement and an existing Placement Fee Summary
- (Row 50) V2: I want to send a reminder to approve a Placement Agreement
- (Row 51) V2: I want to receive notification that Approval of the Placement Agreement by Commercial Partner(s).
- (Row 52) V2: I want to receive notification that the Placement Agreement was REJECTED by Commercial Partner(s).
- (Row 53) MVP: I want to digitally sign the uploaded Placement agreement after approval received by Commercial Partner
  V2: I want to digitally sign the approved Placement agreement after approval received by Commercial Partner
- (Row 54) MVP: Automatic reminder to sign Placement Agreement
- (Row 55) MVP: I want to send a reminder to sign Placement Agreement to selected Commercial Partners
- (Row 56) MVP: I want to receive notification that electronic signature was completed by Commercial Partner(s).

#### 1.2.2 — Initiate termsheet

- (Row 57) I want to initiate term sheet
  - Possibility to create a termsheet from scratch
  - Possibility to create a termsheet from duplicate or existing  termsheet with no introducers / partners or commercial partners associated

#### 1.2.2 — Edit termsheet

- (Row 58) I want to assign as a role: partner / commercial partner / introducer to an existing Termsheet.

#### 1.2.2 — Termsheet funding deadline reminders

- (Row 59) I want to automatically remind Interested Users of the Funding Deadline

#### 1.2.2 — Close termsheet

- (Row 60) I want to close an Investment Opportunity manually once the Funding deadline has been reached

#### 1.2.3 — Dispatch INVESTMENT opportunity to potential INVESTORS

- (Row 61) I want to dispatch INVESTMENT OPPORTUNITY (Opportunity description + termsheet X) to selected destinatory for potential investments (investor, partner, commercial partner, introducer)
  Dispatch (OPTIONAL):
  - Select partner with fee model
  - Display and select Commercial partner + introducer that have already signed agreeements.
- (Row 64) I want to send a reminder to get confirmation from INVESTOR if  he wants to view more on INVESTMENT OPPORTUNITY (IF NO ANSWER FROM INVESTOR)

#### 1.2.3 — Dispatch INVESTMENT opportunity to potential COMMERCIAL PARTNERS

- (Row 62) I want to dispatch INVESTMENT OPPORTUNITY (Opportunity description + termsheet X) to selected Commercial Partners specifically
- (Row 65) I want to send a reminder to get confirmation from COMMERCIAL PARTNER if he wants to view more on INVESTMENT OPPORTUNITY (IF NO ANSWER FROM INVESTOR)

#### 1.2.3 — Automatic reminder

- (Row 63) I want a reminder to be automatically generated once a specific period of time has taken place since the investment opportunity was sent with no feedback from Investor

#### 1.2.3 — Dispatch an updated version of an INVESTMENT opportunity to potential INVESTORS or COMMERCIAL PARTNERS

- (Row 66) I want to dispatch INVESTMENT OPPORTUNITY (Opportunity description + termsheet X) to selected destinatory for potential investments (investor, partner, commercial partner, introducer)

#### 1.2.3 — NDA

- (Row 67) NDA (already signed by VERSO CAPITAL) is automatically generated to/
   Investors OR ENTITIES signator(ies) INTERESTED
   COMMERCIAL PARTNERS signator(ies) INTERESTED
- (Row 70) IF NEEDED: I want to upload a signed NDA

#### 1.2.3 — NDA & Dataroom
(INVESTORS)

- (Row 68) I want to receive a notification that the NDA was signed by Investor and dataroom access was granted to an Investor

#### 1.2.3 — NDA & Dataroom (COMMERCIAL PARTNERS)

- (Row 69) I want to receive a notification that the NDA was signed by Investor and dataroom access was granted to a Commercial Partner

#### 1.2.4 — View

- (Row 71) I want to display list of termsheets dispatched between 2 DATES per opportunity
- (Row 72) I want to display list of termsheets DISPATCHED per Investor between 2 DATES per opportunity
- (Row 73) I want to display list of termsheets DISPATCHED per partner between 2 DATES per opportunity
- (Row 74) I want to display list of termsheets DISPATCHED per introducer between 2 DATES per opportunity
- (Row 75) I want to display list of termsheets DISPATCHED between 2 DATES between 2 DATES per opportunity
- (Row 76) I want to display list of investors who PASS between 2 DATES per opportunity
- (Row 77) I want to display list of investors who confirm INTEREST between 2 DATES per opportunity
- (Row 78) I want to display list of Investment Opportunities with STATUS = PASS per Investor between 2 DATES
- (Row 79) I want to display list of  Investment Opportunities with STATUS = INTERESTED per Investor between 2 DATES
- (Row 80) I want to display list of Investment Opportunities with STATUS = PASS per Partner between 2 DATES
- (Row 81) I want to display list of  Investment Opportunities with STATUS = INTERESTED per Partner between 2 DATES
- (Row 82) I want to display list of Investment Opportunities with STATUS = PASS per Introducer between 2 DATES
- (Row 83) I want to display list of  Investment Opportunities with STATUS = INTERESTED per Introducer between 2 DATES
- (Row 84) I want to view which investors receive Termsheet for selected opportunity between 2 DATES
- (Row 85) I want to view/ consult all termsheets created per status per opportunity between 2 DATES
- (Row 86) I want to display list of introducers per opportunity
- (Row 87) I want to display list of partners per opportunity
- (Row 88) I want to display list of Commercial partners per opportunity
- (Row 89) I want to display list of Equity certificates issued per investor and per opportunity
- (Row 90) I want to display list of Statement of Holding issued per investor and per opportunity

#### 1.2.5 — INTEREST CONFIRMED OR NOT

- (Row 91) I want to send a reminder to receive confirmation of interest or not from investor with a DEADLINE
- (Row 92) If confirmed interest: end of the process: initiate subscription process
- (Row 93) If not confirmed interest at all: end of the process
- (Row 94) If not confirmed interest from investor but willing to negotiate:
  Negociation (out of the app)
  - I want to generate a new IO with updated terms
  - I want to close the investment opportunity
- (Row 95) I want to dispatch new investment opportunity with new termsheets
  Re-select fees models for assigned Partner/Introducer assigned to this new IO

#### 1.2.6 — Subscription pack

- (Row 96) When INTEREST is confirmed, I want to generate the subscription packs
- (Row 97) I want to dispatch the initial subcsription pack
- (Row 98) I want to review investor comments
- (Row 99) I want to edit subcsription pack/ upload new documents
- (Row 100) I want to upload final Subscription pack for specific Investor in case more changes to the Subscription pack si required outside of the APP.
- (Row 101) I want to share updated subcsription pack
- (Row 102) I want a reminder to be automatically generated once a specific period of time has taken place since the investment opportunity was sent with no feedback from Investor
- (Row 103) I want to send a reminder to selected investor(s) to request approval
- (Row 104) I want to digitally sign the approved subsription pack after approval received by Investor
- (Row 105) I want to notify VERSO lawyer that I signed subscription pack and is now assigned for digital signature to investor
- (Row 106) I want to receive notification that subscription pack was sent to investors for signature
- (Row 107) I want to receive notification that electronic signature was completed by investors
- (Row 108) I want to access list of subcription packs signed per Investor and per Opportunity between 2 DATES
- (Row 109) I want to access list of subcription packs pending to be sent per Investor and per Opportunity between 2 DATES
- (Row 110) I want to access list of subcription packs pending to be signed by Investor per Investor (OR ALL investors) and per Opportunity between 2 DATES
- (Row 111) I want to update status of the Investment opportunity to "PASS" at any time

#### 1.2.7 — Funding

- (Row 112) I want to automatically request funding on escrow account following signature of subscription pack
- (Row 113) I want to view fund escrow account transfer status
- (Row 114) Automatic reminder to fund escrow account
- (Row 115) I want to send a reminder notification for funding to escrow account
- (Row 116) I want to update status of fund escrow account status:
- (Row 117) I want to receive a notification that escrow account is funded
- (Row 118) I want to confirm the Amount Funded is OK
- (Row 119) I want to request additional amount to be Funded
- (Row 120) I want to reject Funding when Expected Funding Amount was not received in due time
- (Row 121) I want to receive a notificaton when VERSO receives an Invoice from Partners for the selected transactions
- (Row 122) I want to view the Invoice from Partner(s)
- (Row 123) I want to request to proceed to Partner(s) transaction payment to selected Lawyer(s)
- (Row 124) I want to view the fees to pay to selected Partners
- (Row 125) I want to request to proceed to Partner transaction fee payment to selected Lawyer(s)
- (Row 126) I want to receive a notification when the Partner(s) fee payment is completed
- (Row 127) I want to send a notification that VERSO proceeded to partner transaction payment for the selected transactions
- (Row 128) I want to receive a notificaton when VERSO receives an Invoice from BI Introducers for the selected transactions
- (Row 129) I want to view the Invoice from BI Introducers
- (Row 130) I want to request to proceed to BI Introducer transaction payment to selected Lawyer(s)
- (Row 131) I want to send a notification that VERSO proceeded to Introducer transaction payment for the selected transactions
- (Row 132) I want to receive a notification when the BI Introducer fee payment is completed
- (Row 133) I want to receive a notificaton when VERSO receives an Invoice from Commercial Partner(s) for the selected transactions
- (Row 134) I want to view the Invoice from Commercial Partners
- (Row 135) I want to request to proceed to Commercial Partner placement fee payment to selected Lawyer(s)
- (Row 136) I want to receive a notification when the Commercial Partner(s) placement fee payment is completed
- (Row 137) I want to send a notification that VERSO proceeded to Commercial Partner(s) transaction payment for the selected transactions
- (Row 138) I want to view all funding status per opportunity between 2 DATES and per INVESTOR (or ALL investors)
- (Row 139) I want to view all payment status to Partners / Commercial Partners / Introducers per opportunity between 2 DATES and per INVESTOR (or ALL investors)

#### 1.2.8 — Equity Certificates Issuance

- (Row 140) I want to issue a certificate to certifiy Investor Shareholding position in the company he/she invested in
- (Row 141) I want to approve the issued certificates before dispatch
- (Row 142) I want to automatically dispatch the issued certificated to investors once approved
- (Row 143) I want to receive a notification when issued certificate was sent to investors

#### 1.2.9 — Statement of Holding Issuance

- (Row 144) I want to issue a Statement of Holding to certifiy Investor Shareholding position in the company he/she invested in
- (Row 145) I want to approve the issued Statement of Holding before dispatch
- (Row 146) I want to automatically dispatch the Statement of Holding to investors once approved
- (Row 147) I want to receive a notification when Statement of Holding was sent to investors

### 1.3 — Reporting

#### 1.3.1 — Transaction tracking

- (Row 148) I want to view all NEW notifications assigned to me per Opportunity
- (Row 149) I want to view and download history of the activity (activity logs incl. date, time, user, action, opportunity per User and/or per Opportunity)
- (Row 150) I want to assign tasks to selected users
- (Row 151) I want to view all NEW notifications per assignee per Opportunity
- (Row 152) I want to send a reminder of any task to selected user(s)
- (Row 153) I want to view all reminders sent per Investor per Opportunity
- (Row 154) I want to update the dropdown menu categories
- (Row 155) I want to know how much money has been raised between 2 DATES per Opportunity
- (Row 156) I want to know how much money is in the pipeline per STATUS between 2 DATES per Opportunity

#### 1.3.2 — Opportunity Performance

- (Row 157) I want to view up to date reconciliation report per opportunity for completed / pending transactions
- (Row 158) I want to generate reconciliation report per Opportunity for completed / pending transactions

#### 1.3.3 — Client performance across opportunity

- (Row 159) I want to view all transactions revenues per Opportunity per Investor
- (Row 160) I want to view all shareholding position per Opportunity per Investor
- (Row 161) I want to generate reconciliation report

#### 1.3.4 — Partner performance

- (Row 162) I want to view all transactions revenues per Opportunity per Partner
- (Row 163) I want to generate reconciliation report

#### 1.3.5 — Commercial partner performance

- (Row 164) I want to view all transactions revenues per Opportunity per Commercial Partner
- (Row 165) I want to generate reconciliation report

#### 1.3.6 — Introducer performance

- (Row 166) I want to view all transactions revenues per Opportunity per Introducer
- (Row 167) I want to generate reconciliation report

#### 1.3.7 — VERSO Compartment reconciliation

- (Row 168) I want to view up to date reconciliation report per compartment for completed / pending transactions
- (Row 169) I want to generate reconciliation report per Compartment for completed / pending transactions

#### 1.3.8 — Conversion Event

- (Row 170) I want to select an Event to convert Note certificates for specific Investments.
- (Row 171) I want to manually enter the Conversion conditions:
  - Convertible Start Date (possibility to correct manually pre-filled information from term sheet if needed)
  - Convertible End Date
  - Conversion Price per Share
  for the selected Investment Opportunities.
- (Row 172) I want to view the automatic CONVERSION Calculation Summary [Total, per Termsheet, per Investor, per investment].
- (Row 173) I want to confirm the Conversion option(s) to notify the selected Investors:
  MVP:
  (b) 100% in shares.
  V2:
  (a) 100% in cash OR
  (b) 100% in shares.
- (Row 174) MVP: None
  V2:I want to send Automatic reminders after 24H and 48H.
- (Row 175) V2: I want to send a reminder manually when I want.
- (Row 176) V2: I want to receive a confirmation of the CONVERSION responses with a Summary [Total, per Termsheet, per Investor, per transaction].
- (Row 177) MVP: I want to automatically generate updated Equity Certificates and Statement of Holdings.
  V2: IF option (b), I want to automatically generate updated Equity Certificates and Statement of Holdings.
- (Row 178) V2: IF option (a), I (or Lawyer) want to confirm processed payment to selected Investors.

#### 1.3.9 — Redemption Event

- (Row 179) I want to select a Redemption Event for specific Investments  [possibility to unselect specific transactions or investors from the list] to apply REDEMPTION to.
- (Row 180) I want to manually enter REDEMPTION condition i.e. “Redemption Price per Share” for the selected Investments.
- (Row 181) I want to view the Redemption calculation summary in $ and number of shares [Total, per Termsheet, per Investor, per Investment] after being calculated automatically.
- (Row 182) I want to confirm the Redemption option(s) to notify the selected Investors:
  (a) 100% in cash [default option].
  (b) 100% in shares.
  (c) X% in cash /Y% in shares. (i.e. X=50%, Y=50%)
- (Row 183) In case of (b) and (c), I want to automatically generate a Shares Transfer Agreement (STA) for digital signature.
- (Row 184) In case of (b), I want to send a Request for payment of VERSO Performance fees (Invoice) before proceeding to the Redemption in shares
- (Row 185) In case of (b), I (or Lawyer) want to confirm processed payment by Investors.
- (Row 186) In case of (b), I want to approve the payment of the Performance Fees Amount
- (Row 187) In case of (b), I want to request additional payment of the Performance Fees Amount
- (Row 188) IF option (a) or (c), I (or Lawyer) want to confirm processed payment to selected Investors.
- (Row 189) IF option (a) or (c), I (or Lawyer) want to confirm processed Additional Payment to selected Investors.
- (Row 190) I want to automatically generate updated Equity Certificates and Statement of Holdings according to option (a), (b) or (c).
- (Row 191) I want to receive notification that  Equity Certificates and Statement of Holdings were updated according to option (a), (b) or (c).
- (Row 192) Once  Equity Certificates and Statement of Holding updated, I want to view the REDEMPTION fees [Total, per Termsheet, per Investor, per investment] to associated Partners, Commercial Partners and Introducers are automatically generated.
- (Row 193) I want to automatically request invoice to selected Partners, Commercial Partners and Introducersto VERSO CAPITAL.
- (Row 194) I want to send Automatic reminders to receive individual invoices after 24H and 48H.
- (Row 195) I want to send individual invoices requests reminder manually when I want.
- (Row 196) I want to view Invoice Summary as manually entered by Partners, Commercial Partners and Introducers and uploaded invoice(s) as submiited by Partners, Commercial Partners and Introducers.
- (Row 197) MVP: if Invoice Summary input is equal to the Total expected REDEMPTION Fees Summary as calculated by the APP, I want to view Invoice Summary and uploaded invoice to approve Invoice.
  V2: I want to automatically send notifications to proceed to payment to ME and to the Lawyer if Invoice Summary input is equal to Total expected REDEMPTION Fees Summary as calculated by the APP.
- (Row 198) if Invoice Summary input is different from Total expected REDEMPTION Fees Summary as calculated by the APP, I want to view Invoice Summary and uploaded invoice to approve Invoice.
- (Row 199) if Invoice Summary input is different from Total expected REDEMPTION Fees Summary as calculated by the APP, I want to view Invoice Summary and uploaded invoice to request change(s) to the Invoice.
- (Row 200) I (or Lawyer) want to confirm processed payment to selected Partners, Commercial Partners and/or Introducers.

### 1.4 — Resell

#### 1.4.1 — Resell

- (Row 201) I want to receive a notification when an investor wants to sell his shares
- (Row 202) I want to initiate a new INVESTMENT OPPORTUNITY including a term sheet with the:
  - Possibility to create a termsheet from scratch
  - Possibility to create a termsheet from duplicate or existing
- (Row 203) I want to dispatch the subscription pack to selected Investors
- (Row 204) I want to automatically assign the action to CEO to transfer payment to seller once VERSO receives funding from buyer
- (Row 205) I want to assign to Lawyer to proceed to payment to seller
- (Row 206) I want to receive notifications when payment transfer is completed
- (Row 207) I want to send a reminder to lawyer to proceed to payment transfer
- (Row 208) I want to send an status update on the sales transaction
- (Row 209) I want to automatically update shareholding position of seller in reporting database

### 1.5 — GDPR

#### 1.5.1 — ADMIN: Right to be forgotten / Right to erasure

- (Row 210) I want to delete personal data if
  (a) it is no longer used for the purpose it was originally collected
  (b) consent for the storage of data is revoked

#### 1.5.2 — ADMIN: Right to access information

- (Row 211) I need to obtain clear consent from the consumer of my product or service so that I can keep record of informed consent to process personal data.
- (Row 212) I need to update consent to process personal data
- (Row 213) I want to Implement the processes for relevant personal data scope identification (personal data required by regulations vs. non-required)
- (Row 214) I want to define and implement the processes for customer consent management, disclosure of stored personal data, correction of wrong personal data, right to erasure and portability
- (Row 215) I need to ensure that I obtain only the bare minimum information from users so that I can effectively deliver the service and follow compliance standards.

#### 1.5.3 — ADMIN: Right for processing to be restricted

- (Row 216) I need to report data breaches to the user owner of his personal data
  I need to allow user to restrict data processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful as an alternative to requiring the erasure of the personal data so processed

#### 1.5.4 — ADMIN: Right to oppose to automated individual decision making

- (Row 217) I need to allow users to object to the processing of his personal data when such processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party

#### 1.5.5 — ADMIN: Right to data portability

- (Row 218) I want to generate extract of user datas to be made available to user by email

#### 1.5.6 — Right to access information

- (Row 219) I want to submit a request to rectify, erase or transfer personal data (ALL or specific item) so that I can protect my personal identity.

#### 1.5.7 — Right to data portability

- (Row 220) I want to download all my personal information in a common format such as CSV or XLS so that I can retrieve all my personal information from the product or service.

#### 1.5.8 — Right for processing to be restricted

- (Row 221) I want to restrict how the product/service uses my personal information so that I can keep control over when and how my personal information is used.

#### 1.5.9 — Right to be forgotten

- (Row 222) I need to own the right to be forgotten by being able to permanently delete / request deletion of my personal information from the product or service so that I can protect my personal identity.

#### 1.5.10 — Right for processing to be restricted

- (Row 223) I need to view clearly defined data policy in plain language so that I can understand why, how and who processes my personal information.

#### 1.5.11 — Right to rectification

- (Row 224) I want to request Incorrect data to be rectified with no delay

#### 1.5.12 — Explicit consent

- (Row 225) Consent can be withdrawn at any time.

#### 1.5.13 — BLACKLISTED

- (Row 226) I want to keep access my personnal datas  (need to define if any other specific access are required)

#### 1.5.14 — Right for processing to be restricted

- (Row 227) I want to require restriction on processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful and instead of asking for the erasure of the personal data so processed, I ask for the restriction of their use
  In such case, my personal data  shall, with the exception of storage, only be processed with my consent or for the establishment, exercise or defence of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the Union or of a Member State

#### 1.5.15 — Right to oppose to automated invdividual decision making

- (Row 228) I want to object to the processing of my personal data when such processing is:
  - necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (not applicable here)
  - necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the client (not applicable here)
- (Row 229) 228

## 2.Arranger

- Excel `max_row`: 87 (header row + data rows)
- Extracted rows: 86 (excluding blank `User stories` cells)

### 2.1 — My Profile

#### 2.1.1 — Create Account

- (Row 2) I want to complete my profile for approval
- (Row 3) I want to update my profile for "re-approval"

#### 2.1.2 — Login

- (Row 4) I want to login with my user ID and password

#### 2.1.3 — Profile Approval

- (Row 5) I want to submit my profile for approval
- (Row 6) I receive a notification that my profile has been approved to get access to the full content of the APP
- (Row 7) I receive notification that my profile has not been approved

#### 2.1.4 — Check-in

- (Row 8) I want to know the most interesting features available in the APP
- (Row 9) I want to select the most important features I want to be able to perform in the APP
- (Row 10) I want to customiwe My Profile

### 2.2 — My Partners

#### 2.2.1 — Create Partner Fee Models

- (Row 11) I want to create fees model for selected  partners. (There can be several fees model for one partner).
- (Row 12) I want to update fees model for selected partners. (There can be several fees model for one partner).

#### 2.2.2 — Payment

- (Row 13) I want to automatically send a notification to Partner(s) to send an invoice
- (Row 14) I want to receive a notificaton when VERSO receives an Invoice from Partners for the selected transactions
- (Row 15) I want to view the fees to pay to selected Partners
- (Row 16) I want to request to proceed to Partner transaction fee payment to selected Lawyer(s)
- (Row 17) I want to receive a notification when the Partner(s) fee payment is completed

#### 2.2.3 — View

- (Row 18) I want to display list of partners per opportunity
- (Row 19) I want to display fee models and details per partner per opportunity

#### 2.2.4 — Partner performance

- (Row 20) I want to view all transactions revenues per Opportunity per Partner
- (Row 21) I want to generate reconciliation report

### 2.3 — My Introducers

#### 2.3.1 — Create Introducer Fee Model

- (Row 22) I want to create fees model for selected  introducers. (There can be several fees model for one introducer).
- (Row 23) I want to update fees model for selected  introducers. (There can be several fees model for one  introducer).
- (Row 24) I want to send fees model to selected introducers. (There can be several fees model for one introducer.)
- (Row 25) I want to update an existing Introducer Agreement
- (Row 26) Automatic reminder to approve Introducer Agreement
- (Row 27) I want to receive notification that Approval of the Introducer Agreement by Introducer(s).
- (Row 28) I want to receive notification that the Introducer Agreement was REJECTED by Introducer(s).
- (Row 29) I want to digitally sign the approved Introducer agreement after approval received by Introducer
- (Row 30) Automatic reminder to sign Introducer Agreement
- (Row 31) I want to send a reminder to sign Introducer Agreement to selected introducers
- (Row 32) I want to receive notification that electronic signature was completed by Introducer(s).

#### 2.3.2 — Payment

- (Row 33) I want to automatically send a notification to BI Introducer(s) to send an invoice
- (Row 34) I want to receive a notificaton when VERSO receives an Invoice from BI Introducers for the selected transactions
- (Row 35) I want to view the Invoice from BI Introducers
- (Row 36) I want to request to proceed to BI Introducer transaction payment to selected Lawyer(s) and CEO
- (Row 37) I want to receive a notification when the BI Introducer fee payment is completed

#### 2.3.3 — View

- (Row 38) I want to display list of introducers per opportunity
- (Row 39) I want to display fee models and details per introducer per opportunity

#### 2.3.4 — Introducer performance

- (Row 40) I want to view all transactions revenues per Opportunity per Introducer
- (Row 41) I want to generate reconciliation report

### 2.4 — My Commercial Partners

#### 2.4.1 — Create Commercial Partner Fee Models

- (Row 42) I want to create fees model for selected  Commercial Partner. (There can be several fees model for one Commercial Partner).
- (Row 43) I want to update fees model for selected  Commercial Partners. (There can be several fees model for one Commercial Partne).
- (Row 44) I want to send fees model to selected Commercial Partners. (There can be several fees model for one Commercial Partner.)
- (Row 45) V2: I want to update an existing Placement Agreement
- (Row 46) V2: Automatic reminder to approve a Placement Agreement
- (Row 47) V2: I want to receive notification that Approval of the Placement Agreement by Commercial Partner(s).
- (Row 48) V2: I want to receive notification that the Placement Agreement was REJECTED by Commercial Partner(s).
- (Row 49) I want to digitally sign the approved Placement agreement after approval received by Commercial Partner.
- (Row 50) Automatic reminder to sign Placement Agreement
- (Row 51) I want to send a reminder to sign Placement Agreement to selected Commercial Partner Signatories Contact(s)
- (Row 52) I want to receive notification that electronic signature was completed by Commercial Partner Signatories Contact(s).

#### 2.4.2 — Payment

- (Row 53) I want to automatically send a notification to Commercial Partner(s) to send an invoice
- (Row 54) I want to receive a notificaton when VERSO receives an Invoice from Commercial Partner(s) for the selected transactions
- (Row 55) I want to view the Invoice from Commercial Partners
- (Row 56) I want to request to proceed to Commercial Partner placement fee payment to selected Lawyer(s)
- (Row 57) I want to receive a notification when the Commercial Partner(s) placement fee payment is completed

#### 2.4.3 — View

- (Row 58) I want to display list of Commercial Partners per opportunity
- (Row 59) I want to display fee models and details per Commercial partner per opportunity

#### 2.4.4 — Commercial Partner performance

- (Row 60) I want to view all transactions revenues per Opportunity per Commercial Partner
- (Row 61) I want to generate reconciliation report

### 2.5 — My Lawyers

#### 2.5.1 — View

- (Row 62) I want to display list of introducers per opportunity

#### 2.5.2 — Reporting

- (Row 63) I want to view the escrow account funding status

### 2.6 — My Mandates

#### 2.6.1 — Subscription pack

- (Row 64) I want to receive notification that subscription pack was rejected by investors
- (Row 65) I want to digitally sign the approved subsription pack after notification received by CEO
- (Row 66) I want to notify VERSO lawyer that I signed subscription pack and is now assigned for digital signature to investor
- (Row 67) I want to receive notification that subscription pack was sent to investors for signature
- (Row 68) I want to receive notification that electronic signature was completed by investors
- (Row 69) I want to access list of subcription packs signed per Investor and per Opportunity between 2 DATES

#### 2.6.2 — Funding

- (Row 70) I want to receive a notification that escrow account is funded
- (Row 71) I want to send a notification that VERSO proceeded to partner transaction payment for the selected transactions
- (Row 72) I want to send a notification that VERSO proceeded to Introducer transaction payment for the selected transactions
- (Row 73) I want to send a notification that VERSO proceeded to Placement transaction payment for the selected transactions

#### 2.6.3 — Compartment Reporting

- (Row 74) I want to view up to date reconciliation report per opportunity for completed / pending transactions
- (Row 75) I want to generate reconciliation report per Opportunity for completed / pending transactions
- (Row 76) I want to view up to date reconciliation report per compartment for completed / pending transactions
- (Row 77) I want to generate reconciliation report per Compartment for completed / pending transactions

### 2.7 — GDPR

#### 2.7.1 — Right to access information

- (Row 78) I want to submit a request to rectify, erase or transfer personal data (ALL or specific item) so that I can protect my personal identity.

#### 2.7.2 — Right to data portability

- (Row 79) I want to download all my personal information in a common format such as CSV or XLS so that I can retrieve all my personal information from the product or service.

#### 2.7.3 — Right for processing to be restricted

- (Row 80) I want to restrict how the product/service uses my personal information so that I can keep control over when and how my personal information is used.

#### 2.7.4 — Right to be forgotten

- (Row 81) I need to own the right to be forgotten by being able to permanently delete / request deletion of my personal information from the product or service so that I can protect my personal identity.

#### 2.7.5 — Right for processing to be restricted

- (Row 82) I need to view clearly defined data policy in plain language so that I can understand why, how and who processes my personal information.

#### 2.7.6 — Right to rectification

- (Row 83) I want to request Incorrect data to be rectified with no delay

#### 2.7.7 — Explicit consent

- (Row 84) Consent can be withdrawn at any time.

#### 2.7.8 — BLACKLISTED

- (Row 85) I want to keep access my personnal datas  (need to define if any other specific access are required)

#### 2.7.9 — Right for processing to be restricted

- (Row 86) I want to require restriction on processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful and instead of asking for the erasure of the personal data so processed, I ask for the restriction of their use
  In such case, my personal data  shall, with the exception of storage, only be processed with my consent or for the establishment, exercise or defence of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the Union or of a Member State

#### 2.7.10 — Right to oppose to automated invdividual decision making

- (Row 87) I want to object to the processing of my personal data when such processing is:
  - necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (not applicable here)
  - necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the client (not applicable here)

## 3.Lawyer

- Excel `max_row`: 60 (header row + data rows)
- Extracted rows: 59 (excluding blank `User stories` cells)

### 3.1 — My Profile

#### 3.1.1 — Create Account

- (Row 2) I want to complete my profile for approval
- (Row 3) I want to update my profile for "re-approval"

#### 3.1.2 — Login

- (Row 4) I want to login with my user ID and password

#### 3.1.3 — Profile Approval

- (Row 5) I want to submit my profile for approval
- (Row 6) I receive a notification that my profile has been approved to get access to the full content of the APP
- (Row 7) I receive notification that my profile has not been approved

#### 3.1.4 — Check-in

- (Row 8) I want to know the most interesting features available in the APP
- (Row 9) I want to select the most important features I want to be able to perform in the APP
- (Row 10) I want to customiwe My Profile

### 3.2 — My Notifications

#### 3.2.1 — Subscription pack

- (Row 11) I want to receive a notification when the subscription pack is signed by VERSO CEO
- (Row 12) I want to receive a notification when the subscription pack is signed by VERSO Arranger
- (Row 13) I want to receive notification that electronic signature was completed by investors.

#### 3.2.2 — Escrow account funding

- (Row 14) I want to receive notifications to provide Escrow account funding status per Investor per Opportunity

#### 3.2.3 — Equity Certificates Issuance

- (Row 15) I want to receive a notification when issued certificate was sent to investors
- (Row 16) I want to automatically insert the specimen of my signature

#### 3.2.4 — Statement of Holding Issuance

- (Row 17) I want to receive a notification when issued Statement of Holding was sent to investors
- (Row 18) I want to automatically insert the specimen of my signature

#### 3.2.5 — Partner fees payment

- (Row 19) I want to receive a notification when the Partner invoice has been received
- (Row 20) I want to receive a notification to proceed to Partner fees payment

#### 3.2.6 — Introducer fees payment

- (Row 21) I want to receive a notification when the BI invoice has been received
- (Row 22) I want to receive a notification to proceed to BI fees payment

#### 3.2.7 — Payment to seller(s)

- (Row 25) I want to receive a notification to proceed to payment to seller

#### 3.2.8 — Commercial Partner fees payment

- (Row 23) I want to receive a notification when the Commercial Partner invoice has been received
- (Row 24) I want to receive a notification to proceed to Commercial Partner fees payment

### 3.3 — Escrow Account Handling

#### 3.3.1 — Escrow account funding

- (Row 26) I want to send a notifications once escrow account funding is completed
- (Row 27) I want to send/ receive a notifications once escrow account funding is not completed yet

#### 3.3.2 — Partner fees payment

- (Row 28) I want to display Partner invoice details per Partner per Opportunity
- (Row 29) I want to send a notifications that Partner fees payment is completed
- (Row 30) I want to send/receive a notifications that Partner fees payment is not completed yet

#### 3.3.3 — Introducer fees payment

- (Row 31) I want to display BI invoice details per Introducer per Opportunity
- (Row 32) I want to send a notification when the Introducer fees payment is completed.
- (Row 33) I want to send/receive a notification when the Introducer fees payment is not completed yet.

#### 3.3.4 — Payment to seller(s)

- (Row 37) I want to send a notification when payment transfer request to Seller(s) is completed.

#### 3.3.5 — Escrow Account funding status

- (Row 38) I want to send a notification with amount of funds received on Escrow Account for a specific Investment Opportunity.

#### 3.3.6 — Escrow Account Conversion Event

- (Row 39) V2: IF option (a), I (or Lawyer) want to confirm processed payment to selected Investors.

#### 3.3.7 — Escrow Account Redemption Event

- (Row 40) In case of (b) and (c), I want to receive a notification of a Shares Transfer Agreement (STA) sent for digital signature.
- (Row 41) In case of (b) and (c), I want to receive a notification when a Shares Transfer Agreement (STA) is digitally signed by Investor.
- (Row 42) In case of (b), I want to confirm processed payment of Performance Fees Amount by Investors.
- (Row 43) In case of option (b), I want to receive the approval of the payment of the Performance Fees Amount
- (Row 44) If option (a) or (c), I want to confirm processed payment to selected Investors.
- (Row 45) If option (a) or (c), I want to confirm processed Additional Payment to selected Investors.
- (Row 46) I want to receive notification that  Equity Certificates and Statement of Holdings were updated according to option (a), (b) or (c).

#### 3.3.8 — Commercial Partner fees payment

- (Row 34) I want to display Commercial Partner invoice details per Introducer per Opportunity
- (Row 35) I want to send a notification when the Commercial Partner fees payment is completed.
- (Row 36) I want to send/receive a notification when the Commercial Partner fees payment is not completed yet.

### 3.4 — Reporting

#### 3.4.1 — Transaction reconciliation

- (Row 47) I want to view the reconciliation per transaction between Amount Invested, Transaction fees and Funds received in the escrow account.

#### 3.4.2 — Compartment reconciliation

- (Row 48) I want to view the reconciliation per compartment between Amount Invested, Number of Shares owned, Transaction fees and Funds received in the escrow account.

#### 3.4.3 — Redemption reconciliation

- (Row 49) I want to view the reconciliation per transaction between Amount Invested, Number of Shares owned before and after Redemption, Performance fees (or carried interests) across all parties and Funds received in (option (b)) / sent from (option (a) and (c)) the escrow account.

#### 3.4.4 — Conversion reconciliation

- (Row 50) MVP: I want to view the reconciliation per transaction between Amount Invested, Number of Shares owned before and after Conversion and Funds received in the escrow account.
  V2: (option (a)): I also want to view the reconciliation per transaction between Amount Invested, Performance fees (or carried interests) and Funds sent from the escrow account.

### 3.5 — GDPR

#### 3.5.1 — Right to access information

- (Row 51) I want to submit a request to rectify, erase or transfer personal data (ALL or specific item) so that I can protect my personal identity.

#### 3.5.2 — Right to data portability

- (Row 52) I want to download all my personal information in a common format such as CSV or XLS so that I can retrieve all my personal information from the product or service.

#### 3.5.3 — Right for processing to be restricted

- (Row 53) I want to restrict how the product/service uses my personal information so that I can keep control over when and how my personal information is used.

#### 3.5.4 — Right to be forgotten

- (Row 54) I need to own the right to be forgotten by being able to permanently delete / request deletion of my personal information from the product or service so that I can protect my personal identity.

#### 3.5.5 — Right for processing to be restricted

- (Row 55) I need to view clearly defined data policy in plain language so that I can understand why, how and who processes my personal information.

#### 3.5.6 — Right to rectification

- (Row 56) I want to request Incorrect data to be rectified with no delay

#### 3.5.7 — Explicit consent

- (Row 57) Consent can be withdrawn at any time.

#### 3.5.8 — BLACKLISTED

- (Row 58) I want to keep access my personnal datas  (need to define if any other specific access are required)

#### 3.5.9 — Right for processing to be restricted

- (Row 59) I want to require restriction on processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful and instead of asking for the erasure of the personal data so processed, I ask for the restriction of their use
  In such case, my personal data  shall, with the exception of storage, only be processed with my consent or for the establishment, exercise or defence of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the Union or of a Member State

#### 3.5.10 — Right to oppose to automated invdividual decision making

- (Row 60) I want to object to the processing of my personal data when such processing is:
  - necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (not applicable here)
  - necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the client (not applicable here)

## 4.Investor

- Excel `max_row`: 80 (header row + data rows)
- Extracted rows: 79 (excluding blank `User stories` cells)

### 4.1 — My profile

#### 4.1.1 — Create account

- (Row 2) I want to create my account after received link from VERSO
- (Row 3) If I never received invitation to use VERSO app:
  - I want to request access to the app / filling up a contact us form
- (Row 4) I want to update my profile for "re-approval"

#### 4.1.2 — Login

- (Row 5) I want to login with my user ID and password

#### 4.1.3 — Profile approval

- (Row 6) I want to complete my profile for approval
- (Row 7) I want to save my profile as draft until i complete all the required fields
- (Row 8) I want to submit my profile for approval
- (Row 9) I want to complete my profile if incomplete
- (Row 10) I want to receive a notification that my profile has been approved to get access to the full content of the APP
- (Row 11) I want to receive notification that my profile has not been approved

#### 4.1.4 — Check-in

- (Row 12) I want to know the most interesting features available in the APP
- (Row 13) I want to select the most important features I want to be able to perform in the APP
- (Row 14) I want to customiwe My Profile

### 4.2 — My opportunities

#### 4.2.1 — View

- (Row 15) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I was notified to
- (Row 16) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I confirm INTEREST
- (Row 17) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I PASSED
- (Row 18) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I APPROVED
- (Row 19) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I SIGNED
- (Row 20) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I FUNDED

#### 4.2.2 — More information on Investment Opportunity

- (Row 21) I want to get access to the dataroom for the selected investment opportunity
- (Row 22) I am not interested by the Investment Opportunity
- (Row 23) I receive a notification to confirm if I am interested in a specific Investment Opportunity

#### 4.2.3 — Access dataroom

- (Row 24) I receive a notification I can access the content of the dataroom
- (Row 25) I want to view files available in the data room
- (Row 26) I want to send a reminder to get access to the dataroom

#### 4.2.4 — Confirmation of Interest Amount

- (Row 27) I want to confirm interest or not
- (Row 28) I want to update the INTEREST Confirmation Amounts
- (Row 29) I want to review updated Investment opportunity after negotiation with VERSO

#### 4.2.5 — Subscription pack

- (Row 30) I receive a notification that I hace received a subscription pack for Interested Investment Opportunity
- (Row 31) I want to review the subscription pack
- (Row 32) I want to download the subscription pack docs
- (Row 33) I want to share my comments on subscription pack docs
- (Row 34) I want to ask further clarifications or additional information requiring further edition or edition of additional documents
- (Row 35) I receive a notification that I have received an updated subscription pack for Interested Investment Opportunity
- (Row 36) I want to approve the subscription pack
- (Row 37) I want to reject the subscription pack
- (Row 38) I want to digitally sign the subscription pack
- (Row 39) I want to view list of all approved / signed opportunities

#### 4.2.6 — Funding

- (Row 40) I want to receive a notification that the subscription pack was successfully signed and I need to transfer fund to escrow account
- (Row 41) I want to receive a reminder that the escrow account has not been funded yet
- (Row 42) I want to receive a notification that escrow account has been funded

#### 4.2.7 — Equity Certificates

- (Row 43) I want to receive a notification when the issued certificate is available  to be viewed and downloaded
- (Row 44) I want to view my Equity Certificates per Opportunity

#### 4.2.8 — Statement of Holding

- (Row 45) I want to receive a notification when the Statement of Holding is available  to be viewed and downloaded
- (Row 46) I want to view my Statement of Holding per Opportunity

### 4.3 — My Investments

#### 4.3.1 — View My transactions

- (Row 47) I want to view the transactions I made per Opportunity between 2 DATES

#### 4.3.2 — View Transaction details

- (Row 48) I want to view the signed subscription pack per opportunity

#### 4.3.3 — View evolution of my investments

- (Row 49) I want to get access to updated information of My investments and compare with the initial value of my investment

#### 4.3.4 — View my shareholding positions

- (Row 50) I want to view the number of shares invested in each opportunity

#### 4.3.6 — View performance of my investment

- (Row 51) I want to see how much profit I have generated and how much I will generate per opportunity

#### 4.3.7 — Conversion Event

- (Row 52) MVP: I want to receive confirmation of Conversion in shares
  V2: I want to confirm MY Conversion option (if the CEO proposes 2 options):
  (a) 100% in cash OR
  (b) 100% in shares.
- (Row 53) If option (a) and (b), I want to view my updated Equity Certificates and Statement of Holdings.
- (Row 54) V2 only: IF option (a), I  want to receive confirmation that Accrued Interest payment was completed by VERSO.

#### 4.3.8 — Redemption Event

- (Row 55) I want to confirm the Redemption option as notified for the selected Investments:
  (a) 100% in cash [default option].
  (b) 100% in shares.
  (c) X% in cash /Y% in shares. (i.e. X=50%, Y=50%)
- (Row 56) In case of (b) and (c), I want to digitally sign a Shares Transfer Agreement (STA).
- (Row 57) In case of (b), I want to view the notification to pay VERSO Performance fees (Invoice)
- (Row 58) In case of (b), I want to send a notification to confirm payment of VERSO Performance fees
- (Row 59) In case of (b), I want to send a notification to confirm Additional Payment of VERSO Performance fees
- (Row 60) I want to view my updated Equity Certificates and Statement of Holdings.
- (Row 61) IF option (a) or (c), I  want to receive confirmation that Redemption payment was completed by VERSO.
- (Row 62) IF option (a) or (c), I  want to automatically send reminders of the Redemption payment to VERSO after X days.

### 4.4 — My Notifications

#### 4.4.1 — Transaction tracking

- (Row 63) I wanted to view all notifications assigned to me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

#### 4.4.2 — Transaction tracking

- (Row 64) I want to view all NEW notifications assigned to me per Opportunity

#### 4.4.3 — Transaction tracking

- (Row 65) I wanted to view all notifications assigned BY me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

### 4.5 — My Investment Sales

#### 4.5.1 — Resell

- (Row 66) I want to sell a quantity of shares or amount in $ from a selected position in My Investments

#### 4.5.2 — Resell

- (Row 67) I want to receive a notification that a subscription pack has been dispatched

#### 4.5.3 — Resell

- (Row 68) I want to receive a notification that transaction was completed

#### 4.5.4 — Resell

- (Row 69) I want to receive a notification the payment was completed

#### 4.5.5 — Resell

- (Row 70) I want to send an update status on the sales transaction

### 4.6 — GDPR

#### 4.6.1 — Right to access information

- (Row 71) I want to submit a request to rectify, erase or transfer personal data (ALL or specific item) so that I can protect my personal identity.

#### 4.6.2 — Right to data portability

- (Row 72) I want to download all my personal information in a common format such as CSV or XLS so that I can retrieve all my personal information from the product or service.

#### 4.6.3 — Right for processing to be restricted

- (Row 73) I want to restrict how the product/service uses my personal information so that I can keep control over when and how my personal information is used.

#### 4.6.4 — Right to be forgotten

- (Row 74) I need to own the right to be forgotten by being able to permanently delete / request deletion of my personal information from the product or service so that I can protect my personal identity.

#### 4.6.5 — Right for processing to be restricted

- (Row 75) I need to view clearly defined data policy in plain language so that I can understand why, how and who processes my personal information.

#### 4.6.6 — Right to rectification

- (Row 76) I want to request Incorrect data to be rectified with no delay

#### 4.6.7 — Explicit consent

- (Row 77) Consent can be withdrawn at any time.

#### 4.6.8 — BLACKLISTED

- (Row 78) I want to keep access my personnal datas  (need to define if any other specific access are required)

#### 4.6.9 — Right for processing to be restricted

- (Row 79) I want to require restriction on processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful and instead of asking for the erasure of the personal data so processed, I ask for the restriction of their use
  In such case, my personal data  shall, with the exception of storage, only be processed with my consent or for the establishment, exercise or defence of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the Union or of a Member State

#### 4.6.10 — Right to oppose to automated invdividual decision making

- (Row 80) I want to object to the processing of my personal data when such processing is:
  - necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (not applicable here)
  - necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the client (not applicable here)

## 5.Partner

- Excel `max_row`: 106 (header row + data rows)
- Extracted rows: 105 (excluding blank `User stories` cells)

### 5.1 — My profile

#### 5.1.1 — Create account

- (Row 2) I want to create my account after received link from VERSO
- (Row 3) If I never received invitation to use VERSO app:
  - I want to request access to the app / filling up a contact us form
- (Row 4) I want to update my profile for "re-approval"

#### 5.1.2 — Login

- (Row 5) I want to login with my user ID and password

#### 5.1.3 — Profile approval

- (Row 6) I want to complete my profile for approval
- (Row 7) I want to save my profile as draft until i complete all the required fields
- (Row 8) I want to submit my profile for approval
- (Row 9) I want to complete my profile if incomplete
- (Row 10) I receive a notification that my profile has been approved to get access to the full content of the APP
- (Row 11) I receive notification that my profile has not been approved

#### 5.1.4 — Check-in

- (Row 12) I want to know the most interesting features available in the APP
- (Row 13) I want to select the most important features I want to be able to perform in the APP
- (Row 14) I want to customiwe My Profile

### 5.2 — My opportunities as investor (even if I am partner)

#### 5.2.1 — View

- (Row 15) #REF!
- (Row 16) #REF!
- (Row 17) #REF!
- (Row 18) #REF!
- (Row 19) #REF!
- (Row 20) #REF!

#### 5.2.2 — More information on Investment Opportunity

- (Row 21) I want to get access to the dataroom for the selected investment opportunity
- (Row 22) I am not interested by the Investment Opportunity
- (Row 23) I receive a notification if I am interested in a specific Investment Opportunity

#### 5.2.3 — Access dataroom

- (Row 24) I receive a notification I can access the content of the dataroom
- (Row 25) I want to view files available in the data room
- (Row 26) I want to send a reminder to get access to the dataroom

#### 5.2.4 — Confirmation of Interest Amount

- (Row 27) I want to confirm interest or not
- (Row 28) I want to update the INTEREST Confirmation Amounts
- (Row 29) I want to review updated Investment opportunity after negotiation with VERSO

#### 5.2.5 — Subscription pack

- (Row 30) I receive a notification that I have received a subscription pack for Interested Investment Opportunity
- (Row 31) I want to review the subscription pack
- (Row 32) I want to download the subscription pack docs
- (Row 33) I want to share my comments on subscription pack docs
- (Row 34) I want to ask further clarifications or additional information requiring further edition or edition of additional documents
- (Row 35) I want to receive a notification that I have received an updated subscription pack for Interested Investment Opportunity
- (Row 36) I want to approve the subscription pack
- (Row 37) I want to reject the subscription pack
- (Row 38) I want to digitally sign the subscription pack
- (Row 39) I want to view list of all approved opportunities

#### 5.2.6 — Funding

- (Row 40) I want to receive a notification that the subscription pack was successfully signed and I need to transfer fund to escrow account
- (Row 41) I want to receive a reminder that the escrow account has not been funded yet
- (Row 42) I want to receive a notification that escrow account has been funded

#### 5.2.7 — Equity Certificates

- (Row 43) I want to receive a notification when the issued certificate is available  to be viewed and downloaded
- (Row 44) I want to view my Equity Certificates per Opportunity

#### 5.2.8 — Statement of Holding

- (Row 45) I want to receive a notification when the Statement of Holding is available  to be viewed and downloaded
- (Row 46) I want to view my Statement of Holding per Opportunity

### 5.3 — My Investments

#### 5.3.1 — View My transactions

- (Row 47) I want to view the transactions I made per Opportunity between 2 DATES

#### 5.3.2 — View Transaction details

- (Row 48) I want to view the signed subscription pack per opportunity

#### 5.3.3 — View evolution of my investments

- (Row 49) I want to get access to updated information of My investments and compare with the initial value of my investment

#### 5.3.4 — View my shareholding positions

- (Row 50) I want to view the number of shares invested in each opportunity

#### 5.3.6 — View performance of my investment

- (Row 51) I want to see how much profit I have generated and how much I will generate per opportunity

#### 5.3.7 — Conversion Event

- (Row 52) MVP: I want to receive confirmation of Conversion in shares
  V2: I want to confirm MY Conversion option (if the CEO proposes 2 options):
  (a) 100% in cash OR
  (b) 100% in shares.
- (Row 53) If option (a) and (b), I want to view my updated Equity Certificates and Statement of Holdings.
- (Row 54) V2 only: IF option (a), I  want to receive confirmation that Accrued Interest payment was completed by VERSO.

#### 5.3.8 — Redemption Event

- (Row 55) I want to confirm the Redemption option as notified for the selected Investments:
  (a) 100% in cash [default option].
  (b) 100% in shares.
  (c) X% in cash /Y% in shares. (i.e. X=50%, Y=50%)
- (Row 56) In case of (b) and (c), I want to digitally sign a Shares Transfer Agreement (STA).
- (Row 57) In case of (b), I want to view the notification to pay VERSO Performance fees (Invoice)
- (Row 58) In case of (b), I want to send a notification to confirm payment of VERSO Performance fees
- (Row 59) In case of (b), I want to send a notification to confirm Additional Payment of VERSO Performance fees
- (Row 60) I want to view my updated Equity Certificates and Statement of Holdings.
- (Row 61) IF option (a) or (c), I  want to receive confirmation that Redemption payment was completed by VERSO.
- (Row 62) IF option (a) or (c), I  want to automatically send reminders of the Redemption payment to VERSO after X days.

### 5.4 — My Investments Notifications to be grouped with My Transactions Notifications as a Partner

#### 5.4.1 — My Invesments tracking

- (Row 63) I want to view all notifications assigned to me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

#### 5.4.2 — My Invesments tracking

- (Row 64) I want to view all NEW notifications assigned to me per Opportunity

#### 5.4.3 — My Invesments tracking

- (Row 65) I wanted to view all notifications assigned BY me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

### 5.5 — My Investment Sales

#### 5.5.1 — Resell

- (Row 66) I want to sell a quantity of shares or amount in $ from a selected position in My Investments

#### 5.5.2 — Resell

- (Row 67) I want to receive a notification that a subscription pack has been dispatched

#### 5.5.3 — Resell

- (Row 68) I want to receive a notification that transaction was completed

#### 5.5.4 — Resell

- (Row 69) I want to receive a notification the payment was completed

#### 5.5.5 — Resell

- (Row 70) I want to send an update status on the sales transaction

### 5.6 — My Transactions (specifically as a PARTNER)

#### 5.6.1 — View My Transactions

- (Row 71) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a PARTNER
- (Row 72) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a PARTNER or INTRODUCER and INVESTOR confirmed INTEREST
- (Row 73) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a PARTNER or INTRODUCER and INVESTOR PASSED
- (Row 74) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a PARTNER or INTRODUCER and INVESTOR APPROVED
- (Row 75) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a PARTNER or INTRODUCER and INVESTOR SIGNED
- (Row 76) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a PARTNER or INTRODUCER and INVESTOR FUNDED
- (Row 77) I want to display the Partner fees model per Opportunity that applies to ME
- (Row 78) I want to display the Investment Opportunities (description + termsheet)
- (Row 79) I want to review more information about an Investment Opportunity and get access to the data room

#### 5.6.2 — My Transactions tracking

- (Row 80) I want to view notifications that subscription pack was sent to investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 81) I want to view notifications that subscription pack was APPROVED by investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 82) I want to view notifications that subscription pack was SIGNED by investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 83) I want to view notifications that VERSO escrow account was FUNDED by investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 84) I want to view notifications that VERSO proceeded to Partner(s) transaction payment for the transactions I was assigned to as a PARTNER
- (Row 85) V1: I want to view notifications that Partner Invoice was sent to VERSO for the transaction I was assigned to as a PARTNER
- (Row 86) V1: I want to view notifications that VERSO proceeded to Partner(s) transaction payment for the transactions I was assigned to as a PARTNER
- (Row 87) I want to view a transaction summary prior to generate the PARTNER Invoice

#### 5.6.3 — My Transactions Reporting

- (Row 88) I want to see how much revenues I have generated between 2 DATES
- (Row 89) I want to recalculate my fees based on the progress status.
- (Row 90) I want to see how much revenues I have generated so far and how much I will generate per opportunity (OR ALL OPPORTUNITIES) and per investor
- (Row 91) I want to send a REDEMPTION Fees Invoice and to enter manually the Total Due Amount in the APP.
- (Row 92) I want to view an APPROVAL notification of the REDEMPTION Fees Invoice from the CEO
- (Row 93) I want to view a REQUEST FOR CHANGE notification on REDEMPTION Fees from the CEO
- (Row 94) I want to receive confirmation that Redemption Fees payment was completed by VERSO.

#### 5.6.4 — My Shared Transactions

- (Row 95) I want to SHARE INVESTMENT OPPORTUNITY (Opportunity description + termsheet X) to selected INVESTOR ONLY for potential investments
  - Apply partner fee model as defined by CEO automatically
  - Copy CEO and Arranger by default automatically
  - No Introducer or Commercial Partner can be defined
- (Row 96) I want to SHARE INVESTMENT OPPORTUNITY (Opportunity description + termsheet X) to selected INVESTOR and INTRODUCER for potential investments
  - Apply partner fee model as defined by CEO automatically
  - Copy CEO and Arranger by default automatically
  - Copy Introducer as entered by Partner
  - No Commercial Partner can be defined

### 5.7 — GDPR

#### 5.7.1 — Right to access information

- (Row 97) I want to submit a request to rectify, erase or transfer personal data (ALL or specific item) so that I can protect my personal identity.

#### 5.7.2 — Right to data portability

- (Row 98) I want to download all my personal information in a common format such as CSV or XLS so that I can retrieve all my personal information from the product or service.

#### 5.7.3 — Right for processing to be restricted

- (Row 99) I want to restrict how the product/service uses my personal information so that I can keep control over when and how my personal information is used.

#### 5.7.4 — Right to be forgotten

- (Row 100) I need to own the right to be forgotten by being able to permanently delete / request deletion of my personal information from the product or service so that I can protect my personal identity.

#### 5.7.5 — Right for processing to be restricted

- (Row 101) I need to view clearly defined data policy in plain language so that I can understand why, how and who processes my personal information.

#### 5.7.6 — Right to rectification

- (Row 102) I want to request Incorrect data to be rectified with no delay

#### 5.7.7 — Explicit consent

- (Row 103) Consent can be withdrawn at any time.

#### 5.7.8 — BLACKLISTED

- (Row 104) I want to keep access my personnal datas  (need to define if any other specific access are required)

#### 5.7.9 — Right for processing to be restricted

- (Row 105) I want to require restriction on processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful and instead of asking for the erasure of the personal data so processed, I ask for the restriction of their use
  In such case, my personal data  shall, with the exception of storage, only be processed with my consent or for the establishment, exercise or defence of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the Union or of a Member State

#### 5.7.10 — Right to oppose to automated invdividual decision making

- (Row 106) I want to object to the processing of my personal data when such processing is:
  - necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (not applicable here)
  - necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the client (not applicable here)

## 6.Introducer

- Excel `max_row`: 115 (header row + data rows)
- Extracted rows: 111 (excluding blank `User stories` cells)
- Blank `User stories` rows skipped: 3 (first: 80, 98, 99)

### 6.1 — My profile

#### 6.1.1 — Create account

- (Row 2) I want to create my account after received link from VERSO
- (Row 3) If I never received invitation to use VERSO app:
  - I want to request access to the app / filling up a contact us form
- (Row 4) I want to update my profile for "re-approval"

#### 6.1.2 — Login

- (Row 5) I want to login with my user ID and password

#### 6.1.3 — Profile approval

- (Row 6) I want to complete my profile for approval
- (Row 7) I want to save my profile as draft until i complete all the required fields
- (Row 8) I want to submit my profile for approval
- (Row 9) I want to complete my profile if incomplete
- (Row 10) I want to receive a notification that my profile has been approved to get access to the full content of the APP
- (Row 11) I want to receive notification that my profile has not been approved

#### 6.1.4 — Check-in

- (Row 12) I want to know the most interesting features available in the APP
- (Row 13) I want to select the most important features I want to be able to perform in the APP
- (Row 14) I want to customiwe My Profile

### 6.2 — My opportunities as investor (even If I am Introducer)

#### 6.2.1 — View

- (Row 15) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I was notified to
- (Row 16) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I confirm INTEREST
- (Row 17) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I PASSED
- (Row 18) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I APPROVED
- (Row 19) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I SIGNED
- (Row 20) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I FUNDED

#### 6.2.2 — More information on Investment Opportunity

- (Row 21) I want to get access to the dataroom for the selected investment opportunity
- (Row 22) I am not interested by the Investment Opportunity
- (Row 23) I receive a notification to confirm if I am interested in a specific Investment Opportunity

#### 6.2.3 — Access dataroom

- (Row 24) I receive a notification I can access the content of the dataroom
- (Row 25) I want to view files available in the data room
- (Row 26) I want to send a reminder to get access to the dataroom

#### 6.2.4 — Confirmation of Interest Amount

- (Row 27) I want to confirm interest or not
- (Row 28) I want to update the INTEREST Confirmation Amounts
- (Row 29) I want to review updated Investment opportunity after negotiation with VERSO

#### 6.2.5 — Subscription pack

- (Row 30) I receive a notification that I hace received a subscription pack for Interested Investment Opportunity
- (Row 31) I want to review the subscription pack
- (Row 32) I want to download the subscription pack docs
- (Row 33) I want to share my comments on subscription pack docs
- (Row 34) I want to ask further clarifications or additional information requiring further edition or edition of additional documents
- (Row 35) I receive a notification that I have received an updated subscription pack for Interested Investment Opportunity
- (Row 36) I want to approve the subscription pack
- (Row 37) I want to reject the subscription pack
- (Row 38) I want to digitally sign the subscription pack
- (Row 39) I want to view list of all approved / signed opportunities

#### 6.2.6 — Funding

- (Row 40) I want to receive a notification that the subscription pack was successfully signed and I need to transfer fund to escrow account
- (Row 41) I want to receive a reminder that the escrow account has not been funded yet
- (Row 42) I want to receive a notification that escrow account has been funded

#### 6.2.7 — Equity Certificates

- (Row 43) I want to receive a notification when the issued certificate is available  to be viewed and downloaded
- (Row 44) I want to view my Equity Certificates per Opportunity

#### 6.2.8 — Statement of Holding

- (Row 45) I want to receive a notification when the Statement of Holding is available  to be viewed and downloaded
- (Row 46) I want to view my Statement of Holding per Opportunity

### 6.3 — My Investments

#### 6.3.1 — View My transactions

- (Row 47) I want to view the transactions I made per Opportunity between 2 DATES

#### 6.3.2 — View Transaction details

- (Row 48) I want to view the signed subscription pack per opportunity

#### 6.3.3 — View evolution of my investments

- (Row 49) I want to get access to updated information of My investments and compare with the initial value of my investment

#### 6.3.4 — View my shareholding positions

- (Row 50) I want to view the number of shares invested in each opportunity

#### 6.3.5 — View performance of my investment

- (Row 51) I want to see how much profit I have generated and how much I will generate per opportunity

#### 6.3.6 — #REF!

- (Row 52) #REF!
- (Row 53) #REF!
- (Row 54) #REF!

#### 6.3.7 — #REF!

- (Row 55) #REF!
- (Row 56) #REF!
- (Row 57) #REF!
- (Row 58) #REF!
- (Row 59) #REF!
- (Row 60) #REF!
- (Row 61) #REF!
- (Row 62) #REF!

### 6.4 — My Investments Notifications to be grouped with My Introductions Notifications as a Introducer

#### 6.4.1 — Transaction tracking

- (Row 63) I wanted to view all notifications assigned to me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

#### 6.4.2 — Transaction tracking

- (Row 64) I want to view all NEW notifications assigned to me per Opportunity

#### 6.4.3 — Transaction tracking

- (Row 65) I wanted to view all notifications assigned BY me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

### 6.5 — My Investment Sales

#### 6.5.1 — Resell

- (Row 66) I want to sell a quantity of shares or amount in $ from a selected position in My Investments

#### 6.5.2 — Resell

- (Row 67) I want to receive a notification that a subscription pack has been dispatched

#### 6.5.3 — Resell

- (Row 68) I want to receive a notification that transaction was completed

#### 6.5.4 — Resell

- (Row 69) I want to receive a notification the payment was completed

#### 6.5.5 — Resell

- (Row 70) I want to send an update status on the sales transaction

### 6.6 — My Introductions

#### 6.6.1 — View My Introductions

- (Row 71) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS an INTRODUCER
- (Row 72) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS an INTRODUCER and INVESTOR confirmed INTEREST
- (Row 73) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS an INTRODUCER and INVESTOR PASSED
- (Row 74) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS an INTRODUCER and INVESTOR APPROVED
- (Row 75) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS an INTRODUCER and INVESTOR SIGNED
- (Row 76) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS an INTRODUCER and INVESTOR FUNDED
- (Row 77) I want to display the Investment Opportunity (description + termsheet)
- (Row 78) I want to review more information about an Investment Opportunity and get access to the data room
- (Row 79) I want to display the Introducer fees model per Opportunity that applies to ME

#### 6.6.2 — My Introductions Agreements

- (Row 81) I want to display the Introducer agreement that was dispatched to me.
  Introducer agreement includes summary of fees (visible from the app)
- (Row 82) I want to view the reminders to approve Introducer Agreement(s)
- (Row 83) I want to view the reminders to sign Introducer Agreement(s)
- (Row 84) I want to approve an Introducer Agreement
- (Row 85) I want to sign an Introducer Agreement
- (Row 86) I want to receive notification that the Introduction Agreement was successuly signed
- (Row 87) I want to reject an Introducer Agreement
- (Row 88) I want to receive notification that the Introduction Agreement was rejected
- (Row 89) I want to display the list of Introducer Agreements
- (Row 90) I want to view more details of the Introducer Agreements I selected

#### 6.6.3 — My Introductions tracking

- (Row 91) I want to view notifications that subscription pack was sent to investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 92) I want to view notifications that subscription pack was APPROVED by investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 93) I want to view notifications that subscription pack was SIGNED by investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 94) I want to view notifications that VERSO escrow account was FUNDED by investors for which I was assigned as a PARTNER and INTRODUCER
- (Row 95) I want to view notifications that BI Invoice was sent to VERSO for the transaction I was assigned to as an INTRODUCER
- (Row 96) I want to view notifications that VERSO proceeded to Intoducer(s) transaction payment for the transactions I was assigned to as an INTRODUCER
- (Row 97) I want to view a transaction summary prior to generate Invoice

#### 6.6.4 — My Introductions Reporting

- (Row 100) I want to see how much revenues I have generated between 2 DATES
- (Row 101) I want to see how much revenues I have generated so far and how much I will generate per opportunity (OR ALL OPPORTUNITIES) and per investor
- (Row 102) I want to send a REDEMPTION Fees Invoice and to enter manually the Total Due Amount in the APP.
- (Row 103) I want to view an APPROVAL notification of the REDEMPTION Fees Invoice from the CEO
- (Row 104) I want to view a REQUEST FOR CHANGE notification on REDEMPTION Fees from the CEO
- (Row 105) I want to receive confirmation that Redemption Fees payment was completed by VERSO.

### 6.7 — GDPR

#### 6.7.1 — Right to access information

- (Row 106) I want to submit a request to rectify, erase or transfer personal data (ALL or specific item) so that I can protect my personal identity.

#### 6.7.2 — Right to data portability

- (Row 107) I want to download all my personal information in a common format such as CSV or XLS so that I can retrieve all my personal information from the product or service.

#### 6.7.3 — Right for processing to be restricted

- (Row 108) I want to restrict how the product/service uses my personal information so that I can keep control over when and how my personal information is used.

#### 6.7.4 — Right to be forgotten

- (Row 109) I need to own the right to be forgotten by being able to permanently delete / request deletion of my personal information from the product or service so that I can protect my personal identity.

#### 6.7.5 — Right for processing to be restricted

- (Row 110) I need to view clearly defined data policy in plain language so that I can understand why, how and who processes my personal information.

#### 6.7.6 — Right to rectification

- (Row 111) I want to request Incorrect data to be rectified with no delay

#### 6.7.7 — Explicit consent

- (Row 112) Consent can be withdrawn at any time.

#### 6.7.8 — BLACKLISTED

- (Row 113) I want to keep access my personnal datas  (need to define if any other specific access are required)

#### 6.7.9 — Right for processing to be restricted

- (Row 114) I want to require restriction on processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful and instead of asking for the erasure of the personal data so processed, I ask for the restriction of their use
  In such case, my personal data  shall, with the exception of storage, only be processed with my consent or for the establishment, exercise or defence of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the Union or of a Member State

#### 6.7.10 — Right to oppose to automated invdividual decision making

- (Row 115) I want to object to the processing of my personal data when such processing is:
  - necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (not applicable here)
  - necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the client (not applicable here)

## 7.Commercial Partner

- Excel `max_row`: 112 (header row + data rows)
- Extracted rows: 111 (excluding blank `User stories` cells)

### 7.1 — My profile

#### 7.1.1 — Create account

- (Row 2) I want to create my account after received link from VERSO
- (Row 3) If I never received invitation to use VERSO app:
  - I want to request access to the app / filling up a contact us form
- (Row 4) I want to update my profile for "re-approval"

#### 7.1.2 — Login

- (Row 5) I want to login with my user ID and password

#### 7.1.3 — Profile approval

- (Row 6) I want to complete my profile for approval
- (Row 7) I want to save my profile as draft until i complete all the required fields
- (Row 8) I want to submit my profile for approval
- (Row 9) I want to complete my profile if incomplete
- (Row 10) I want to receive a notification that my profile has been approved to get access to the full content of the APP
- (Row 11) I want to receive notification that my profile has not been approved

#### 7.1.4 — Check-in

- (Row 12) I want to know the most interesting features available in the APP
- (Row 13) I want to select the most important features I want to be able to perform in the APP
- (Row 14) I want to customiwe My Profile

### 7.2 — My opportunities

#### 7.2.1 — View

- (Row 15) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I was notified to
- (Row 16) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I confirm INTEREST
- (Row 17) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I PASSED
- (Row 18) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I APPROVED
- (Row 19) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I SIGNED
- (Row 20) I want to display the list of opportunies (INVESTMENT OPPORTUNITIES) I FUNDED

#### 7.2.2 — More information on Investment Opportunity

- (Row 21) I want to get access to the dataroom for the selected investment opportunity
- (Row 22) I am not interested by the Investment Opportunity
- (Row 23) I receive a notification to confirm if I am interested in a specific Investment Opportunity

#### 7.2.3 — Access dataroom

- (Row 24) I receive a notification I can access the content of the dataroom
- (Row 25) I want to view files available in the data room
- (Row 26) I want to send a reminder to get access to the dataroom

#### 7.2.4 — Confirmation of Interest Amount

- (Row 27) I want to confirm interest or not
- (Row 28) I want to update the INTEREST Confirmation Amounts
- (Row 29) I want to review updated Investment opportunity after negotiation with VERSO

#### 7.2.5 — Subscription pack

- (Row 30) I receive a notification that I hace received a subscription pack for Interested Investment Opportunity
- (Row 31) I want to review the subscription pack
- (Row 32) I want to download the subscription pack docs
- (Row 33) I want to share my comments on subscription pack docs
- (Row 34) I want to ask further clarifications or additional information requiring further edition or edition of additional documents
- (Row 35) I receive a notification that I have received an updated subscription pack for Interested Investment Opportunity
- (Row 36) I want to approve the subscription pack
- (Row 37) I want to reject the subscription pack
- (Row 38) I want to digitally sign the subscription pack
- (Row 39) I want to view list of all approved / signed opportunities

#### 7.2.6 — Funding

- (Row 40) I want to receive a notification that the subscription pack was successfully signed and I need to transfer fund to escrow account
- (Row 41) I want to receive a reminder that the escrow account has not been funded yet
- (Row 42) I want to receive a notification that escrow account has been funded

#### 7.2.7 — Equity Certificates

- (Row 43) I want to receive a notification when the issued certificate is available  to be viewed and downloaded
- (Row 44) I want to view my Equity Certificates per Opportunity

#### 7.2.8 — Statement of Holding

- (Row 45) I want to receive a notification when the Statement of Holding is available  to be viewed and downloaded
- (Row 46) I want to view my Statement of Holding per Opportunity

### 7.3 — My Investments

#### 7.3.1 — View My transactions

- (Row 47) I want to view the transactions I made per Opportunity between 2 DATES

#### 7.3.2 — View Transaction details

- (Row 48) I want to view the signed subscription pack per opportunity

#### 7.3.3 — View evolution of my investments

- (Row 49) I want to get access to updated information of My investments and compare with the initial value of my investment

#### 7.3.4 — View my shareholding positions

- (Row 50) I want to view the number of shares invested in each opportunity

#### 7.3.5 — View performance of my investment

- (Row 51) I want to see how much profit I have generated and how much I will generate per opportunity

#### 7.3.6 — #REF!

- (Row 52) #REF!
- (Row 53) #REF!
- (Row 54) #REF!

#### 7.3.7 — #REF!

- (Row 55) #REF!
- (Row 56) #REF!
- (Row 57) #REF!
- (Row 58) #REF!
- (Row 59) #REF!
- (Row 60) #REF!
- (Row 61) #REF!
- (Row 62) #REF!

### 7.4 — My Investments Notifications to be grouped with My Transactions Notifications as a Commercial Partner

#### 7.4.1 — Transaction tracking

- (Row 63) I wanted to view all notifications assigned to me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

#### 7.4.2 — Transaction tracking

- (Row 64) I want to view all NEW notifications assigned to me per Opportunity

#### 7.4.3 — Transaction tracking

- (Row 65) I wanted to view all notifications assigned BY me per type of notifications (i.e. subscription pack pending approval, funding pending etc...)

### 7.5 — My Investment Sales

#### 7.5.1 — Resell

- (Row 66) I want to sell a quantity of shares or amount in $ from a selected position in My Investments

#### 7.5.2 — Resell

- (Row 67) I want to receive a notification that a subscription pack has been dispatched

#### 7.5.3 — Resell

- (Row 68) I want to receive a notification that transaction was completed

#### 7.5.4 — Resell

- (Row 69) I want to receive a notification the payment was completed

#### 7.5.5 — Resell

- (Row 70) I want to send an update status on the sales transaction

### 7.6 — My Transactions (specifically as a COMMERCIAL PARTNER)

#### 7.6.1 — View My Transactions

- (Row 71) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a COMMERCIAL PARTNER
- (Row 72) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a COMMERCIAL PARTNER and INVESTOR confirmed INTEREST
- (Row 73) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a COMMERCIAL PARTNER and INVESTOR PASSED
- (Row 74) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a COMMERCIAL PARTNER and INVESTOR APPROVED
- (Row 75) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a COMMERCIAL PARTNER and INVESTOR SIGNED
- (Row 76) I want to display the list of opportunities (INVESTMENT OPPORTUNITIES) I was notified to AS a COMMERCIAL PARTNER and INVESTOR FUNDED
- (Row 77) I want to display the Investment Opportunities (description + termsheet)
- (Row 78) I want to review more information about an Investment Opportunity and get access to the data room
- (Row 79) I want to display the Partner fees model per Opportunity that applies to ME

#### 7.6.2 — My Placement Agreements

- (Row 80) MVP: I want to display the Placement Fee Summary that was dispatched to me.
  V2: I want to display the Placement agreement and the Placement Fee Summary that was dispatched to me. Placement agreement includes summary of fees (visible from the app)
- (Row 81) V2: I want to view the reminders to approve Placement Agreement(s)
- (Row 82) I want to view the reminders to sign Placement Agreement(s)
- (Row 83) V2: I want to approve a Placement Agreement
- (Row 84) I want to sign an Placement Agreement
- (Row 85) I want to receive notification that the Placement Agreement was successuly signed
- (Row 86) V2: I want to reject a Placement Agreement
- (Row 87) V2: I want to receive notification that the Placement Agreement was rejected
- (Row 88) I want to display the list of Placement Agreements
- (Row 89) I want to view more details of the Placement Agreements I selected

#### 7.6.3 — My Transactions tracking

- (Row 90) I want to view notifications that subscription pack was sent to investors for which I was assigned as a COMMERCIAL PARTNER and INTRODUCER
- (Row 91) I want to view notifications that subscription pack was APPROVED by investors for which I was assigned as a COMMERCIAL PARTNER and INTRODUCER
- (Row 92) I want to view notifications that subscription pack was SIGNED by investors for which I was assigned as a COMMERCIAL PARTNER and INTRODUCER
- (Row 93) I want to view notifications that VERSO escrow account was FUNDED by investors for which I was assigned as a COMMERCIAL PARTNER and INTRODUCER
- (Row 94) I want to view notifications that VERSO proceeded to COMMERCIAL partner transaction payment for the transactions I was assigned to as a COMMERCIAL PARTNER
- (Row 95) I want to view a transaction summary prior to generate Invoice

#### 7.6.4 — My Transactions Reporting

- (Row 96) I want to see how much revenues I have generated between 2 DATES
- (Row 97) I want to recalculate my fees based on the progress status.
- (Row 98) I want to see how much revenues I have generated so far and how much I will generate per opportunity (OR ALL OPPORTUNITIES) and per investor
- (Row 99) I want to send a REDEMPTION Fees Invoice and to enter manually the Total Due Amount in the APP.
- (Row 100) I want to view an APPROVAL notification of the REDEMPTION Fees Invoice from the CEO
- (Row 101) I want to view a REQUEST FOR CHANGE notification on REDEMPTION Fees  from the CEO
- (Row 102) I want to receive confirmation that Redemption Fees payment was completed by VERSO.

### 7.7 — GDPR

#### 7.7.1 — Right to access information

- (Row 103) I want to submit a request to rectify, erase or transfer personal data (ALL or specific item) so that I can protect my personal identity.

#### 7.7.2 — Right to data portability

- (Row 104) I want to download all my personal information in a common format such as CSV or XLS so that I can retrieve all my personal information from the product or service.

#### 7.7.3 — Right for processing to be restricted

- (Row 105) I want to restrict how the product/service uses my personal information so that I can keep control over when and how my personal information is used.

#### 7.7.4 — Right to be forgotten

- (Row 106) I need to own the right to be forgotten by being able to permanently delete / request deletion of my personal information from the product or service so that I can protect my personal identity.

#### 7.7.5 — Right for processing to be restricted

- (Row 107) I need to view clearly defined data policy in plain language so that I can understand why, how and who processes my personal information.

#### 7.7.6 — Right to rectification

- (Row 108) I want to request Incorrect data to be rectified with no delay

#### 7.7.7 — Explicit consent

- (Row 109) Consent can be withdrawn at any time.

#### 7.7.8 — BLACKLISTED

- (Row 110) I want to keep access my personnal datas  (need to define if any other specific access are required)

#### 7.7.9 — Right for processing to be restricted

- (Row 111) I want to require restriction on processing when:
  - I contest the accuracy of the personal data so processed
  - the processing is unlawful and instead of asking for the erasure of the personal data so processed, I ask for the restriction of their use
  In such case, my personal data  shall, with the exception of storage, only be processed with my consent or for the establishment, exercise or defence of legal claims or for the protection of the rights of another natural or legal person or for reasons of important public interest of the Union or of a Member State

#### 7.7.10 — Right to oppose to automated invdividual decision making

- (Row 112) I want to object to the processing of my personal data when such processing is:
  - necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (not applicable here)
  - necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the client (not applicable here)
