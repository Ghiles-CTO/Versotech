module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},875148,a=>{"use strict";a.s(["createClient",()=>c,"hasActiveSession",()=>d,"resetClient",()=>e]);var b=a.i(578644);let c=(0,b.registerClientReference)(function(){throw Error("Attempted to call createClient() from the server but createClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts <module evaluation>","createClient"),d=(0,b.registerClientReference)(function(){throw Error("Attempted to call hasActiveSession() from the server but hasActiveSession is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts <module evaluation>","hasActiveSession"),e=(0,b.registerClientReference)(function(){throw Error("Attempted to call resetClient() from the server but resetClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts <module evaluation>","resetClient")},977228,a=>{"use strict";a.s(["createClient",()=>c,"hasActiveSession",()=>d,"resetClient",()=>e]);var b=a.i(578644);let c=(0,b.registerClientReference)(function(){throw Error("Attempted to call createClient() from the server but createClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts","createClient"),d=(0,b.registerClientReference)(function(){throw Error("Attempted to call hasActiveSession() from the server but hasActiveSession is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts","hasActiveSession"),e=(0,b.registerClientReference)(function(){throw Error("Attempted to call resetClient() from the server but resetClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts","resetClient")},359725,a=>{"use strict";a.i(875148);var b=a.i(977228);a.n(b)},436687,a=>{"use strict";function b(a){var b;let c,d=Array.isArray(a?.conversation_participants)?a.conversation_participants.map(a=>{let b=a?.profiles||{};return{id:b.id||a.user_id,displayName:b.display_name||b.email||null,email:b.email||null,role:b.role||null,avatarUrl:b.avatar_url??null,participantRole:a?.participant_role??"member",joinedAt:a?.joined_at,lastReadAt:a?.last_read_at??null,lastNotifiedAt:a?.last_notified_at??null,isMuted:a?.is_muted??!1,isPinned:a?.is_pinned??!1}}):[],e=Array.isArray(a?.messages)?a.messages[0]:null,f=e?(c=(b=e).sender,{id:b.id,conversationId:b.conversation_id,senderId:b.sender_id,body:b.body??null,messageType:b.message_type??"text",fileKey:b.file_key??null,replyToMessageId:b.reply_to_message_id??null,metadata:b.metadata??{},createdAt:b.created_at,editedAt:b.edited_at??null,deletedAt:b.deleted_at??null,sender:c?{id:c.id??null,displayName:c.displayName??c.display_name??null,email:c.email??null,role:c.role??null,avatarUrl:c.avatarUrl??c.avatar_url??null}:null,readBy:Array.isArray(b.read_by)?b.read_by:[]}):null;return{id:a.id,subject:a.subject??null,preview:a.preview??null,type:a.type??"dm",visibility:a.visibility??"internal",ownerTeam:a.owner_team??null,dealId:a.deal_id??null,createdBy:a.created_by??null,createdAt:a.created_at,updatedAt:a.updated_at,lastMessageAt:a.last_message_at??null,lastMessageId:a.last_message_id??null,archivedAt:a.archived_at??null,metadata:a.metadata??{},participants:d,unreadCount:a.unreadCount??0,latestMessage:f,participantCount:d.length}}a.i(359725),a.s(["normalizeConversation",()=>b])},230087,a=>{"use strict";a.s(["MessagingClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call MessagingClient() from the server but MessagingClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/messaging/staff/messaging-client.tsx <module evaluation>","MessagingClient")},271712,a=>{"use strict";a.s(["MessagingClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call MessagingClient() from the server but MessagingClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/messaging/staff/messaging-client.tsx","MessagingClient")},711413,a=>{"use strict";a.i(230087);var b=a.i(271712);a.n(b)},644587,a=>{"use strict";var b=a.i(714898),c=a.i(711413),d=a.i(243085),e=a.i(198307),f=a.i(436687);async function g(){let a=await (0,d.requireAuth)(["staff_admin","staff_ops","staff_rm","ceo"]),g=(0,e.createServiceClient)();console.log("[Staff Messages Page] Loading conversations for user:",a.id);let{data:h,error:i}=await g.from("conversations").select(`
      *,
      conversation_participants (
        conversation_id,
        user_id,
        participant_role,
        joined_at,
        last_read_at,
        last_notified_at,
        is_muted,
        is_pinned,
        profiles:user_id (
          id,
          display_name,
          email,
          role,
          avatar_url
        )
      ),
      messages (
        id,
        conversation_id,
        sender_id,
        body,
        message_type,
        file_key,
        reply_to_message_id,
        metadata,
        created_at,
        edited_at,
        deleted_at,
        sender:sender_id (
          id,
          display_name,
          email,
          role,
          avatar_url
        )
      )
    `).order("last_message_at",{ascending:!1,nullsFirst:!1}).order("created_at",{foreignTable:"messages",ascending:!1}).limit(1,{foreignTable:"messages"}).limit(50);if(i)throw console.error("[Staff Messages Page] Error loading conversations:",i),Error(i.message);console.log("[Staff Messages Page] Loaded conversations:",h?.length||0);let j=(h||[]).map(f.normalizeConversation),k=j.map(a=>a.id);if(k.length>0){let{data:b}=await g.rpc("get_conversation_unread_counts",{p_user_id:a.id,p_conversation_ids:k}),c=new Map;for(let a of b||[])a?.conversation_id&&c.set(a.conversation_id,Number(a.unread_count)||0);for(let a of j)a.unreadCount=c.get(a.id)??0}return(0,b.jsx)(c.MessagingClient,{initialConversations:j,currentUserId:a.id})}a.s(["default",()=>g,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__6d7eef48._.js.map