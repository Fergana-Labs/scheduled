import { readMarkdownPosts } from './markdown-reader';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  content: string;
  keywords?: string;
  metaDescription?: string;
}

// Hardcoded blog posts (legacy - keeping for backward compatibility)
const hardcodedBlogPosts: BlogPost[] = [
  {
    slug: 'in-praise-of-mess',
    title: 'In Praise of Mess',
    description:
      'How I learned to stop worrying and love the chaos. On building AI that adapts to human messiness instead of demanding we be tidier.',
    date: '2025-08-25',
    author: 'Sam Liu',
    category: 'Thoughts',
    content: `For as long as I can remember, my thoughts have moved faster than my hands could catch them. And boy did I want to catch them. Grasping at them all, convinced that any one of them might hold the secret to happiness, wealth, and eternal youth. They'd arrive uninvited, in the quiet moments of in-between: in the shower, on a run, mid-conversation, or during that long, liminal haze right before falling asleep. All too often, I'd force myself out of bed, out of the darkness to the searing screen of my notes app, convinced that this was the one. Afraid to let it go into that good night.

In notes app after notes app, on scattered pieces of paper, in margins of books I'd never finish, they'd pile up. Fragments of entire universes hoarded across my digital and physical space, scattered like breadcrumbs I never quite find my way back to. Swept underneath the bed to be forgotten.

![Actual state of my co-founder's notes app](/in-praise-of-mess.png)

Most note-taking tools are built by people who never seem to forget. They're built for clarity but only because those who use it already have it. It's for people with their folders color-coded, their calendars obedient, their notes neatly organized. It's for people with "OCD" rather than "ADHD". I've tried every productivity system and note taking tool out there from Evernote to Obsidian to the more obscure Zettelkasten. Each one promised to bring order to chaos. Each one collapsed under the constant upkeep required to keep them usable. Every few months I'll declare bankruptcy on my notes. Start afresh on a new page, new notebook, new note taking app, with the weary optimism that this time will be better. Eventually, I stopped trying. Notes and reading lists pile up with the distant hope that eventually, maybe, AI will bail me out.

## Building the Lifeline

It seems AI might just bail me out — though in this case, I'm the one building the lifeline. The only way I've found to keep pace with my own brain is to create a tool that can run alongside it, catching what falls through the cracks. It lets me be my chaotic self without the quiet shame of disorganization. While my thoughts dart from one thing to the next, it quietly sorts them in the background.

The promise of technology has always been that it would free us from tedious, repetitive work. Instead, most software has only layered on more clicks, more forms, and more robotic bureaucracy. It hasn't liberated us; it's just made the filing cabinets digital. Minimalism hasn't freed us from hoarding. It has just been rebranded. Your desk may look spotless but there are skeletons hidden under your desktop.

AI finally gives us a way out, not by demanding we be tidier, but by embracing the messiness. We're building something that knows your thoughts don't arrive pre-labeled or neatly color-coded, and doesn't expect them to. In that respect, we're making a different promise: no neat, unchanging folders because let's be honest, they'd be outdated in a week. We are cashing in on the original promise. Not by making you work for the tool, but by having the tool work for you.

## The Bigger Picture

As a society, we're living through an on-going experiment — a moment where the rules are still being written, and the boundaries of what's possible shift by the month. We're still figuring out how to channel this technology into something that feels genuinely useful. One thing is clear: cramming chatbots into every product isn't the answer. Instead, we picture a tool that takes in your notes as they are, quietly sorting them in the background so you never waste energy deciding where they belong. One that brings back forgotten sparks of insight at the very moment they matter. One that spots the patterns you'd never notice on your own — and reveals them in ways that catch you off guard.

In the long run, note-taking is just the entry point. Cheap digital cameras and iPhones didn't just make photography more accessible; they transformed how we remember our lives. Suddenly, moments that would have faded into distant memory could be captured, shared, and saved for prosperity. The act of remembering changed and with it, the very act of living. We believe AI will have a similar shift, not just in how we remember the world, but in how we remember ourselves.

Right now, memory is the single biggest limitation of AI. Most tools still require you to start every interaction by re-explaining the entire context, like a goldfish introducing itself every time it swims past you. In five years, people will look back and find it absurd that we ever had to do this.

What holds AI back today isn't raw intelligence. Indeed, reasoning models seem to have largely solved that part of the equation. What holds AI back is the lack of contextual understanding, focus, and planning. These are the ingredients that turn a model from a parlor trick into a true collaborator. Our work starts with helping people make sense of their own notes, but that's just the first chapter in building systems that can remember with you, think with you, and help you act without friction.

## The Mission

At the end of the day, our mission is simple: to empower humanity to live more fully and take more agency. Unlike photography, which has pulled us deeper into our screens, we hope AI can push us back into the real world — less distracted, less performative, more present. Memory is the foundation. The rest is what becomes possible once you have it.

---

*Originally published on [Sam's Substack](https://samzliu.substack.com/p/in-praise-of-mess).*`,
  },
  {
    slug: 'agi-is-here',
    title: 'Hot Take: AGI is Already Here',
    description:
      "AI agents can already automate most white collar work. The only thing holding them back is that they're restricted to coding CLIs. We built a free open source UI to fix that.",
    date: '2025-08-24',
    author: 'Fergana Labs Team',
    category: 'Product',
    content: `## The Speed of Progress is Staggering

It's been incredible how fast AI has been getting better. I remember when Cursor would struggle with code files that were longer than just a few hundred lines - and that was a mere **4 months ago**.

Today, tools like Cursor, Claude Code, and Codex can build entire codebases from scratch. They have no problem operating on complex projects with hundreds of thousands of lines of code. They can refactor architectures, debug intricate issues, and implement features that would have taken senior developers hours or days.

## You May Not Have Noticed

If you're not using these tools every day, you may not have realized just how capable they've become.

These aren't just sophisticated chatbots anymore. They are **truly autonomous agents that can take actions and effect change in the world**. They can read files, write code, execute commands, search the web, and coordinate multi-step tasks without constant supervision.

The technology to automate most white collar work already exists. You could, right now, use these AI agents to:

- Generate comprehensive reports from raw data
- Bulk edit hundreds of documents across your workspace
- Synthesize insights from dozens of research papers
- Update PowerPoint presentations with the latest numbers
- Reorganize and rename entire folder hierarchies
- Extract action items from meeting transcripts
- Draft emails, memos, and proposals

The limiting factor isn't capability. It's accessibility.

## The Problem: They're Stuck in Terminal Windows

Here's the paradox: the most powerful AI agents available today are restricted to coding CLIs.

These agents are trapped in terminal windows, accessible only to developers who are comfortable with command-line interfaces, environment variables, and package managers. If you're not technical, you're locked out of using the most advanced AI tools humanity has ever created.

This is backwards. The people who could benefit most from AI automation - knowledge workers drowning in repetitive tasks - are the ones who can't access it.

## Our Solution: Bringing AI Agents to Everyone

That's why we built **Claude Agent Desktop** - a free, open source UI wrapper around the Claude Agent SDK (which powers Claude Code and other agentic tools).

![Claude Agent Desktop Interface](/stash-desktop-demo.png)

**If you're non-technical**, Claude Agent Desktop gives you access to these powerful agents without opening a terminal window. No installation headaches. No configuration files. No Python environments.

Just download the app and start automating.

### What You Can Do With It

Here are some use cases people are running today:

**Bulk File Operations**
"Rename all the files in my Downloads folder based on their content and organize them into appropriate folders"

**Document Synthesis**
"Read through these 15 user research interview notes and create a comprehensive report with themes and insights"

**Content Creation**
"Update my quarterly board deck with the latest metrics from the finance spreadsheet"

**Meeting Follow-ups**
"Extract action items from this meeting transcript and draft follow-up emails for each attendee"

**Research Analysis**
"Compare the methodology across these 20 academic papers and create a literature review"

These aren't hypothetical scenarios. They're actual tasks people are completing in minutes instead of hours.

## Why Open Source?

We believe that access to AGI-level capabilities shouldn't be gated behind technical knowledge or expensive subscriptions.

The future of work is being shaped by AI agents right now. That future should be accessible to everyone - not just developers with terminal proficiency.

By open-sourcing Claude Agent Desktop, we're democratizing access to the most powerful AI agents available today. The code is MIT licensed, fully extensible, and built to be customized for your specific workflows.

Anyone can inspect it, modify it, or build on top of it. That's how it should be.

[Download on GitHub →](https://github.com/Fergana-Labs/claude_agent_desktop)`,
  },
];

// Merge hardcoded posts with markdown posts
let cachedBlogPosts: BlogPost[] | null = null;

function getAllPostsInternal(): BlogPost[] {
  if (cachedBlogPosts) {
    return cachedBlogPosts;
  }

  const markdownPosts = readMarkdownPosts();

  // Deduplicate by slug - prefer markdown posts over hardcoded ones
  const markdownSlugs = new Set(markdownPosts.map(p => p.slug));
  const uniqueHardcodedPosts = hardcodedBlogPosts.filter(
    p => !markdownSlugs.has(p.slug)
  );

  cachedBlogPosts = [...uniqueHardcodedPosts, ...markdownPosts];
  return cachedBlogPosts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const allPosts = getAllPostsInternal();
  return allPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  const allPosts = getAllPostsInternal();
  return allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllPostsInternal();
  return allPosts.filter(post => post.category === category);
}
