# Free AI SEO course — setup + the 6 emails

The popup captures an email and promises a six-part course on getting found in
AI search. This file holds the drip setup and the email content, so the promise
is backed by something real before the popup goes live.

---

## Where signups go — wired up and verified

`src/components/IntroPopup.jsx` posts to the MailerLite embedded-form endpoint
for the **`AI SEO course`** group:

```
https://assets.mailerlite.com/jsonp/2556825/forms/194928629535213309/subscribe
```

Every signup lands in that group, which is what the drip automation triggers
off. Subscribers → Groups → `AI SEO course` is the stored list, exportable to
CSV any time.

Three things about this endpoint that cost time to work out, worth keeping
written down:

- It wants **form-encoded** `fields[email]`, not JSON. Posting JSON returns
  "The email field is required" — so the earlier FormSubmit-shaped payload
  would have failed silently on every signup.
- It answers **HTTP 200 even when it rejects the address**, with
  `{"success":false,...}` in the body. Checking the status code alone would
  report a refused signup as a success.
- It sends `access-control-allow-origin: *`, so the browser posts to it
  directly. No serverless proxy and no API key in the front end.

Verified end to end: a real submission through the popup returns
`{"success":true}`, a malformed address is correctly refused, and the popup's
error state surfaces MailerLite's own message.

Two test subscribers were created while wiring this up — delete them from the
group when convenient:

- `claude-wiring-test@vergosolutions.com.au`
- `claude-endpoint-check@vergosolutions.com.au`

## Still to do: build the automation

The drip has to run from an email platform. It handles the list, the sending
schedule, deliverability, and — not optional in Australia — the unsubscribe
link and sender identification the Spam Act 2003 requires. Rolling that
yourself means building unsubscribe handling and suppression lists, which is a
lot of surface area to get wrong for no upside.

### Use MailerLite

Free to 1,000 subscribers, which is well past where this needs to be, and its
automation builder is the least painful of the options. Brevo and Kit both work
too if you already have one — the shape of the setup is identical.

Do these in order. Steps 1–5 are all in MailerLite; only step 6 touches code.

1. **Sign up** at mailerlite.com. It asks what you're sending and roughly who
   to — answer honestly, they review new accounts for spam and a vague answer
   slows approval. Mention it's an opt-in educational series for trade
   businesses.
2. **Verify your sending domain.** It'll walk you through adding DNS records at
   your registrar — same place you added the Vercel records for
   vergosolutions.com.au. Do this properly rather than sending from a gmail
   address: unverified senders land in spam, and the whole thing is pointless
   if nobody sees email one.
3. **Create a group** called `AI SEO course`. In MailerLite a "group" is just a
   list — this is what the popup will feed into.
4. **Create the automation.** Automations → new. Trigger: *when a subscriber
   joins a group* → pick `AI SEO course`. Then build the chain:

   | Step | Action |
   |---|---|
   | 1 | Send Email 1 |
   | 2 | Wait 2 days |
   | 3 | Send Email 2 |
   | 4 | Wait 3 days |
   | 5 | Send Email 3 |
   | 6 | Wait 3 days |
   | 7 | Send Email 4 |
   | 8 | Wait 4 days |
   | 9 | Send Email 5 |
   | 10 | Wait 4 days |
   | 11 | Send Email 6 |

   That lands on **day 0, 2, 5, 8, 12, 16.** Front-loaded on purpose — most
   unsubscribes happen on the first two, so lesson one has to earn its place.
5. **Paste the six emails below in**, subject lines included. Leave MailerLite's
   unsubscribe footer alone; it's legally required, not optional.
6. **Get the form endpoint and send it over.** Make an embedded form in
   MailerLite pointed at the `AI SEO course` group, choose the HTML/embed
   option, and copy the URL out of the form's `action="..."` attribute. Send me
   that URL and I'll wire it into `SIGNUP_ENDPOINT` and test a real signup end
   to end.

Why step 6 needs testing rather than just pasting: browser-to-platform form
posts can be blocked by CORS depending on which endpoint type you copy. If the
embed URL is rejected, the fallback is a tiny Vercel serverless function that
forwards the signup server-side — about 15 lines, no extra services. Either way
it gets verified with a real address before it's considered done.

Until step 6 is finished, signups still reach the business inbox via
FormSubmit, so nothing is lost in the meantime — they just have to be added to
MailerLite by hand if you want the sequence to fire.

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
