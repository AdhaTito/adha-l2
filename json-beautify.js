function beautifyJson(index) {
  let input = document.getElementById(`jsonInput${index}`).value;
  try {
    let jsonObj = JSON.parse(input);
    document.getElementById(`jsonInput${index}`).value = JSON.stringify(
      jsonObj,
      null,
      4
    );
  } catch (error) {
    alert("Invalid JSON: " + error.message);
  }
}

function compareJson() {
  try {
    let json1 = JSON.parse(document.getElementById("jsonInput1").value);
    let json2 = JSON.parse(document.getElementById("jsonInput2").value);

    let json1Str = JSON.stringify(json1, null, 4);
    let json2Str = JSON.stringify(json2, null, 4);

    displayComparison(json1Str, json2Str);
  } catch (error) {
    alert("Invalid JSON: " + error.message);
  }
}

function displayComparison(json1, json2) {
  let lines1 = json1.split("\n");
  let lines2 = json2.split("\n");
  let maxLength = Math.max(lines1.length, lines2.length);
  let result1 = "";
  let result2 = "";

  for (let i = 0; i < maxLength; i++) {
    let line1 = lines1[i] || "";
    let line2 = lines2[i] || "";
    if (line1 !== line2) {
      result1 += `<span class='highlight'>${line1}</span>\n`;
      result2 += `<span class='highlight'>${line2}</span>\n`;
    } else {
      result1 += `${line1}\n`;
      result2 += `${line2}\n`;
    }
  }
  document.getElementById("comparisonResult1").innerHTML = result1;
  document.getElementById("comparisonResult2").innerHTML = result2;
}
