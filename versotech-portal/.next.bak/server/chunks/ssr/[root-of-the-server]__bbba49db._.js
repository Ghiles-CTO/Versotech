module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},718829,a=>{"use strict";var b=a.i(999684);let c=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},d=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.forwardRef)(({color:a="currentColor",size:c=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...e,width:c,height:c,stroke:a,strokeWidth:g?24*Number(f)/Number(c):f,className:d("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),g=(a,e)=>{let g=(0,b.forwardRef)(({className:g,...h},i)=>(0,b.createElement)(f,{ref:i,iconNode:e,className:d(`lucide-${c(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,g),...h}));return g.displayName=c(a),g};a.s(["default",()=>g],718829)},441196,a=>{"use strict";let b=(0,a.i(718829).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);a.s(["AlertCircle",()=>b],441196)},875148,a=>{"use strict";a.s(["createClient",()=>c,"hasActiveSession",()=>d,"resetClient",()=>e]);var b=a.i(578644);let c=(0,b.registerClientReference)(function(){throw Error("Attempted to call createClient() from the server but createClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts <module evaluation>","createClient"),d=(0,b.registerClientReference)(function(){throw Error("Attempted to call hasActiveSession() from the server but hasActiveSession is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts <module evaluation>","hasActiveSession"),e=(0,b.registerClientReference)(function(){throw Error("Attempted to call resetClient() from the server but resetClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts <module evaluation>","resetClient")},977228,a=>{"use strict";a.s(["createClient",()=>c,"hasActiveSession",()=>d,"resetClient",()=>e]);var b=a.i(578644);let c=(0,b.registerClientReference)(function(){throw Error("Attempted to call createClient() from the server but createClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts","createClient"),d=(0,b.registerClientReference)(function(){throw Error("Attempted to call hasActiveSession() from the server but hasActiveSession is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts","hasActiveSession"),e=(0,b.registerClientReference)(function(){throw Error("Attempted to call resetClient() from the server but resetClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/lib/supabase/client.ts","resetClient")},359725,a=>{"use strict";a.i(875148);var b=a.i(977228);a.n(b)},436687,a=>{"use strict";function b(a){var b;let c,d=Array.isArray(a?.conversation_participants)?a.conversation_participants.map(a=>{let b=a?.profiles||{};return{id:b.id||a.user_id,displayName:b.display_name||b.email||null,email:b.email||null,role:b.role||null,avatarUrl:b.avatar_url??null,participantRole:a?.participant_role??"member",joinedAt:a?.joined_at,lastReadAt:a?.last_read_at??null,lastNotifiedAt:a?.last_notified_at??null,isMuted:a?.is_muted??!1,isPinned:a?.is_pinned??!1}}):[],e=Array.isArray(a?.messages)?a.messages[0]:null,f=e?(c=(b=e).sender,{id:b.id,conversationId:b.conversation_id,senderId:b.sender_id,body:b.body??null,messageType:b.message_type??"text",fileKey:b.file_key??null,replyToMessageId:b.reply_to_message_id??null,metadata:b.metadata??{},createdAt:b.created_at,editedAt:b.edited_at??null,deletedAt:b.deleted_at??null,sender:c?{id:c.id??null,displayName:c.displayName??c.display_name??null,email:c.email??null,role:c.role??null,avatarUrl:c.avatarUrl??c.avatar_url??null}:null,readBy:Array.isArray(b.read_by)?b.read_by:[]}):null;return{id:a.id,subject:a.subject??null,preview:a.preview??null,type:a.type??"dm",visibility:a.visibility??"internal",ownerTeam:a.owner_team??null,dealId:a.deal_id??null,createdBy:a.created_by??null,createdAt:a.created_at,updatedAt:a.updated_at,lastMessageAt:a.last_message_at??null,lastMessageId:a.last_message_id??null,archivedAt:a.archived_at??null,metadata:a.metadata??{},participants:d,unreadCount:a.unreadCount??0,latestMessage:f,participantCount:d.length}}a.i(359725),a.s(["normalizeConversation",()=>b])},230087,a=>{"use strict";a.s(["MessagingClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call MessagingClient() from the server but MessagingClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/messaging/staff/messaging-client.tsx <module evaluation>","MessagingClient")},271712,a=>{"use strict";a.s(["MessagingClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call MessagingClient() from the server but MessagingClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/messaging/staff/messaging-client.tsx","MessagingClient")},711413,a=>{"use strict";a.i(230087);var b=a.i(271712);a.n(b)},283272,a=>{"use strict";var b=a.i(714898),c=a.i(711413),d=a.i(198307),e=a.i(436687),f=a.i(441196),g=a.i(243085);async function h(){let a=await (0,d.createClient)(),{data:{user:h},error:i}=await a.auth.getUser();if(!h||i)return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(f.AlertCircle,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"Authentication Required"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"Please log in to view messages."})]})});let j=await (0,g.checkStaffAccess)(h.id),k=(0,d.createServiceClient)(),{data:l}=await k.rpc("get_user_personas",{p_user_id:h.id}),m=l?.some(a=>"arranger"===a.persona_type)||!1,n=l?.some(a=>"introducer"===a.persona_type)||!1;if(m&&!j)return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(f.AlertCircle,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"Messages Not Available"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"As an arranger, you'll receive important updates via the notification system. Check the notification bell for alerts about agreements, payments, and signatures."})]})});if(n&&!j)return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(f.AlertCircle,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"Messages Not Available"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"As an introducer, you'll receive important updates via the notification system. Check the notification bell for alerts about introduction progress and commission updates."})]})});let o=[];if(j){let{data:a,error:b}=await k.from("conversations").select(`
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
      `).order("last_message_at",{ascending:!1,nullsFirst:!1}).order("created_at",{foreignTable:"messages",ascending:!1}).limit(1,{foreignTable:"messages"}).limit(50);b&&console.error("[Messages Page] Error loading conversations:",b),o=a||[]}else{let{data:a,error:b}=await k.from("conversations").select(`
        *,
        conversation_participants!inner (
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
      `).eq("conversation_participants.user_id",h.id).order("last_message_at",{ascending:!1,nullsFirst:!1}).order("created_at",{foreignTable:"messages",ascending:!1}).limit(1,{foreignTable:"messages"}).limit(50);b&&console.error("[Messages Page] Error loading conversations:",b),o=a||[]}let p=o.map(e.normalizeConversation),q=p.map(a=>a.id);if(q.length>0){let{data:a}=await k.rpc("get_conversation_unread_counts",{p_user_id:h.id,p_conversation_ids:q}),b=new Map;for(let c of a||[])c?.conversation_id&&b.set(c.conversation_id,Number(c.unread_count)||0);for(let a of p)a.unreadCount=b.get(a.id)??0}return(0,b.jsx)(c.MessagingClient,{initialConversations:p,currentUserId:h.id})}a.s(["default",()=>h,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__bbba49db._.js.map