let mindMapData = {
  id: "root",
  text: "Idea Principal",
  x: 500,
  y: 350,
  color: "#3b82f6",
  children: [
    { id: "child_1", text: "Subtema A", x: 750, y: 280, color: "#10b981", children: [] },
    { id: "child_2", text: "Subtema B", x: 750, y: 420, color: "#8b5cf6", children: [] }
  ]
};

let selectedNodeId = "root";
let draggingNodeId = null;
let dragOffset = { x: 0, y: 0 };

const svgCanvas = document.getElementById("svg-canvas");
const nodesContainer = document.getElementById("nodes-container");
const colorPicker = document.getElementById("node-color");

document.addEventListener("DOMContentLoaded", () => {
  render();
  setupEventListeners();
});

function render() {
  nodesContainer.innerHTML = "";
  svgCanvas.innerHTML = "";
  renderNodeRecursive(mindMapData);
}

function renderNodeRecursive(node, parentNode = null) {
  const nodeEl = document.createElement("div");
  nodeEl.className = `node ${node.id === selectedNodeId ? "selected" : ""}`;
  nodeEl.style.left = `${node.x}px`;
  nodeEl.style.top = `${node.y}px`;
  nodeEl.style.backgroundColor = node.color || "#3b82f6";
  nodeEl.dataset.id = node.id;

  const textEl = document.createElement("span");
  textEl.innerText = node.text;
  textEl.contentEditable = false;
  nodeEl.appendChild(textEl);

  nodesContainer.appendChild(nodeEl);

  nodeEl.addEventListener("mousedown", (e) => startDrag(e, node));
  nodeEl.addEventListener("dblclick", () => enableInlineEdit(textEl, node));

  if (parentNode) {
    drawConnector(parentNode, node);
  }

  if (node.children && node.children.length > 0) {
    node.children.forEach(child => renderNodeRecursive(child, node));
  }
}

function drawConnector(parent, child) {
  const pX = parent.x + 60;
  const pY = parent.y + 20;
  const cX = child.x + 60;
  const cY = child.y + 20;

  const controlX = (pX + cX) / 2;
  const pathData = `M ${pX} ${pY} C ${controlX} ${pY}, ${controlX} ${cY}, ${cX} ${cY}`;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("stroke", child.color || "#cbd5e1");
  path.setAttribute("stroke-width", "3");
  path.setAttribute("fill", "none");

  svgCanvas.appendChild(path);
}

function findNodeAndParent(id, current = mindMapData, parent = null) {
  if (current.id === id) return { node: current, parent };
  if (current.children) {
    for (let child of current.children) {
      const res = findNodeAndParent(id, child, current);
      if (res) return res;
    }
  }
  return null;
}

function addChildNode() {
  const result = findNodeAndParent(selectedNodeId);
  if (!result) return;

  const parent = result.node;
  const newId = "node_" + Date.now();
  const newNode = {
    id: newId,
    text: "Nuevo Subtema",
    x: parent.x + 220,
    y: parent.y + (parent.children.length * 60) - 30,
    color: parent.color,
    children: []
  };

  parent.children.push(newNode);
  selectedNodeId = newId;
  render();
}

function addSiblingNode() {
  const result = findNodeAndParent(selectedNodeId);
  if (!result || !result.parent) return;

  const parent = result.parent;
  const newId = "node_" + Date.now();
  const newNode = {
    id: newId,
    text: "Nuevo Hermano",
    x: result.node.x,
    y: result.node.y + 70,
    color: parent.color,
    children: []
  };

  parent.children.push(newNode);
  selectedNodeId = newId;
  render();
}

function deleteNode() {
  if (selectedNodeId === "root") {
    alert("No se puede eliminar la idea principal.");
    return;
  }
  const result = findNodeAndParent(selectedNodeId);
  if (result && result.parent) {
    result.parent.children = result.parent.children.filter(c => c.id !== selectedNodeId);
    selectedNodeId = result.parent.id;
    render();
  }
}

function enableInlineEdit(textEl, node) {
  textEl.contentEditable = true;
  textEl.focus();
  
  const range = document.createRange();
  range.selectNodeContents(textEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  const saveText = () => {
    textEl.contentEditable = false;
    node.text = textEl.innerText.trim() || "Sin título";
    render();
  };

  textEl.addEventListener("blur", saveText, { once: true });
  textEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveText();
    }
  });
}

function startDrag(e, node) {
  selectedNodeId = node.id;
  draggingNodeId = node.id;
  dragOffset.x = e.clientX - node.x;
  dragOffset.y = e.clientY - node.y;
  
  colorPicker.value = node.color || "#3b82f6";
  render();

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(e) {
  if (!draggingNodeId) return;
  const result = findNodeAndParent(draggingNodeId);
  if (result) {
    result.node.x = e.clientX - dragOffset.x;
    result.node.y = e.clientY - dragOffset.y;
    render();
  }
}

function stopDrag() {
  draggingNodeId = null;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}

function buildWordList(node) {
  let html = `<li><b>${node.text}</b>`;
  if (node.children && node.children.length > 0) {
    html += "<ul>";
    node.children.forEach(child => {
      html += buildWordList(child);
    });
    html += "</ul>";
  }
  html += "</li>";
  return html;
}

function exportToWord() {
  const listHtml = buildWordList(mindMapData);
  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Mapa Conceptual</title></head>
    <body>
      <h2>Esquema del Mapa Conceptual</h2>
      <ul>${listHtml}</ul>
    </body>
    </html>
  `;
  const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mapa_conceptual.doc";
  a.click();
  URL.revokeObjectURL(url);
}

function setupEventListeners() {
  document.getElementById("btn-add-child").addEventListener("click", addChildNode);
  document.getElementById("btn-add-sibling").addEventListener("click", addSiblingNode);
  document.getElementById("btn-delete").addEventListener("click", deleteNode);

  colorPicker.addEventListener("input", (e) => {
    const result = findNodeAndParent(selectedNodeId);
    if (result) {
      result.node.color = e.target.value;
      render();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.isContentEditable) return;
    if (e.key === "Tab") { e.preventDefault(); addChildNode(); }
    if (e.key === "Enter") { e.preventDefault(); addSiblingNode(); }
    if (e.key === "Delete" || e.key === "Backspace") { deleteNode(); }
  });

  document.getElementById("btn-export-json").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mindMapData, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "mapa_mental.json";
    a.click();
  });

  const fileInput = document.getElementById("file-input");
  document.getElementById("btn-import-json").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        mindMapData = JSON.parse(event.target.result);
        selectedNodeId = mindMapData.id;
        render();
      } catch (err) {
        alert("El archivo subido no es un JSON válido.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("btn-export-png").addEventListener("click", () => {
    const canvasContainer = document.getElementById("canvas-container");
    html2canvas(canvasContainer, { backgroundColor: "#f8fafc" }).then(canvas => {
      const a = document.createElement("a");
      a.download = "mapa_conceptual.png";
      a.href = canvas.toDataURL();
      a.click();
    });
  });

  document.getElementById("btn-export-pdf").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("btn-export-word").addEventListener("click", exportToWord);
}
