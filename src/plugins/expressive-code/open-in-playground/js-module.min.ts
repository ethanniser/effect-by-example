/*
	THIS IS SUPPOSTED TO BE GENERATED BUT ITS NOT I JUST COPIED IT FROM THE EFFECT WEBSITE

	---

    GENERATED FILE - DO NOT EDIT
	----------------------------
	This JS module code was built from the source file "js-module.ts".
	To change it, modify the source file and then re-run the build script.
*/

export default 'try{(()=>{var s=new TextEncoder;var i=e=>{let n=e.length,t="",o;for(o=2;o<n;o+=3)t+=r[e[o-2]>>2],t+=r[(e[o-2]&3)<<4|e[o-1]>>4],t+=r[(e[o-1]&15)<<2|e[o]>>6],t+=r[e[o]&63];return o===n+1&&(t+=r[e[o-2]>>2],t+=r[(e[o-2]&3)<<4],t+="=="),o===n&&(t+=r[e[o-2]>>2],t+=r[(e[o-2]&3)<<4|e[o-1]>>4],t+=r[(e[o-1]&15)<<2],t+="="),t};var r=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"];var c=e=>i(e).replace(/=/g,"").replace(/\\+/g,"-").replace(/\\//g,"_");var a=e=>typeof e=="string"?c(s.encode(e)):c(e);function h(e){let p=(e.currentTarget.closest(".expressive-code")?.querySelector(".copy button")).dataset.code.replace(/\\u007f/g,`\n`),l=a(p);window.open(`${window.location.origin}/play/?code=${l}`,"_blank")}function d(e){e.querySelectorAll?.(".expressive-code .open-in-playground button").forEach(n=>n.addEventListener("click",h))}d(document);var g=new MutationObserver(e=>e.forEach(n=>n.addedNodes.forEach(t=>{d(t)})));g.observe(document.body,{childList:!0,subtree:!0});document.addEventListener("astro:page-load",()=>{d(document)});})();}catch(e){console.error("[EC] js-module failed:",e)}';
