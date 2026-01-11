---
description: How to clear all KV pairs using Wrangler
---

# Clear All KV Pairs

This workflow explains how to delete all key-value pairs from a Cloudflare KV namespace using Wrangler CLI, without deleting the namespace itself.

## Important Notes

- **This only deletes the keys**, not the namespace itself. The namespace remains intact and ready to use.
- Use the `--remote` flag to target **production** KV. Without it, you'll target local development storage.
- Requires `jq` to be installed. Install via `choco install jq` on Windows.

## Steps

### 1. Generate list of all keys

List all keys in your **remote production** KV namespace and save them to a JSON file:

```bash
# For Bash/Git Bash:
wrangler kv key list --binding=<YOUR_BINDING_NAME> --remote | jq '[.[].name]' > keys.json

# For PowerShell (to avoid UTF-16 encoding issues):
wrangler kv key list --binding=<YOUR_BINDING_NAME> --remote | jq '[.[].name]' | Out-File -Encoding utf8 keys.json
```

Or using namespace ID:

```bash
# For Bash/Git Bash:
wrangler kv key list --namespace-id=<YOUR_NAMESPACE_ID> --remote | jq '[.[].name]' > keys.json

# For PowerShell:
wrangler kv key list --namespace-id=<YOUR_NAMESPACE_ID> --remote | jq '[.[].name]' | Out-File -Encoding utf8 keys.json
```

This creates a `keys.json` file containing an array of all key names:

```json
["key1", "key2", "key3"]
```

**For local development keys** (omit `--remote`):

```bash
wrangler kv key list --binding=<YOUR_BINDING_NAME> | jq '[.[].name]' > keys.json
```

### 2. Bulk delete all keys

// turbo
Once you have the `keys.json` file, delete all keys from **remote production**:

```bash
wrangler kv bulk delete --binding=<YOUR_BINDING_NAME> --remote keys.json
```

Or with namespace ID:

```bash
wrangler kv bulk delete --namespace-id=<YOUR_NAMESPACE_ID> --remote keys.json
```

### 3. Clean up

Delete the temporary keys file:

```bash
rm keys.json
```

## Configuration

- Replace `<YOUR_BINDING_NAME>` with the binding name from your `wrangler.jsonc` file (e.g., `TOPICAL_CACHE`)
- Replace `<YOUR_NAMESPACE_ID>` with your actual namespace ID from the Cloudflare dashboard or `wrangler.jsonc`

## Danger Zone

If you actually want to **delete the entire namespace** (not just the keys):

```bash
wrangler kv namespace delete --namespace-id=<YOUR_NAMESPACE_ID>
```

⚠️ **Warning**: This permanently destroys the namespace and all its data!
