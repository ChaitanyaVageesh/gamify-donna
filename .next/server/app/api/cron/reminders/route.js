(()=>{var e={};e.id=606,e.ids=[606],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},41506:(e,t,r)=>{"use strict";r.d(t,{S:()=>o});var a=r(58329);let n=process.env.NEXT_PUBLIC_SUPABASE_URL??"https://placeholder.supabase.co",i=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??"placeholder-anon-key";function o(){let e=process.env.NEXT_PUBLIC_SUPABASE_URL??"https://placeholder.supabase.co",t=process.env.SUPABASE_SERVICE_KEY??"placeholder-service-key";return(0,a.UU)(e,t,{auth:{persistSession:!1}})}(0,a.UU)(n,i)},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},57075:e=>{"use strict";e.exports=require("node:stream")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},69615:(e,t,r)=>{"use strict";r.d(t,{H:()=>n});var a=r(65342);function n(e,t){let r,n,m=t?.additionalDigits??2,g=function(e){let t,r={},a=e.split(i.dateTimeDelimiter);if(a.length>2)return r;if(/:/.test(a[0])?t=a[0]:(r.date=a[0],t=a[1],i.timeZoneDelimiter.test(r.date)&&(r.date=e.split(i.timeZoneDelimiter)[0],t=e.substr(r.date.length,e.length))),t){let e=i.timezone.exec(t);e?(r.time=t.replace(e[1],""),r.timezone=e[1]):r.time=t}return r}(e);if(g.date){let e=function(e,t){let r=RegExp("^(?:(\\d{4}|[+-]\\d{"+(4+t)+"})|(\\d{2}|[+-]\\d{"+(2+t)+"})$)"),a=e.match(r);if(!a)return{year:NaN,restDateString:""};let n=a[1]?parseInt(a[1]):null,i=a[2]?parseInt(a[2]):null;return{year:null===i?n:100*i,restDateString:e.slice((a[1]||a[2]).length)}}(g.date,m);r=function(e,t){var r,a,n,i,s,l,p,m;if(null===t)return new Date(NaN);let g=e.match(o);if(!g)return new Date(NaN);let f=!!g[4],x=d(g[1]),y=d(g[2])-1,h=d(g[3]),b=d(g[4]),v=d(g[5])-1;if(f){return(r=0,a=b,n=v,a>=1&&a<=53&&n>=0&&n<=6)?function(e,t,r){let a=new Date(0);a.setUTCFullYear(e,0,4);let n=a.getUTCDay()||7;return a.setUTCDate(a.getUTCDate()+((t-1)*7+r+1-n)),a}(t,b,v):new Date(NaN)}{let e=new Date(0);return(i=t,s=y,l=h,s>=0&&s<=11&&l>=1&&l<=(c[s]||(u(i)?29:28))&&(p=t,(m=x)>=1&&m<=(u(p)?366:365)))?(e.setUTCFullYear(t,y,Math.max(x,h)),e):new Date(NaN)}}(e.restDateString,e.year)}if(!r||isNaN(r.getTime()))return new Date(NaN);let f=r.getTime(),x=0;if(g.time&&isNaN(x=function(e){var t,r,n;let i=e.match(s);if(!i)return NaN;let o=p(i[1]),l=p(i[2]),d=p(i[3]);return(t=o,r=l,n=d,24===t?0===r&&0===n:n>=0&&n<60&&r>=0&&r<60&&t>=0&&t<25)?o*a.s0+l*a.Cg+1e3*d:NaN}(g.time)))return new Date(NaN);if(g.timezone){if(isNaN(n=function(e){var t,r;if("Z"===e)return 0;let n=e.match(l);if(!n)return 0;let i="+"===n[1]?-1:1,o=parseInt(n[2]),s=n[3]&&parseInt(n[3])||0;return(t=0,(r=s)>=0&&r<=59)?i*(o*a.s0+s*a.Cg):NaN}(g.timezone)))return new Date(NaN)}else{let e=new Date(f+x),t=new Date(0);return t.setFullYear(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()),t.setHours(e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds(),e.getUTCMilliseconds()),t}return new Date(f+x+n)}let i={dateTimeDelimiter:/[T ]/,timeZoneDelimiter:/[Z ]/i,timezone:/([Z+-].*)$/},o=/^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,s=/^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,l=/^([+-])(\d{2})(?::?(\d{2}))?$/;function d(e){return e?parseInt(e):1}function p(e){return e&&parseFloat(e.replace(",","."))||0}let c=[31,null,31,30,31,30,31,31,30,31,30,31];function u(e){return e%400==0||e%4==0&&e%100!=0}},71261:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>h,routeModule:()=>g,serverHooks:()=>y,workAsyncStorage:()=>f,workUnitAsyncStorage:()=>x});var a={};r.r(a),r.d(a,{GET:()=>m,dynamic:()=>u});var n=r(96559),i=r(48088),o=r(37719),s=r(32190),l=r(41506),d=r(91090),p=r(30083),c=r(69615);let u="force-dynamic";async function m(e){if(e.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return s.NextResponse.json({error:"Unauthorized"},{status:401});try{let e=(0,l.S)(),t=new Date().toISOString().split("T")[0],{data:r}=await e.from("companies").select("*"),a=0;for(let n of r??[]){let{data:r}=await e.from("players").select("*").eq("company_id",n.id).eq("is_active",!0).not("email","is",null);for(let i of r??[]){let{data:r}=await e.from("task_logs").select("id").eq("player_id",i.id).eq("task_date",t).limit(1);if(r&&r.length>0)continue;let{data:o}=await e.from("task_logs").select("task_date").eq("player_id",i.id).order("task_date",{ascending:!1}).limit(1),s=o?.[0]?.task_date?(0,p.m)(new Date,(0,c.H)(o[0].task_date)):1;await (0,d.b)(i,n,s),a++}}return s.NextResponse.json({sent:a})}catch(e){return console.error(e),s.NextResponse.json({error:"Cron failed"},{status:500})}}let g=new n.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/cron/reminders/route",pathname:"/api/cron/reminders",filename:"route",bundlePath:"app/api/cron/reminders/route"},resolvedPagePath:"/Users/chaitanyav/Documents/Build_Sell/gamify-donna/app/api/cron/reminders/route.ts",nextConfigOutput:"",userland:a}),{workAsyncStorage:f,workUnitAsyncStorage:x,serverHooks:y}=g;function h(){return(0,o.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:x})}},78335:()=>{},84297:e=>{"use strict";e.exports=require("async_hooks")},91090:(e,t,r)=>{"use strict";r.d(t,{X:()=>l,b:()=>s});var a=r(29640);function n(){return process.env.RESEND_API_KEY?new a.u(process.env.RESEND_API_KEY):null}let i=process.env.RESEND_FROM_EMAIL||"noreply@example.com",o=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";async function s(e,t,r){let a=n();if(!a||!e.email)return;let s=r>1?`⏰ ${e.name}, you have ${r} days to log!`:`⚡ Don't forget to log today's wins, ${e.name}!`,l=`
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
          <a href="${o}/log" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
            Log My Work →
          </a>
        </div>
        <p style="text-align:center;color:#3f3f46;font-size:12px;margin-top:16px">
          WorkQuest \xb7 ${t.name} \xb7 <a href="${o}" style="color:#7c3aed">Open Dashboard</a>
        </p>
      </div>
    </body>
    </html>
  `;try{await a.emails.send({from:i,to:e.email,subject:s,html:l})}catch(t){console.error(`Failed to send reminder to ${e.email}:`,t)}}async function l(e,t,r){let a=n();if(!a)return;let s=t.filter(e=>e.email&&e.is_active);if(0===s.length)return;let l=`🏆 Weekly Champion: ${e.player.name} wins this week at ${r.name}!`,d=`
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
          <a href="${o}/leaderboard" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
            View Full Leaderboard →
          </a>
        </div>
        <p style="text-align:center;color:#3f3f46;font-size:12px;margin-top:16px">WorkQuest \xb7 ${r.name}</p>
      </div>
    </body>
    </html>
  `;try{await a.emails.send({from:i,to:s.map(e=>e.email),subject:l,html:d})}catch(e){console.error("Failed to send weekly winner email:",e)}}},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[447,110,174],()=>r(71261));module.exports=a})();