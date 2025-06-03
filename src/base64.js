function convertBase64ToImage() {
  let base64String = document.getElementById("base64Input").value.trim();
  let errorMessage = document.getElementById("errorMessage");
  let imageElement = document.getElementById("outputImage");

  // Reset tampilan
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
  imageElement.style.display = "none";

  // Validasi input kosong
  if (!base64String) {
    errorMessage.textContent = "Harap masukkan string Base64!";
    errorMessage.classList.remove("hidden");
    return;
  }

  // Bersihkan karakter non-Base64 yang umum: spasi, newline, dll
  base64String = base64String.replace(/\r\n/g, "").replace(/\s/g, "");

  // Cek apakah sudah memiliki prefix
  if (!base64String.startsWith("data:image")) {
    // Deteksi jenis gambar berdasarkan karakter pertama Base64
    let detectedFormat = detectImageFormat(base64String);
    if (!detectedFormat) {
      errorMessage.textContent =
        "Format Base64 tidak valid atau tidak didukung!";
      errorMessage.classList.remove("hidden");
      return;
    }
    base64String = `data:image/${detectedFormat};base64,` + base64String;
  }

  // Validasi apakah benar-benar gambar Base64
  const base64Pattern =
    /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/;
  if (!base64Pattern.test(base64String)) {
    errorMessage.textContent = "Format Base64 tidak valid!";
    errorMessage.classList.remove("hidden");
    return;
  }

  // Tampilkan gambar
  imageElement.src = base64String;
  imageElement.style.display = "block";
}

function detectImageFormat(base64String) {
  // Mapping karakter pertama Base64 ke format gambar
  const formatMap = {
    "/9j": "jpeg",
    iVB: "png",
    R0l: "gif",
  };

  let prefix = base64String.substring(0, 3);
  return formatMap[prefix] || null;
}
