let db;
const req=indexedDB.open("mechanicDB",1);
req.onupgradeneeded=e=>{
  db=e.target.result;
  if(!db.objectStoreNames.contains("jobs")) db.createObjectStore("jobs",{keyPath:"id",autoIncrement:true});
};
req.onsuccess=e=>{ db=e.target.result; renderJobs(); }

let jobs=[], completedJobs=[];

// Map
let map=L.map('map').setView([51.378,0.523],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);

// SPA Navigation
let currentView='jobs';
function showJobs(){currentView='jobs';renderJobs();}
function showMap(){currentView='map';}
function showCompleted(){currentView='completed';renderCompleted();}

// Render Jobs
function renderJobs(){
  const pane=document.getElementById('taskPane');
  pane.innerHTML='';
  if(jobs.length===0){ for(let i=0;i<3;i++) pane.innerHTML+='<div class="skeleton"></div>'; return; }
  jobs.forEach(job=>{
    const card=document.createElement('div'); card.className='job-card';
    card.textContent=`${job.customer} - ${job.vehicleReg}`;
    pane.appendChild(card);
    const mc=new Hammer(card);
    mc.on('swipeleft',()=>{completeJob(job);});
    mc.on('swiperight',()=>{acceptJob(job);});
  });
}

function acceptJob(job){ alert('Accepted '+job.customer); /* store in IndexedDB */ }
function completeJob(job){
  alert('Completed '+job.customer);
  // generate PDF with jsPDF
  const { jsPDF } = window.jspdf;
  let doc=new jsPDF();
  doc.text(`Job report: ${job.customer} - ${job.vehicleReg}`,10,10);
  doc.save(`${job.vehicleReg}_${Date.now()}.pdf`);
  completedJobs.push(job);
  jobs=jobs.filter(j=>j.id!==job.id);
  renderJobs();
}

function renderCompleted(){
  const pane=document.getElementById('taskPane');
  pane.innerHTML='';
  completedJobs.forEach(job=>{
    const card=document.createElement('div'); card.className='job-card';
    card.textContent=`${job.customer} - ${job.vehicleReg} | Completed`;
    pane.appendChild(card);
  });
}