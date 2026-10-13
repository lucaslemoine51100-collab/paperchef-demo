/* Preserve positions around content refreshes, without blocking manual scrolling. */
const ScrollPosition=(()=>{
 let gesture=0;for(const name of ['wheel','touchstart','pointerdown'])addEventListener(name,()=>gesture++,{capture:true,passive:true});
 addEventListener('keydown',e=>{if(['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '].includes(e.key))gesture++;},true);
 function capture(root=document){
  const revision=gesture,hash=location.hash,open=root instanceof HTMLDialogElement?root.open:null;
  const page={top:scrollY,left:scrollX},entries=[];
  if(root!==document)entries.push({node:root,top:root.scrollTop,left:root.scrollLeft});
  for(const node of root.querySelectorAll('*'))if(node.scrollTop||node.scrollLeft){
   const id=node.id,body=node.classList.contains('dialog-scroll-body');
   entries.push({node,id,body,top:node.scrollTop,left:node.scrollLeft});
  }
  const apply=()=>{if(gesture!==revision||hash!==location.hash||open!==null&&(!open||!root.open))return;
   for(const entry of entries){const node=entry.node.isConnected?entry.node:entry.id?root.querySelector('#'+CSS.escape(entry.id)):entry.body?root.querySelector('.dialog-scroll-body'):null;if(node){node.scrollTop=entry.top;node.scrollLeft=entry.left;}}
   if(root===document)window.scrollTo({top:page.top,left:page.left,behavior:'instant'});
  };
  return ()=>{apply();requestAnimationFrame(()=>requestAnimationFrame(apply));};
 }
 function keep(root,draw){const restore=capture(root);const result=draw();restore();return result;}
 return {capture,keep};
})();

// Synchronous filters and view controls also replace parts of the page.
for(const name of ['click','input','change'])document.addEventListener(name,event=>{
 if(name==='click'&&!event.target.closest('button,input,select,summary'))return;
 const restore=ScrollPosition.capture();queueMicrotask(restore);
},true);
