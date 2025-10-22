# Document System - Ready for Testing

**Date:** 2025-01-20
**Status:** ✅ All fixes implemented, ready for testing
**Priority:** HIGH - Test before production deployment

---

## ✅ What Was Fixed

### Critical Issues Resolved
1. ✅ **Storage bucket inconsistency** - Created `documents` and `deal-documents` buckets
2. ✅ **Missing RLS policies** - Added 9 storage policies for security
3. ✅ **Client-side security gap** - Deal downloads now use server API with audit logging
4. ✅ **Environment variables** - Standardized bucket configuration

### Documentation Created
1. ✅ **Complete analysis** - 73-page technical deep-dive
2. ✅ **Separation rationale** - Why two systems exist
3. ✅ **Fixes summary** - All changes documented
4. ✅ **Quick reference** - One-page decision guide

---

## 🧪 Testing Checklist

### Prerequisites
- [ ] Restart Next.js dev server (to load new env vars)
- [ ] Verify `.env.local` has new bucket variables
- [ ] Confirm database migrations applied successfully

### Phase 1: Storage Buckets (Database)

```sql
-- Run this query to verify buckets exist:
SELECT id, name, public, file_size_limit
FROM storage.buckets
ORDER BY name;

-- Expected results:
-- deal-documents | deal-documents | false | 52428800
-- docs           | docs           | true  | null
-- documents      | documents      | false | 52428800
```

- [ ] Three buckets exist
- [ ] `documents` is private (public=false)
- [ ] `deal-documents` is private (public=false)
- [ ] File size limits are set

### Phase 2: Storage RLS Policies

```sql
-- Verify policies exist:
SELECT policyname, tablename
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Should see 9 policies
```

- [ ] Staff upload policies exist for both buckets
- [ ] Staff update/delete policies exist
- [ ] Authenticated read policy exists for documents
- [ ] Investor read policy exists for deal-documents

### Phase 3: Staff Upload (General Documents)

**Test Steps:**
1. Login as staff user
2. Navigate to Documents section
3. Click "Upload Document"
4. Choose "File Upload" tab
5. Select document type (e.g., "Report")
6. Choose a PDF file (<50MB)
7. Upload

**Expected Results:**
- [ ] Upload succeeds
- [ ] File stored in `documents` bucket
- [ ] Document record created in `documents` table
- [ ] Status is 'draft', is_published is false
- [ ] Audit log entry created
- [ ] No console errors

**Database Verification:**
```sql
-- Check document was created:
SELECT id, name, file_key, status, is_published
FROM documents
ORDER BY created_at DESC
LIMIT 1;

-- Check file is in storage:
SELECT name, bucket_id
FROM storage.objects
WHERE bucket_id = 'documents'
ORDER BY created_at DESC
LIMIT 1;
```

### Phase 4: Staff Upload (Deal Data Room)

**Test Steps:**
1. Login as staff user
2. Navigate to a Deal detail page
3. Click "Data Room" tab
4. Click "Upload Document"
5. Choose folder (e.g., "Legal")
6. Select file
7. Leave "visible_to_investors" unchecked
8. Upload

**Expected Results:**
- [ ] Upload succeeds
- [ ] File stored in `deal-documents` bucket
- [ ] Document record created in `deal_data_room_documents` table
- [ ] File path is `deals/{dealId}/Legal/{filename}`
- [ ] visible_to_investors is false
- [ ] Audit log entry created
- [ ] No console errors

**Database Verification:**
```sql
-- Check document was created:
SELECT id, file_name, file_key, folder, visible_to_investors
FROM deal_data_room_documents
ORDER BY created_at DESC
LIMIT 1;

-- Check file is in storage:
SELECT name, bucket_id
FROM storage.objects
WHERE bucket_id = 'deal-documents'
ORDER BY created_at DESC
LIMIT 1;
```

### Phase 5: General Document Download (Investor)

**Test Steps:**
1. As staff, publish a document (set is_published=true)
2. Login as investor who owns/subscribes to that document
3. Navigate to Documents page
4. Find the published document
5. Click "Download"

**Expected Results:**
- [ ] Download button works
- [ ] New tab opens with file
- [ ] File downloads successfully
- [ ] Audit log entry created with investor details
- [ ] No console errors

**Database Verification:**
```sql
-- Check audit log:
SELECT actor_user_id, action, entity, metadata
FROM audit_logs
WHERE action = 'document:download'
ORDER BY created_at DESC
LIMIT 1;

-- Verify metadata includes:
-- - file_key
-- - user_role
-- - expiry_minutes: 15
```

### Phase 6: Deal Document Download (Investor)

**Test Steps:**
1. As staff, grant data room access to investor for a deal
   - Navigate to Deal → Data Room Access tab
   - Click "Grant Access"
   - Select investor, no expiry date
2. As staff, make a document visible
   - Toggle visible_to_investors to true
3. Login as that investor
4. Navigate to Deal detail page
5. Click "Data Room" section
6. Click "Download" on visible document

**Expected Results:**
- [ ] Download button appears
- [ ] Click opens download in new tab
- [ ] File downloads successfully
- [ ] Audit log entry created with deal context
- [ ] No console errors

**Database Verification:**
```sql
-- Check audit log:
SELECT actor_user_id, action, entity, entity_id, metadata
FROM audit_logs
WHERE action = 'document:download'
AND entity = 'deals'
ORDER BY created_at DESC
LIMIT 1;

-- Verify metadata includes:
-- - document_id
-- - deal_name
-- - is_staff: false
-- - expiry_seconds: 120
```

### Phase 7: Access Control (Negative Tests)

**Test 7a: Investor without access cannot see deal documents**
1. Login as investor WITHOUT data room access to Deal A
2. Navigate to Deal A detail page
3. View Data Room section

**Expected:**
- [ ] "Access not granted" or empty state message
- [ ] No download buttons visible
- [ ] Cannot download documents even with direct API call

**Test 7b: Expired access blocks downloads**
1. As staff, grant access with expires_at in the past
2. As investor, try to download

**Expected:**
- [ ] Download fails
- [ ] Error message: "Data room access not granted or expired"

**Test 7c: Revoked access blocks downloads**
1. As staff, grant access then revoke it (set revoked_at)
2. As investor, try to download

**Expected:**
- [ ] Download fails
- [ ] Error message: "Data room access not granted or expired"

**Test 7d: Invisible documents not downloadable**
1. As staff, set visible_to_investors=false on a document
2. Investor has valid data room access
3. Try to download

**Expected:**
- [ ] Document not visible in list
- [ ] Direct API call returns 403

### Phase 8: File Type Validation

**Test Steps:**
1. Try to upload .exe file
2. Try to upload file >50MB

**Expected:**
- [ ] .exe file rejected (MIME type)
- [ ] Large file rejected (size limit)
- [ ] Error messages are clear

### Phase 9: Pre-Signed URL Expiry

**Test 9a: General document URLs expire after 15 minutes**
1. Download a document, copy the URL
2. Wait 16 minutes
3. Try to access URL again

**Expected:**
- [ ] URL returns 403 or expired error
- [ ] Cannot download file

**Test 9b: Deal document URLs expire after 2 minutes**
1. Download a deal document, copy the URL
2. Wait 3 minutes
3. Try to access URL again

**Expected:**
- [ ] URL returns 403 or expired error
- [ ] Cannot download file

### Phase 10: Audit Logging

**Verification Queries:**
```sql
-- All document downloads today:
SELECT
  al.action,
  al.entity,
  al.metadata->>'file_name' as file_name,
  al.metadata->>'user_role' as user_role,
  p.display_name,
  al.created_at
FROM audit_logs al
JOIN profiles p ON p.id = al.actor_user_id
WHERE al.action = 'document:download'
  AND al.created_at > CURRENT_DATE
ORDER BY al.created_at DESC;

-- Deal document downloads:
SELECT
  al.metadata->>'document_id' as doc_id,
  al.metadata->>'deal_name' as deal,
  al.metadata->>'is_staff' as is_staff,
  p.display_name,
  al.created_at
FROM audit_logs al
JOIN profiles p ON p.id = al.actor_user_id
WHERE al.action = 'document:download'
  AND al.entity = 'deals'
ORDER BY al.created_at DESC
LIMIT 10;
```

- [ ] All downloads are logged
- [ ] Logs include user details
- [ ] Logs include document details
- [ ] Logs distinguish staff vs investor
- [ ] Logs include deal context for deal documents

---

## 🐛 Known Issues / Edge Cases

### Not Yet Fixed
- [ ] Other code files may still reference wrong bucket names
- [ ] Files in legacy `docs` bucket not migrated
- [ ] Document versioning UI incomplete (schema exists)
- [ ] Folder hierarchy UI incomplete (schema exists)

### To Monitor
- Watch for upload failures (check bucket name usage)
- Monitor audit log volume (should increase)
- Check for 403 errors in storage access
- Verify RLS policies don't block legitimate access

---

## 🚀 Deployment Checklist

### Before Deploying to Production

1. **Environment Variables**
   - [ ] Add bucket env vars to production `.env`
   - [ ] Verify Supabase connection works
   - [ ] Test with production Supabase instance

2. **Database Migrations**
   - [ ] Apply storage bucket policies migration
   - [ ] Verify buckets exist in production
   - [ ] Verify RLS policies active

3. **Code Deployment**
   - [ ] Deploy new API endpoint: `/api/deals/[id]/documents/[documentId]/download`
   - [ ] Deploy updated `data-room-documents.tsx` component
   - [ ] Deploy updated `.env` configuration

4. **Post-Deployment Verification**
   - [ ] Test upload in production
   - [ ] Test download in production
   - [ ] Check audit logs are being created
   - [ ] Monitor error rates in production logs

---

## 📊 Success Metrics

After deployment, monitor:

1. **Upload Success Rate**
   - Target: >99% success rate
   - Watch for: Bucket name errors, file size rejections

2. **Download Success Rate**
   - Target: >99% success rate
   - Watch for: Access denied, expired URLs

3. **Audit Log Volume**
   - Expect: Increase in audit log entries
   - Should match: Number of downloads

4. **Security Incidents**
   - Target: Zero unauthorized access attempts
   - Monitor: Failed download attempts, revoked access usage

5. **Performance**
   - Download API latency: <500ms
   - Upload API latency: <2s for 10MB file
   - No degradation vs. previous system

---

## 📞 Support During Testing

### If Tests Fail

**Upload Fails:**
1. Check browser console for errors
2. Verify bucket exists: `SELECT * FROM storage.buckets WHERE name = 'documents'`
3. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'objects'`
4. Verify env vars loaded: Check Next.js startup logs

**Download Fails:**
1. Check network tab for API errors
2. Verify audit logs: `SELECT * FROM audit_logs WHERE action = 'document:download' ORDER BY created_at DESC LIMIT 5`
3. Test RLS: Try as different user roles
4. Check file exists: `SELECT * FROM storage.objects WHERE name LIKE '%filename%'`

**Access Denied:**
1. For general docs: Check is_published and ownership
2. For deal docs: Check data_room_access table
3. Verify RLS policies are active
4. Check user role in profiles table

### Getting Help

1. Check error logs: Browser console + server logs
2. Check audit logs: `audit_logs` table
3. Review documentation: `docs/` folder
4. Check this testing document for expected behavior

---

## ✅ Testing Sign-Off

Once all tests pass:

- [ ] All uploads work (general + deal)
- [ ] All downloads work (general + deal)
- [ ] Access control works (positive + negative tests)
- [ ] Audit logging works
- [ ] No console errors
- [ ] No security gaps
- [ ] Documentation reviewed

**Tester Name:** _________________
**Date:** _________________
**Sign-Off:** _________________

---

## 🎯 Next Steps After Testing

1. **If tests pass:**
   - Deploy to production
   - Monitor for 48 hours
   - Migrate files from `docs` bucket
   - Update remaining code references

2. **If tests fail:**
   - Document failure details
   - Check troubleshooting section
   - Review RLS policies
   - Verify environment configuration

---

**Current Status:** ✅ Ready for testing
**Last Updated:** 2025-01-20

---
