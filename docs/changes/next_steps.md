# Next Steps - Oct 12, 2025 Client Review
Each item pairs Julien's explicit request with the follow-up action (and Ghiles' commitment when made) so responsibilities are unambiguous.

## Access & Branding
- **Client need:** "So, it's very uh low low tech, but we'll have the um we'll we'll activate a way to uh for for people to create their accounts and then um everything we do is under versholdings.com."
  - **Action:** Expose investor login/signup entry on `versholdings.com`.
- **Client need:** "So they will just add the button which includes um a little more right. So when you click on the button they can sign into uh the platform directly."
  - **Commitment (Ghiles):** Will add the CTA that routes investors into email verification.
- **Client need:** "Could we have simply an access that is versholdings.com-admin and then what happens is for the staff this is the page where they're going to land ... and the clients they will just type ... they will find the button that says um login or profile or whatever."
  - **Action:** Provision the hidden `versholdings.com-admin` route for staff-only sign-in (unlinked from public navigation).
- **Client need:** "So, I'm with you. So, basically for the third party clients, it will be verse.com and they will log in there. they will have their own uh their own uh login uh URL basically."
  - **Action:** Reserve dedicated authentication surface under `verse.com` for SaaS/third-party tenants.
- **Client need:** "The only thing I need to do, I need to send you the logo ... they're bold and dark."
  - **Commitment (Ghiles):** Replace investor auth branding with the supplied Verso wordmark and colour variants.

## Investor Portal Experience
- **Client need:** "When people will come the very top will be the new deals ... Number two ... it's the actions uh required ... like an action center."
  - **Action:** Reorder dashboard to lead with featured deals, followed by an action centre block.
- **Client need:** "He will go into the holdings ... that's the portfolio. You can call it portfolio instead of holdings." / "The documents button here will disappear. We'll merge it with reports... below reports you will have the section with tasks and messages."
  - **Action:** Update nav to `Dashboard -> Active Deals -> Portfolio -> Reports -> Tasks -> Messages` and remove separate Documents tab.
- **Client need:** "We need them as soon as the account will be launched, we need them to answer like 10 questions about their risk ... the types of investments they like..."
  - **Action:** Add onboarding questionnaire and profile fields to drive deal recommendations.
- **Client need:** "Just put an amount. ... No need for a progress bar." / "Maybe we can say indicative completion date..." / "Once they click on Revolute ... there should be several places where they can click."
  - **Action:** Redesign deal cards to show up-to amounts, deadlines, urgency cues, and clear multi-location CTAs that trigger approvals.
- **Client need:** "The company logos will be the real logo." / "Include the website ... it should be a new window."
  - **Action:** Use actual company logos and add external links opening in a new tab or window.
- **Client need:** "You don't want investors ... to generate position statements whenever they want..."
  - **Commitment (Ghiles confirmed):** Keep position statements on a scheduled cadence (no ad-hoc generation).
- **Client need:** "If a client clicks on Revolute and ... signs the NDA ... he will be able to do Q&As ... would we have a similar message box within the due diligence part?"
  - **Action:** Add per-deal Q&A/messaging within the deal room to replace WhatsApp threads.
- **Client need:** "Do you think I should add a calendar view for both portals?" / "Yeah ... a timeline in the calendar where we can see ... follow-up that's urgent."
  - **Action:** Deliver shared calendar views surfacing deal deadlines, meetings, and urgent tasks across investor and staff portals.

## Documents & Data Room Structure
- **Client need:** "We need to define exactly which documents will end up here ... Maybe the copy of the NDAs ... I would prefer to add another page for that."
  - **Action:** Finalise taxonomy: keep invested-asset documents under Reports and stand up a separate pre-investment deal-room page.
- **Client need:** "All of this will move to reports to simplify the menu."
  - **Action:** Ensure legacy document entry points redirect into the unified Reports module.

## Staff Portal & Operations
- **Client need:** "Maybe at the very top ... add up something like ... keep confidential and private at all time ... We need to add some red."
  - **Action:** Add red confidentiality banner on the staff dashboard.
- **Client need:** "We will need to load the Excel spreadsheet I gave you. We'll need to load all the database."
  - **Action:** Import the vehicle dataset from Julien's spreadsheet to validate UI ergonomics.
- **Client need:** "Any type of regroup or filter ... it's helpful because ... some of my colleagues spend eight hours a day on it."
  - **Action:** Provide configurable views (table, grouped/Kanban, filters) for entity management.
- **Client need:** "Before the name itself you can have the ref ... we use VC2 VC106."
  - **Action:** Prepend reference codes to entity listings and support search by code.
- **Client need:** "Maybe we can create a folder ... KYC ... legal documents ... redemption."
  - **Action:** Seed entity document storage with default folder sets (KYC, legal, redemption or closure, etc.).
- **Client need:** "You will have lawyers ... accountants ... administrators ... auditors ... strategic partners."
  - **Action:** Extend entity profiles with stakeholder role sections.
- **Client need:** "We need to have an action center ... there will be things that are not done yet ... I want to check in one click all my entities, all the red flags, all the green flags."
  - **Action:** Build entity status/flag summaries and per-vehicle action centre surfacing outstanding items.
- **Client need:** "Is it possible for staff to select all the clients to send a message ... We'll have certain roles that cannot touch it."
  - **Action:** Implement investor broadcast messaging with role-based permissions.
- **Client need:** "If we approve it unlocks something then the investor gets a message ... If we say no ... it's rejected because ... missing some documents."
  - **Action:** Hook approval outcomes to templated investor notifications (reasons included).
- **Client need:** "We would like to have our own signature system ... it should give a unique identification number."
  - **Commitment (Ghiles):** Integrate open-source e-signature flow issuing auditable signature IDs.
- **Client need:** "I want to make sure ... screenshots are blocked."
  - **Action:** Evaluate and enforce screenshot protection on web and mobile clients.
- **Client need:** "Yes. ... I think it's okay to keep it in the platform as well." (regarding LinkedIn/outreach leads)
  - **Action:** Surface leads data inside the staff portal rather than pushing to an external CRM.

## Automation & Coordination
- **Client need:** "They will know what's the deadline. They will follow up on the prospects ... Some agents they will follow up on Q&As ... documentation that's missing."
  - **Action:** Configure automations/agents to chase deadlines, Q&A responses, and compliance gaps.
- **Client need:** "The moment it approves it ... issues a task ... once it is signed they will have access to the deal room."
  - **Commitment (Ghiles):** Complete the approval -> task -> data-room access workflow.
- **Client need:** "What we can do is ... reconvene ... to go to the next sections introducers fees reconciliation ..."
  - **Action:** Schedule the follow-up working session to cover introducers, fee reconciliation, and remaining modules.
