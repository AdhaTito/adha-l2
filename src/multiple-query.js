const dataInput = document.getElementById("dataInput");
const separatorInput = document.getElementById("separatorInput");
const colonInput = document.getElementById("colonInput");
const queryInput = document.getElementById("queryInput");
const resultData = document.getElementById("resultData");
const resultQuery = document.getElementById("resultQuery");

// Generate formatted data
document.getElementById("generateBtn").addEventListener("click", () => {
  const data = dataInput.value.trim();
  const separator = separatorInput.value || ",";
  const colon = colonInput.value || "'";
  const query = queryInput.value || "";

  if (!data) {
    alert("⚠️ No data entered!");
    return;
  }

  const lines = data.split(/\r?\n/).filter((line) => line.trim());
  const formattedData = lines
    .map((line) => `${colon}${line.trim()}${colon}`)
    .join(separator);
  const finalQuery = query.replace("<DATA_HERE>", formattedData);

  resultData.value = formattedData;
  resultQuery.value = finalQuery;
});

// Copy functions
document.getElementById("copyDataBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(resultData.value);
  alert("✅ Formatted data copied!");
});

document.getElementById("copyQueryBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(resultQuery.value);
  alert("✅ Query copied!");
});
