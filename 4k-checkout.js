/* ============================================================================
   IPTV FIRESTICK — Checkout popup (data capture -> Sheet + email + WhatsApp)
   Self-contained. Opens from the "Subscribe Now" buttons in #packages.
   Dark + lime theme. EN / FR / IT. £ prices. Formula: base*(1+0.85*(N-1)).
   ============================================================================ */
(function () {
  "use strict";
  if (window.__k4CheckoutLoaded) return;
  window.__k4CheckoutLoaded = true;

  var CONFIG = {
    ENDPOINT: "https://script.google.com/macros/s/AKfycbxiFYtxvl1mIyZVnrPurDQjmfJ5X2y5JIBFnFp7WMaDRybMFsKChKjN3UN3qpkvkvA8Kg/exec",
    WHATSAPP: "16615413954",
    CURRENCY: "$",
    EXTRA_FACTOR: 0.85,   // each extra connection costs 85% of base (15% discount)
    CONN_MIN: 1, CONN_MAX: 5,
    PLANS: {
      bronze:    { name:"Plano Bronze",    months:12, bonusMonths:0, price:39.99 },
      gold:      { name:"Plano Gold",      months:15, bonusMonths:3, price:49.99, popular:true },
      platinum:  { name:"Plano Platinum",  months:15, bonusMonths:3, price:59.99 },
      exclusive: { name:"Exclusivo", months:24, bonusMonths:3, price:84.99 }
    }
  };

  // -------- i18n --------
  var LANGS = {
    en: { eyebrow:"4K IPTV Subscription", title:"Complete your order", sub:"Enter your details to activate your subscription.",
      name:"Full name", namePh:"John Smith", phone:"Phone number", email:"Email address", emailPh:"you@example.com",
      pay:"Payment method", conn:"Simultaneous connections", cU1:"Connection", cU:"Connections", duration:"Duration", bonus:"Bonus",
      total:"Total", submit:"Complete order", secure:"Your information is transmitted securely.", guarantee:"7-day money-back guarantee.",
      months:"Months", free:"Months Free", okTitle:"Order received!", okBody:"Thank you! Confirm on WhatsApp to finalise and activate your subscription.",
      paynow:"💳 Pay now", wa:"Confirm on WhatsApp", again:"Place another order",
      eName:"Please enter your name.", ePhone:"Invalid phone number.", eEmail:"Invalid email.", ePay:"Choose a payment method.",
      msg:function(p,d,c,pr,n,m){return "Hi! I'm "+n+" \ud83d\udc4b\n\n"+
        "\ud83d\uded2 Order: "+p+"\n"+
        "\u23f1 Duration: "+d+"\n"+
        "\ud83d\udcfa Connections: "+c+"\n"+
        "\ud83d\udcb0 Total: "+pr+"\n"+
        "\ud83d\udcb3 Payment: "+m+"\n\n"+
        "Please send me the payment details to complete my order \u2705";} },
    fr: { eyebrow:"Abonnement 4K IPTV", title:"Finalisez votre commande", sub:"Entrez vos informations pour activer votre abonnement.",
      name:"Nom complet", namePh:"Jean Dupont", phone:"Téléphone", email:"Adresse email", emailPh:"vous@exemple.fr",
      pay:"Moyen de paiement", conn:"Connexions simultanées", cU1:"Connexion", cU:"Connexions", duration:"Durée", bonus:"Bonus",
      total:"Total", submit:"Valider ma commande", secure:"Vos informations sont transmises en toute sécurité.", guarantee:"Satisfait ou remboursé 7 jours.",
      months:"Mois", free:"Mois Offerts", okTitle:"Commande enregistrée !", okBody:"Merci ! Confirmez sur WhatsApp pour finaliser et activer votre abonnement.",
      paynow:"💳 Payer maintenant", wa:"Confirmer sur WhatsApp", again:"Passer une autre commande",
      eName:"Veuillez entrer votre nom.", ePhone:"Numéro invalide.", eEmail:"Email invalide.", ePay:"Choisissez un moyen de paiement.",
      msg:function(p,d,c,pr,n,m){return "Bonjour ! Je suis "+n+" \ud83d\udc4b\n\n"+
        "\ud83d\uded2 Commande : "+p+"\n"+
        "\u23f1 Dur\u00e9e : "+d+"\n"+
        "\ud83d\udcfa Connexions : "+c+"\n"+
        "\ud83d\udcb0 Total : "+pr+"\n"+
        "\ud83d\udcb3 Paiement : "+m+"\n\n"+
        "Merci de m'envoyer les informations de paiement pour finaliser ma commande \u2705";} },
    it: { eyebrow:"Abbonamento 4K IPTV", title:"Completa il tuo ordine", sub:"Inserisci i tuoi dati per attivare l'abbonamento.",
      name:"Nome completo", namePh:"Mario Rossi", phone:"Telefono", email:"Indirizzo email", emailPh:"tu@esempio.it",
      pay:"Metodo di pagamento", conn:"Connessioni simultanee", cU1:"Connessione", cU:"Connessioni", duration:"Durata", bonus:"Bonus",
      total:"Totale", submit:"Completa l'ordine", secure:"Le tue informazioni sono trasmesse in modo sicuro.", guarantee:"Soddisfatti o rimborsati 7 giorni.",
      months:"Mesi", free:"Mesi Gratis", okTitle:"Ordine ricevuto!", okBody:"Grazie! Conferma su WhatsApp per completare e attivare il tuo abbonamento.",
      paynow:"💳 Paga ora", wa:"Conferma su WhatsApp", again:"Effettua un altro ordine",
      eName:"Inserisci il tuo nome.", ePhone:"Numero non valido.", eEmail:"Email non valida.", ePay:"Scegli un metodo di pagamento.",
      msg:function(p,d,c,pr,n,m){return "Ciao! Sono "+n+" \ud83d\udc4b\n\n"+
        "\ud83d\uded2 Ordine: "+p+"\n"+
        "\u23f1 Durata: "+d+"\n"+
        "\ud83d\udcfa Connessioni: "+c+"\n"+
        "\ud83d\udcb0 Totale: "+pr+"\n"+
        "\ud83d\udcb3 Pagamento: "+m+"\n\n"+
        "Inviami i dati di pagamento per completare il mio ordine \u2705";} }
  };
  function detectLang(){ var p=location.pathname; if(/^\/fr(\/|$)/.test(p))return "fr"; if(/^\/us(\/|$)/.test(p))return "en"; if(/^\/it(\/|$)/.test(p))return "it"; var l=(document.documentElement.lang||"").slice(0,2); return LANGS[l]?l:"pt"; }
  LANGS.pt = { eyebrow:"Assinatura 4K IPTV", title:"Finalize seu pedido", sub:"Insira seus dados para ativar sua assinatura.",
    name:"Nome completo", namePh:"João Silva", phone:"Telefone", email:"Endereço de e-mail", emailPh:"voce@exemplo.com",
    pay:"Forma de pagamento", conn:"Conexões simultâneas", cU1:"Conexão", cU:"Conexões", duration:"Duração", bonus:"Bônus",
    total:"Total", submit:"Finalizar pedido", secure:"Suas informações são transmitidas com segurança.", guarantee:"Garantia de reembolso de 7 dias.",
    months:"Meses", free:"Meses Grátis", okTitle:"Pedido recebido!", okBody:"Obrigado! Confirme no WhatsApp para concluir e ativar a sua assinatura.",
    paynow:"💳 Pagar agora", wa:"Confirmar no WhatsApp", again:"Fazer outro pedido",
    eName:"Digite seu nome.", ePhone:"Número inválido.", eEmail:"E-mail inválido.", ePay:"Escolha uma forma de pagamento.",
    msg:function(p,d,c,pr,n,m){return "Ol\u00e1! Sou "+n+" \ud83d\udc4b\n\n"+
      "\ud83d\uded2 Pedido: "+p+"\n"+
      "\u23f1 Dura\u00e7\u00e3o: "+d+"\n"+
      "\ud83d\udcfa Conex\u00f5es: "+c+"\n"+
      "\ud83d\udcb0 Total: "+pr+"\n"+
      "\ud83d\udcb3 Pagamento: "+m+"\n\n"+
      "Por favor, envie-me os dados de pagamento para concluir o meu pedido \u2705";} };
  var LANG = detectLang(), T = LANGS[LANG];

  var COUNTRIES=[{n:"United Kingdom",i:"GB",d:"+44",f:"🇬🇧"},{n:"United States",i:"US",d:"+1",f:"🇺🇸"},{n:"France",i:"FR",d:"+33",f:"🇫🇷"},{n:"Italy",i:"IT",d:"+39",f:"🇮🇹"},{n:"Ireland",i:"IE",d:"+353",f:"🇮🇪"},{n:"Germany",i:"DE",d:"+49",f:"🇩🇪"},{n:"Spain",i:"ES",d:"+34",f:"🇪🇸"},{n:"Belgium",i:"BE",d:"+32",f:"🇧🇪"},{n:"Switzerland",i:"CH",d:"+41",f:"🇨🇭"},{n:"Netherlands",i:"NL",d:"+31",f:"🇳🇱"},{n:"Canada",i:"CA",d:"+1",f:"🇨🇦"},{n:"Morocco",i:"MA",d:"+212",f:"🇲🇦"}];

  var PAY = {
    applepay:{label:"Apple Pay",svg:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.16-.46 7.84 1.3 10.4.86 1.25 1.88 2.66 3.22 2.61 1.29-.05 1.78-.84 3.34-.84 1.56 0 2 .84 3.37.81 1.39-.02 2.27-1.28 3.12-2.53.98-1.45 1.39-2.85 1.41-2.93-.03-.01-2.71-1.04-2.74-4.13zM14.6 4.6c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-3 1.54-.66.76-1.24 1.98-1.08 3.15 1.14.09 2.3-.58 3.02-1.44z"/></svg>'},
    googlepay:{label:"Google Pay",svg:'<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12.24 10.29v3.53h4.89c-.2 1.13-.8 2.09-1.7 2.73v2.26h2.75c1.61-1.48 2.54-3.66 2.54-6.25 0-.6-.05-1.18-.15-1.74h-8.33z" fill="#4285F4"/><path d="M12.24 20c2.3 0 4.22-.76 5.63-2.06l-2.75-2.13c-.76.51-1.74.81-2.88.81-2.21 0-4.09-1.49-4.76-3.5H4.63v2.2C6.04 18.13 8.94 20 12.24 20z" fill="#34A853"/><path d="M7.48 13.12A4.8 4.8 0 017.23 12c0-.39.07-.77.18-1.12V8.68H4.63A7.98 7.98 0 003.78 12c0 1.29.31 2.51.85 3.32l2.85-2.2z" fill="#FBBC05"/><path d="M12.24 6.5c1.25 0 2.36.43 3.24 1.27l2.43-2.43C16.45 3.99 14.53 3.2 12.24 3.2c-3.3 0-6.2 1.87-7.61 4.6l2.85 2.2c.67-2.01 2.55-3.5 4.76-3.5z" fill="#EA4335"/></svg>'},
    card:{label:"Card",svg:'<svg viewBox="0 0 24 24" width="22" height="20" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>'},
    paypal:{label:"PayPal",svg:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#009cde"><path d="M7.08 21.5H4.6a.64.64 0 01-.63-.74L6.4 4.63A.9.9 0 017.29 4h6.2c2.53 0 4.3.62 5.06 1.8.35.55.5 1.13.46 1.86 0 .17-.03.35-.06.55l-.03.15.2.11c.37.2.68.47.9.8.36.55.44 1.28.24 2.28-.23 1.15-.65 2.11-1.24 2.83a5.1 5.1 0 01-2.06 1.5c-.79.32-1.7.48-2.7.48h-.65c-.46 0-.9.16-1.25.46-.35.3-.58.71-.66 1.16l-.05.27-.6 3.79-.02.14a.36.36 0 01-.36.31H7.08z"/></svg>'},
    crypto:{label:"Crypto",svg:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#f7931a"><circle cx="12" cy="12" r="11"/><path d="M16 10.4c.2-1.4-.9-2.1-2.3-2.6l.5-1.8-1.1-.3-.4 1.8c-.3-.07-.6-.14-.9-.2l.4-1.8-1.1-.3-.5 1.8c-.24-.05-.47-.1-.7-.16v-.01l-1.5-.38-.3 1.2s.8.18.79.2c.44.1.52.4.5.63l-1.2 4.9c-.06.13-.2.33-.5.25.01.02-.8-.2-.8-.2l-.56 1.28 1.42.35c.26.07.52.14.77.2l-.5 1.85 1.1.3.5-1.8c.3.08.6.16.88.23l-.45 1.8 1.1.28.5-1.85c1.9.36 3.32.21 3.92-1.5.48-1.38-.02-2.17-1.02-2.69.73-.17 1.28-.65 1.42-1.64Zm-2.54 3.55c-.34 1.38-2.67.63-3.42.45l.62-2.47c.76.19 3.16.56 2.8 2.02Zm.35-3.57c-.31 1.25-2.25.62-2.88.46l.56-2.24c.63.16 2.65.45 2.32 1.78Z" fill="#fff"/></svg>'}
  };
  var METHODS=["applepay","googlepay","card","paypal","crypto"];

  var LIME="#22d3ee", LIME2="#34d399";
  var css=''+
  '.fs-ov{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;background:rgba(3,4,6,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}'+
  '.fs-ov.open{display:flex}'+
  '.fs-modal{position:relative;width:100%;max-width:900px;margin:auto;background:#0c0e12;border:1px solid #1e222b;border-radius:22px;box-shadow:0 40px 90px rgba(0,0,0,.6);overflow:hidden;display:grid;grid-template-columns:1fr 1fr;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#f4f7f2;animation:fsIn .24s ease}'+
  '@keyframes fsIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}'+
  '.fs-x{position:absolute;top:15px;right:15px;z-index:5;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid #262b34;color:#9aa2ad;cursor:pointer;font-size:17px}'+
  '.fs-x:hover{color:#fff}'+
  '.fs-sum{padding:30px 28px;background:radial-gradient(120% 70% at 6% 0%,rgba(34,211,238,.14),transparent 60%),#0a0c10;border-right:1px solid #171b22;display:flex;flex-direction:column}'+
  '.fs-eye{color:'+LIME+';font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}'+
  '.fs-badge{display:inline-block;background:'+LIME+';color:#0a0c10;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;margin-bottom:10px;width:fit-content}'+
  '.fs-plan{font-size:34px;font-weight:800;line-height:1;margin:0}'+
  '.fs-tag{color:#8b93a0;font-size:15px;margin-top:8px}'+
  '.fs-hr{height:1px;background:#1b1f27;margin:20px 0}'+
  '.fs-row{display:flex;align-items:center;justify-content:space-between;margin:13px 0;font-size:14px}.fs-row .k{color:#8b93a0}.fs-row .v{font-weight:700}.fs-row .v.hl{color:'+LIME+'}'+
  '.fs-cl{color:#6f7784;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:18px 0 9px}'+
  '.fs-step{display:flex;align-items:stretch;border:1px solid #232833;border-radius:13px;overflow:hidden;background:#11141a}'+
  '.fs-step button{width:52px;border:none;background:transparent;color:'+LIME+';font-size:22px;cursor:pointer}.fs-step button:disabled{color:#39404b;cursor:not-allowed}'+
  '.fs-step .mid{flex:1;text-align:center;padding:11px 0;border-left:1px solid #232833;border-right:1px solid #232833}'+
  '.fs-step .num{font-size:19px;font-weight:800;line-height:1}.fs-step .cap{font-size:10px;letter-spacing:.1em;color:#6f7784;text-transform:uppercase;margin-top:3px}'+
  '.fs-total{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:12px}.fs-total .k{font-size:16px;font-weight:600}.fs-total .amt{font-size:27px;font-weight:800;color:'+LIME+'}'+
  '.fs-guar{color:#8b93a0;font-size:12.5px;margin-top:10px}'+
  '.fs-form{padding:30px 28px;background:#0c0e12}'+
  '.fs-form h3{margin:0 0 5px;font-size:23px;font-weight:800}.fs-form .sub{color:#8b93a0;font-size:14px;margin:0 0 18px}'+
  '.fs-lb{display:block;font-size:13px;font-weight:600;margin:15px 0 7px}.fs-lb:first-of-type{margin-top:0}'+
  '.fs-in{width:100%;background:#11141a;border:1px solid #232833;border-radius:11px;height:46px;padding:0 14px;font-size:14px;outline:none;color:#f4f7f2}'+
  '.fs-in::placeholder{color:#5c6470}.fs-in:focus{border-color:'+LIME+'}.fs-in.bad{border-color:#ff5b5b}'+
  '.fs-ph{display:flex;gap:9px}.fs-cc{flex:none;width:92px;background:#11141a;border:1px solid #232833;border-radius:11px;height:46px;padding:0 8px;font-size:14px;cursor:pointer;color:#f4f7f2}.fs-cc:focus{border-color:'+LIME+'}'+
  '.fs-err{color:#ff5b5b;font-size:12px;margin-top:7px;display:none}.fs-err.on{display:block}'+
  '.fs-pays{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:6px}'+
  '.fs-pay{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:#11141a;border:1.5px solid #232833;border-radius:12px;padding:12px 5px;cursor:pointer;font-size:12.5px;font-weight:600;color:#aab2bd;min-height:66px;text-align:center}'+
  '.fs-pay:hover{border-color:#333b47}.fs-pay.sel{border-color:'+LIME+';background:rgba(34,211,238,.10);color:#fff}'+
  '.fs-submit{width:100%;margin-top:20px;background:linear-gradient(135deg,#2D6BFF,#8B5CF6 55%,#22D3EE);color:#fff;border:none;border-radius:12px;height:52px;font-size:16px;font-weight:800;cursor:pointer}'+
  '.fs-submit:hover{filter:brightness(1.05)}.fs-submit:disabled{opacity:.7;cursor:wait}'+
  '.fs-secure{text-align:center;color:#6f7784;font-size:12px;margin-top:11px}'+
  '.fs-ok{display:none;grid-column:1 / -1;text-align:center;padding:34px 26px}.fs-ok.on{display:block}'+
  '.fs-check{width:66px;height:66px;border-radius:50%;background:rgba(34,211,238,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 16px}'+
  '.fs-ok h3{margin:0 0 6px;font-size:22px}.fs-ok p{color:#8b93a0;font-size:14px;margin:0 auto 20px;max-width:430px}'+
  '.fs-paynow{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#2D6BFF,#8B5CF6 55%,#22D3EE);color:#fff;text-decoration:none;font-weight:800;padding:13px 24px;border-radius:12px;margin-right:10px}'+
  '.fs-wa{display:inline-flex;align-items:center;gap:9px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:12px}'+
  '.fs-again{display:block;margin:14px auto 0;background:none;border:none;color:#8b93a0;font-size:13px;cursor:pointer;text-decoration:underline}'+
  '@media(max-width:720px){.fs-modal{grid-template-columns:1fr;max-width:440px}.fs-sum{border-right:none;border-bottom:1px solid #171b22}.fs-plan{font-size:28px}}';

  var overlay, modal, st={key:"gold",conn:1,method:null,dial:"+44",country:"GB"};

  function money(n){ return CONFIG.CURRENCY + n.toFixed(2); }
  function plan(){ return CONFIG.PLANS[st.key]||CONFIG.PLANS.gold; }
  function total(){ var p=plan(); var n=Math.max(CONFIG.CONN_MIN,Math.min(CONFIG.CONN_MAX,st.conn));
    return Math.round((p.price*(1+CONFIG.EXTRA_FACTOR*(n-1)))*100)/100; }
  function durStr(p){ return p.months+" "+T.months; }
  function bonusStr(p){ return p.bonusMonths>0 ? ("+"+p.bonusMonths+" "+T.free) : "—"; }

  function build(){
    var style=document.createElement("style"); style.textContent=css; document.head.appendChild(style);
    overlay=document.createElement("div"); overlay.className="fs-ov";
    var pays=METHODS.map(function(m){return '<div class="fs-pay" data-m="'+m+'"><span>'+PAY[m].svg+'</span><span>'+PAY[m].label+'</span></div>';}).join("");
    modal=document.createElement("div"); modal.className="fs-modal";
    modal.innerHTML=
      '<button class="fs-x" data-x>✕</button>'+
      '<div class="fs-body" style="display:contents">'+
        '<aside class="fs-sum">'+
          '<div class="fs-eye">'+T.eyebrow+'</div>'+
          '<div class="fs-badge" data-pop style="display:none">★ '+(LANG==="fr"?"Le Plus Populaire":LANG==="it"?"Più Popolare":LANG==="pt"?"Mais Popular":"Most Popular")+'</div>'+
          '<h1 class="fs-plan" data-plan>Gold</h1>'+
          '<div class="fs-tag" data-tag></div>'+
          '<div class="fs-hr"></div>'+
          '<div class="fs-row"><span class="k">'+T.duration+'</span><span class="v" data-dur>—</span></div>'+
          '<div class="fs-row"><span class="k">'+T.bonus+'</span><span class="v hl" data-bonus>—</span></div>'+
          '<div class="fs-cl">'+T.conn+'</div>'+
          '<div class="fs-step"><button type="button" data-d="-1">−</button><div class="mid"><div class="num" data-num>1</div><div class="cap" data-cap>'+T.cU1+'</div></div><button type="button" data-d="1">+</button></div>'+
          '<div class="fs-hr"></div>'+
          '<div class="fs-total"><span class="k">'+T.total+'</span><span class="amt" data-total>—</span></div>'+
          '<div class="fs-guar">✓ '+T.guarantee+'</div>'+
        '</aside>'+
        '<section class="fs-form">'+
          '<h3>'+T.title+'</h3><p class="sub">'+T.sub+'</p>'+
          '<label class="fs-lb">'+T.name+'</label><input class="fs-in" data-name type="text" placeholder="'+T.namePh+'" autocomplete="name">'+
          '<div class="fs-err" data-e-name>'+T.eName+'</div>'+
          '<label class="fs-lb">'+T.phone+'</label><div class="fs-ph"><select class="fs-cc" data-cc></select><input class="fs-in" data-phone type="tel" placeholder="7123 456789" autocomplete="tel"></div>'+
          '<div class="fs-err" data-e-phone>'+T.ePhone+'</div>'+
          '<label class="fs-lb">'+T.email+'</label><input class="fs-in" data-email type="email" placeholder="'+T.emailPh+'" autocomplete="email">'+
          '<div class="fs-err" data-e-email>'+T.eEmail+'</div>'+
          '<label class="fs-lb">'+T.pay+'</label><div class="fs-pays">'+pays+'</div>'+
          '<div class="fs-err" data-e-pay>'+T.ePay+'</div>'+
          '<button class="fs-submit" data-submit>'+T.submit+'</button>'+
          '<div class="fs-secure">🔒 '+T.secure+'</div>'+
        '</section>'+
      '</div>'+
      '<div class="fs-ok" data-ok>'+
        '<div class="fs-check"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="'+LIME+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>'+
        '<h3>'+T.okTitle+'</h3><p>'+T.okBody+'</p>'+
        '<a class="fs-wa" data-wa target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5s-.2.3-.3.5-.3.4-.1.7c.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.7.8 2 1 .3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>'+T.wa+'</a>'+
        '<button class="fs-again" data-again>'+T.again+'</button>'+
      '</div>';
    overlay.appendChild(modal); document.body.appendChild(overlay);

    var cc=modal.querySelector("[data-cc]");
    COUNTRIES.forEach(function(c){ var o=document.createElement("option"); o.value=c.d+"|"+c.i; o.textContent=c.f+" "+c.d; cc.appendChild(o); });
    cc.value=COUNTRIES[0].d+"|"+COUNTRIES[0].i;
    cc.addEventListener("change",function(){ var p=cc.value.split("|"); st.dial=p[0]; st.country=p[1]; });

    modal.querySelector("[data-x]").addEventListener("click",close);
    overlay.addEventListener("mousedown",function(e){ if(e.target===overlay) close(); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&overlay.classList.contains("open")) close(); });
    modal.querySelectorAll("[data-d]").forEach(function(b){ b.addEventListener("click",function(){ st.conn=Math.min(CONFIG.CONN_MAX,Math.max(CONFIG.CONN_MIN,st.conn+ +b.getAttribute("data-d"))); render(); }); });
    modal.querySelectorAll("[data-m]").forEach(function(el){ el.addEventListener("click",function(){ modal.querySelectorAll("[data-m]").forEach(function(x){x.classList.remove("sel");}); el.classList.add("sel"); st.method=el.getAttribute("data-m"); modal.querySelector("[data-e-pay]").classList.remove("on"); }); });
    ["name","phone","email"].forEach(function(f){ modal.querySelector("[data-"+f+"]").addEventListener("input",function(){ this.classList.remove("bad"); modal.querySelector("[data-e-"+f+"]").classList.remove("on"); }); });
    modal.querySelector("[data-submit]").addEventListener("click",submit);
    modal.querySelector("[data-again]").addEventListener("click",function(){ modal.querySelector("[data-ok]").classList.remove("on"); modal.querySelector(".fs-body").style.display="contents"; });
  }

  function render(){
    var p=plan();
    modal.querySelector("[data-plan]").textContent=p.name;
    modal.querySelector("[data-tag]").textContent=durStr(p);
    modal.querySelector("[data-dur]").textContent=durStr(p);
    modal.querySelector("[data-bonus]").textContent=bonusStr(p);
    modal.querySelector("[data-num]").textContent=st.conn;
    modal.querySelector("[data-cap]").textContent=st.conn>1?T.cU:T.cU1;
    modal.querySelector("[data-total]").textContent=money(total());
    modal.querySelector("[data-pop]").style.display=p.popular?"inline-block":"none";
    modal.querySelectorAll("[data-d]").forEach(function(b){ var d=+b.getAttribute("data-d"); b.disabled=(d<0&&st.conn<=CONFIG.CONN_MIN)||(d>0&&st.conn>=CONFIG.CONN_MAX); });
  }

  function open(key){
    if(CONFIG.PLANS[key]) st.key=key;
    st.conn=1; st.method=null;
    modal.querySelector(".fs-body").style.display="contents";
    modal.querySelector("[data-ok]").classList.remove("on");
    modal.querySelectorAll("[data-m]").forEach(function(x){x.classList.remove("sel");});
    ["name","phone","email"].forEach(function(f){ var el=modal.querySelector("[data-"+f+"]"); el.value=""; el.classList.remove("bad"); modal.querySelector("[data-e-"+f+"]").classList.remove("on"); });
    modal.querySelector("[data-e-pay]").classList.remove("on");
    render(); overlay.classList.add("open"); document.body.style.overflow="hidden";
  }
  function close(){ overlay.classList.remove("open"); document.body.style.overflow=""; }

  function submit(){
    var name=modal.querySelector("[data-name]").value.trim();
    var localPhone=modal.querySelector("[data-phone]").value.trim();
    var email=modal.querySelector("[data-email]").value.trim();
    var digits=localPhone.replace(/[^0-9]/g,"");
    var vN=name.length>=2,vP=digits.length>=6,vE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),vPay=!!st.method;
    modal.querySelector("[data-name]").classList.toggle("bad",!vN);   modal.querySelector("[data-e-name]").classList.toggle("on",!vN);
    modal.querySelector("[data-phone]").classList.toggle("bad",!vP);  modal.querySelector("[data-e-phone]").classList.toggle("on",!vP);
    modal.querySelector("[data-email]").classList.toggle("bad",!vE);  modal.querySelector("[data-e-email]").classList.toggle("on",!vE);
    modal.querySelector("[data-e-pay]").classList.toggle("on",!vPay);
    if(!(vN&&vP&&vE&&vPay)) return;

    var p=plan(), phone=(st.dial+" "+localPhone).trim(), tot=total();
    var connTxt=st.conn+" "+(st.conn>1?T.cU:T.cU1);
    var payload={ timestamp:new Date().toISOString(), site:location.hostname, plan:p.name, duration:durStr(p),
      bonus:(p.bonusMonths>0?("+"+p.bonusMonths+" "+T.free):""), connections:st.conn,
      unit_price:p.price.toFixed(2), total:tot.toFixed(2), currency:CONFIG.CURRENCY,
      name:name, phone:phone, email:email, dial:st.dial, country:st.country,
      payment_method:PAY[st.method].label, payment_key:st.method,
      page:location.pathname, language:LANG, referrer:document.referrer||"" };

    var msg=T.msg(p.name, durStr(p), connTxt, money(tot), name, PAY[st.method].label);
    var waUrl="https://wa.me/"+CONFIG.WHATSAPP+"?text="+encodeURIComponent(msg);
    modal.querySelector("[data-wa]").setAttribute("href",waUrl);

    var btn=modal.querySelector("[data-submit]"); btn.disabled=true; btn.textContent="…";
    function done(){ try{window.open(waUrl,"_blank","noopener");}catch(_){}
      modal.querySelector(".fs-body").style.display="none"; modal.querySelector("[data-ok]").classList.add("on");
      btn.disabled=false; btn.textContent=T.submit; overlay.scrollTop=0; }
    if(!CONFIG.ENDPOINT){ setTimeout(done,300); return; }
    fetch(CONFIG.ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)}).then(done).catch(done);
  }

  // Detect the plan from a clicked ".plan-buy" order button (data-msg / data-price).
  function planFromEl(a){
    var msg=(a.getAttribute("data-msg")||a.textContent||"");
    var m=msg.match(/Bronze|Gold|Platinum|Platinium|Exclusivo|Exclusif|Exclusive/i);
    if(m){ var k=m[0].toLowerCase(); if(k==="platinium")k="platinum"; if(k==="exclusivo"||k==="exclusif")k="exclusive"; return k; }
    var pr=parseFloat(a.getAttribute("data-price")||"");
    if(!isNaN(pr)){ var keys=Object.keys(CONFIG.PLANS);
      for(var i=0;i<keys.length;i++){ if(Math.abs(CONFIG.PLANS[keys[i]].price-pr)<0.005) return keys[i]; } }
    return null;
  }
  document.addEventListener("click",function(e){
    var a=e.target && e.target.closest ? e.target.closest('.plan-buy') : null;
    if(!a) return;
    var key=planFromEl(a);
    if(!key || !CONFIG.PLANS[key]) return;
    e.preventDefault(); e.stopImmediatePropagation();
    open(key);
  }, true);

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",build); else build();
})();

/* Hero CTA: send the primary "Get Started / Começar / Commencer" button to the packages section */
(function(){
  function isTrial(a){ try{ return /start my free trial/i.test(decodeURIComponent(a.getAttribute("href")||"")); }catch(e){ return false; } }
  function packagesSection(){
    var pb=document.querySelector(".plan-buy");
    if(pb){ return pb.closest("section")||pb.closest("[id]")||pb.parentElement; }
    return document.querySelector('#planos,#tarifs,#packages,#plans,#pricing,[id*="plano"],[id*="tarif"],[id*="package"]');
  }
  function wire(){
    document.querySelectorAll("a.btn.btn-primary").forEach(function(a){
      if(!isTrial(a) || a.__pkgWired) return;
      a.__pkgWired=true;
      a.addEventListener("click", function(e){
        var sec=packagesSection();
        if(sec){ e.preventDefault(); e.stopImmediatePropagation(); sec.scrollIntoView({behavior:"smooth", block:"start"}); }
      }, true);
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", wire); else wire();
})();

/* smooth anchor scrolling for CTA -> packages */
(function(){ try{ document.documentElement.style.scrollBehavior="smooth"; }catch(e){} })();
