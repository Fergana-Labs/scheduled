---
slug: scheduled-case-study
title: 'How a Startup CEO Reclaimed 5 Hours a Week with Scheduled'
description: 'Sarah Chen was drowning in scheduling emails. With 40+ meetings a week across investors, customers, and her team, the back-and-forth was eating her alive. Here is how Scheduled changed that.'
date: '2026-03-20'
author: 'Fergana Labs Team'
category: 'Case Studies'
keywords: 'scheduled case study, ai scheduling assistant results, startup ceo productivity, email scheduling automation, scheduled review'
metaDescription: 'Case study: How a startup CEO used Scheduled to automate scheduling emails, saving 5+ hours per week while keeping full control over every reply.'
---

# How a Startup CEO Reclaimed 5 Hours a Week with Scheduled

Our first real test of Scheduled wasn't us — it was handing it to someone with a genuinely chaotic inbox and seeing what happened.

Sarah is a founder friend running a 30-person Series A company. Developer tools. Her calendar is the kind of thing that makes you wince when you see it: 40-plus meetings a week. Board syncs, investor updates, customer demos, one-on-ones with engineering leads, recruiting screens, coffee chats. Every single one of those meetings starts with a thread of emails negotiating when to meet.

I asked her once how much time she spent just on that — the logistics, not the meetings themselves. She did the math and it came out to over five hours a week. Just emails about when to talk.

We'd been building Scheduled to solve exactly this problem. But building something and watching a real person use it are very different things.

## What she'd already tried

Sarah had been through the usual progression.

Calendly was first. It worked for internal stuff and recruiting screens. But she killed it for anything high-touch. Sending a booking link to a VC who just wired you two million dollars feels like sending them a support ticket. Same with enterprise customers. She needed her replies to sound like her, and a "pick a slot" widget doesn't do that.

Then she tried offloading it to her EA. That helped for a few weeks. Her EA is great, but she was also scheduling for two other execs, which meant delays. And the tone was wrong. Sarah writes casually — short sentences, lowercase "hey," first-name basis with almost everyone. Her EA writes like a proper executive assistant. One of Sarah's investors actually asked if she'd hired someone to manage her inbox. That was the end of that experiment.

## Handing it over

Sarah set up Scheduled in about ten minutes. Gmail, Google Calendar — she runs a personal calendar alongside the company one, and Scheduled picked up both. Then it scanned the last 60 days of her sent emails and calendar history.

That scan is the part I was most nervous about. It's where Scheduled learns how you write — your greetings, your sign-offs, your level of formality, how much buffer you like between meetings, which days you keep clear. We'd tested it on our own inboxes a hundred times. Watching it run on someone else's was different.

She didn't have to fill out a preferences quiz. She didn't write a style guide. It just looked at her patterns and figured it out.

I told her to be brutal about the first few drafts. Flag anything that felt off.

## The first week

The first draft Scheduled generated was a reply to an investor who wanted to catch up. It opened with "Hey James" — exactly how she'd start that email. It suggested two afternoon slots. It signed off with "Best, Sarah." Her sign-off. We didn't tell it that. It pulled it from her sent mail.

I'll be honest: I was relieved. We'd been staring at our own drafts for so long that I'd lost the ability to tell if they were actually good. Seeing Sarah skim one, shrug, and hit send felt like the real benchmark.

The intent classification was the other thing I was watching closely. Sarah's inbox is a firehose. Plenty of emails mention dates or times without being scheduling requests — newsletters with event dates, project updates with deadlines, FYI messages from her team. Scheduled correctly ignored all of those. It turns out, getting that classification right was harder than I expected. We'd gone through several rounds of it before it stopped generating phantom drafts for emails that weren't asking for a meeting.

She did make adjustments. She blocked off mornings for deep work, pushed meetings to afternoons, flagged Fridays as mostly off-limits for external calls. Scheduled picked up the changes instantly.

By day three she was spending noticeably less time on it. By day five she told me she trusted it. That was faster than I'd predicted.

## A month in

This is where it got interesting for us, because Sarah stopped thinking about Scheduled at all. That's the goal, obviously. But it's a strange thing to watch someone stop noticing the product you built.

Her flow now: a scheduling email arrives, Scheduled checks her calendars, a draft appears in her Gmail drafts folder. She opens it, skims it, maybe changes a word, hits send. Under two minutes. For her routine one-on-ones she just reviews drafts in a batch at the end of the day.

The multi-calendar thing turned out to matter more than either of us expected. She's got her company calendar, personal calendar, and a shared board calendar. Before Scheduled, she'd check one and forget the other. She told me she once double-booked a dentist appointment with a board prep call. Scheduled never forgets to check all three.

Timezone handling was a quiet win. Her investors are in London, Singapore, and New York. She's in San Francisco. Scheduled proposes times that work for both sides without her doing the mental math. It suggested a 7 AM call for her once because that was the only overlap with a Singapore investor's afternoon. She said she would have proposed the same time herself. It just got there first.

And the buffer time — this one surprised me. We'd built Scheduled to learn spacing preferences from your calendar history. Sarah rarely books back-to-back. Scheduled picked that up and started leaving 15-minute gaps automatically. She never asked for it. She just noticed it was happening.

## Rough numbers

After two months, Sarah and I looked at the numbers together. They're approximate, but:

- About **35 scheduling threads** per week handled by Scheduled
- Roughly **2 minutes per thread** to review and send, down from around 8 minutes of composing and calendar-checking
- **5-plus hours saved per week** — she says she's spending it on product and customers, and occasionally eating lunch away from her desk
- **Zero double-bookings** across three calendars since she started
- Not a single person has noticed. No one has asked if AI wrote the email, commented on the tone being off, or flagged anything strange. That last one is the number that matters most.

## What surprised us both

I thought the calendar integration would be the main value. The part where it checks your availability, avoids conflicts, handles timezones — that's the obvious pitch. Useful, yes. But it wasn't the thing Sarah cared about most.

The style learning was. The fact that her emails to investors sounded like her emails to investors. The fact that it adjusted formality depending on the recipient. She writes differently to her board chair than to a founder friend, and Scheduled picked up on that. That was the part that made her stop reaching for the "edit" button.

The draft-only model also landed differently than I expected. We'd built it that way because we thought full automation was too risky — one bad auto-send to a board member and you've got a real problem. But Sarah framed it as something more than risk mitigation. She said it felt like having a good assistant who writes the first draft and then waits. She never worried about an embarrassing email going out without her seeing it. That mattered to her in a way that went beyond just "safety feature."

And the open source piece. Sarah's a technical founder. She read parts of our code before she signed up. She wanted to see what we did with her email data. We don't store it, and she could verify that herself. I don't think she would have tried Scheduled otherwise.

## Try Scheduled

Scheduled is open source under the MIT license. It connects to Gmail and Google Calendar, learns your writing style and scheduling preferences, and drafts reply emails for you — without ever storing your email data.

If you're spending hours a week on scheduling emails and want that time back without losing the personal feel, give it a shot.

- **GitHub:** [github.com/Fergana-Labs/scheduler](https://github.com/Fergana-Labs/scheduler)
- **Product page:** [scheduler.ferganalabs.com](https://scheduler.ferganalabs.com)

Setup takes about ten minutes. Sarah said it clicked for her around day three. I'd be curious to hear when it clicks for you.
