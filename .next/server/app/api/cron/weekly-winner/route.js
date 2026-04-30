(()=>{var e={};e.id=332,e.ids=[332],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},41506:(e,t,r)=>{"use strict";r.d(t,{S:()=>s});var a=r(58329);let o=process.env.NEXT_PUBLIC_SUPABASE_URL??"https://placeholder.supabase.co",n=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??"placeholder-anon-key";function s(){let e=process.env.NEXT_PUBLIC_SUPABASE_URL??"https://placeholder.supabase.co",t=process.env.SUPABASE_SERVICE_KEY??"placeholder-service-key";return(0,a.UU)(e,t,{auth:{persistSession:!1}})}(0,a.UU)(o,n)},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},57075:e=>{"use strict";e.exports=require("node:stream")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},84297:e=>{"use strict";e.exports=require("async_hooks")},91090:(e,t,r)=>{"use strict";r.d(t,{X:()=>l,b:()=>i});var a=r(29640);function o(){return process.env.RESEND_API_KEY?new a.u(process.env.RESEND_API_KEY):null}let n=process.env.RESEND_FROM_EMAIL||"noreply@example.com",s=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";async function i(e,t,r){let a=o();if(!a||!e.email)return;let i=r>1?`⏰ ${e.name}, you have ${r} days to log!`:`⚡ Don't forget to log today's wins, ${e.name}!`,l=`
    <!DOCTYPE html>
    <html>
    <body style="background:#09090b;color:#f4f4f5;font-family:system-ui,sans-serif;padding:32px;margin:0">
      <div style="max-width:500px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="margin:0;font-size:28px">⚡ WorkQuest</h1>
          <p style="margin:8px 0 0;opacity:0.9">${t.name}</p>
        </div>
        <div style="background:#13131f;border-radius:12px;padding:24px;border:1px solid #1e1e30">
          <h2 style="margin:0 0 12px;color:#a78bfa">Hey ${e.name}!</h2>
          <p style="color:#a1a1aa;margin:0 0 16px">
            ${r>1?`You haven't logged your work for <strong style="color:#f59e0b">${r} days</strong>. You can log retroactively — don't lose those points!`:"The day is almost done. Log your wins and climb the leaderboard!"}
          </p>
          <a href="${s}/log" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
            Log My Work →
          </a>
        </div>
        <p style="text-align:center;color:#3f3f46;font-size:12px;margin-top:16px">
          WorkQuest \xb7 ${t.name} \xb7 <a href="${s}" style="color:#7c3aed">Open Dashboard</a>
        </p>
      </div>
    </body>
    </html>
  `;try{await a.emails.send({from:n,to:e.email,subject:i,html:l})}catch(t){console.error(`Failed to send reminder to ${e.email}:`,t)}}async function l(e,t,r){let a=o();if(!a)return;let i=t.filter(e=>e.email&&e.is_active);if(0===i.length)return;let l=`🏆 Weekly Champion: ${e.player.name} wins this week at ${r.name}!`,d=`
    <!DOCTYPE html>
    <html>
    <body style="background:#09090b;color:#f4f4f5;font-family:system-ui,sans-serif;padding:32px;margin:0">
      <div style="max-width:500px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="margin:0;font-size:28px">🏆 Weekly Champion!</h1>
          <p style="margin:8px 0 0;opacity:0.9">${r.name} \xb7 WorkQuest</p>
        </div>
        <div style="background:#13131f;border-radius:12px;padding:32px;border:1px solid #f59e0b;text-align:center">
          <div style="width:80px;height:80px;border-radius:50%;background:${e.player.avatar_color};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;font-weight:bold;color:white">
            ${e.player.name.charAt(0).toUpperCase()}
          </div>
          <h2 style="margin:0 0 8px;font-size:28px">${e.player.name}</h2>
          <p style="color:#f59e0b;font-size:18px;margin:0 0 4px;font-weight:600">🥇 This Week's Champion</p>
          <p style="color:#7c3aed;font-size:32px;font-weight:800;margin:16px 0">${e.total_score} pts</p>
          <p style="color:#a1a1aa;margin:0">Incredible work this week! 🔥</p>
        </div>
        <div style="text-align:center;margin-top:24px">
          <a href="${s}/leaderboard" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
            View Full Leaderboard →
          </a>
        </div>
        <p style="text-align:center;color:#3f3f46;font-size:12px;margin-top:16px">WorkQuest \xb7 ${r.name}</p>
      </div>
    </body>
    </html>
  `;try{await a.emails.send({from:n,to:i.map(e=>e.email),subject:l,html:d})}catch(e){console.error("Failed to send weekly winner email:",e)}}},93420:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>b,routeModule:()=>f,serverHooks:()=>k,workAsyncStorage:()=>h,workUnitAsyncStorage:()=>w});var a={};r.r(a),r.d(a,{GET:()=>x,dynamic:()=>g});var o=r(96559),n=r(48088),s=r(37719),i=r(32190),l=r(41506),d=r(91090),p=r(5200),c=r(17098),u=r(20592),y=r(90672),m=r(66429);let g="force-dynamic";async function x(e){if(e.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return i.NextResponse.json({error:"Unauthorized"},{status:401});try{let e=(0,l.S)(),t=new Date,r=(0,p.GP)((0,c.k)((0,u.e)(t,1),{weekStartsOn:1}),"yyyy-MM-dd"),a=(0,p.GP)(function(e,t){let r=(0,m.q)(),a=t?.weekStartsOn??t?.locale?.options?.weekStartsOn??r.weekStartsOn??r.locale?.options?.weekStartsOn??0,o=(0,y.a)(e),n=o.getDay();return o.setDate(o.getDate()+((n<a?-7:0)+6-(n-a))),o.setHours(23,59,59,999),o}((0,u.e)(t,1),{weekStartsOn:1}),"yyyy-MM-dd"),{data:o}=await e.from("companies").select("*");for(let t of o??[]){let{data:o}=await e.from("task_logs").select("player_id, total_score").eq("company_id",t.id).gte("task_date",r).lte("task_date",a);if(!o||0===o.length)continue;let n={};for(let e of o)n[e.player_id]=(n[e.player_id]||0)+e.total_score;let s=Object.entries(n).sort((e,t)=>t[1]-e[1])[0]?.[0];if(!s)continue;let{data:i}=await e.from("players").select("*").eq("id",s).single();if(!i)continue;let{data:l}=await e.from("weekly_winners").insert({player_id:s,company_id:t.id,week_start:r,week_end:a,total_score:n[s]}).select().single();if(!l)continue;let{data:p}=await e.from("players").select("*").eq("company_id",t.id).eq("is_active",!0);await (0,d.X)({...l,player:i},p??[],t)}return i.NextResponse.json({success:!0})}catch(e){return console.error(e),i.NextResponse.json({error:"Weekly winner cron failed"},{status:500})}}let f=new o.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/cron/weekly-winner/route",pathname:"/api/cron/weekly-winner",filename:"route",bundlePath:"app/api/cron/weekly-winner/route"},resolvedPagePath:"/Users/chaitanyav/Documents/Build_Sell/gamify-donna/app/api/cron/weekly-winner/route.ts",nextConfigOutput:"",userland:a}),{workAsyncStorage:h,workUnitAsyncStorage:w,serverHooks:k}=f;function b(){return(0,s.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:w})}},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[447,110,174,163],()=>r(93420));module.exports=a})();