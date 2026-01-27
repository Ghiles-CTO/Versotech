module.exports=[589578,a=>{a.v({className:"geist_a71539c9-module__T19VSG__className",variable:"geist_a71539c9-module__T19VSG__variable"})},435214,a=>{a.v({className:"geist_mono_8d43a2aa-module__8Li5zG__className",variable:"geist_mono_8d43a2aa-module__8Li5zG__variable"})},265986,a=>{a.v({className:"league_spartan_620a3bef-module__6cOzLG__className",variable:"league_spartan_620a3bef-module__6cOzLG__variable"})},214345,a=>{"use strict";a.s(["AuthInitWrapper",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call AuthInitWrapper() from the server but AuthInitWrapper is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/auth-init-wrapper.tsx <module evaluation>","AuthInitWrapper")},228546,a=>{"use strict";a.s(["AuthInitWrapper",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call AuthInitWrapper() from the server but AuthInitWrapper is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/auth-init-wrapper.tsx","AuthInitWrapper")},905202,a=>{"use strict";a.i(214345);var b=a.i(228546);a.n(b)},798263,a=>{"use strict";a.s(["Toaster",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call Toaster() from the server but Toaster is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/ui/sonner.tsx <module evaluation>","Toaster")},334585,a=>{"use strict";a.s(["Toaster",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call Toaster() from the server but Toaster is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/ui/sonner.tsx","Toaster")},694419,a=>{"use strict";a.i(798263);var b=a.i(334585);a.n(b)},142710,a=>{"use strict";var b=a.i(714898),c=a.i(589578);let d={className:c.default.className,style:{fontFamily:"'Geist', 'Geist Fallback'",fontStyle:"normal"}};null!=c.default.variable&&(d.variable=c.default.variable);var e=a.i(435214);let f={className:e.default.className,style:{fontFamily:"'Geist Mono', 'Geist Mono Fallback'",fontStyle:"normal"}};null!=e.default.variable&&(f.variable=e.default.variable);var g=a.i(265986);let h={className:g.default.className,style:{fontFamily:"'League Spartan', 'League Spartan Fallback'",fontStyle:"normal"}};null!=g.default.variable&&(h.variable=g.default.variable);var i=a.i(905202),j=a.i(694419);let k=`
  html, body {
    background-color: #fff !important;
  }
  html.staff-dark,
  html.staff-dark body {
    background-color: #0a0a0a !important;
  }
`,l=`
(function() {
  try {
    var pref = localStorage.getItem('verso-theme-preference');
    var resolved = localStorage.getItem('verso-theme-resolved');
    var isDark = pref === 'dark' || (pref === 'auto' && resolved === 'staff-dark') || (!pref && resolved === 'staff-dark');
    var html = document.documentElement;

    // ALL CSS variables for BOTH themes - must match globals.css exactly
    var lightVars = {
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': '222.2 47.4% 11.2%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': '210 40% 96%',
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '222.2 84% 4.9%',
      '--radius': '0.5rem',
      '--chart-1': '12 76% 61%',
      '--chart-2': '173 58% 39%',
      '--chart-3': '197 37% 24%',
      '--chart-4': '43 74% 66%',
      '--chart-5': '27 87% 67%'
    };

    var darkVars = {
      '--background': '0 0% 3.9%',
      '--foreground': '220 14% 96%',
      '--card': '0 0% 6%',
      '--card-foreground': '220 14% 96%',
      '--popover': '0 0% 12%',
      '--popover-foreground': '220 14% 96%',
      '--primary': '210 100% 70%',
      '--primary-foreground': '222.2 47.4% 11.2%',
      '--secondary': '220 12% 18%',
      '--secondary-foreground': '220 14% 88%',
      '--muted': '220 12% 22%',
      '--muted-foreground': '220 15% 72%',
      '--accent': '220 12% 22%',
      '--accent-foreground': '220 14% 94%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '220 12% 18%',
      '--input': '220 12% 18%',
      '--ring': '220 15% 70%',
      '--radius': '0.5rem',
      '--chart-1': '210 90% 56%',
      '--chart-2': '164 85% 60%',
      '--chart-3': '34 95% 62%',
      '--chart-4': '280 75% 65%',
      '--chart-5': '340 80% 60%'
    };

    // ALWAYS set variables - for BOTH themes
    var vars = isDark ? darkVars : lightVars;
    for (var key in vars) {
      html.style.setProperty(key, vars[key]);
    }

    if (isDark) {
      html.classList.add('staff-dark');
      html.style.colorScheme = 'dark';
    } else {
      html.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;function m({children:a}){return(0,b.jsxs)("html",{lang:"en",suppressHydrationWarning:!0,children:[(0,b.jsxs)("head",{children:[(0,b.jsx)("style",{dangerouslySetInnerHTML:{__html:k}}),(0,b.jsx)("script",{dangerouslySetInnerHTML:{__html:l}})]}),(0,b.jsxs)("body",{className:`${d.variable} ${f.variable} ${h.variable} antialiased`,suppressHydrationWarning:!0,children:[(0,b.jsx)(i.AuthInitWrapper,{}),a,(0,b.jsx)(j.Toaster,{})]})]})}a.s(["default",()=>m,"metadata",0,{title:"VERSO Holdings | Investment Portal",description:"Secure investment platform for VERSO Holdings - Access your portfolio, documents, and performance reports"},"viewport",0,{width:"device-width",initialScale:1}],142710)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__a1518c7a._.js.map