# Appwrite Troubleshooting - Array Fields

## Common Issue: Array Fields Showing as Empty

### Problem Description
When saving tools with Futurepedia data, array fields (keyFeatures, pros, cons, whoIsUsing) appear empty or null in Appwrite, even though the data is being sent.

### Root Cause
Appwrite has specific requirements for array fields that might not be met.

## ✅ Solution Checklist

### 1. Verify Array Attributes Are Correctly Created

In Appwrite Console → Databases → ai-tool-hunter → tools → Attributes:

For **each** of these fields:
- keyFeatures
- pros
- cons
- whoIsUsing
- uncommonUseCases

Verify:
- ✅ **Type**: String
- ✅ **Size**: 5000 or higher
- ✅ **Required**: NO (unchecked)
- ✅ **Array**: YES (checked) ← **CRITICAL!**
- ✅ **Default**: Empty array `[]`

### 2. How to Create Array Attribute Correctly

If you need to recreate an attribute:

1. **Delete the old attribute** (if it exists and is wrong)
2. Click **"Create Attribute"**
3. Select **"String"**
4. Fill in:
   ```
   Key: keyFeatures
   Size: 5000
   Required: [ ] No
   Array: [✓] Yes  ← CHECK THIS BOX!
   Default: []
   ```
5. Click **"Create"**

**Repeat for**: pros, cons, whoIsUsing, uncommonUseCases

### 3. JSON String Fields (NOT Arrays)

These should be String type but **NOT** arrays:
- pricingTiers
- ratings
- whatMakesUnique
- dataSource

Settings:
```
Type: String
Size: 10000 (for pricingTiers), 2000 (for ratings/whatMakesUnique), 50 (for dataSource)
Required: No
Array: [ ] No  ← NOT AN ARRAY!
```

## 🔍 How to Verify It's Working

### Method 1: Direct Test in Appwrite Console

1. Go to Appwrite Console → Databases → tools
2. Click **"Create Document"** (manual test)
3. Try to add data to keyFeatures:
   - Click the `+ Add item` button
   - Add a test value like "Feature 1"
   - Click `+ Add item` again
   - Add "Feature 2"

If you can add multiple items, the array field is configured correctly!

If you can't add items or there's no `+ Add item` button, the field is **not** configured as an array.

### Method 2: Check Existing Documents

1. Find a tool you created
2. Click to view the document
3. Check the keyFeatures field:
   - ✅ **Correct**: Shows as `["item1", "item2", "item3"]`
   - ❌ **Wrong**: Shows as `null`, `""`, or single string

### Method 3: Check Schema Definition

1. Go to Attributes tab
2. Find keyFeatures row
3. Check the **"Array"** column
   - ✅ Should show: "Yes" or a checkmark
   - ❌ If it shows: "No" or is empty, recreate the attribute

## 🐛 Common Mistakes

### Mistake 1: Created as Single String Instead of Array
```
❌ Wrong: Type: String, Array: No
✅ Right: Type: String, Array: Yes
```

**How it fails:**
- Frontend sends: `["Feature 1", "Feature 2", "Feature 3"]`
- Appwrite rejects or converts to: `null`
- Tool detail page shows: Nothing

### Mistake 2: Size Too Small
```
❌ Wrong: Size: 255
✅ Right: Size: 5000+
```

**How it fails:**
- Data gets truncated
- Only partial array saved
- Some items missing

### Mistake 3: Marked as Required
```
❌ Wrong: Required: Yes
✅ Right: Required: No
```

**How it fails:**
- Can't save tools without Futurepedia data
- API fallback tools fail to save
- Errors when saving

### Mistake 4: Wrong Data Type
```
❌ Wrong: Type: Integer[], Type: Object
✅ Right: Type: String, Array: Yes
```

**How it fails:**
- Type mismatch
- Data rejected by Appwrite
- Null values in database

## 📋 Step-by-Step Fix

If fields are showing empty, follow these steps:

### Step 1: Backup Existing Data (if any)
```
Go to tools collection → Export as JSON
```

### Step 2: Delete Wrong Attributes
```
For each wrong field:
1. Go to Attributes tab
2. Click the three dots (...) next to the field
3. Click "Delete Attribute"
4. Confirm deletion
```

### Step 3: Recreate Attributes Correctly

**For Array Fields** (keyFeatures, pros, cons, whoIsUsing, uncommonUseCases):
```
1. Click "Create Attribute"
2. Choose "String"
3. Enter:
   - Key: [field name]
   - Size: 5000
   - Required: Uncheck
   - Array: CHECK THIS BOX ✓
   - Default: [] (optional)
4. Click "Create"
5. Wait for attribute to be created (shows "available" status)
```

**For JSON String Fields** (pricingTiers, ratings):
```
1. Click "Create Attribute"
2. Choose "String"
3. Enter:
   - Key: [field name]
   - Size: 10000 (pricingTiers) or 2000 (ratings)
   - Required: Uncheck
   - Array: UNCHECK (NOT an array)
4. Click "Create"
```

**For Regular String Fields** (whatMakesUnique, dataSource):
```
1. Click "Create Attribute"
2. Choose "String"
3. Enter:
   - Key: [field name]
   - Size: 2000 (whatMakesUnique) or 50 (dataSource)
   - Required: Uncheck
   - Array: Uncheck
4. Click "Create"
```

### Step 4: Test with New Tool

1. Go to admin dashboard
2. Add a popular tool (e.g., "Notion")
3. Check terminal logs show scraped data
4. Save the tool
5. Check Appwrite Console
6. Verify arrays have data: `["item1", "item2"]`

### Step 5: Restore Old Data (if needed)

If you had existing tools:
1. Edit each tool in admin dashboard
2. Regenerate data with auto-generate
3. Save again

## 🎯 Visual Guide

### ✅ Correct Array Field Configuration

```
Attribute Settings:
┌─────────────────────────────┐
│ Attribute Key: keyFeatures  │
│ Type: String                │
│ Size: 5000                  │
│ Required: [ ]               │
│ Array: [✓]  ← MUST BE CHECKED!
│ Default: []                 │
└─────────────────────────────┘
```

### ❌ Wrong Configuration (Not Array)

```
Attribute Settings:
┌─────────────────────────────┐
│ Attribute Key: keyFeatures  │
│ Type: String                │
│ Size: 5000                  │
│ Required: [ ]               │
│ Array: [ ]  ← WRONG! NOT CHECKED!
│ Default:                    │
└─────────────────────────────┘
```

## 💾 Expected Data in Appwrite

After saving a tool with Futurepedia data, the document should look like:

```json
{
  "$id": "unique_id",
  "name": "Notion",
  "keyFeatures": [
    "All-in-one workspace",
    "Customizable templates",
    "Real-time collaboration",
    "Cross-platform sync",
    "Database functionality"
  ],
  "pros": [
    "Highly versatile",
    "Great for teams",
    "Extensive integrations",
    "Clean interface"
  ],
  "cons": [
    "Steep learning curve",
    "Can be overwhelming",
    "Limited offline mode"
  ],
  "whoIsUsing": [
    "Content creators",
    "Project managers",
    "Students",
    "Small businesses"
  ],
  "pricingTiers": "[{\"name\":\"Free\",\"price\":\"$0\"},{\"name\":\"Plus\",\"price\":\"$8/month\"}]",
  "ratings": "{\"overallScore\":4.5,\"easeOfUse\":4.0,...}",
  "whatMakesUnique": "Notion combines notes, docs, wikis...",
  "dataSource": "futurepedia"
}
```

**Key Points:**
- Arrays are actual JSON arrays: `["item1", "item2"]`
- NOT strings: `"item1,item2"` ❌
- NOT single values: `"item1"` ❌
- NOT null: `null` ❌

## 🔎 Quick Diagnostic Commands

### Check Attribute Type in Appwrite

1. Go to Attributes tab
2. Look at the table columns
3. Find the **"Array"** column
4. All array fields should show "Yes"

| Key | Type | Size | Required | Array |
|-----|------|------|----------|-------|
| keyFeatures | String | 5000 | No | **Yes** ✓ |
| pros | String | 5000 | No | **Yes** ✓ |
| cons | String | 5000 | No | **Yes** ✓ |
| pricingTiers | String | 10000 | No | **No** |
| ratings | String | 2000 | No | **No** |

## ✅ Verification Checklist

After fixing, verify:

- [ ] keyFeatures attribute is Type: String, Array: Yes
- [ ] pros attribute is Type: String, Array: Yes
- [ ] cons attribute is Type: String, Array: Yes
- [ ] whoIsUsing attribute is Type: String, Array: Yes
- [ ] uncommonUseCases attribute is Type: String, Array: Yes
- [ ] pricingTiers is Type: String, Array: No (stores JSON)
- [ ] ratings is Type: String, Array: No (stores JSON)
- [ ] All array fields have Size ≥ 5000
- [ ] All fields are NOT required (optional)
- [ ] Can manually add array items in Appwrite Console
- [ ] Test tool saves with actual array data (not null)
- [ ] Tool detail page displays all sections

## 🆘 Still Having Issues?

If arrays are still empty after following all steps:

1. **Check browser console** for errors when saving
2. **Check terminal logs** show data is being sent
3. **Try manually creating a document** in Appwrite Console
4. **Check Appwrite project permissions** (Any: Read, Users: CRUD)
5. **Verify you're looking at the right database/collection**
6. **Check Appwrite version** (should be latest)

The issue is almost always: **Array checkbox not checked when creating attribute!**
