/* LUAAR — piezas gráficas de la marca (símbolo, sello, fases de luna, patrón). Se usan en manual, empaque y web. */
(function(){
var G="#C5A469";
function sym(c,w){c=c||G;w=w||1.6;return '<svg viewBox="0 0 54 54" fill="none" aria-hidden="true"><path d="M36 6a22 22 0 1 0 12 40A24 24 0 0 1 36 6z" stroke="'+c+'" stroke-width="'+w+'" stroke-linejoin="round"/><path d="M27 15c2.6 3.6 3.6 6.6 0 10.4-3.6-3.8-2.6-6.8 0-10.4z" fill="'+c+'"/></svg>';}
function phase(p,c){var r=20,cx=24,cy=24,k=Math.cos(2*Math.PI*p),rx=Math.abs(k)*r,wax=p<=0.5;
 var d='M'+cx+','+(cy-r)+' A'+r+','+r+' 0 0 1 '+cx+','+(cy+r)+' A'+rx.toFixed(2)+','+r+' 0 0 '+(k>0?0:1)+' '+cx+','+(cy-r)+'Z';
 var lit=(p===0||p===1)?'':'<path d="'+d+'" fill="'+c+'"'+(wax?'':' transform="translate(48 0) scale(-1 1)"')+'/>';
 if(p===0.5)lit='<circle cx="24" cy="24" r="20" fill="'+c+'"/>';
 return '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="'+c+'" stroke-width="1.2"/>'+lit+'</svg>';}
function seal(c,t,bg){c=c||G;t=t||"LUZ DE LUNA · HECHA VELA · COLOMBIA · ";var id="s"+Math.random().toString(36).slice(2,7);
 return '<svg viewBox="0 0 200 200" aria-hidden="true">'+(bg?'<circle cx="100" cy="100" r="99" fill="'+bg+'"/>':'')+'<circle cx="100" cy="100" r="94" fill="none" stroke="'+c+'" stroke-width="1"/><circle cx="100" cy="100" r="62" fill="none" stroke="'+c+'" stroke-width=".8"/><defs><path id="'+id+'" d="M100,100 m-77,0 a77,77 0 1,1 154,0 a77,77 0 1,1 -154,0"/></defs><text font-family="Jost,Arial,sans-serif" font-size="12.5" letter-spacing="5.2" fill="'+c+'"><textPath href="#'+id+'">'+t+'</textPath></text><g transform="translate(73 73)">'+sym(c,1.4).replace('<svg ','<svg width="54" height="54" ')+'</g></svg>';}
window.LUAAR={sym:sym,phase:phase,seal:seal};
document.querySelectorAll("[data-sym]").forEach(function(e){e.innerHTML=sym(e.dataset.sym||G,e.dataset.w);});
document.querySelectorAll("[data-seal]").forEach(function(e){e.innerHTML=seal(e.dataset.seal||G,e.dataset.text,e.dataset.bg);});
document.querySelectorAll("[data-phases]").forEach(function(e){var c=e.dataset.phases||G,n=+(e.dataset.n||8),h="";for(var i=0;i<n;i++)h+=phase(i/n,c);if(e.dataset.full)h+=phase(0.5,c);e.innerHTML=h;});
document.querySelectorAll("[data-phase]").forEach(function(e){e.innerHTML=phase(+e.dataset.phase,e.dataset.c||G);});
})();
