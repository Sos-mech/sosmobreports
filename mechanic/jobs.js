let jobs = [
  { customer: 'John Doe', vehicle: 'BMW 1 Series', status: 'pending' },
  { customer: 'Jane Smith', vehicle: 'Mini Cooper', status: 'pending' },
  { customer: 'Mike Brown', vehicle: 'Audi A3', status: 'pending' }
];

let currentJob = null;

function loadJobs(){
  const pane = document.getElementById('taskPane');
  pane.innerHTML='';
  if(jobs.length===0){
    for(let i=0;i<3;i++)
      pane.innerHTML+='<div class="skeleton"></div>';
    return;
  }

  jobs.forEach(job=>{
    const card = document.createElement('div');
    card.className='job-card';
    card.setAttribute('data-customer', job.customer);
    card.innerHTML = `<strong>${job.customer}</strong><br><span>${job.vehicle}</span>`;
    pane.appendChild(card);

    const mc = new Hammer(card);
    mc.on('swipeleft',()=>{ completeJob(job); });
    mc.on('swiperight',()=>{ startJob(job); });
  });
}

function startJob(job){
  if(currentJob){
    alert('Finish current job first!');
    return;
  }
  currentJob = job;
  job.status = 'in-progress';
  job.startTime = new Date();
  updateTicker();
  loadJobs();
  startTimer(job);
}

function startTimer(job){
  const card = document.querySelector(`.job-card[data-customer='${job.customer}']`);
  const timerEl = document.createElement('div');
  timerEl.className='job-timer';
  card.appendChild(timerEl);

  job.timerInterval = setInterval(()=>{
    const diff = Math.floor((new Date() - job.startTime)/1000);
    const mins = Math.floor(diff/60);
    const secs = diff % 60;
    timerEl.innerText = `Time: ${mins}m ${secs}s`;
    if(diff > 900) card.style.backgroundColor = '#ffdddd';
  },1000);
}

function completeJob(job){
  if(job.timerInterval) clearInterval(job.timerInterval);
  job.status='completed';
  job.endTime = new Date();
  currentJob = null;
  loadJobs();
  updateTicker();
  generatePDF(job);
}

function generatePDF(job){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const start = job.startTime ? job.startTime.toLocaleString() : 'N/A';
  const end = job.endTime ? job.endTime.toLocaleString() : 'N/A';

  doc.setFontSize(16);
  doc.text('SOS Mechanic Job Report', 10, 20);
  doc.setFontSize(12);
  doc.text(`Customer: ${job.customer}`,10,30);
  doc.text(`Vehicle: ${job.vehicle}`,10,40);
  doc.text(`Start Time: ${start}`,10,50);
  doc.text(`End Time: ${end}`,10,60);
  doc.text(`Status: ${job.status}`,10,70);

  const fileName = `${job.vehicle.replace(/\s+/g,'_')}_${Date.now()}.pdf`;
  doc.save(fileName);
}

function updateTicker(){
  const ticker = document.getElementById('ticker');
  const pending = jobs.filter(j=>j.status==='pending').length;
  ticker.innerText = `${pending} jobs pending`;
}

function showJobs(){ document.getElementById('taskPane').style.display='block'; document.getElementById('mapPane').style.display='none'; }
function showMap(){ document.getElementById('taskPane').style.display='none'; document.getElementById('mapPane').style.display='block'; }
function showCompleted(){ document.getElementById('taskPane').innerHTML=''; jobs.filter(j=>j.status==='completed').forEach(j=>{ const card=document.createElement('div'); card.className='job-card'; card.innerHTML=`<strong>${j.customer}</strong><br>${j.vehicle}`; document.getElementById('taskPane').appendChild(card); }); showJobs(); }

loadJobs();
updateTicker();

// Initialize OSM map
let map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,
  attribution:'© OpenStreetMap'
}).addTo(map);

document.getElementById('locInput').addEventListener('change', e=>{
  const val = e.target.value;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`)
    .then(r=>r.json())
    .then(data=>{
      if(data && data.length){
        const lat = data[0].lat;
        const lon = data[0].lon;
        map.setView([lat,lon],15);
        L.marker([lat,lon]).addTo(map).bindPopup(val).openPopup();
      }
    });
});