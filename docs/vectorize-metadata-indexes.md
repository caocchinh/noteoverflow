# Cloudflare Vectorize Metadata Indexes

## Overview

Cloudflare Vectorize requires **metadata indexes** to be created before you can filter search results by metadata fields. This document explains how to create and manage metadata indexes.

## Setting Up the Vector Database

```bash
# Create the Vectorize index
wrangler vectorize create question-semantic-search --dimensions=768 --metric=cosine

# Verify it was created
wrangler vectorize list
```

### Erasing Everything in the Vector Database

```bash
# Delete the entire index (this erases all vectors)
wrangler vectorize delete question-semantic-search

# Recreate the index
wrangler vectorize create question-semantic-search --dimensions=768 --metric=cosine
```

---

## Creating Metadata Indexes

### Using Wrangler CLI

```bash
# Create a metadata index for a string field
wrangler vectorize create-metadata-index <INDEX_NAME> --property-name=<FIELD_NAME> --type=string

# Create a metadata index for a number field
wrangler vectorize create-metadata-index <INDEX_NAME> --property-name=<FIELD_NAME> --type=number

# Create a metadata index for a boolean field
wrangler vectorize create-metadata-index <INDEX_NAME> --property-name=<FIELD_NAME> --type=boolean
```

### Example: Current Implementation

For our `question-semantic-search` index, we use two metadata fields:

```bash
# Create index for 'subject' field
wrangler vectorize create-metadata-index question-semantic-search --property-name=subject --type=string

# Create index for 'curriculum' field
wrangler vectorize create-metadata-index question-semantic-search --property-name=curriculum --type=string
```

### Using PowerShell Script

We've provided a convenience script that creates all necessary metadata indexes:

```powershell
.\scripts\create-vectorize-metadata-indexes.ps1
```

## Listing Existing Metadata Indexes

```bash
wrangler vectorize get question-semantic-search
```

This will show you all metadata indexes currently configured on the index.

## Deleting Metadata Indexes

```bash
wrangler vectorize delete-metadata-index question-semantic-search --property-name=<FIELD_NAME>
```

## Important Notes

### Re-indexing Requirement

⚠️ **CRITICAL**: Vectors that were upserted **before** a metadata index was created will **not** be searchable by that field until they are re-upserted.

**To fix this, you must:**

1. Create the metadata indexes (as shown above)
2. Re-run your indexing process to update all existing vectors

**Option A: Clear and re-index (recommended for major changes)**

```bash
# Delete the entire index
wrangler vectorize delete-index question-semantic-search --force

# Recreate the index
wrangler vectorize create question-semantic-search --dimensions=1024 --metric=cosine

# Create metadata indexes
.\scripts\create-vectorize-metadata-indexes.ps1

# Re-run indexing via your API endpoint
# Visit http://localhost:3000/admin/AI and click "Index Questions"
```

**Option B: Update existing vectors**

```sql
-- Reset the indexing flag in your database
UPDATE question SET isQuestionImageIndexed = 0;

-- Then re-run the indexing endpoint
```

### Limitations

- Maximum of **10 metadata indexes** per Vectorize index
- Supported types: `string`, `number`, `boolean`
- Filter object must be less than **2048 bytes** when serialized to JSON

## Filter Syntax in Code

When you create metadata indexes, you can filter by those fields in your queries:

```typescript
// Simple filter (automatically transformed to Cloudflare format)
const filter = {
  subject: "Physics (9702)",
  curriculum: "CIE A-LEVEL",
};

// This gets transformed to Cloudflare format:
// {
//   subject: { $eq: 'Physics (9702)' },
//   curriculum: { $eq: 'CIE A-LEVEL' }
// }

const matches = await queryVectorize(
  "question-semantic-search",
  queryEmbedding,
  {
    topK: 5,
    returnMetadata: "all",
    filter: filter,
  }
);
```

### Available Filter Operators

While our code currently uses `$eq` (equals), Cloudflare Vectorize supports these operators:

- `$eq`: Equals
- `$ne`: Not equals
- `$in`: In a list of values
- `$nin`: Not in a list of values
- `$lt`: Less than
- `$lte`: Less than or equal to
- `$gt`: Greater than
- `$gte`: Greater than or equal to

Example with advanced operators:

```typescript
const filter = {
  year: { $gte: 2020, $lte: 2024 },
  subject: { $in: ["Physics (9702)", "Chemistry (9701)"] },
  isPublished: { $eq: true },
};
```

## Troubleshooting

### Filters return no results

**Cause**: Metadata indexes don't exist, or vectors were indexed before metadata indexes were created.

**Solution**:

1. Verify indexes exist: `wrangler vectorize get question-semantic-search`
2. Create missing indexes using the script above
3. Re-index all vectors

### "Property not indexed" error

**Cause**: Trying to filter by a field that doesn't have a metadata index.

**Solution**: Create a metadata index for that property using the commands above.

## Adding New Metadata Fields

If you need to add new filterable fields in the future:

1. **Update the metadata in your indexing code** (e.g., in `semanticSearch.ts`):

   ```typescript
   metadata: {
     questionId: q.id,
     type: "question",
     subject: q.subjectId ?? "",
     curriculum: q.curriculumName ?? "",
     // Add your new field here
     newField: q.newField ?? ""
   }
   ```

2. **Create the metadata index** via Wrangler:

   ```bash
   wrangler vectorize create-metadata-index question-semantic-search --property-name=newField --type=string
   ```

3. **Re-index all vectors** to populate the new metadata field

4. **Update the PowerShell script** to include the new index for future use
