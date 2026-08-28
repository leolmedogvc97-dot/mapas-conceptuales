// Estado inicial del mapa mental
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

// Referencias del DOM
const svgCanvas = document.getElementById("svg-canvas");
const nodesContainer = document.getElementById("nodes-container");
const colorPicker = document.getElementById("node-color");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  render();
  setupEventListeners();
});

// Renderizar todo el mapa (Nodos y Conexiones SVG)
function render() {
  nodesContainer.innerHTML = "";
  svgCanvas.innerHTML = "";
  renderNodeRecursive(mindMapData);
}

function renderNodeRecursive(node, parentNode = null) {
  // 1. Crear elemento DOM del Nodo
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

  // Eventos de selección y edición
  nodeEl.addEventListener("mousedown", (e) => startDrag(e, node));
  nodeEl.addEventListener("dblclick", () => enableInlineEdit(textEl, node));

  // 2. Dibujar línea/curva SVG si tiene padre
  if (parentNode) {
    drawConnector(parentNode, node);
  }

  // 3. Renderizar hijos de forma recursiva
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => renderNodeRecursive(child, node));
  }
}

// Dibujar conectores curvos estilo Bezier
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

// --- Operaciones con Nodos ---

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

// --- Edición y Arrastre (Drag & Drop) ---

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

// --- Funciones de Exportación (PNG, PDF, Word) ---

function captureCanvasAsImage() {
  const canvasContainer = document.getElementById("canvas-container");
  return html2canvas(canvasContainer, { backgroundColor: "#f8fafc" });
}

// Exportar PDF
function exportToPDF() {
  captureCanvasAsImage().then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("mapa_conceptual.pdf");
  });
}

// Generar esquema jerárquico en texto para Word
function buildWordOutline(node, level = 1) {
  let html = `<h${Math.min(level, 6)} style="color: ${node.color}; font-family: Arial, sans-serif;">${"&nbsp;".repeat((level-1)*4)}${node.text}</h${Math.min(level, 6)}>`;
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      html += buildWordOutline(child, level + 1);
    });
  }
  return html;
}

// Exportar Word (.docx)
function exportToWord() {
  captureCanvasAsImage().then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const outlineHtml = buildWordOutline(mindMapData);

    // Documento HTML compatible con Microsoft Word (.docx)
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Mapa Conceptual</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2, h3, h4 { margin-bottom: 5px; }
          .diagram { margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Mapa Conceptual - ${mindMapData.text}</h1>
        <hr>
        <h2>Estructura Jerárquica:</h2>
        ${outlineHtml}
        <br><hr><br>
        <h2>Diagrama Visual:</h2>
        <div class="diagram">
          <img src="${imgData}" style="max-width: 100%; height: auto;" />
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mapa_conceptual.docx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// --- Configuración de Eventos ---

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

  // Atajos de Teclado
  document.addEventListener("keydown", (e) => {
    if (e.target.isContentEditable) return;
    if (e.key === "Tab") { e.preventDefault(); addChildNode(); }
    if (e.key === "Enter") { e.preventDefault(); addSiblingNode(); }
    if (e.key === "Delete" || e.key === "Backspace") { deleteNode(); }
  });

  // JSON Import/Export
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

  // Eventos de los nuevos botones
  document.getElementById("btn-export-png").addEventListener("click", () => {
    captureCanvasAsImage().then(canvas => {
      const a = document.createElement("a");
      a.download = "mapa_conceptual.png";
      a.href = canvas.toDataURL();
      a.click();
    });
  });

  document.getElementById("btn-export-pdf").addEventListener("click", exportToPDF);
  document.getElementById("btn-export-word").addEventListener("click", exportToWord);
}
