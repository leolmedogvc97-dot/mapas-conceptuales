// Mapa conceptual predeterminado: Sistema Jurídico
const legalMapPreset = {
  id: "root",
  text: "SISTEMA JURÍDICO",
  x: 1200,
  y: 80,
  color: "#1e3a8a",
  children: [
    {
      id: "node_dc",
      text: "DERECHO COMPARADO",
      x: 350,
      y: 240,
      color: "#2563eb",
      children: [
        { id: "node_macro", text: "MACRO-COMPARACIÓN\n(Sistemas y familias)", x: 200, y: 380, color: "#3b82f6", children: [] },
        { id: "node_micro", text: "MICRO-COMPARACIÓN\n(Instituciones concretas)", x: 480, y: 380, color: "#3b82f6", children: [] }
      ]
    },
    {
      id: "node_rj",
      text: "RECEPCIÓN JURÍDICA",
      x: 1200,
      y: 240,
      color: "#059669",
      children: [
        { id: "node_tec", text: "TÉCNICA\n(Voluntaria)", x: 1050, y: 380, color: "#10b981", children: [] },
        { id: "node_pol", text: "POLÍTICA\n(Impuesta)", x: 1350, y: 380, color: "#10b981", children: [] }
      ]
    },
    {
      id: "node_fj",
      text: "FAMILIAS JURÍDICAS",
      x: 2150,
      y: 240,
      color: "#7c3aed",
      children: [
        {
          id: "node_crit",
          text: "CRITERIOS DE CLASIFICACIÓN\n- Historia\n- Fuentes / Jerarquía\n- Estructura\n- Ideología / Religión",
          x: 1850,
          y: 380,
          color: "#8b5cf6",
          children: []
        },
        {
          id: "node_clas",
          text: "CLASIFICACIÓN DE FAMILIAS",
          x: 2450,
          y: 380,
          color: "#8b5cf6",
          children: [
            {
              id: "node_civil",
              text: "CIVIL LAW / ROMANO-GERMÁNICO",
              x: 1550,
              y: 560,
              color: "#d97706",
              children: [
                { id: "node_c1", text: "Subclasificaciones:\n• Eur.-Continentales (Francia, Alemania)\n• Latinoamericanos (México, Brasil)\n• Latinoafricanos (Senegal, Togo)", x: 1550, y: 700, color: "#f59e0b", children: [] },
                { id: "node_c2", text: "Características:\n• Derecho escrito y codificado\n• Jurisprudencia secundaria\n• Formal y Preventivo", x: 1550, y: 860, color: "#f59e0b", children: [] },
                { id: "node_c3", text: "SISTEMA FEDATARIO:\nNOTARIO LATINO\n• Lic. en Derecho y profesional\n• Fe pública estatal\n• Preventor de litigios", x: 1550, y: 1020, color: "#b45309", children: [] }
              ]
            },
            {
              id: "node_common",
              text: "COMMON LAW / ANGLOSAJÓN",
              x: 2000,
              y: 560,
              color: "#d97706",
              children: [
                { id: "node_cm1", text: "Subclasificaciones:\n• Inglés (Inglaterra, Australia)\n• Norteamericano (EE. UU.)\n• Angloafricanos (Nigeria, Uganda)", x: 2000, y: 700, color: "#f59e0b", children: [] },
                { id: "node_cm2", text: "Características:\n• Derecho no escrito / oral\n• Costumbre como fuente\n• Precedente (Stare decisis)\n• Jurado contencioso", x: 2000, y: 860, color: "#f59e0b", children: [] },
                { id: "node_cm3", text: "SISTEMA FEDATARIO:\nNOTARY PUBLIC\n• Sin estudios jurídicos\n• Certifica firmas/identidad\n• Sin prueba plena", x: 2000, y: 1020, color: "#b45309", children: [] }
              ]
            },
            {
              id: "node_islam",
              text: "ISLÁMICO",
              x: 2450,
              y: 560,
              color: "#d97706",
              children: [
                { id: "node_is1", text: "Fundamento:\n• Basado en la Sharía y la religión", x: 2450, y: 700, color: "#f59e0b", children: [] },
                { id: "node_is2", text: "Subclasificaciones:\n• Radicales (Irán, A. Saudita)\n• Moderados (Egipto, Marruecos)", x: 2450, y: 820, color: "#f59e0b", children: [] }
              ]
            },
            {
              id: "node_soc",
              text: "SOCIALISTA",
              x: 2850,
              y: 560,
              color: "#d97706",
              children: [
                { id: "node_sc1", text: "Estado actual:\n• Transición económica de mercado", x: 2850, y: 700, color: "#f59e0b", children: [] },
                { id: "node_sc2", text: "Subclasificaciones:\n• Sistema Chino (c/ mercado)\n• En transición (Cuba, Vietnam)", x: 2850, y: 820, color: "#f59e0b", children: [] },
                { id: "node_sc3", text: "Características:\n• Subordinación legal al Estado\n• Transición a economía mixta", x: 2850, y: 960, color: "#f59e0b", children: [] }
              ]
            },
            {
              id: "node_mix",
              text: "SISTEMAS MIXTOS",
              x: 3250,
              y: 560,
              color: "#d97706",
              children: [
                { id: "node_mx1", text: "Subclasificaciones:\n• Escandinavos (Dinamarca, Noruega)\n• Híbridos (Filipinas, Singapur)", x: 3250, y: 700, color: "#f59e0b", children: [] },
                { id: "node_mx2", text: "Características:\n• Combinación heterogénea de tradiciones jurídicas", x: 3250, y: 840, color: "#f59e0b", children: [] }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Asignar el mapa jurídico como inicial
let mindMapData = JSON.parse(JSON.stringify(legalMapPreset));

let selectedNodeId = "root";
let draggingNodeId = null;
let dragOffset = { x: 0, y: 0 };

const svgCanvas = document.getElementById("svg-canvas");
const nodesContainer = document.getElementById("nodes-container");
const colorPicker = document.getElementById("node-color");

document.addEventListener("DOMContentLoaded", () => {
  render();
  setupEventListeners();
  
  // Centrar el scroll automáticamente en el nodo principal al iniciar
  const canvasContainer = document.getElementById("canvas-container");
  canvasContainer.scrollLeft = 800;
  canvasContainer.scrollTop = 0;
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
  nodeEl.style.whiteSpace = "pre-wrap"; // Permite saltos de línea dentro del nodo
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
  const pX = parent.x + 80;
  const pY = parent.y + 25;
  const cX = child.x + 80;
  const cY = child.y + 25;

  const controlY = (pY + cY) / 2;
  const pathData = `M ${pX} ${pY} C ${pX} ${controlY}, ${cX} ${controlY}, ${cX} ${cY}`;

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
    text: "Nuevo Concepto",
    x: parent.x,
    y: parent.y + 120,
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
    text: "Nuevo Concepto",
    x: result.node.x + 220,
    y: result.node.y,
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
  document.getElementById("btn-add-child").addEventListener("click", addChildNode);
  document.getElementById("btn-add-sibling").addEventListener("click", addSiblingNode);
  document.getElementById("btn-delete").addEventListener("click", deleteNode);
  
  document.getElementById("btn-load-legal").addEventListener("click", () => {
    mindMapData = JSON.parse(JSON.stringify(legalMapPreset));
    selectedNodeId = "root";
    render();
  });

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
