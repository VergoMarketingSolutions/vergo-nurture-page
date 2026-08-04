# Free AI SEO course — setup + the 6 emails

The popup captures an email and promises a six-part course on getting found in
AI search. This file holds the drip setup and the email content, so the promise
is backed by something real before the popup goes live.

---

## Where signups currently go

`src/components/IntroPopup.jsx` posts to `SIGNUP_ENDPOINT`, which right now is
the same FormSubmit inbox alias the quote form uses. That means **signups reach
your inbox immediately and nothing is lost** — but FormSubmit only forwards to
an inbox. It does not store a list and it does not send a sequence.

## To turn the automated sequence on

The drip has to run from an email platform. It handles the list, the sending
schedule, deliverability, and — not optional in Australia — the unsubscribe
link and sender identification the Spam Act 2003 requires. Rolling that
yourself means building unsubscribe handling and suppression lists, which is a
lot of surface area to get wrong for no upside.

Any of these have a free tier that covers a list this size and does automation:

| Platform | Free tier | Notes |
|---|---|---|
| MailerLite | 1,000 subscribers | Simplest automation builder of the three |
| Brevo | 300 sends/day | Generous contact limit |
| ConvertKit / Kit | 1,000 subscribers | Strongest for email-course sequences |

Steps, once you've picked one:

1. Create the account (this needs your own login — it can't be done for you).
2. Make a group/list called something like `AI SEO course`.
3. Build an automation: **trigger** = joins that group → **action** = send
   Email 1 → wait 2 days → Email 2 → wait 3 days → Email 3 → … through Email 6.
4. Paste the six emails below in.
5. Copy the platform's form/API endpoint and replace `SIGNUP_ENDPOINT` in
   `src/components/IntroPopup.jsx`. That one line is the only code change.
6. Send yourself a test signup and confirm Email 1 lands.

Suggested spacing: **day 0, 2, 5, 8, 12, 16.** Front-load the useful bits — most
people who unsubscribe do it in the first two emails, so lesson one has to earn
its place.

---

## Email 1 — Why your competitor is showing up in ChatGPT and you aren't

**Subject:** The new "near me" search nobody told you about
**Preview:** It isn't Google anymore. Not entirely.

Gday,

Quick one to start, because you've got jobs on.

When someone's aircon dies at 8pm, a growing number of them don't open Google
anymore. They ask ChatGPT, or they read the AI summary sitting above Google's
actual results. And the AI names two or three businesses.

Here's the part that matters: it isn't picking those names from whoever paid
the most. It's assembling them from what it can find and verify about you
across the web — your Google Business Profile, your reviews, your website,
directories, and whether all of it agrees.

Which means if your details are inconsistent or thin, you're invisible in that
answer. Not ranked low. Not there at all.

Over the next five emails I'll walk you through what actually moves this, in
the order I'd do it. No jargon, and nothing that needs a developer.

Tomorrow-ish: the single highest-leverage thing, and it takes twenty minutes.

— The team at VM Solutions

---

## Email 2 — The twenty-minute fix most trades skip

**Subject:** Do this one before anything else
**Preview:** Twenty minutes, no developer needed.

Before any clever stuff: make your business facts identical everywhere.

AI models cross-check. When your phone number is one thing on your Google
Business Profile, another on your website footer, and a third on some
directory you forgot you signed up to in 2019, that inconsistency reads as
uncertainty — and uncertain businesses don't get recommended.

Twenty minutes, in this order:

1. **Google Business Profile.** Claim it if you haven't. Exact business name,
   phone, service areas, hours — including whether you actually do
   after-hours, because that's a question people ask AI directly.
2. **Your website footer.** Same name, same phone, same suburb wording. Match
   it character for character.
3. **Search your own business name.** Anything with old details, fix or kill.

That's it. Boring. It's also the thing that most often separates the trades who
show up in AI answers from the ones who don't.

Next: the thing AI leans on hardest, and how to get more of it without being
weird about it.

— VM Solutions

---

## Email 3 — Reviews: what AI actually reads

**Subject:** Why 40 reviews beats 200 (sometimes)
**Preview:** Recency and specifics beat raw count.

Reviews aren't just social proof anymore — they're the raw material AI uses to
describe you.

Three things matter more than total count:

- **Recency.** Twelve reviews from this year beat eighty from 2019. A quiet
  twelve months reads as a business that might not be operating.
- **Specifics.** "Great service" tells the AI nothing. "Replaced our ducted
  system in Thornbury, came out same day" tells it your service, your suburb,
  and your response time — all things it can match a question against.
- **Steady flow.** Thirty reviews in one week looks bought. Two or three a week
  forever looks like a real business.

The ask that works: text, not email, within an hour of finishing the job, while
they're still pleased. One line, one link. And ask them to mention what you did
and where — that's what turns a review into something AI can use.

If you're doing volume and this is falling over, it's exactly the sort of thing
worth automating. More on that later — not now.

— VM Solutions

---

## Email 4 — Write down the answers you give forty times a week

**Subject:** The questions you're sick of answering
**Preview:** Those are the pages that get you found.

You already know your customers' questions. You answer them on the phone every
day.

- How much does it cost to replace a ducted system?
- Can you fix a leak in the rain?
- How long does a re-roof take?
- Do you charge for a quote?

Each of those is a page on your website. Question as the heading, straight
answer in the first two sentences, then the detail.

Why it works: AI search matches questions to answers. A page titled "Services"
matches nothing. A page titled "How much does ducted aircon replacement cost in
Melbourne?" matches exactly what somebody typed.

Give ranges, not "contact us for pricing." A range that's honest gets quoted by
the AI. A wall gets skipped.

Start with three. The three you're most tired of answering.

— VM Solutions

---

## Email 5 — Telling search engines what you are, in their language

**Subject:** The bit of code that does the heavy lifting
**Preview:** Your web person can add this in ten minutes.

This is the most technical email in the series, and it's still not very
technical, because you don't have to write it — you just have to know it should
exist.

Structured data — schema markup — is a small block of code that states your
business facts in a format machines read without guessing: that you're a
`LocalBusiness`, your trading name, phone, service areas, opening hours,
whether you do emergency call-outs.

Without it, AI infers all that from your page text and sometimes gets it wrong.
With it, there's nothing to get wrong.

What to do: send your web person "please add LocalBusiness schema with our
service areas and hours." If nobody maintains your site, this is one of the
first things we check in a marketing review — usually it's missing, or it's
there with details that stopped being true two years ago.

Last one next: how to tell whether any of this is working.

— VM Solutions

---

## Email 6 — Checking whether it worked

**Subject:** Ask the robot about yourself
**Preview:** The five-minute check, then what's next.

Simplest test there is: open ChatGPT and ask what you'd ask if you were a
customer.

- "Best roofer in [your suburb]"
- "Emergency aircon repair near [your suburb]"
- "Who does ducted heating in [your suburb]?"

Do you come up? Are the details right? If it names competitors and not you,
that's your gap — and after the last five emails you know the levers: consistent
details, recent specific reviews, question-shaped pages, schema.

Do it monthly. It moves.

That's the course. Genuinely, that's the lot — no part seven where it turns out
you need to buy something.

If you'd rather not do it yourself, that's the work we do: finding where the
leads leak and making sure the phone gets answered when they don't. Reply to
this email, or grab a quote at vergosolutions.com.au/quote. And if you'd rather
just take the list and run it yourself, good on you — that was the point.

— VM Solutions

P.S. The thing most trades underestimate: all of this only pays off if someone
picks up when the phone finally rings. Worth being honest with yourself about
which end your bottleneck is actually at.
