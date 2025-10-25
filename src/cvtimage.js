const csvFile = document.getElementById("csvFile");
const processBtn = document.getElementById("processBtn");
const previewBtn = document.getElementById("previewBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");
const previewContainer = document.getElementById("previewContainer");
const columnsList = document.getElementById("columnsList");

// Utility functions
const logStatus = (msg) => (statusEl.textContent = msg);

const stripPrefix = (base64) => {
  if (!base64) return "";
  const idx = base64.indexOf("base64,");
  return idx !== -1 ? base64.slice(idx + 7).trim() : base64.trim();
};

const base64ToUint8Array = (base64) => {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
};

const detectExt = (raw) => {
  if (!raw || typeof raw !== "string") return "jpg";
  const m = raw.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
  if (m && m[1]) {
    const map = {
      jpeg: "jpg",
      jpg: "jpg",
      png: "png",
      webp: "webp",
    };
    return map[m[1].toLowerCase()] || "jpg";
  }
  return "jpg";
};

// ✅ Preview Columns
previewBtn.addEventListener("click", () => {
  const file = csvFile.files[0];
  if (!file) return alert("Pilih file CSV terlebih dahulu!");
  Papa.parse(file, {
    header: true,
    preview: 3,
    skipEmptyLines: true,
    complete: (results) => {
      const cols = results.meta.fields || [];
      previewContainer.classList.remove("hidden");
      columnsList.textContent = cols.length
        ? cols.join(", ")
        : "(Tidak ada kolom terdeteksi)";
      logStatus(`Ditemukan ${cols.length} kolom`);
    },
    error: (err) => logStatus("❌ Gagal membaca CSV: " + err.message),
  });
});

// ✅ Proses CSV → ZIP (mengikuti format Python)
processBtn.addEventListener("click", () => {
  const file = csvFile.files[0];
  if (!file) return alert("Pilih file CSV terlebih dahulu!");

  logStatus("📂 Membaca CSV dan memproses data...");

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    delimiter: "", // kosong = auto detect
    complete: async function (results) {
      const rows = results.data;
      const zip = new JSZip();
      let saved = 0,
        failed = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const ktp_image = row["ktp_image"] || row[0];
        const zoloz_image = row["zoloz_image"] || row[1];
        const nik = (row["nik"] || row[2] || "").trim();

        if (!nik || (!ktp_image && !zoloz_image)) {
          failed++;
          continue;
        }

        // Simpan gambar KTP
        if (ktp_image) {
          const cleaned = stripPrefix(ktp_image);
          const bin = base64ToUint8Array(cleaned);
          if (bin) {
            zip.file(`KTP/${nik}_KTP.${detectExt(ktp_image)}`, bin, {
              binary: true,
            });
            saved++;
          }
        }

        // Simpan gambar ZOLOZ
        if (zoloz_image) {
          const cleaned = stripPrefix(zoloz_image);
          const bin = base64ToUint8Array(cleaned);
          if (bin) {
            zip.file(`FR/${nik}_FR.${detectExt(zoloz_image)}`, bin, {
              binary: true,
            });
            saved++;
          }
        }
      }

      logStatus(`📦 Membuat ZIP... (berhasil: ${saved}, gagal: ${failed})`);
      const blob = await zip.generateAsync({
        type: "blob",
      });
      saveAs(blob, `images_${Date.now()}.zip`);
      logStatus("✅ ZIP berhasil diunduh!");
    },
    error: (err) => logStatus("❌ Gagal membaca CSV: " + err.message),
  });
});

// ✅ Clear File
clearBtn.addEventListener("click", () => {
  csvFile.value = "";
  previewContainer.classList.add("hidden");
  columnsList.textContent = "";
  logStatus("");
});
