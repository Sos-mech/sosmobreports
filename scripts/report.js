let images = [];

function toggleLiveSection() {
  const type = document.getElementById("type").value;
  document.getElementById("live-section").style.display = type === "Full Diagnostic" ? "block" : "none";
}

function previewImages(event) {
  const files = event.target.files;
  const previews = document.getElementById("previews");
  previews.innerHTML = "";
  images = [];

  for (let file of files) {
    const reader = new FileReader();
    reader.onload = e => {
      images.push(e.target.result);
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview";
      previews.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const plate = document.getElementById("plate").value || "UNKNOWN";
  const vehicle = document.getElementById("vehicle").value || "UNKNOWN";
  const type = document.getElementById("type").value;
  const obs = document.getElementById("obs").value || "-";
  const live = document.getElementById("live").value || "-";
  const rec = document.getElementById("rec").value || "-";

  // Get GPS
  let coords = "Location not available";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      coords = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      addPDFContent();
    }, addPDFContent);
  } else addPDFContent();

  function addPDFContent() {
    let y = 10;
    pdf.setFontSize(14);
    pdf.text(`Vehicle Report – ${plate}`, 10, y); y += 8;

    pdf.setFontSize(10);
    pdf.text(`Type: ${type}`, 10, y); y += 6;
    pdf.text(`Vehicle: ${vehicle}`, 10, y); y += 6;
    pdf.text(`Date: ${new Date().toLocaleString()}`, 10, y); y += 6;
    pdf.text(`Location: ${coords}`, 10, y); y += 10;

    pdf.setFontSize(11);
    pdf.text("Observations:", 10, y); y += 6;
    pdf.setFontSize(10);
    pdf.text(obs, 10, y, { maxWidth: 180 }); y += 20;

    if (type === "Full Diagnostic") {
      pdf.text("Live Data / Notes:", 10, y); y += 6;
      pdf.text(live, 10, y, { maxWidth: 180 }); y += 20;
    }

    pdf.text("Recommendations:", 10, y); y += 6;
    pdf.text(rec, 10, y, { maxWidth: 180 }); y += 10;

    // Disclaimer
    y += 10;
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text(
      "Disclaimer: This report reflects vehicle condition at the time of inspection only. " +
      "All findings are based on tests and observations performed by SOS Mechanics. " +
      "No guarantee is provided regarding future performance, repairs, or outcomes. " +
      "SOS Mechanics is not responsible for any subsequent damage or issues that may arise.",
      10, y, { maxWidth: 180 }
    );

    // Add images
    for (let img of images) {
      pdf.addPage();
      pdf.addImage(img, "JPEG", 10, 20, 180, 120);
    }

    pdf.save(`SOS_Report_${plate}.pdf`);
  }
}