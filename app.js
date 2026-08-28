let mindMapData = {
  id: "root",
  text: "Idea Principal",
  x: 1500,
  y: 100,
  color: "#1e3a8a",
  children: []
};

let selectedNodeId = "root";
let draggingNodeId = null;
let dragOffset = { x: 0, y: 0 };

const svgCanvas = document.getElementById("svg-canvas");
const nodesContainer = document.getElementById("nodes-container");
const colorPicker = document.getElementById("node-color");

document.addEventListener("DOMContentLoaded", () => {
  autoLayout(mindMapData);
  render();
  setupEventListeners();
  
  const canvasContainer = document.getElementById("canvas-container");
  if (canvasContainer) {
    canvasContainer.scrollLeft = 800;
    canvasContainer.scrollTop = 0;
  }
});

// Cuenta nodos hoja para distribuir el ancho total
function getLeafCount(node) {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  return node.children.reduce((acc, child) => acc + getLeafCount(child), 0);
}

// Layout automático para evitar encimamientos
function autoLayout(node, startX = 1500, startY = 100, level = 0) {
  const NODE_WIDTH = 260;
  const NODE_HEIGHT = 180;

  const colors = ["#1e3a8a", "#2563eb", "#059669", "#7c3aed", "#d97706", "#b45309"];
  if (!node.color) {
    node.color = colors[level % colors.length];
  }

  node.y = startY;

  if (node.children && node.children.length > 0) {
    const totalLeaves = getLeafCount(node);
    const totalSubtreeWidth = totalLeaves * NODE_WIDTH;
    let currentX = startX - totalSubtreeWidth / 2;

    node.children.forEach((child) => {
      const childLeaves = getLeafCount(child);
      const childSubtreeWidth = childLeaves * NODE_WIDTH;
      const childCenterX = currentX + childSubtreeWidth / 2;

      autoLayout(child, childCenterX, startY + NODE_HEIGHT, level + 1);
      currentX += childSubtreeWidth;
    });

    node.x = startX;
  } else {
    node.x = startX;
  }
}

function render() {
  if (!nodesContainer || !svgCanvas) return;
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
    requestAnimationFrame(() => {
      const parentEl = document.querySelector(`[data-id="${parentNode.id}"]`);
      if (parentEl && nodeEl) {
        const pRect = parentEl.getBoundingClientRect();
        const cRect = nodeEl.getBoundingClientRect();
        const containerRect = nodesContainer.getBoundingClientRect();

        const pX = pRect.left + pRect.width / 2 - containerRect.left;
        const pY = pRect.top + pRect.height - containerRect.top;
        const cX = cRect.left + cRect.width / 2 - containerRect.left;
        const cY = cRect.top - containerRect.top;

        drawConnector(pX, pY, cX, cY, node.color);
      }
    });
  }

  if (node.children && node.children.length > 0) {
    node.children.forEach(child => renderNodeRecursive(child, node));
  }
}

function drawConnector(pX, pY, cX, cY, color) {
  const controlY = (pY + cY) / 2;
  const pathData = `M ${pX} ${pY} C ${pX} ${controlY}, ${cX} ${controlY}, ${cX} ${cY}`;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("stroke", color || "#cbd5e1");
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
}

function buildWordList(node) {
  let html = `<li><b>${node.text.replace(/\n/g, '<br>')}</b>`;
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
  document.getElementById("btn-add-child")?.addEventListener("click", () => {
    const res = findNodeAndParent(selectedNodeId);
    if (!res) return;
    const newId = "node_" + Date.now();
    res.node.children.push({ id: newId, text: "Nuevo Concepto", children: [] });
    autoLayout(mindMapData);
    selectedNodeId = newId;
    render();
  });

  document.getElementById("btn-add-sibling")?.addEventListener("click", () => {
    const res = findNodeAndParent(selectedNodeId);
    if (!res || !res.parent) return;
    const newId = "node_" + Date.now();
    res.parent.children.push({ id: newId, text: "Nuevo Concepto", children: [] });
    autoLayout(mindMapData);
    selectedNodeId = newId;
    render();
  });

  document.getElementById("btn-delete")?.addEventListener("click", () => {
    if (selectedNodeId === "root") return;
    const res = findNodeAndParent(selectedNodeId);
    if (res && res.parent) {
      res.parent.children = res.parent.children.filter(c => c.id !== selectedNodeId);
      selectedNodeId = res.parent.id;
      autoLayout(mindMapData);
      render();
    }
  });

  document.getElementById("btn-import-text")?.addEventListener("click", () => {
    const rawInput = prompt("Pega aquí el JSON del mapa conceptual:");
    if (!rawInput) return;
    try {
      const parsedData = JSON.parse(rawInput);
      mindMapData = parsedData;
      selectedNodeId = mindMapData.id || "root";
      autoLayout(mindMapData);
      render();
    } catch (e) {
      alert("Error: El texto pegado no es un JSON válido.");
    }
  });

  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      const res = findNodeAndParent(selectedNodeId);
      if (res) {
        res.node.color = e.target.value;
        render();
      }
    });
  }

  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mindMapData, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "mapa_mental.json";
    a.click();
  });

  const fileInput = document.getElementById("file-input");
  document.getElementById("btn-import-json")?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        mindMapData = JSON.parse(event.target.result);
        selectedNodeId = mindMapData.id || "root";
        autoLayout(mindMapData);
        render();
      } catch (err) {
        alert("El archivo subido no es un JSON válido.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("btn-export-png")?.addEventListener("click", () => {
    const canvasContainer = document.getElementById("canvas-container");
    if (typeof html2canvas !== "undefined" && canvasContainer) {
      html2canvas(canvasContainer, { backgroundColor: "#f8fafc" }).then(canvas => {
        const a = document.createElement("a");
        a.download = "mapa_conceptual.png";
        a.href = canvas.toDataURL();
        a.click();
      });
    }
  });

  document.getElementById("btn-export-pdf")?.addEventListener("click", () => {
    window.print();
  });

  document.getElementById("btn-export-word")?.addEventListener("click", exportToWord);
}

function startDrag(e, node) {
  selectedNodeId = node.id;
  draggingNodeId = node.id;
  dragOffset.x = e.clientX - node.x;
  dragOffset.y = e.clientY - node.y;
  render();
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(e) {
  if (!draggingNodeId) return;
  const res = findNodeAndParent(draggingNodeId);
  if (res) {
    res.node.x = e.clientX - dragOffset.x;
    res.node.y = e.clientY - dragOffset.y;
    render();
  }
}

function stopDrag() {
  draggingNodeId = null;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}
