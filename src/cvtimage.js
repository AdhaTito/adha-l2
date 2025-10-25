const csvFileEl = document.getElementById("csvFile");
const delimiterEl = document.getElementById("delimiter");
const hasHeaderEl = document.getElementById("hasHeader");
const colImage1El = document.getElementById("colImage1");
const colImage2El = document.getElementById("colImage2");
const colIdEl = document.getElementById("colId");
const folder1El = document.getElementById("folder1");
const folder2El = document.getElementById("folder2");
const previewBtn = document.getElementById("previewBtn");
const processBtn = document.getElementById("processBtn");
const clearBtn = document.getElementById("clearBtn");
const logEl = document.getElementById("log");

let parsedData = null; // store parsed results
let columns = [];

function log(msg) {
  const time = new Date().toLocaleTimeString();
  logEl.innerHTML =
    `<div class="mb-1"><strong>[${time}]</strong> ${msg}</div>` +
    logEl.innerHTML;
}

// helper: remove data URI prefix if exists
function stripDataPrefix(s) {
  if (!s) return s;
  const idx = s.indexOf("base64,");
  if (idx !== -1) return s.slice(idx + 7).trim();
  return s.trim();
}

// convert base64 string to Uint8Array
function base64ToUint8Array(base64) {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return null;
  }
}

// Populate column selectors from parsed header or generated col names
function populateColumnSelectors(cols) {
  columns = cols;
  [colImage1El, colImage2El, colIdEl].forEach((sel) => {
    // clear
    sel.innerHTML = '<option value="">(pilih)</option>';
  });
  cols.forEach((c) => {
    const opt1 = document.createElement("option");
    opt1.value = c;
    opt1.text = c;
    const opt2 = opt1.cloneNode(true);
    const opt3 = opt1.cloneNode(true);
    colImage1El.appendChild(opt1);
    colImage2El.appendChild(opt2);
    colIdEl.appendChild(opt3);
  });
  log(`Columns populated: ${cols.join(", ")}`);
}

// Preview: parse file and show columns
previewBtn.addEventListener("click", () => {
  const file = csvFileEl.files[0];
  if (!file) {
    alert("Pilih file CSV dulu.");
    return;
  }
  const delim = delimiterEl.value.trim() || undefined;
  const header = hasHeaderEl.value === "true";

  Papa.parse(file, {
    header: header,
    dynamicTyping: false,
    skipEmptyLines: true,
    preview: 10, // only read first 10 rows to detect
    delimiter: delim,
    complete: function (results) {
      log(
        `Preview parsed — rows: ${results.data.length}, fields: ${Object.keys(results.data[0] || {}).length}`
      );
      if (header) {
        const cols = results.meta.fields.slice();
        populateColumnSelectors(cols);
        parsedData = null; // keep full parse for processing step
      } else {
        // build col_0.. based on number of columns
        const firstRow = results.data[0] || [];
        const colCount =
          firstRow.length ||
          (results.meta.fields ? results.meta.fields.length : 0);
        const cols = [];
        for (let i = 0; i < colCount; i++) cols.push(`col_${i}`);
        populateColumnSelectors(cols);
        parsedData = null;
      }
    },
    error: function (err) {
      log("Error parsing preview: " + err.message);
    },
  });
});

// Process and build ZIP
processBtn.addEventListener("click", () => {
  const file = csvFileEl.files[0];
  if (!file) {
    alert("Pilih file CSV dulu.");
    return;
  }

  const delim = delimiterEl.value.trim() || undefined;
  const header = hasHeaderEl.value === "true";
  const colImg1 = colImage1El.value;
  const colImg2 = colImage2El.value;
  const colId = colIdEl.value;
  const folder1 = (folder1El.value || "KTP").replace(/\/+$/, "");
  const folder2 = (folder2El.value || "FR").replace(/\/+$/, "");

  if (!colImg1 || !colId) {
    alert("Pilih setidaknya kolom gambar1 dan kolom ID (NIK).");
    return;
  }

  log("Memulai parse lengkap...");
  Papa.parse(file, {
    header: header,
    dynamicTyping: false,
    skipEmptyLines: true,
    delimiter: delim,
    complete: async function (results) {
      log(`File parsed, rows: ${results.data.length}`);
      const data = results.data;
      const zip = new JSZip();

      let countSaved = 0;
      let countFailed = 0;

      for (let i = 0; i < data.length; i++) {
        // Obtain values depending on header=true/false
        let row = data[i];
        // If header=false, PapaParse returns arrays; convert to object with col_0.. names
        if (!header && Array.isArray(row)) {
          const obj = {};
          for (let j = 0; j < row.length; j++) obj[`col_${j}`] = row[j];
          row = obj;
        }

        const idVal = (row[colId] || row["NIK"] || row["nik"] || "")
          .toString()
          .trim();
        const base64_1_raw = row[colImg1];
        const base64_2_raw = colImg2 ? row[colImg2] : null;

        if (!idVal) {
          log(`Row ${i + 1}: missing ID — skipping`);
          countFailed++;
          continue;
        }

        // Process image1
        if (base64_1_raw) {
          const cleaned1 = stripDataPrefix(base64_1_raw);
          const bin1 = base64ToUint8Array(cleaned1);
          if (bin1) {
            // use path like "KTP/{id}_KTP.jpg"
            const extGuess = detectImageExt(base64_1_raw) || "jpg";
            const filename1 = `${idVal}_KTP.${extGuess}`;
            zip.file(`${folder1}/${filename1}`, bin1, {
              binary: true,
            });
            countSaved++;
          } else {
            log(`Row ${i + 1} (${idVal}): gagal decode gambar1`);
            countFailed++;
          }
        } else {
          log(`Row ${i + 1} (${idVal}): gambar1 kosong`);
        }

        // Process image2 if selected
        if (base64_2_raw) {
          const cleaned2 = stripDataPrefix(base64_2_raw);
          const bin2 = base64ToUint8Array(cleaned2);
          if (bin2) {
            const extGuess = detectImageExt(base64_2_raw) || "jpg";
            const filename2 = `${idVal}_FR.${extGuess}`;
            zip.file(`${folder2}/${filename2}`, bin2, {
              binary: true,
            });
            countSaved++;
          } else {
            log(`Row ${i + 1} (${idVal}): gagal decode gambar2`);
            countFailed++;
          }
        }
      } // end for

      log(
        `Proses selesai. Saved: ${countSaved}, Failed rows: ${countFailed}. Mempersiapkan ZIP...`
      );
      try {
        const content = await zip.generateAsync({
          type: "blob",
        });
        const outName = `images_export_${Date.now()}.zip`;
        saveAs(content, outName);
        log(`ZIP diunduh: ${outName}`);
      } catch (e) {
        log("Gagal membuat ZIP: " + e.message);
      }
    },
    error: function (err) {
      log("Error parsing file: " + err.message);
    },
  });
});

// Clear UI & data
clearBtn.addEventListener("click", () => {
  csvFileEl.value = "";
  delimiterEl.value = "";
  hasHeaderEl.value = "true";
  colImage1El.innerHTML = '<option value="">(pilih kolom gambar 1)</option>';
  colImage2El.innerHTML = '<option value="">(pilih kolom gambar 2)</option>';
  colIdEl.innerHTML = '<option value="">(pilih kolom ID)</option>';
  parsedData = null;
  logEl.innerHTML = "";
});

// Try to detect image extension from data URI prefix if present
function detectImageExt(raw) {
  if (!raw || typeof raw !== "string") return null;
  const m = raw.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
  if (m && m[1]) {
    const map = {
      jpeg: "jpg",
      jpeg: "jpg",
      png: "png",
      webp: "webp",
      gif: "gif",
      bmp: "bmp",
    };
    return map[m[1].toLowerCase()] || m[1].toLowerCase();
  }
  return null;
}

// When CSV file selected, try auto-populate columns (light attempt)
csvFileEl.addEventListener("change", () => {
  const file = csvFileEl.files[0];
  if (!file) return;
  // Try quick parse (no header assumption) to get field count & sample header
  Papa.parse(file, {
    header: true,
    preview: 5,
    skipEmptyLines: true,
    complete: function (res) {
      if (res && res.meta && res.meta.fields && res.meta.fields.length) {
        populateColumnSelectors(res.meta.fields);
      } else {
        // fallback: parse first row as array
        Papa.parse(file, {
          header: false,
          preview: 1,
          complete: function (r2) {
            const arr = r2.data[0] || [];
            const cols = [];
            for (let i = 0; i < arr.length; i++) cols.push(`col_${i}`);
            populateColumnSelectors(cols);
          },
        });
      }
    },
  });
});
