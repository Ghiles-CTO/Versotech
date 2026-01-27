1:"$Sreact.fragment"
9:I[62110,[],"default"]
:HL["/_next/static/chunks/f8b9c9f3cd793e71.css","style"]
:HL["/_next/static/chunks/216b7a7e601a0e09.css","style"]
:HL["/_next/static/media/797e433ab948586e-s.p.dbea232f.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/7a514bda021b6b92-s.p.b628dbda.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
2:Ta77,
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
0:{"P":null,"b":"26fw8xjxX2b4Sy-LZfq-X","c":["","versotech_main","set-password"],"q":"","i":false,"f":[[["",{"children":["(public)",{"children":["versotech_main",{"children":["set-password",{"children":["__PAGE__",{}]}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/f8b9c9f3cd793e71.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/chunks/216b7a7e601a0e09.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","script","script-0",{"src":"/_next/static/chunks/615da2a13093011b.js","async":true,"nonce":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"\n  html, body {\n    background-color: #fff !important;\n  }\n  html.staff-dark,\n  html.staff-dark body {\n    background-color: #0a0a0a !important;\n  }\n"}}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]]}],"$L3"]}]]}],{"children":["$L4",{"children":["$L5",{"children":["$L6",{"children":["$L7",{},null,false,false]},null,false,false]},null,false,false]},null,false,false]},null,false,false],"$L8",false]],"m":"$undefined","G":["$9",[]],"S":true}
a:I[476634,["/_next/static/chunks/615da2a13093011b.js"],"AuthInitWrapper"]
b:I[581119,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"default"]
c:I[494986,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"default"]
d:I[599454,["/_next/static/chunks/615da2a13093011b.js","/_next/static/chunks/629e48a7074c19ae.js","/_next/static/chunks/8ce79e088fd9c058.js"],"default"]
e:I[535114,["/_next/static/chunks/615da2a13093011b.js"],"Toaster"]
f:I[124899,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"ClientPageRoot"]
10:I[962135,["/_next/static/chunks/615da2a13093011b.js","/_next/static/chunks/8ce79e088fd9c058.js","/_next/static/chunks/b1019c04a27edd91.js","/_next/static/chunks/c778e2c9fc6e954b.js"],"default"]
13:I[663905,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"OutletBoundary"]
14:"$Sreact.suspense"
16:I[663905,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"ViewportBoundary"]
18:I[663905,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"MetadataBoundary"]
3:["$","body",null,{"className":"geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable league_spartan_620a3bef-module__6cOzLG__variable antialiased","suppressHydrationWarning":true,"children":[["$","$La",null,{}],["$","$Lb",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$Lc",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","$Ld",null,{}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$Le",null,{}]]}]
4:["$","$1","c",{"children":[null,["$","$Lb",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$Lc",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","$Ld",null,{}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]]}]
5:["$","$1","c",{"children":[null,["$","$Lb",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$Lc",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
6:["$","$1","c",{"children":[null,["$","$Lb",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$Lc",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
7:["$","$1","c",{"children":[["$","$Lf",null,{"Component":"$10","serverProvidedParams":{"searchParams":{},"params":{},"promises":["$@11","$@12"]}}],[["$","script","script-0",{"src":"/_next/static/chunks/8ce79e088fd9c058.js","async":true,"nonce":"$undefined"}],["$","script","script-1",{"src":"/_next/static/chunks/b1019c04a27edd91.js","async":true,"nonce":"$undefined"}],["$","script","script-2",{"src":"/_next/static/chunks/c778e2c9fc6e954b.js","async":true,"nonce":"$undefined"}]],["$","$L13",null,{"children":["$","$14",null,{"name":"Next.MetadataOutlet","children":"$@15"}]}]]}]
8:["$","$1","h",{"children":[null,["$","$L16",null,{"children":"$L17"}],["$","div",null,{"hidden":true,"children":["$","$L18",null,{"children":["$","$14",null,{"name":"Next.Metadata","children":"$L19"}]}]}],["$","meta",null,{"name":"next-size-adjust","content":""}]]}]
11:{}
12:"$7:props:children:0:props:serverProvidedParams:params"
17:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
1a:I[43842,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"IconMark"]
15:null
19:[["$","title","0",{"children":"VERSO Holdings | Investment Portal"}],["$","meta","1",{"name":"description","content":"Secure investment platform for VERSO Holdings - Access your portfolio, documents, and performance reports"}],["$","link","2",{"rel":"icon","href":"/favicon.ico?favicon.0b3bf435.ico","sizes":"256x256","type":"image/x-icon"}],["$","$L1a","3",{}]]
