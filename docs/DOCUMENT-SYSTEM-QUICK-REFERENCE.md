# Document System Quick Reference Card

---

## 🎯 Quick Decision: Which System?

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Is this for an ACTIVE DEAL with NDA/confidentiality?      │
│                                                             │
│  YES → Deal Data Room (deal_data_room_documents)           │
│  NO  → General Documents (documents)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 System Comparison

| Feature | **General Documents** | **Deal Data Room** |
|---------|----------------------|-------------------|
| **Table** | `documents` | `deal_data_room_documents` |
| **Bucket** | `documents` | `deal-documents` |
| **For** | Permanent records | Temporary deal docs |
| **Access** | Published + ownership | Access grants + visible flag |
| **Expires** | Never | Can expire |
| **Revocable** | No | Yes |

---

## 🔑 Environment Variables

```env
# General Documents
STORAGE_BUCKET_NAME=documents
NEXT_PUBLIC_STORAGE_BUCKET_NAME=documents

# Deal Data Rooms
DEAL_DOCUMENTS_BUCKET=deal-documents
NEXT_PUBLIC_DEAL_DOCUMENTS_BUCKET=deal-documents
```

---

## 📍 API Endpoints

### General Documents
```typescript
GET  /api/documents                      // List/search
POST /api/documents/upload               // Upload file
POST /api/documents/link                 // Link external
GET  /api/documents/[id]/download        // Download (15 min expiry)
```

### Deal Data Rooms
```typescript
POST /api/deals/[id]/documents/upload                    // Upload
GET  /api/deals/[id]/documents/[docId]/download          // Download (2 min expiry)
GET  /api/deals/[id]/data-room-access                    // List access grants
POST /api/deals/[id]/data-room-access                    // Grant/revoke access
```

---

## ✅ Use General Documents For:

- ✅ Quarterly investor statements
- ✅ Annual tax documents (K-1s)
- ✅ Finalized subscription agreements
- ✅ Fund performance reports
- ✅ Legal notices
- ✅ KYC/AML documentation
- ✅ Any permanent investor record

---

## ✅ Use Deal Data Room For:

- ✅ Draft term sheets
- ✅ Due diligence materials
- ✅ Confidential presentations
- ✅ Financial projections
- ✅ Documents under negotiation
- ✅ NDA-protected materials
- ✅ Documents that expire with deal

---

## 🔒 Access Control

### General Documents
```
Staff:     Full access
Investors: Only published docs they own/subscribe to
```

### Deal Data Rooms
```
Staff:     Full access
Investors: Need active access grant:
           - visible_to_investors = true
           - Access not revoked
           - Access not expired
```

---

## 📝 Common Workflows

### Upload General Document (Staff)
```typescript
1. Use UploadDocumentModal component
2. Choose "File Upload" or "Link Document"
3. Select document type
4. Upload → Creates draft (is_published=false)
5. Later: Publish via admin panel
```

### Upload Deal Document (Staff)
```typescript
1. Navigate to Deal detail → Data Room tab
2. Click "Upload Document"
3. Select folder, set visibility=false
4. Upload to data room
5. Later: Toggle visible_to_investors=true
```

### Grant Data Room Access (Staff)
```typescript
1. Deal detail → Data Room Access tab
2. Click "Grant Access"
3. Select investor
4. Optional: Set expiry date
5. Access granted
```

### Download Document (Investor)
```typescript
// Automatic via UI buttons
// Both systems now use server-side API endpoints
// Full audit logging enabled
```

---

## 🛡️ Security Features

| Feature | General Docs | Deal Docs |
|---------|--------------|-----------|
| **URL Expiry** | 15 minutes | 2 minutes |
| **Audit Logging** | ✅ Yes | ✅ Yes |
| **Watermarking** | ✅ Yes | ✅ Yes |
| **RLS Policies** | ✅ Yes | ✅ Yes |
| **Access Revocation** | N/A | ✅ Yes |
| **Time-Limited Access** | N/A | ✅ Yes |

---

## 🗂️ Folder Organization

### General Documents
```
Hierarchical folders (optional):
  /VERSO Fund I
    /Agreements
    /KYC Documents
    /Position Statements
    /Reports
```

### Deal Data Rooms
```
Simple string folders:
  "Legal"
  "Financial"
  "Due Diligence"
  "Misc"
```

---

## 🚨 Common Mistakes to Avoid

❌ **Don't** use deal data room for permanent records
❌ **Don't** use general documents for time-sensitive deal materials
❌ **Don't** forget to grant data room access before setting docs visible
❌ **Don't** hardcode bucket names (use env vars)
❌ **Don't** generate pre-signed URLs client-side (use API endpoints)
❌ **Don't** try to unify the two systems

---

## 📞 Support

**Documentation:**
- Full analysis: `docs/document-system-analysis.md`
- Separation rationale: `docs/document-systems-separation.md`
- Fixes summary: `docs/document-system-fixes-summary.md`

**Questions?**
- Check documentation first
- Review RLS policies for access issues
- Verify environment variables are set
- Check audit logs for download issues

---

## 🔧 Troubleshooting

### "Document not found"
→ Check RLS policies, verify user has access

### "Failed to create download link"
→ Check bucket exists, verify file_key is correct

### "Data room access denied"
→ Verify investor has active access grant (not revoked, not expired)

### Upload fails
→ Check file size (<50MB), verify MIME type allowed

---

**Last Updated:** 2025-01-20
**System Status:** ✅ Active and Secure

---
