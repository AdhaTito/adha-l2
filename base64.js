function convertBase64ToImage() {
  let base64String = document.getElementById("base64Input").value.trim();

  if (!base64String.startsWith("data:image")) {
    base64String = "data:image/png;base64," + base64String;
  }

  let imageElement = document.getElementById("outputImage");
  imageElement.src = base64String;
  imageElement.style.display = "block";
}
