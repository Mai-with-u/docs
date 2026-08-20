---
title: How are messages processed?
---
# How Are Messages Processed? 📨

Have you ever wondered, when you @MaiBot or chat with it, how exactly does it process your message? Let's explain this process in simple terms.

## One-Sentence Version

**You send a message → The bot thinks → It replies to you**

That's it! But there are actually many interesting little steps in between.

## Detailed Process (Explained in Plain Language)

### 1️⃣ Receiving the Message

When you send a message in the group:
- If you @ the bot, it will definitely see it
- If you don't @ it, it will still sneak a peek, thinking whether to chime in
- Whether it's text, images, or emojis, it can receive them all

### 2️⃣ First, Check Whether to Respond

The bot will quickly judge first:
- Is this spam? (Filter out if there are blocked words)
- Is this a command? (Like "!help")
- If it's a command, process the command first

### 3️⃣ Enter Thinking Mode

If it's not a command, the bot starts thinking seriously:
- Look at what you were discussing before
- Recall your personal characteristics
- Think about whether now is the right time to chime in

### 4️⃣ Decide Whether to Reply

This step is crucial! The bot will consider:
- What is the current chat atmosphere like?
- Will my reply disturb you?
- What would be appropriate for me to say?

Sometimes it chooses to:
- **Reply immediately** - feels it's time to speak
- **Wait a bit** - feels the timing isn't right
- **Stay silent** - decides not to chime in after all

### 5️⃣ Organize the Language

If it decides to reply, the bot will:
- Think about what tone to use
- Recall the speaking style of your group
- Choose appropriate emojis (if needed)
- Organize a natural reply

### 6️⃣ Send the Reply

Finally, send out the prepared message!

## A Real Example 🌰

**Scenario**: The group is discussing where to go this weekend

```
Xiao Ming: Want to go hiking this weekend, anyone want to join?
Xiao Hong: I want to! But the weather forecast says it might rain
Xiao Gang: How about we change to the mall instead?
(At this moment you @MaiBot)
You: @MaiBot What do you think?

[Bot receives the message, starts thinking...]

MaiBot: I think hiking is pretty great! But it depends on the weather,
       if it rains, the mall is indeed safer~
       You could prepare a Plan B, that would be more flexible 😊
```

**Bot's Thinking Process**:
1. Received @ message → "Someone is asking for my opinion"
2. Check context → "They are discussing weekend activities"
3. Check chat atmosphere → "Quite relaxed, can participate"
4. Decide to reply → "Give some practical advice"
5. Organize language → "Use a relaxed tone, add an emoji"
6. Send reply → "Done!"

## When Will It Reply to You?

### Situations Where It Will Definitely Reply:
- You @ the bot
- You speak directly to it
- It feels your message is asking it

### Situations Where It Might Reply:
- The group chat is lively and the atmosphere is good
- The topic is something it's interested in
- It feels it has useful information to share

### Situations Where It Usually Won't Reply:
- The group is discussing very private matters
- The atmosphere is quite serious or tense
- It feels it's inappropriate to chime in

## Viewing Nested Forwarded Messages

Sometimes a forwarded message in a group itself contains **more forwards nested inside** — like Russian dolls. For example, someone forwards a collection of chat records, and each record may be part of another forward.

Since 1.2.0, MaiBot can **expand and view the full content of nested forwarded messages**:

- It doesn't just see "there's a forward here"; it sees the actual messages inside the forward
- Nested layers are expanded one by one, so MaiBot understands the whole story of the forward
- This lets it join in and respond better when a forwarded thread is being discussed

Think of it as MaiBot learning to "unwrap the Russian dolls" — no matter how many layers a forwarded message is nested, it can read the real content inside.

## How Fast Is the Reply?

This depends on the situation:
- **Instant reply**: Sometimes thinks fast and replies immediately
- **Wait a bit**: Sometimes needs to think for a while
- **Reply after a long time**: Might be busy with other things, or really thinking hard

Just like a real person, it also has its own "thinking time."

## Why Sometimes It Doesn't Reply?

The bot doesn't reply usually because:
1. **Feels it shouldn't speak** - understands politeness like a real person
2. **Still thinking** - hasn't figured out how to say it yet
3. **Network issues** - technical reasons (rare)
4. **Set to quiet mode** - administrator asked it to speak less

## Want to Learn More?

If you're interested in technical details:
- [See how MaiBot thinks →](./maisaka-reasoning.md)
- [Understand its memory system →](./memory-system.md)
- [See how it learns speaking styles →](./learning.md)

Remember, MaiBot's goal is not to reply the fastest, but to participate in the conversation most naturally. It wants to become a true chat partner, not a cold automatic reply machine.