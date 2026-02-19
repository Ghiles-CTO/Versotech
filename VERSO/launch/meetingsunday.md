Feb 1, 2026
Versotech / next steps - Transcript
00:00:00
 
Ghiles Moussaoui: Good. What about
Fred Demargne: Yeah, I'm a bit bit tired to be honest.
Ghiles Moussaoui: you?
Fred Demargne: I've done lots of data crunching today and it's tiring. But what about you? Is it cold in or is it better?
Ghiles Moussaoui: Hello.
Fred Demargne: Is it cold in it?
Ghiles Moussaoui: Yeah, it's still cold. It's about - 10° outside.
Fred Demargne: Minus
Ghiles Moussaoui: So yeah,
Fred Demargne: 10.
Ghiles Moussaoui: it's a bit cold, but I think just these last two days, but uh previously was better.
Fred Demargne: Okay,
Ghiles Moussaoui: Where are you right now?
Fred Demargne: we're in Paris.
Ghiles Moussaoui: Paris. Okay,
Fred Demargne: Yeah.
Ghiles Moussaoui: nice.
Fred Demargne: So um when are we going to manage to finalize this data migration for Verso Capital One?
Ghiles Moussaoui: Okay. So, you sent me another email just right
Fred Demargne: What do you
Ghiles Moussaoui: now.
Fred Demargne: think?
Ghiles Moussaoui: The gap is So, you're saying there's still mismatches.
Fred Demargne: I can't hear you.
Ghiles Moussaoui: Oh.
Fred Demargne: I don't know if it's me or your connection, but it's uh it's breaking out.
 
 
00:01:35
 
Ghiles Moussaoui: Can you hear me right now?
Fred Demargne: Yeah, I can hear you relatively well. I don't know. Let's see if you speak a bit longer to see if it works.
Ghiles Moussaoui: Yeah. Okay. Okay. I just took off my uh headphones. Here's the headphones.
Fred Demargne: Okay,
Ghiles Moussaoui: Okay. So yeah.
Fred Demargne: there it's better.
Ghiles Moussaoui: Um
Fred Demargne: So what I did what I did uh so there's only one compartment where there's a gap is VC 106. So I compared uh so there was a gap two weeks ago and I realized the gap
Ghiles Moussaoui: okay.
Fred Demargne: was exactly the amount of fees for verso partner. So that's why I initially asked you to add virtual partner and then since then uh I'm I've not been able to to match the the amount of fees. So now with what you did last night,
Ghiles Moussaoui: Yeah.
Fred Demargne: I have u I realized that there was one mistake in the dashboard which I corrected. So now I'm I'm able to match the investment amount fees with for 90 what was it
 
 
00:02:47
 
Ghiles Moussaoui: I think the your voice is
Fred Demargne: 98.
Ghiles Moussaoui: Yeah.
Fred Demargne: My voice my voice is breaking.
Ghiles Moussaoui: Not anymore, but it was a little bit. I will let you know if there if if I'm not hearing you. So,
Fred Demargne: Let me check if my daughter is doing stuff.
Ghiles Moussaoui: please.
Fred Demargne: One
Ghiles Moussaoui: Okay.
Fred Demargne: second. No, she doesn't seem to be. So, let's see. Otherwise, I'm going to have to collect from my phone.
Ghiles Moussaoui: Yeah.
Fred Demargne: Uh so I was saying that um from the last version you sent last night or today I don't remember I was able to match for VC 106 the invested amount fee for a total of
Ghiles Moussaoui: Okay.
Fred Demargne: 98,546 because I corrected the dashboard. So there's one line which is missing on your D on the on your data probably and I mentioned to you the specific row to him to to maybe he can do it
Ghiles Moussaoui: Okay.
Fred Demargne: manually uh into the
Ghiles Moussaoui: Okay.
Fred Demargne: system.
 
 
00:04:14
 
Ghiles Moussaoui: Sorry. When did you update the dashboard?
Fred Demargne: Uh it was be when I sent you the email. So it was
Ghiles Moussaoui: Yeah, I think I'm running old version from last week,
Fred Demargne: uh
Ghiles Moussaoui: so I didn't update it because I need
Fred Demargne: I just I just changed one one cell. It's two cells.
Ghiles Moussaoui: Yeah.
Fred Demargne: It's just one row, two cells. So maybe you can do it manually into the database.
Ghiles Moussaoui: Okay. Yeah.
Fred Demargne: You check the row in the compartment and then maybe you just need to uh so
Ghiles Moussaoui: Okay.
Fred Demargne: by doing this chain on the dashboard I could match the total amount for the invested amount fees. However,
Ghiles Moussaoui: Okay.
Fred Demargne: the spread does not match and there is
Ghiles Moussaoui: Okay.
Fred Demargne: a difference of 46,796 and I was trying to look for the and it's not straightforward because I need to go one by one.
Ghiles Moussaoui: Okay.
Fred Demargne: I realize that the Lee run group there's a problem here. There is some fees missing.
 
 
00:05:26
 
Fred Demargne: Yeah.
Ghiles Moussaoui: Yeah.
Fred Demargne: in the spreads and also mentioned to you that lead run group is not the investor but that's our mistake Julian added the name in entity just to remember that they were together uh when the relationship was made but um the investors are the individual people with their names in the dashboard so Lee group is an introduc I don't
Ghiles Moussaoui: Yeah.
Fred Demargne: even know if it's an introducer I think it's an introducer Yeah, it's part of versi if you want.
Ghiles Moussaoui: Okay. Okay.
Fred Demargne: Okay.
Ghiles Moussaoui: So I think dashboard
Fred Demargne: So, so there are several lines I which are
Ghiles Moussaoui: object.
Fred Demargne: missing
Ghiles Moussaoui: Okay. Um I think as far as I understand there is first a mismatch between the file I'm using for the dashboard and also the lean group issue. But when I um the thing is the way it is structured inside the database is not the same as um inside the file right the file I I sent to you it's
Fred Demargne: Yeah.
Ghiles Moussaoui: not row based but fee based so the commissions is different and this is why for example there will be subscriptions performance subscriptions with zero there but um yeah there is one issue the other issue um I think I identified from the emails is that the uniques for example the Sandra and the Eric rows right they have twice 50,000 uh for Sandra and there's twice 100,000 for
 
 
00:07:16
 
Ghiles Moussaoui: Eric so this is how I extracted it from the dashboard and I kept it the subscriptions directly um so that's how I did it but
Fred Demargne: Okay.
Ghiles Moussaoui: for for me I find the same spread uh as long as I you know, I fixed the Lee brand group. Um, so yeah.
Fred Demargne: Lan group the Lan group gap was not 46,000 so there must be something
Ghiles Moussaoui: Okay.
Fred Demargne: else the the change I made on the dashboard is just for it's just two cells and uh that that doesn't impact the
Ghiles Moussaoui: Yep.
Fred Demargne: spread that impact the the fee the invested amount but so as soon as you add it to your database we will be 100% matching.
Ghiles Moussaoui: Yeah. for my internal calculations I find I find like for versal partner
Fred Demargne: So,
Ghiles Moussaoui: spread the total in um VC06 I believe is 2 million uh 11,173 with a rounding of 5 cents.
Fred Demargne: no, no,
Ghiles Moussaoui: How much should it be?
Fred Demargne: that's not correct. So if you look at the dashboard online, it should be 2,68,621.80.
 
 
00:08:43
 
Ghiles Moussaoui: Okay. So I think the issue is my uh the dashboard I have here because I'm doing from dashboard apart um and DB apart and I'm coming to the same conclusion on my end but it's different uh
Fred Demargne: If you look at the dashboard, look at the dashboard online because we haven't changed this one. If you look at the dashboard online and you go all the way down, you will have the total in the row 224, you have the total for the
Ghiles Moussaoui: Got it.
Fred Demargne: fees.
Ghiles Moussaoui: So let me uh you're not aware if there is any other any other changes in the dashboard.
Fred Demargne: No, no, there is nothing. Uh the only thing I just I I haven't changed hasn't changed anything on the dashboard except what
Ghiles Moussaoui: Good idea.
Fred Demargne: I just realized now. uh these two the two cells but the two cells does not impact this number on the on the
Ghiles Moussaoui: Yeah.
Fred Demargne: column BA the the uh this was not impacted so the total
Ghiles Moussaoui: I understand.
Fred Demargne: here you see is 2 million76 you just have to take into account that one of the partner is Simony in the row 2 16 uh 15 sorry so if you do two 2,76,000 minus 8,1 196 you have 2,61 68. So I don't know what's what's wrong when you export it,
 
 
00:10:20
 
Ghiles Moussaoui: Okay.
Fred Demargne: but the dashboard online is that part of the dashboard has not changed for for probably several years.
Ghiles Moussaoui: Okay.
Fred Demargne: And uh and the total amount here is is what I'm trying to match.
Ghiles Moussaoui: Okay. I think uh it could be an extraction issue, but I need to take a look. So, I'm currently taking a look into it. I will re extract it. Recalculate the amount in
Fred Demargne: Okay.
Ghiles Moussaoui: T.
Fred Demargne: Okay.
Ghiles Moussaoui: And um
Fred Demargne: What about the emails of the investors?
Ghiles Moussaoui: so
Fred Demargne: Where are you on this for virtual
Ghiles Moussaoui: u the last bunch you sent to me uh
Fred Demargne: capital?
Ghiles Moussaoui: included the asset managers, right? So I included that.
Fred Demargne: Yes.
Ghiles Moussaoui: Uh that was the last push but um the asset manager did not create them because I thought okay we need to discuss it first. So I have the architecture and then I create their accounts and so it's you know correctly linked with the investors you referred to inside the files.
 
 
00:11:51
 
Ghiles Moussaoui: So yeah, that's uh where I am at when it comes to that. Uh is sent
Fred Demargne: So if I go if I go in production I will find those I will be able to check
Ghiles Moussaoui: you.
Fred Demargne: this that the email addresses are correct.
Ghiles Moussaoui: Yes.
Fred Demargne: So let me try to check quickly now. So that's not production here. This is okay. This is production here. So uh if I took one example Okay. Here. So, for instance, if I look, it's not here. It's not this one. What was the name? It was the emails. No. Yeah, it was the emails. Okay. Okay. So if I put safe for instance, so I need to look is there is it a different category as a user or it's under introducers.
Ghiles Moussaoui: Uh, I understand what you mean.
Fred Demargne: If I if I look for for an asset manager on in in
Ghiles Moussaoui: No, asset managers did not add them.
 
 
00:13:29
 
Ghiles Moussaoui: As I told you, I added the emails for investors.
Fred Demargne: production
Ghiles Moussaoui: Asset managers, I'm waiting to discuss the structure. uh so I don't make mistakes uh from the beginning. I sent you a file I think for the PRD of what est manager should be with the email template remember but we do not get into it
Fred Demargne: Okay. Is it normal that there is a S in the production platform? S with B
Ghiles Moussaoui: the name yeah it was just an account
Fred Demargne: at.com.
Ghiles Moussaoui: they created as the CEO So for login uh I I created just to log in but I can delete it. It's not visible to investors, but the moment we launch, you can clean all of that or change it to my name or something like
Fred Demargne: Okay. Okay. So, no worries.
Ghiles Moussaoui: that.
Fred Demargne: Uh, so for the asset manager, why don't we at least have them in the system? Uh, even if we don't set up anything yet because if we want to launch quickly, um, we still need to review this and, uh, it's not straightforward.
 
 
00:14:51
 
Ghiles Moussaoui: Okay.
Fred Demargne: So if we were going to to put in to start to to to launch without having the logic of asset manager,
Ghiles Moussaoui: Mhm.
Fred Demargne: I think at minimum what I would want to be able to see is the asset manager
Ghiles Moussaoui: Yep.
Fred Demargne: appearing as a as a user type and
Ghiles Moussaoui: Mhm.
Fred Demargne: the relationship with the investors in
Ghiles Moussaoui: Um yeah, the the relationship
Fred Demargne: uh for the past for the past commission that was
Ghiles Moussaoui: is
Fred Demargne: paid.
Ghiles Moussaoui: the is there in the file? Did you include the past commissions?
Fred Demargne: Uh the past commission if they if they are they will be in the dashboard
Ghiles Moussaoui: How do I identify if an asset manager is in dashboard? Is it the name matching?
Fred Demargne: by the name by the name
Ghiles Moussaoui: Okay. So, could they be I mean for now we we took all of the partners introducers and we turned them into introducers. Does that mean I need to search for the asset managers among the introducers we
 
 
00:15:58
 
Fred Demargne: Yeah.
Ghiles Moussaoui: extracted and uh change them to asset managers in the system and link them to the investors?
Fred Demargne: Yeah.
Ghiles Moussaoui: Is that how it should be done? Okay,
Fred Demargne: Yeah.
Ghiles Moussaoui: I already did that.
Fred Demargne: I'm not sure there are many to be honest because I see the names that we use.
Ghiles Moussaoui: Yeah.
Fred Demargne: I don't think uh there is much uh cross um
Ghiles Moussaoui: Yeah. Yeah.
Fred Demargne: so it shouldn't be an issue from a data perspective and and all the emails of the investor did you manage to and the emails for the introducers did you manage to do that well too?
Ghiles Moussaoui: Uh I think so. Yeah, because all of I think all of the files you told me to add emails I did it. Um maybe there is a couple of
Fred Demargne: Okay.
Ghiles Moussaoui: mismatches. Um I don't remember but I don't think there is any mismatch otherwise it is documented on my end uh because
Fred Demargne: So you think you could do an extract of the before we we move to the verso capital
 
 
00:17:05
 
Ghiles Moussaoui: yeah
Fred Demargne: 2 SCSP. Do you think you can do an extract and see the the the users whether they are investor, introducer, whatever where you are missing an email address.
Ghiles Moussaoui: I will get it done by tonight. I will Yeah,
Fred Demargne: So that we can we know exactly what we are missing for one of the vehicle before we move to the next.
Ghiles Moussaoui: I will send it to you tonight. Um okay. So that is
Fred Demargne: Okay.
Ghiles Moussaoui: clear.
Fred Demargne: So now I need to be before so I know Julian copied you in but I need to review the document that Julian sent about Verso Capital 2 SCSP because I am not sure that it's completely consistent. Uh I think they have done it very quickly just to make sure that they can send something. So I need to check um and also when there is an introducer email if we don't have the name of the introducer then it's not going to work. Uh so they sometime they put introducer email with an email and there is no introducer under name.
 
 
00:18:22
 
Ghiles Moussaoui: Yeah,
Fred Demargne: So we will not be able to use this information like this.
Ghiles Moussaoui: I think are are you sure the calculation on the dashboard
Fred Demargne: So
Ghiles Moussaoui: is correct?
Fred Demargne: what calculation do you
Ghiles Moussaoui: See the spread?
Fred Demargne: mean?
Ghiles Moussaoui: I'm still finding um 11,000 not 76.
Fred Demargne: You mean the sum?
Ghiles Moussaoui: Yeah.
Fred Demargne: Are you asking me if the sum in Excel is correct?
Ghiles Moussaoui: Yeah.
Fred Demargne: Uh I have a backup uh offline and I get the same sum.
Ghiles Moussaoui: Okay. So when you calculate it,
Fred Demargne: So yes.
Ghiles Moussaoui: you get the same sum or are you defaulting to the sum that is calculated or you're doing
Fred Demargne: Yeah,
Ghiles Moussaoui: it
Fred Demargne: I did both. I can redo it now. Just just uh to check. Maybe it's a format issues. Maybe some of the when you extract is doing a funny thing and some of the numbers are converted into string. So when you add up it doesn't add up.
 
 
00:19:34
 
Ghiles Moussaoui: Oh, let me see.
Fred Demargne: So is there any hidden line? So I'm just checking now and the sun is correct. I'm just want to see if there is any hidden u row. This one. No, no, it's correct.
Ghiles Moussaoui: Okay.
Fred Demargne: There could be an issue with the
Ghiles Moussaoui: Yeah,
Fred Demargne: format.
Ghiles Moussaoui: I will investigate and see.
Fred Demargne: If I could I could have if I could have found the gap exactly I would have told you but the total gap
Ghiles Moussaoui: Yeah.
Fred Demargne: is I say it to you by email and then I know le so the lean group there's a problem there it doesn't explain the gap
Ghiles Moussaoui: Mhm. Okay. And uh can I default to can I refer to these as uh I mean the sums as uh something correct all the time. Previously when I told you um in the previous DB I extracted the dashboard and uh I discussed it with Julian. He told I told him I found some mismatches in the sums.
 
 
00:21:01
 
Ghiles Moussaoui: He told me uh there could be some mismatches. So I never defaulted to the sums to
Fred Demargne: No,
Ghiles Moussaoui: verify.
Fred Demargne: there shouldn't be there shouldn't be any mismatch because we you the dashboard is has been used by auditors by accountants and they never identify any
Ghiles Moussaoui: Okay.
Fred Demargne: mismatch. So many people worked on this uh dashboard to do know even to audit our accounts. So I doubt that there is any gap and for the other compartment I checked the extraction you sent me with the dashboard and it was matching.
Ghiles Moussaoui: Okay.
Fred Demargne: So it's just this compartment who is not matching.
Ghiles Moussaoui: Okay.
Fred Demargne: So so once you we finalize this small gap in the spread once we double check the email addresses then in parallel now I'm going to check the data that Julian sent. uh once it's clean I'll send it to you
Ghiles Moussaoui: Okay.
Fred Demargne: cleaned so that you I basically what I what I'm going to tell you I'm not going to what is the best way to do it I think the best if you agree the best way to do it will be the following so I will make sure that the dashboard online for those compartment in VC capital 2
 
 
00:22:36
 
Ghiles Moussaoui: Yep.
Fred Demargne: are correctly uh associated So between for each transaction between the investor and the introducer and
Ghiles Moussaoui: Yeah. Yeah.
Fred Demargne: then as a separate file I'll send you the introducer name and the introducer email and the contact and the name of
Ghiles Moussaoui: Mhm.
Fred Demargne: the introducer like like we did
Ghiles Moussaoui: Okay. So I think um as long as the pattern
Fred Demargne: before.
Ghiles Moussaoui: in the dashboard is clear it's like the same uh then it would be
Fred Demargne: is the same.
Ghiles Moussaoui: forward because for
Fred Demargne: Yes, it is the same.
Ghiles Moussaoui: example
Fred Demargne: You just need to if you want I can go we can check together because maybe you know exactly what you need to check.
Ghiles Moussaoui: yeah
Fred Demargne: So if you go to the online dashboard and you go further on the right hand
Ghiles Moussaoui: okay yeah I am See which
Fred Demargne: side.
Ghiles Moussaoui: one?
Fred Demargne: So you see you have one tab which says VC SCSP2 with
Ghiles Moussaoui: Yeah, I
Fred Demargne: a a triangle arrow and then so from there you have the
 
 
00:23:36
 
Ghiles Moussaoui: know.
Fred Demargne: VC capital 2.
Ghiles Moussaoui: Yeah, I know
Fred Demargne: So,
Ghiles Moussaoui: this.
Fred Demargne: so if you look normally it's exactly the same
Ghiles Moussaoui: Yeah, I mean um not the structure this but um see for example when there is
Fred Demargne: structure.
Ghiles Moussaoui: negative number previously there was some stuff like that or the renaming is it done based on the same meaning if I find an investor here and we did some renaming on it previously right and now I will add another investor because we renamed it and then we need to rename it because it's on the same name uh the same thing for the introducer so which will create duplicates and then inside the dashboard duplicates of multiple records in DB and it will create some issues right because we did a lot of renaming. Um so that is one thing um when I say
Fred Demargne: Yeah. So, normally at the moment,
Ghiles Moussaoui: structure.
Fred Demargne: if I'm if I'm correct, you have zero data for Verso Capital 2 in
Ghiles Moussaoui: Yeah. Correct. Yes of
 
 
00:24:41
 
Fred Demargne: production. So, let's make sure because I you need to be tough on me.
Ghiles Moussaoui: course.
Fred Demargne: So that maybe we lose one day but the the file that we have to load is 100% correct.
Ghiles Moussaoui: Yeah.
Fred Demargne: So I will check I will try to make sure as much as I can but it's a manual job so I can I can make mistakes that the the name of the introducer in the dashboard that
Ghiles Moussaoui: Yep.
Fred Demargne: you have where you where you at will be exactly the same as the name of of the
Ghiles Moussaoui: Uhhuh.
Fred Demargne: introducer in the other spreadsheet with the contact details.
Ghiles Moussaoui: Yeah.
Fred Demargne: So I will try to make sure of this.
Ghiles Moussaoui: Yeah.
Fred Demargne: So that's and and and I will because they are more recent there is less there's I think there is less risk to to need to change the names and the reason why I was I was asking Julian in a in a WhatsApp group to to do this reconciliation
Ghiles Moussaoui: Okay.
Fred Demargne: is because I've been waiting for him for months and a half to
 
 
00:25:44
 
Ghiles Moussaoui: Yeah.
Fred Demargne: basically link the latest transactions so that you know the d the
Ghiles Moussaoui: Okay.
Fred Demargne: dashboard needs to give a single source of truth. So everything so this is the main reference. So until we completely migrate to the platform,
Ghiles Moussaoui: Yeah.
Fred Demargne: we need to make sure that this is 100% sure uh correct. So I want to make sure that everything there is correct and then for whatever for the email and stuff has a different purpose than the dashboard.
Ghiles Moussaoui: Mhm.
Fred Demargne: So that should be that should be okay.
Ghiles Moussaoui: Okay. Yeah. uh that works then um if it's straightforward I can get it done in a day. It's just you know the same pattern. I have multiple scripts um I iterate to match it exactly. It will be fine for that.
Fred Demargne: All right. So, so that's I will try to finalize this tonight to be able to send you
Ghiles Moussaoui: All right. Great. Yeah.
Fred Demargne: something for virtual capital 2 SCSP that uh
 
 
00:26:54
 
Ghiles Moussaoui: Great.
Fred Demargne: maybe if I'm falling asleep before I send it to you then I will have to work on it tomorrow morning first thing in the morning.
Ghiles Moussaoui: Okay.
Fred Demargne: Okay. Um so that's one thing for the data then in terms of functionalities. So let's put aside the asset manager for a second. Uh we discussed several things recently.
Ghiles Moussaoui: Yep.
Fred Demargne: U so I sent you the statuses for the users.
Ghiles Moussaoui: Yeah. Yeah.
Fred Demargne: Was that clear to
Ghiles Moussaoui: Uh I implemented it on account on an account uh scope,
Fred Demargne: you?
Ghiles Moussaoui: right? So um the new and then incomplete and then KYC I think approval pending or something. Um it was basically the same flow before but with different statuses. So I put the statuses there. I blocked the NDA um for you know people that don't have an account that is active. I created an approval for a CEO once all of the KYC is submitted and approved to basically put the account as active.
 
 
00:28:09
 
Ghiles Moussaoui: So they can uh start to transact before that they can only see what uh was displayed for them before right as we discussed it. And I changed uh what was not changed before. For example,
Fred Demargne: Yeah.
Ghiles Moussaoui: the term sheet what what we discussed. Um so yeah, the fields that are by default now appear by default and you can edit them directly.
Fred Demargne: Let's finish on the user. Let's finish on the user before you move to the term sheets.
Ghiles Moussaoui: Okay, that's basically
Fred Demargne: So I understood that there were two things with from what I understood was different apart from
Ghiles Moussaoui: Okay.
Fred Demargne: the different statuses. One was the CEO does not approve does not activate an account.
Ghiles Moussaoui: Yeah, now it's Yeah,
Fred Demargne: It's just as soon as the CEO approve the KYC and everything then
Ghiles Moussaoui: that was Yeah,
Fred Demargne: automatically the user is
Ghiles Moussaoui: now I changed it.
Fred Demargne: approved.
Ghiles Moussaoui: Once all of the KYC's are approved including the KYC personal information or just documents then uh what is generated automatically is an approval for the CEO.
 
 
00:29:20
 
Ghiles Moussaoui: Once that approval is um first you can reject it and the account changed to rejected and
Fred Demargne: Okay.
Ghiles Moussaoui: they can you know they can still not transact but they need uh with they need the note for see what is missing so they uh do the work again. So that is uh done. All right.
Fred Demargne: Okay.
Ghiles Moussaoui: And then when the C approved um approves that the account becomes active and they will be able to transact and go through the transaction flow which is subscriptions and like and all.
Fred Demargne: Okay,
Ghiles Moussaoui: So that is done. Um the other
Fred Demargne: perfect. And then what about the u the rejection?
Ghiles Moussaoui: thing
Fred Demargne: Did you also had this functionality if the co reject the information received by the user because he doesn't want this user to work with
Ghiles Moussaoui: Yeah.
Fred Demargne: us?
Ghiles Moussaoui: So um the blacklist thing um is by default done because a user never gets there if they are blacklisted. If they are deactivated uh if their email or yeah if their email is deactivated then directly uh they won't be able to do anything.
 
 
00:30:30
 
Fred Demargne: No, I was not suggesting to deactivate the email. I was suggesting just to so before the blacklist I was talking about the rejection.
Ghiles Moussaoui: Yes.
Fred Demargne: So to be blacklisted you need to have been approved in the past but uh for
Ghiles Moussaoui: Mhm.
Fred Demargne: some user they will never been approved. They will be rejected.
Ghiles Moussaoui: Oh, okay. Yeah.
Fred Demargne: Uh this flow this flow existed.
Ghiles Moussaoui: Yeah.
Fred Demargne: Yeah.
Ghiles Moussaoui: Uh it was it was a rejection and now I I added the notification um
Fred Demargne: Okay.
Ghiles Moussaoui: beforehand. Before uh when they are rejected nothing happens really but now there is a loop where okay gets rejected you have more information about about why you are rejected then uh you know you are able to uh put more documents or do what is necessary and then
Fred Demargne: Perfect.
Ghiles Moussaoui: the approval will be done again and then again the co approves or rejects and
Fred Demargne: No, if you are I mean it's nice to have the flexibility but in theory when you are rejected it's it's it's it's it's a final state.
 
 
00:31:32
 
Ghiles Moussaoui: Okay. So, we
Fred Demargne: If if if there is a problem with the documentation and we request further
Ghiles Moussaoui: Yeah.
Fred Demargne: information the status is incomplete.
Ghiles Moussaoui: Yeah.
Fred Demargne: So there could be several thing which are missing the personal detail, the KYC,
Ghiles Moussaoui: Yes. Yes.
Fred Demargne: the questionnaire and there is a specific case for the entity
Ghiles Moussaoui: So,
Fred Demargne: because here you need to send notification to each member of an entity. But this is if we request some clarification we are in an intermediate state called
Ghiles Moussaoui: Yeah. Yeah.
Fred Demargne: incomplete.
Ghiles Moussaoui: I understand. uh and the status work how it is done basically if it is rejected but there is some document that needs to be done and the person sees notification and they go re-upload the document the status goes back to incomplete because then the KYC is still pending right and after the KY
Fred Demargne: Okay. In theory when you are I mean I think it's okay for the moment.
Ghiles Moussaoui: Okay.
Fred Demargne: We'll see how it works.
 
 
00:32:32
 
Fred Demargne: I think the way it was defined it was supposed to be a final state.
Ghiles Moussaoui: Yeah.
Fred Demargne: So if you are rejected is because you have provided all the information that we we could review
Ghiles Moussaoui: Yeah.
Fred Demargne: and we the CEO decided not to authorize this
Ghiles Moussaoui: Sure. Yeah.
Fred Demargne: user at all.
Ghiles Moussaoui: Yeah. I can do that. It does not take
Fred Demargne: Uh if you I mean if it's complex for you we can leave it the way it
Ghiles Moussaoui: much.
Fred Demargne: is at the moment and see how it goes.
Ghiles Moussaoui: Five minutes.
Fred Demargne: But uh but the no yeah the the the point is as long as the CEO has not made a final decision and request additional information the state is
Ghiles Moussaoui: Yeah.
Fred Demargne: incomplete as soon as and then the decision the CEO can can make is I
Ghiles Moussaoui: Okay.
Fred Demargne: approve or I reject those are final states uh except with now the
Ghiles Moussaoui: Yeah.
Fred Demargne: blacklisted. So if you have been approved in the past and we have a a
 
 
00:33:26
 
Ghiles Moussaoui: Mhm.
Fred Demargne: major issue with a user, we need to be able to blacklist him.
Ghiles Moussaoui: Yep.
Fred Demargne: Blacklist him doesn't mean that we delete his account because we cannot. They he has rights and there's a GDPR.
Ghiles Moussaoui: Yeah.
Fred Demargne: All the data belongs to him. So the the way I was I I thought about it is um he is basically cannot access at room cannot confirm any interest cannot invest under any circumstances.
Ghiles Moussaoui: Yep.
Fred Demargne: So we as if it was never been approved.
Ghiles Moussaoui: Yep.
Fred Demargne: Uh and he can automatically we don't delete the deals where he was supposed to be active.
Ghiles Moussaoui: Yep.
Fred Demargne: Uh but if the CEO wants on top of not working with a guy anymore, if he wants to block him right away on everything, he's just blocking the open deals that was uh available to
Ghiles Moussaoui: Mhm.
Fred Demargne: him. So in in other in in saying in another way, basically this user will only see his details.
Ghiles Moussaoui: Mhm.
Fred Demargne: Uh if he had invested before, he will see his investments.
 
 
00:34:44
 
Ghiles Moussaoui: Mhm.
Fred Demargne: uh but he will not see any other new deals. He will not be able to do anything else than reading the
Ghiles Moussaoui: Yep.
Fred Demargne: information that belongs to him.
Ghiles Moussaoui: Got it.
Fred Demargne: And if he and if he wants to be deactivated and I know we have the possibility to deactivate him but
Ghiles Moussaoui: Yeah.
Fred Demargne: before we deactivate him we will have to uh make sure that we can upload and send all the data of this account to him.
Ghiles Moussaoui: To him. Yeah, of course. Yeah,
Fred Demargne: Yeah.
Ghiles Moussaoui: it makes sense.
Fred Demargne: So that that is um so I believe this was was a new uh feature that you didn't have. So, I don't know if you already implemented it or if you need a bit more
Ghiles Moussaoui: No. unauthorized it's for me um it's done automatically in the
Fred Demargne: time.
Ghiles Moussaoui: platform right because you will still be if you're rejected for example it's still by default um I understand what you know what you mean now if it is approved but later you want you want the option to um you know unauthorize them okay
 
 
00:35:55
 
Fred Demargne: Yes.
Ghiles Moussaoui: so yeah that is new and it's not implemented yet because I thought okay in the flow from the beginning what happens only the beginning if user is unauthorized uh or rejected and all it's all the
Fred Demargne: Yeah.
Ghiles Moussaoui: same state they end up um with so they can see but they cannot um transact. So the transaction flow is what is blocked or not blocked based on the status.
Fred Demargne: Okay.
Ghiles Moussaoui: Yeah.
Fred Demargne: So I think maybe this you can do it right after the launch. I don't know. It's I don't I don't really I don't know if there's any side effect on something else uh which will then create an issue with all the statuses and stuff. So maybe uh we can move this to after the right after the launch.
Ghiles Moussaoui: I think yeah it's not does not take much because it's something add on top
Fred Demargne: Um
Ghiles Moussaoui: in the user in the account page you go there you can have a button to unauthorize them if you want and that will just change a label uh a boolean inside the database and uh that's it.
 
 
00:37:03
 
Ghiles Moussaoui: And the code just makes sure that okay if boolean is active uh then they cannot do uh what they cannot do.
Fred Demargne: Okay.
Ghiles Moussaoui: Yeah.
Fred Demargne: So if you're comfortable then go ahead but afterwards just a question of time and priority.
Ghiles Moussaoui: Yep.
Fred Demargne: I think this one is less of a priority for the launch than the data and then what we discussed
Ghiles Moussaoui: Okay.
Fred Demargne: last week about the term sheet that's
Ghiles Moussaoui: Uh yeah. So what we discussed if I remember correctly was first uh all of the
Fred Demargne: Friday.
Ghiles Moussaoui: defaults uh that have so for example the two to um the two field the purchaser and also the date was missing so I added the date. Um so basically the defaults will appear as text directly and you can edit it right when you create a new sheet or um and basically yeah if you don't edit it it keeps the value if you edit it uh then changes so there is one thing
Fred Demargne: Exactly.
Ghiles Moussaoui: and the the way to write the issuer and the vehicle was updated I use the exact uh example you created with vehicle 600 series 600 to extract that.
 
 
00:38:17
 
Ghiles Moussaoui: Uh I changed the HTML template to remove the buy and also remove
Fred Demargne: Okay.
Ghiles Moussaoui: the text field for price. Uh yeah, price per share and now it's only um the number.
Fred Demargne: Okay.
Ghiles Moussaoui: Uh I think that was that was all. No,
Fred Demargne: Yeah, I think that was the major thing. So is it is it now in local or also in the uh testing
Ghiles Moussaoui: no, it's done on local. I was testing the the activation for all of the personas.
Fred Demargne: environment
Ghiles Moussaoui: Uh so yeah, I just finished before I went to the gym. So I would push tonight. I will have a new version in both the user and production with all of the fields. Um yeah.
Fred Demargne: I think I would prefer the user and the term sheet changes to be only available in in test.
Ghiles Moussaoui: Okay, I can push to test uh and then we can validate test and then push everything to I have multiple commits.
Fred Demargne: Exactly.
Ghiles Moussaoui: I have about 10 commits uh pending not pushed yet including
 
 
00:39:25
 
Fred Demargne: Yeah,
Ghiles Moussaoui: the
Fred Demargne: I would prefer I would prefer I will I will ask Clude to tell me all the comments that you have in production and I prefer just to have a look quickly and then uh then we can go ahead if after I review it I would prefer that for the moment in production we only focus on
Ghiles Moussaoui: Yeah.
Fred Demargne: data uh we first discuss so that when it's done and we can start
Ghiles Moussaoui: Yep.
Fred Demargne: loading stuff uh after I review it.
Ghiles Moussaoui: Okay.
Fred Demargne: I'll try to do it tonight as well if I don't do it tonight, I will do first thing tomorrow morning uh to be able to give you a go ahead. Uh but in test as soon as you test in local and it works you can load in in test this there is no
Ghiles Moussaoui: Yeah.
Fred Demargne: problem just let me know or so I know it's done and then I can
Ghiles Moussaoui: Yeah. Mhm.
Fred Demargne: I can check myself as well.
Ghiles Moussaoui: All right. Got it.
 
 
00:40:16
 
Ghiles Moussaoui: Uh, one thing I don't know is I don't know if unpushed commits appear inside the MCP when you connect it to GitHub. I'm not sure about this. Um if you if you ask Claude,
Fred Demargne: Let me
Ghiles Moussaoui: yeah,
Fred Demargne: ask
Ghiles Moussaoui: tell it what are the commits that are not pushed yet.
Fred Demargne: in the chat or in the
Ghiles Moussaoui: Um the
Fred Demargne: code.
Ghiles Moussaoui: chat
Fred Demargne: Okay. sites here. I'm going to send again the message because I did it before. So I will use can you please list up let's see I need do I need to specify the repository or it's going to check for both of
Ghiles Moussaoui: Uh no there is only one repository connected to
Fred Demargne: them the
Ghiles Moussaoui: it.
Fred Demargne: production
Ghiles Moussaoui: Uh yeah there is only one repository. It's it's routing right? It's a branch thing uh for production and testing.
Fred Demargne: Okay.
Ghiles Moussaoui: It's not uh a different repo.
Fred Demargne: Okay. So, he's searching now.
 
 
00:43:05
 
Fred Demargne: You still thinking?
Ghiles Moussaoui: I know I found I think I think I found the the number
Fred Demargne: I know I need to allow I need to allow here.
Ghiles Moussaoui: to
Fred Demargne: There is um a button to press. So there are 15 commits.
Ghiles Moussaoui: okay that are not pushed yet.
Fred Demargne: Yeah, that's what it's telling me.
Ghiles Moussaoui: It can tell you.
Fred Demargne: Some of them are I think some of them are very technical.
Ghiles Moussaoui: It can tell you in nontechnical talk
Fred Demargne: There's one for it says verify spread fee calculation
Ghiles Moussaoui: spreadsheet.
Fred Demargne: calculation
Ghiles Moussaoui: Uh
Fred Demargne: clarify invoice UI labeling
Ghiles Moussaoui: Wait, how is it displayed to
Fred Demargne: Let me share my
Ghiles Moussaoui: you?
Fred Demargne: screen.
Ghiles Moussaoui: Okay.
Fred Demargne: Can you see my screen?
Ghiles Moussaoui: Yep.
Fred Demargne: So that's So I said, "Okay, can you please list the latest commits?" And I've got the latest
Ghiles Moussaoui: Uh no, all of these January 22.
Fred Demargne: commit.
Ghiles Moussaoui: Um I mean I pushed um all of these you can it's better to ask it uh the Yeah.
 
 
00:44:45
 
Ghiles Moussaoui: So that means that basically uh from January 22 I did not push any code. So locally I am many commits ahead but did not push them. Uh for example just today I created about five not in
Fred Demargne: So I put latest commit not being uh
Ghiles Moussaoui: production not pushed yet I don't know if it can find
Fred Demargne: what not pushed.
Ghiles Moussaoui: them.
Fred Demargne: So in the repository and not and not uh pushed in production yet. Do you see the message? Let me check.
Ghiles Moussaoui: Mhm.
Fred Demargne: There's a production branch. So if you deploy from a specific
Ghiles Moussaoui: It's just thinking.
Fred Demargne: branch
Ghiles Moussaoui: Yeah, it's main. Um yeah, it cannot identify what is not in production yet. So it only sees what is pushed to GitHub. It has access to GitHub, not the get work tree. So for that um don't have co-work
Fred Demargne: Is there a prompt that can find to highlight just those
Ghiles Moussaoui: um sorry there is
Fred Demargne: ones?
 
 
00:46:39
 
Ghiles Moussaoui: I think a way yeah there is a way
Fred Demargne: Can we come to the prompt so that we can get this information?
Ghiles Moussaoui: uh but it's could be a little bit technical u you need to set up the git um g control I mean version system. Forgot the name but g um yeah and with g.
Fred Demargne: I think I have I think I have g on my um How do I check if I have it on my laptop? Um,
Ghiles Moussaoui: Um
Fred Demargne: I need to go to the prompt to the comment.
Ghiles Moussaoui: same idea
Fred Demargne: Get help. Let me see if I click get help. If I get if it works. Get help. No. Um,
Ghiles Moussaoui: and
Fred Demargne: if I put get v for the version.
Ghiles Moussaoui: get.
Fred Demargne: Yeah, I have a version 2.41.
Ghiles Moussaoui: Okay,
Fred Demargne: 410.
Ghiles Moussaoui: let me check one thing.
Fred Demargne: Listen,
Ghiles Moussaoui: Yeah, I think it's not possible um to see what is not pushed.
Fred Demargne: if you can if you can do it yourself and send me by email the table,
 
 
00:48:39
 
Ghiles Moussaoui: Yeah. Mhm.
Fred Demargne: uh it's okay. Okay. Don't don't spend too much time on
Ghiles Moussaoui: Yeah, I can send you uh a table of everything that is being done.
Fred Demargne: this.
Ghiles Moussaoui: Um okay. I'm thinking if we need to set up a new um a new repository.
Fred Demargne: Yeah, maybe it would be a good idea. But uh I don't want to create complexity now.
Ghiles Moussaoui: Yeah.
Fred Demargne: Maybe we should do it once we are in production where we are once we are launched.
Ghiles Moussaoui: Okay. Okay. Uh, no. I think if the way
Fred Demargne: I know the branches is the way to go.
Ghiles Moussaoui: because
Fred Demargne: We should need one one repository and just a clear production branch is separate from the test branch.
Ghiles Moussaoui: yes,
Fred Demargne: That should be
Ghiles Moussaoui: yes.
Fred Demargne: enough.
Ghiles Moussaoui: The the issue I found previously is that Versel deploys everything automatically, all the branches.
Fred Demargne: Uh,
Ghiles Moussaoui: So but it gives you uh you know which branch you can go to which version of the code you
 
 
00:49:48
 
Fred Demargne: okay.
Ghiles Moussaoui: can go to. So there is one thing I did not dive into it but I think I can fix it tonight and uh have when I push uh to one branch for the testing it does not go to the main or I can create uh another production branch instead.
Fred Demargne: Yeah, maybe it's easier to put to create a new one for the
Ghiles Moussaoui: Yeah. Okay. All right.
Fred Demargne: production.
Ghiles Moussaoui: I will do that.
Fred Demargne: Okay. All right.
Ghiles Moussaoui: Yeah.
Fred Demargne: So, I think after that, so the last point I wanted to discuss is asset manager.
Ghiles Moussaoui: Yeah.
Fred Demargne: Uh I think it's a bit late now to discuss this to implement it.
Ghiles Moussaoui: Mhm.
Fred Demargne: So we maybe we can discuss tomorrow.
Ghiles Moussaoui: Yeah. Three.
Fred Demargne: Uh ideally for me for the launch what I would like is what I what we
Ghiles Moussaoui: Mhm.
Fred Demargne: discussed before. So to have the asset manager in a specific
Ghiles Moussaoui: Yeah. Yeah, I can do it.
 
 
00:50:51
 
Fred Demargne: database.
Ghiles Moussaoui: If there is not if that is the only thing that is needed, uh it's no problem.
Fred Demargne: Yeah, I think that would be good to have this so that we can identify them already.
Ghiles Moussaoui: Yep.
Fred Demargne: Um when there is a relationship with an investor that we have that relationship as
Ghiles Moussaoui: Mhm.
Fred Demargne: if the relationship was a pure introduction.
Ghiles Moussaoui: Yeah, I understand.
Fred Demargne: So don't create something new in what we need to visualize or so on and then and then u depending on how much time that we
Ghiles Moussaoui: Yep.
Fred Demargne: have to implement the functionality and we will see up to where we can get
Ghiles Moussaoui: Okay. When do you think we we will be able to to launch based on current schedule of let's say if optimistically?
Fred Demargne: I mean I think for me uh from a process point of view I think we are almost there uh with what we discussed on the term
Ghiles Moussaoui: Yeah.
Fred Demargne: sheet.
Ghiles Moussaoui: Yeah.
Fred Demargne: The only thing I haven't tested properly is a is a is is a virtual sign because I was waiting for you to tell me to finish it.
 
 
00:52:05
 
Ghiles Moussaoui: Yeah.
Fred Demargne: Have you are you done with this or
Ghiles Moussaoui: Uh yeah, I think there is like pixelwise not exact mismatches in subscription
Fred Demargne: not?
Ghiles Moussaoui: pack. I left it there. It's very good. Um but yeah, I would like to show you maybe walk you through it a demo or show you all the documents.
Fred Demargne: Okay, we can do it tomorrow if you want.
Ghiles Moussaoui: Yeah.
Fred Demargne: What time is best for you tomorrow to to catch
Ghiles Moussaoui: Um,
Fred Demargne: up?
Ghiles Moussaoui: okay. Do you prefer in the evening or in the morning?
Fred Demargne: I would prefer more towards the end of the morning. I mean I know what time you are waking up because if you work late I suppose you wake up late
Ghiles Moussaoui: Yeah.
Fred Demargne: in the evening I've got uh some late meetings uh from 7 and until 10 so I would be a bit shattered I have to
Ghiles Moussaoui: until 10.
Fred Demargne: say
Ghiles Moussaoui: Uh about 2 hours, I guess, or an hour.
Fred Demargne: that's
 
 
00:53:14
 
Ghiles Moussaoui: Okay.
Fred Demargne: Okay.
Ghiles Moussaoui: Yeah, I can do 11:00 a.m. as well as uh I mean
Fred Demargne: Okay. So, let's do 11.
Ghiles Moussaoui: H.
Fred Demargne: Let's do 11 tomorrow.
Ghiles Moussaoui: All right,
Fred Demargne: That's
Ghiles Moussaoui: 11 works. Then let me book it.
Fred Demargne: okay.
Ghiles Moussaoui: I just sent you What should we cover?
Fred Demargne: All right. What did you say?
Ghiles Moussaoui: What should we cover in the meeting tomorrow? What did you
Fred Demargne: So the all the points that we covered today uh hopefully we have closed the data migration for VC capital 1
Ghiles Moussaoui: Yeah.
Fred Demargne: SCSP. uh we should cover uh so if you can tell me that everything that we discussed on term sheets uh the the statuses for the users that we discussed today except the blacklist if you cannot but if you can obviously you do it but if you cannot I could exclude the blacklist so once you push it in test please send me an email so that I know even if it's late tonight then I will I will start testing before our
 
 
00:54:32
 
Ghiles Moussaoui: Yep.
Fred Demargne: four and then uh depending on how much I've progressed on
Ghiles Moussaoui: Okay.
Fred Demargne: the vessel capital 2 data migration and uh then we can discuss that uh that's what I think we should cover
Ghiles Moussaoui: Okay. All right.
Fred Demargne: for me that's the last we should now try to stick I know J the compliance agent and stuff but I think now we need to try to focus on what we need to finalize for the launch.
Ghiles Moussaoui: Okay, I've created a PRD uh with user stories
Fred Demargne: I think J is also Yeah.
Ghiles Moussaoui: for the compliance agent uh but they did not um start it yet the development. So what I think makes sense is you know uh have a clear test branching environment and so I can work locally and uh yeah I think it can um it can work because most of it is just the compliance agent specifically most of it is just branding right the documents is branding the risk um you know the risk profile is easy because it uses the personal KYC information and all and um I don't know if you check the document he sent but yeah that's basically most of uh what there is and the other one is checking the documents and um yeah and all of it is just notifications uh one is an agent that answers messages so there will be AI there But for the rest it's um mostly just data and branding and a renaming of notifications.
Fred Demargne: Okay,
Ghiles Moussaoui: So yeah.
Fred Demargne: me I have not went through the document yet because
Ghiles Moussaoui: Yeah. Okay.
Fred Demargne: for me we can launch without the compliance engine and we cannot launch without everything else that we are working on. So I'm trying to focus on this.
Ghiles Moussaoui: Yeah.
Fred Demargne: If tomorrow that we see that we made good progress and and you have free
Ghiles Moussaoui: Yeah.
Fred Demargne: time after that and maybe we can we can discuss this in the call the compliance
Ghiles Moussaoui: Yeah. The work Yeah. The the the way I work is that I have always a prior a priority,
Fred Demargne: agent
Ghiles Moussaoui: you know, high priority task which is the main task, but there is always waiting um especially if the script takes a lot of time to compile and extract all of the data. Uh so I am always able to work parallel.
 
 
Transcription ended after 00:57:59

This editable transcript was computer generated and might contain errors. People can also change the text after it was created.
