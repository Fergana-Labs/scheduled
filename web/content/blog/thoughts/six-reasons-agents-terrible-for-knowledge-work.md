---
slug: six-reasons-agents-terrible-for-knowledge-work
title: 'The Six Reasons Why Agents Are Great for Code but Terrible for Knowledge Work'
description: 'Despite the near-human capabilities of AI coding agents, the jobs of most knowledge workers still look the same today. This paradox is what drove us to build Scheduled.'
date: '2026-03-20'
author: 'Fergana Labs Team'
category: 'Thoughts'
keywords: 'ai agents knowledge work, ai coding agents vs knowledge work, ai scheduling, ai productivity, why ai hasnt transformed work, ai agent limitations'
metaDescription: 'Why AI agents excel at coding but struggle with knowledge work. Six fundamental problems and how we solved them building Scheduled.'
---

# The Six Reasons Why Agents Are Great for Code but Terrible for Knowledge Work

Despite the near-human capabilities of AI coding agents, the jobs of most knowledge workers still look the same today. Maybe a bit more ChatGPT sprinkled in, but the day-to-day of a consultant or sales rep is basically unchanged from a decade ago. Contrast that with the before-and-after of personal computing, which reshaped every office job in a generation.

This paradox, incredible AI capability but minimal AI adoption in real workflows, is what drove us to build [Scheduled](https://tryscheduled.com). Along the way, we stumbled into a problem that perfectly illustrates why the gap exists.

## It's crazy there's no AI Calendly

Something all my friends know: I am terrible at responding to texts. Emails and scheduling are even worse. Between sales, recruiting, user interviews, and fundraising, there are a lot of meetings to schedule and a lot of balls that can get dropped.

If everyone in the valley is building coding agent orchestrators, surely I can build a simple calendar bot to solve my own problem. How hard could it be?

It turns out, harder than I thought. And the reason why it's hard turns out to be the same reason AI hasn't yet transformed knowledge work the way it's transformed software engineering. These are the problems that need to be solved for that to happen:

## 1. The mental model problem

One might ask why not just use an existing tool. Calendly, Howie, Fyxer, etc. I've tried them all. None quite scratched the itch, and they all fall prey to the mental model problem: productivity tools work great as long as your mental model of the world matches their design philosophy. If you're an inbox-zero person, these tools are a dream. If you're an inbox-100k person like me, they fall flat quickly.

Coding agents sidestep it because code has a universal structure: files, functions, tests, output. But knowledge work is deeply personal. Everyone's email workflow or notes workflow is different. Everyone's definition of "organized" is different. Build a tool that assumes a particular mental model and you'll delight 20% of users while alienating the rest. We ran into this problem in our first experiment of building [Allegory](https://www.allegory.to/) where a few passionate excited users (traditional VC advice) was not enough to build a company around the idea. This is the failure mode of the AI notes and personal CRM tarpit traps.

**How we solved it:** Build it absurdly simple. It has no real interface. There's basically one button. We don't need to map to your mental model if there's nothing to model. The best products in this emerging wave share this trait: Granola, Gamma, Wisprflow. They're all one function in, one function out with no system or configuration to speak of.

## 2. The procedure problem

Knowledge work runs on procedures. When you get an email from a prospective client, there's a twelve-step process: check the CRM, look up the company, draft a personalized response, CC the right people, set a follow-up reminder, log the interaction, etc. Multiply that by every type of email, every type of meeting, every type of request and you end up with a lot of steps to follow.

At first glance, this feels ripe for automation. It's all repeatable steps. However, there's a catch. LLMs are surprisingly bad at following long, multi-step instructions reliably. Coding agents don't hit this wall as hard because code is largely self-correcting. You (or your AI) can run it, and it either works or it throws an error. Knowledge work has no general compiler. Anyone who has tried to get an agent to follow a complex skills.md file will be familiar with the pain.

**How we solved it:** Emerging paradigms around agents are programmatic tool calling and recursive language models. Because agents are so good at writing code due to their post-training, we might as well let them write code to do everything else. Code also happens to be very good at being reliable. The solution is encoding procedures into code which call agents which in turn call code which in turn call agents... (in reality we probably don't need that many recursive layers). The key is that the code the production agent writes and the code that you (or your coding agent) writes to govern that production agent can be interchangeable. Thus, we can reliably encode multi-step procedures like: first determine if it's a group meeting or a 1:1. If it's a 1:1 and they have not sent over a time yet, please suggest some times and then...

## 3. The exposure problem

Another fundamental asymmetry between coding and knowledge work is that coding is high complexity, low exposure. Knowledge work is low complexity, high exposure.

A coding agent can fumble through seventeen attempts at a function and run code safely in a sandbox. When an AI sends the wrong email to a client however, there's an immediate loss of trust. The stakes are social, professional, and immediate.

The tasks themselves aren't hard. Drafting an email, scheduling a meeting, formatting a slide deck are all very simple. But LLM reliability isn't at a level where you can let it loose on anything externally visible without supervision.

**How we solved it:** Guard rails instead of walls. In the real world, a wall tries to stop you from doing something, period. A guard rail prevents you from doing something by accident while still letting you act intentionally. Think of the DoorDash confirmation when you're ordering delivery to an address that's not your house. It doesn't block you, but it does make you think twice.

Thus, we tier safety features. Deterministic kill switches handle the hard boundaries: the AI only ever writes drafts, never sends. For areas where the agent can exercise discretion, like suggesting time slots or prioritizing responses, we use softer nudges. This pattern preserves the agent's intelligence and flexibility without handcuffing it into uselessness.

## 4. The memory problem

Ask a coding agent to refactor a codebase and it can read every file. The truth is right there, in the repository. Most knowledge work is the opposite.

To schedule a single meeting, you might need to know that John from marketing doesn't get along with Kevin. That Sarah prefers morning calls because she's in a different timezone but won't tell you that directly. That the "optional" attendee is actually the decision-maker.

None of this is written down anywhere. If information does exist (slide decks, emails, CRMs), it's almost always out of date. The real source of truth is in people's heads, scattered across Slack threads and half-remembered conversations. There's an asymmetry that means the amount of context needed to execute a simple task is enormous.

**How we solved it:** The problem with memory has always been that it is an accumulating advantage. Thus it is hard to deliver value immediately. Instead of building our own layer from scratch, we bootstrap off existing data and plug into existing systems of record. In this case, we treat calendars and email history as ground truth. Importantly, these existing systems of record are ones where users have a pre-existing incentive to keep up-to-date. Rather than changing user behavior, we piggy-back off of it.

## 5. The all-or-nothing tool problem

Before AI, coding had very few massive SaaS companies. The tools were relatively consolidated or open-sourced enough that inter-operability was relatively easy. Knowledge work is the opposite. There's an ocean of productivity tools with a long tail. Every team uses a slightly different stack: Notion or Confluence. Google Calendar or Outlook. Salesforce or HubSpot. Slack or Teams.

This is a corollary of the mental model problem. Because everyone works differently (and teams have different requirements), everyone uses different tools. The result is that an AI workflow tool needs to integrate with everything a user uses to be useful. Moreover, it's hard to get someone to switch onto your tool because there are already so many tools in a user's arsenal already. Why do I want to learn yet another tool?

**How we solved it:** We chose to side-step the problem. Instead of building our own email client or calendar app, which would require users to abandon their existing tools, we meet you in Gmail which most people already use. The user's existing tool is our interface.

## 6. The sparse rewards problem

When a coding agent writes a function, you can test it. It either passes or it doesn't. The reward signal is clear, immediate, and binary. This leads to ease of training via RLHF or RLVF for models.

Knowledge work has no such luxury. Did the AI draft a good email? That depends on who you ask. There are many ways to do it right, many ways to do it wrong, and the difference often comes down to feel and taste.

**How we solved it:** Carefully choosing the right metric. It has to be super sharp and probably won't be the most obvious one. Wisprflow figured this out early: they optimized for human edits to transcriptions, rather than transcription accuracy itself. The edits told them what actually mattered to users, which was often different from what a benchmark would measure.

We don't try to solve all of email. We solve the laundry problem: the pile of small, asynchronous tasks that create open threads, weigh on your mind, and generate friction wildly disproportionate to the actual time they'd take to complete. Each one is trivial but super annoying in aggregate.

---

We built Scheduled as a sidequest to answer a product question we've been debating internally: Why has no one built a good AI calendar app? It's such a painful problem and surely models are good enough by now to do so. The answer, it turns out, went beyond the simple scheduling tool we built. Those lessons will be folded into our [Stash](https://stash.ac) product. But for now, if you set up a time to chat with us, expect an email from Scheduled.

Scheduled is open source. If you want to try it, break it, or build on it, check it out at [GitHub](https://github.com/Fergana-Labs/scheduled) or [tryscheduled.com](https://tryscheduled.com).
