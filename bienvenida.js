/* LUAAR — pop-up de bienvenida: descuento en la primera compra a cambio de nombre, correo y WhatsApp.
   Sale una sola vez por persona (a los BIENVENIDA.segundos o al bajar BIENVENIDA.scroll de la página); ?bienvenida en la dirección lo abre siempre.
   Los datos llegan por correo a LUAAR con Web3Forms (REGISTRO_CLAVE en index.html). Solo dice «Listo» cuando Web3Forms confirma el envío;
   si el registro no está conectado, falla o tarda más de REGISTRO_ESPERA_MS, lo dice y ofrece WhatsApp con los datos. */
(function(){
var pop=document.getElementById("pop");if(!pop)return;
var D=document.documentElement,CFG=window.BIENVENIDA||{},SEG=+CFG.segundos||12,SCR=+CFG.scroll||.45,
    CLAVE=window.REGISTRO_CLAVE||"",API="https://api.web3forms.com/submit",ESPERA=+window.REGISTRO_ESPERA_MS||12000,DESC=pop.getAttribute("data-descuento")||"10%",KEY="luaar-bienvenida",
    form=document.getElementById("pop-form"),err=document.getElementById("pop-err"),errWa=document.getElementById("pop-errwa"),
    card=pop.querySelector(".pop-card"),stepForm=document.getElementById("pop-paso1"),stepDone=document.getElementById("pop-paso2"),
    shown=false,open=false,last=null,timer=null;
[].forEach.call(pop.querySelectorAll("[data-desc]"),function(e){e.textContent=DESC;});

function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){if(v===undefined)return window["__"+k]||null;window["__"+k]=v;}}
function wa(msg){return "https://wa.me/"+(window.WHATSAPP||"573007652947")+"?text="+encodeURIComponent(msg);}
function focusables(){return [].filter.call(pop.querySelectorAll('a[href],button:not([disabled]),input:not([tabindex="-1"])'),function(e){return e.offsetParent!==null;});}

function show(){if(shown)return;shown=open=true;store(KEY,"visto");last=document.activeElement;
  pop.hidden=false;D.classList.add("pop-open");if(window.lenis&&window.lenis.stop)window.lenis.stop();
  requestAnimationFrame(function(){requestAnimationFrame(function(){pop.classList.add("on");});});
  setTimeout(function(){try{card.focus({preventScroll:true});}catch(e){}},60);}   /* el foco va a la ventana, no a un campo: en el celular no salta el teclado */
function hide(){if(!open)return;open=false;pop.classList.remove("on");D.classList.remove("pop-open");if(window.lenis&&window.lenis.start)window.lenis.start();
  setTimeout(function(){pop.hidden=true;},500);if(last&&last.focus)try{last.focus({preventScroll:true});}catch(e){}}
pop.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("[data-close]"))hide();});
document.addEventListener("keydown",function(e){if(!open)return;if(e.key==="Escape"){hide();return;}
  if(e.key==="Tab"){var f=focusables();if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&(document.activeElement===a||document.activeElement===card)){e.preventDefault();z.focus();}
    else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});

/* cuándo sale */
var forced=/[?&]bienvenida(=|&|$)/.test(location.search),still=D.classList.contains("static")||/[?&]captura/.test(location.search);
if(forced)setTimeout(show,400);
else if(!still&&!store(KEY)){
  timer=setTimeout(show,SEG*1000);
  window.addEventListener("scroll",function onSc(){if(shown){window.removeEventListener("scroll",onSc);return;}
    var max=D.scrollHeight-innerHeight;if(max>0&&window.scrollY/max>=SCR){window.removeEventListener("scroll",onSc);clearTimeout(timer);show();}},{passive:true});}

/* formulario */
function val(n){return (form.elements[n].value||"").trim();}
function okPhone(s){var d=s.replace(/\D/g,"");if(/^\+/.test(s))return d.length>=8&&d.length<=15;return (d.length===10&&d.charAt(0)==="3")||(d.length===12&&d.slice(0,3)==="573");}
function mark(n){[].forEach.call(form.querySelectorAll("[aria-invalid]"),function(i){i.removeAttribute("aria-invalid");});if(n)form.elements[n].setAttribute("aria-invalid","true");}
function fail(msg,data){err.textContent=msg||"No pudimos enviar tus datos: no hubo conexión o el servicio no respondió. Intenta de nuevo o escríbenos por WhatsApp.";
  errWa.href=wa("Hola LUAAR, soy "+data.nombre+". Quiero mi "+DESC+" de bienvenida en mi primera vela. Mi correo es "+data.correo+" y mi WhatsApp "+data.numero+".");
  errWa.target="_blank";errWa.rel="noopener";errWa.hidden=false;}
function finish(kind,data){var t=document.getElementById("pop-t2"),p=document.getElementById("pop-p2"),b=document.getElementById("pop-wa2");
  if(kind==="ok"){t.textContent="Listo, "+data.nombre+".";
    p.textContent="Guardamos tu "+DESC+" para tu primera compra. Escríbenos por WhatsApp cuando elijas tu vela y te lo aplicamos en el chat.";
    b.href=wa("Hola LUAAR, soy "+data.nombre+". Me registré en la página y quiero usar mi "+DESC+" de bienvenida en mi primera vela.");
    b.querySelector("span").textContent="Usar mi "+DESC+" por WhatsApp";}
  else{t.textContent="Escríbenos para tu "+DESC+".";
    p.textContent="El registro de la página todavía no está conectado, así que tus datos no se guardaron. Escríbenos por WhatsApp y te damos tu "+DESC+" en la primera compra.";
    b.href=wa("Hola LUAAR, soy "+data.nombre+". Quiero mi "+DESC+" de bienvenida en mi primera vela. Mi correo es "+data.correo+" y mi WhatsApp "+data.numero+".");
    b.querySelector("span").textContent="Pedir mi "+DESC+" por WhatsApp";}
  b.target="_blank";b.rel="noopener";stepForm.hidden=true;stepDone.hidden=false;try{t.focus({preventScroll:true});}catch(e){}}

form.addEventListener("submit",function(e){e.preventDefault();err.textContent="";errWa.hidden=true;
  if(form.elements.web.value){hide();return;}   /* campo trampa: solo lo llenan los robots */
  var data={nombre:val("nombre"),correo:val("correo"),numero:val("numero"),acepto:form.elements.acepto.checked,pagina:location.href.split("#")[0].split("?")[0]},bad=null;
  if(data.nombre.length<2)bad=["nombre","Escribe tu nombre."];
  else if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.correo))bad=["correo","Revisa tu correo, parece incompleto."];
  else if(!okPhone(data.numero))bad=["numero","Revisa tu WhatsApp: 10 dígitos, por ejemplo 3XX XXX XXXX."];
  else if(!data.acepto)bad=["acepto","Para guardarte el descuento necesitamos tu autorización."];
  mark(bad&&bad[0]);if(bad){err.textContent=bad[1];form.elements[bad[0]].focus();return;}
  if(!CLAVE){finish("sin",data);return;}
  var btn=form.querySelector("button[type=submit]"),lbl=btn.querySelector("span"),txt=lbl.textContent,ended=false;
  btn.disabled=true;lbl.textContent="Guardando…";
  var ctl=window.AbortController?new AbortController():null;
  var to=setTimeout(function(){if(ended)return;ended=true;if(ctl)ctl.abort();btn.disabled=false;lbl.textContent=txt;fail(null,data);},ESPERA);
  var body={access_key:CLAVE,subject:"Nuevo registro de bienvenida · LUAAR",from_name:"Página LUAAR",
    "Nombre":data.nombre,"Correo":data.correo,"WhatsApp":data.numero,"Autorizó sus datos":"Sí","Página":data.pagina};
  fetch(API,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(body),signal:ctl?ctl.signal:undefined})
    .then(function(r){return r.json();})
    .then(function(j){if(ended)return;ended=true;clearTimeout(to);btn.disabled=false;lbl.textContent=txt;
      if(j&&j.success===true){store("luaar-registro","1");finish("ok",data);}else fail(null,data);})
    .catch(function(){if(ended)return;ended=true;clearTimeout(to);btn.disabled=false;lbl.textContent=txt;fail(null,data);});
});
window.LUAAR_BIENVENIDA={abrir:function(){shown=false;show();}};
})();
