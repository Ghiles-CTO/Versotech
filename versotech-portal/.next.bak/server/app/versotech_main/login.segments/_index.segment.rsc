1:"$Sreact.fragment"
4:I[476634,["/_next/static/chunks/615da2a13093011b.js"],"AuthInitWrapper"]
5:I[581119,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"default"]
6:I[494986,["/_next/static/chunks/bec6141d585dfed8.js","/_next/static/chunks/eeac90ebcaabaedb.js"],"default"]
7:I[599454,["/_next/static/chunks/615da2a13093011b.js","/_next/static/chunks/629e48a7074c19ae.js","/_next/static/chunks/8ce79e088fd9c058.js"],"default"]
8:I[535114,["/_next/static/chunks/615da2a13093011b.js"],"Toaster"]
:HL["/_next/static/chunks/f8b9c9f3cd793e71.css","style"]
:HL["/_next/static/chunks/216b7a7e601a0e09.css","style"]
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
0:{"buildId":"26fw8xjxX2b4Sy-LZfq-X","rsc":["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/f8b9c9f3cd793e71.css","precedence":"next"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/chunks/216b7a7e601a0e09.css","precedence":"next"}],["$","script","script-0",{"src":"/_next/static/chunks/615da2a13093011b.js","async":true}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"\n  html, body {\n    background-color: #fff !important;\n  }\n  html.staff-dark,\n  html.staff-dark body {\n    background-color: #0a0a0a !important;\n  }\n"}}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]]}],"$L3"]}]]}],"loading":null,"isPartial":false}
3:["$","body",null,{"className":"geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable league_spartan_620a3bef-module__6cOzLG__variable antialiased","suppressHydrationWarning":true,"children":[["$","$L4",null,{}],["$","$L5",null,{"parallelRouterKey":"children","template":["$","$L6",null,{}],"notFound":[["$","$L7",null,{}],[]]}],["$","$L8",null,{}]]}]
