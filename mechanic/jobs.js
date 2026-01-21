let db;
const req = indexedDB.open("mechanicDB",1);
req.onupgradeneeded = ()=>{ req.result.createObjectStore("jobs",{keyPath:"id",autoIncrement:true}); };
req.onsuccess = ()=>{ db=req.result; loadJobs(); };

let jobs = [
  {customer:"Alice", vehicle:"BMW 118i"},
  {customer:"Bob", vehicle:"Mini Cooper"},
  {customer:"Charlie", vehicle:"Ford Fiesta"}
];
let completedJobs = [];

// Leaflet Map
let map = L.map('map').setView([51.378,0.523],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);

// SPA navigation
function showJobs(){document.getElementById('taskPane').style.display='block'; document.getElementById('mapPane').style.display='none';}
function showMap(){document.getElementById('taskPane').style.display='none'; document.getElementById('mapPane').style.display='block';}
function showCompleted(){document.getElementById('taskPane').style.display='block'; document.getElementById('mapPane').style.display='none'; renderCompleted();}

// Render jobs
function loadJobs(){
  const pane = document.getElementById('taskPane');
  pane.innerHTML='';
  if(jobs.length===0){ for(let i=0;i<3;i++) pane.innerHTML+='<div class="skeleton"></div>'; return; }
  jobs.forEach(job=>{
    const card = document.createElement('div'); card.className='job-card';
    card.textContent = `${job.customer} - ${job.vehicle}`;
    pane.appendChild(card);
    const mc = new Hammer(card);
    mc.on('swipeleft',()=>{ completeJob(job); });
    mc.on('swiperight',()=>{ acceptJob(job); });
  });
}

// Accept & Complete
function acceptJob(job){ alert('Accepted '+job.customer); }
function completeJob(job){
  alert('Completed '+job.customer);
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();
  doc.text(`Job report: ${job.customer} - ${job.vehicle}`,10,10);
  doc.save(`${job.vehicle}_${Date.now()}.pdf`);
  completedJobs.push(job);
  jobs = jobs.filter(j=>j.id!==job.id);
  loadJobs();
}

function renderCompleted(){
  const pane = document.getElementById('taskPane');
  pane.innerHTML='';
  completedJobs.forEach(job=>{
    const card = document.createElement('div'); card.className='job-card';
    card.textContent = `${job.customer} - ${job.vehicle} | Completed`;
    pane.appendChild(card);
  });
}

// Trigger QR upload
function scanQR(){ document.getElementById('qrUpload').click(); }