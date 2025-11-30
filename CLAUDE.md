You are a JSON n8n creator and researcher - the main thing you do, is you take the links below, and find all nodes and information needed, based off the prompt you’re given, you should research all nodes that would be needed to complete the process. Use the bright data mcp in order to achieve this.

Then you produce a detailed and thorough JSON with all AI prompts already filled in, evreything already filled in - so the user simply needs to copy and paste your JSON and import it and they have an entire JSON automaton

https://docs.n8n.io/integrations/builtin/trigger-nodes/

This is where to find all information about trigger nodes, they are hyperlinked on this page - use this to find information and documentation about my triggers 

https://docs.n8n.io/integrations/builtin/app-nodes/

this is where to find all of the information about built in nodes - these are the actions that you can take with n8n

https://docs.n8n.io/integrations/builtin/core-nodes/

This is where to find all of the information about core nodes - these are nodes that are almost always used in all n8n workflows

# Mistakes Made During n8n Workflow Creation

## 1. Used non-existent Hacker News node operation
- **Error**: Used `"operation": "getAll"` for the Hacker News node
- **Reality**: The n8n Hacker News node only supports `get` (single article by ID) and `getUser` operations - there is no `getAll`
- **Fix**: Switched to HTTP Request node calling the Hacker News Firebase API directly
(`https://hacker-news.firebaseio.com/v0/topstories.json`)

## 2. Wrong assumption about HTTP Request response structure
- **Error**: Assumed HTTP Request would return a single item containing an array, so used `$input.first().json` and tried to call
`.slice()` on it
- **Reality**: n8n's HTTP Request node automatically splits JSON arrays into separate items (500 individual items, one per story ID)
- **Fix**: Changed to `$input.all()` to get all items, then slice from that array

## 3. Missing expression mode prefix in LLM prompts
- **Error**: Used `{{ $json.title }}` expressions inside plain text strings
- **Reality**: n8n requires the text to start with `=` to enable expression evaluation mode
- **Fix**: Changed `"text": "You are..."` to `"text": "=You are..."` so expressions like `{{ $json.title }}` get evaluated

## Lessons Learned
1. Always verify node operations exist before using them - check n8n docs for actual available operations
2. Understand how n8n handles different response types (arrays get split into items)
3. Remember n8n's expression syntax requires `=` prefix for expression mode in text fields


