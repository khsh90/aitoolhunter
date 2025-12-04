# Appwrite Database Schema Setup

This guide will help you ensure your Appwrite database has all the required fields to support both scraped Futurepedia data and API-generated data.

## Database Structure

### Database Name
- **Database ID**: `ai-tool-hunter` (or as configured in `.env.local`)

### Collections

---

## 1. Categories Collection

**Collection ID**: `categories`

### Attributes

| Attribute | Type | Size | Required | Array | Default |
|-----------|------|------|----------|-------|---------|
| `name` | String | 100 | Yes | No | - |

### Indexes
- `name` (Key: unique, Type: fulltext)

---

## 2. Tools Collection

**Collection ID**: `tools`

### Basic Attributes (Required for all tools)

| Attribute | Type | Size/Options | Required | Array | Default |
|-----------|------|--------------|----------|-------|---------|
| `name` | String | 255 | Yes | No | - |
| `description` | String | 1000 | Yes | No | - |
| `category` | String | 50 | Yes | No | - |
| `tool_type` | String | 10 | Yes | No | Free |
| `image_url` | URL | 2000 | No | No | - |
| `video_url` | URL | 2000 | No | No | - |
| `website_url` | URL | 2000 | No | No | - |
| `date_added` | DateTime | - | Yes | No | Now |

### Extended Attributes (For Futurepedia scraped data)

| Attribute | Type | Size | Required | Array | Default |
|-----------|------|------|----------|-------|---------|
| `keyFeatures` | String | 5000 | No | Yes | [] |
| `pros` | String | 5000 | No | Yes | [] |
| `cons` | String | 5000 | No | Yes | [] |
| `whoIsUsing` | String | 5000 | No | Yes | [] |
| `pricingTiers` | String | 10000 | No | No | - |
| `whatMakesUnique` | String | 2000 | No | No | - |
| `ratings` | String | 2000 | No | No | - |
| `uncommonUseCases` | String | 5000 | No | Yes | [] |
| `dataSource` | String | 50 | No | No | api |

### Indexes
- `name` (Key: fulltext)
- `category` (Key: key)
- `date_added` (Key: key, Order: DESC)
- `tool_type` (Key: key)
- `dataSource` (Key: key)

---

## Step-by-Step Setup in Appwrite Console

### 1. Create Database

1. Go to your Appwrite Console: https://cloud.appwrite.io/
2. Select your project: `AI Tool Hunter`
3. Click **"Databases"** in the left sidebar
4. Click **"Create Database"**
5. Name: `ai-tool-hunter`
6. Database ID: `ai-tool-hunter` (same as in `.env.local`)

### 2. Create Categories Collection

1. Click **"Create Collection"**
2. **Collection Name**: Categories
3. **Collection ID**: `categories`
4. Click **"Create"**

#### Add Attributes:
1. Click **"Attributes"** tab
2. Click **"Create Attribute"** → **"String"**
   - Key: `name`
   - Size: 100
   - Required: ✅ Yes
   - Array: ❌ No
   - Default: (empty)

#### Set Permissions:
1. Click **"Settings"** tab
2. Under **"Permissions"**:
   - Add **"Any"** role with **Read** permission (for public access)
   - Add **"Users"** role with **Create, Read, Update, Delete** permissions (for admin)

### 3. Create Tools Collection

1. Click **"Create Collection"**
2. **Collection Name**: Tools
3. **Collection ID**: `tools`
4. Click **"Create"**

#### Add Basic Attributes:

**String Attributes:**
```
1. name (String, size: 255, required: ✅)
2. description (String, size: 1000, required: ✅)
3. category (String, size: 50, required: ✅)
4. tool_type (String, size: 10, required: ✅, default: "Free")
5. dataSource (String, size: 50, required: ❌, default: "api")
6. whatMakesUnique (String, size: 2000, required: ❌)
7. pricingTiers (String, size: 10000, required: ❌) # Stores JSON
8. ratings (String, size: 2000, required: ❌) # Stores JSON
```

**URL Attributes:**
```
9. image_url (URL, size: 2000, required: ❌)
10. video_url (URL, size: 2000, required: ❌)
11. website_url (URL, size: 2000, required: ❌)
```

**Array Attributes (String):**
```
12. keyFeatures (String, size: 5000, required: ❌, array: ✅)
13. pros (String, size: 5000, required: ❌, array: ✅)
14. cons (String, size: 5000, required: ❌, array: ✅)
15. whoIsUsing (String, size: 5000, required: ❌, array: ✅)
16. uncommonUseCases (String, size: 5000, required: ❌, array: ✅)
```

**DateTime Attributes:**
```
17. date_added (DateTime, required: ✅, default: now())
```

#### Set Permissions:
Same as Categories collection.

#### Add Indexes:
1. Click **"Indexes"** tab
2. Create these indexes:
   - `name_search` (Type: fulltext, Attributes: name)
   - `category_index` (Type: key, Attributes: category)
   - `date_index` (Type: key, Attributes: date_added, Order: DESC)
   - `type_index` (Type: key, Attributes: tool_type)
   - `source_index` (Type: key, Attributes: dataSource)

---

## Verification Checklist

After setting up, verify:

- [ ] Database `ai-tool-hunter` exists
- [ ] Collection `categories` exists with `name` attribute
- [ ] Collection `tools` exists with all 17 attributes
- [ ] All attributes have correct types (String, URL, DateTime)
- [ ] Array attributes are marked as Array
- [ ] `pricingTiers` and `ratings` are String type (to store JSON)
- [ ] Permissions allow public read and authenticated write
- [ ] Indexes are created for better performance

---

## Important Notes

### JSON Fields

These fields store JSON as strings and are parsed in the frontend:
- **pricingTiers**: Array of pricing tier objects
- **ratings**: Object with rating scores

**Why strings?** Appwrite doesn't support nested objects, so we serialize them as JSON strings.

### Array Fields

These are native Appwrite string arrays:
- **keyFeatures**: ["Feature 1", "Feature 2", ...]
- **pros**: ["Pro 1", "Pro 2", ...]
- **cons**: ["Con 1", "Con 2", ...]
- **whoIsUsing**: ["Content creators", "Developers", ...]
- **uncommonUseCases**: ["Use case 1", ...]

### Data Source Field

- `dataSource`: Either `"futurepedia"` or `"api"`
- Indicates where the data came from
- Tools with `"futurepedia"` source have rich extended data
- Tools with `"api"` source have basic data

---

## Troubleshooting

### "Attribute not found" errors
- Verify the attribute exists in Appwrite Console
- Check spelling and casing (use exact names from schema)
- Refresh your browser after creating attributes

### "Invalid document structure" errors
- Check that required fields are being provided
- Verify data types match (String, URL, DateTime)
- Make sure array fields receive arrays, not single values

### JSON parsing errors
- `pricingTiers` and `ratings` must be JSON strings
- Use `JSON.stringify()` when saving
- Use `JSON.parse()` when reading

### Missing data in UI
- Check that field names match exactly
- Verify permissions allow reading the fields
- Check browser console for errors

---

## Testing Your Schema

After setup, test by:

1. Go to admin dashboard
2. Add a tool using auto-generate
3. Check Appwrite Console → Databases → tools collection
4. Verify the document has all fields populated
5. Check if arrays and JSON fields are properly formatted

Expected document structure:
```json
{
  "$id": "unique_id",
  "name": "Notion",
  "description": "...",
  "category": "category_id",
  "tool_type": "Free",
  "dataSource": "futurepedia",
  "image_url": "https://...",
  "video_url": "https://...",
  "website_url": "https://...",
  "keyFeatures": ["Feature 1", "Feature 2"],
  "pros": ["Pro 1", "Pro 2"],
  "cons": ["Con 1", "Con 2"],
  "whoIsUsing": ["User type 1", "User type 2"],
  "pricingTiers": "[{\"name\":\"Free\",\"price\":\"$0\"},{\"name\":\"Pro\",\"price\":\"$10\"}]",
  "whatMakesUnique": "...",
  "ratings": "{\"overallScore\":4.5,\"easeOfUse\":5,...}",
  "date_added": "2025-01-01T00:00:00.000+00:00"
}
```

---

## Migration from Old Schema

If you have existing tools without the new fields:

1. New fields are all optional (not required)
2. Old tools will continue to work
3. Edit old tools in admin to populate new fields
4. Or regenerate data using auto-generate feature

No data loss will occur - the schema is backward compatible!
