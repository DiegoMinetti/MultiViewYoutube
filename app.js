// app.js
// Lógica principal de la matriz de videos YouTube

const dropzone = document.getElementById('dropzone');
const grid = document.getElementById('grid');
// IDs de videos en vivo por defecto
const DEFAULT_VIDEOS = [
  // Reemplaza estos IDs por los de tus streams en vivo favoritos
  'ArKbAx1K-2U', // a24
  'cb12KmMMDJA', // tn
  'gEsUfOMzaJc', // mitre
  'jTDk5CswBVk', // c5n
  'OLMiTr2OUeU', // canal26
  'wuWPTItW6gU', // neura
];
let videos = JSON.parse(localStorage.getItem('videos'));
if (!Array.isArray(videos) || videos.length === 0) {
  videos = [...DEFAULT_VIDEOS];
  localStorage.setItem('videos', JSON.stringify(videos));
}

let players = [];
let selectedIdx = null;

// Restaurar selección guardada
if (localStorage.getItem('selectedIdx') !== null) {
  selectedIdx = parseInt(localStorage.getItem('selectedIdx'));
  if (isNaN(selectedIdx)) selectedIdx = null;
}

export function getVideoId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.has("v")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.pathname.startsWith("/live/")) return u.pathname.split("/live/")[1];
  } catch {
    return null;
  }
  return null;
}

export function render() {
  grid.innerHTML = '';
  players = [];
  videos.forEach((id, idx) => {
    const div = document.createElement('div');
    div.className = 'video-container';
    div.setAttribute('data-idx', idx);
    const iframe = document.createElement('iframe');
    iframe.id = 'ytplayer-' + idx;
    iframe.src = `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=1&mute=1`;
    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;
    div.appendChild(iframe);
    // Contenedor de botones
    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    // Botón seleccionar
    const btnSel = document.createElement('button');
    btnSel.textContent = (selectedIdx === idx) ? 'Deseleccionar' : 'Seleccionar';
    btnSel.className = 'btn-select';
    btnSel.setAttribute('data-action', 'select');
    btnSel.setAttribute('data-idx', idx);
    btnRow.appendChild(btnSel);
    // Botón quitar (tacho)
    const btnQuitar = document.createElement('button');
    btnQuitar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    btnQuitar.className = 'btn-remove';
    btnQuitar.setAttribute('data-action', 'remove');
    btnQuitar.setAttribute('data-idx', idx);
    btnRow.appendChild(btnQuitar);
    div.appendChild(btnRow);
    grid.appendChild(div);
  });
  if (window.YT && YT.Player) {
    createPlayers();
  }
}

export function unmuteSelected(idx) {
  selectedIdx = idx;
  localStorage.setItem('selectedIdx', idx);
  Array.from(grid.children).forEach((div, i) => {
    if (div && div.style) {
      div.style.border = (i === idx) ? '3px solid #e62117' : '3px solid transparent';
    }
    const btn = div.querySelector('button[data-action="select"]');
    if (btn) btn.textContent = (i === idx) ? 'Deseleccionar' : 'Seleccionar';
  });
  players.forEach((p, i) => {
    if (p && p.mute && p.unMute) {
      if (i === idx) {
        p.unMute();
        p.playVideo();
      } else {
        p.mute();
      }
    }
  });
}

export function createPlayers() {
  players = [];
  videos.forEach((id, idx) => {
    const player = new YT.Player('ytplayer-' + idx, {
      events: {
        'onReady': function(event) {
          event.target.mute();
          event.target.playVideo();
          // Restaurar selección visual y audio si corresponde
          if (selectedIdx === idx) {
            setTimeout(() => {
              unmuteSelected(idx);
            }, 300);
          }
        },
        'onStateChange': () => {}
      }
    });
    players.push(player);
  });
}

// Eventos

grid.addEventListener('click', function(e) {
  let target = e.target;
  if (target.tagName === 'BUTTON' && target.getAttribute('data-action') === 'select') {
    const idx = parseInt(target.getAttribute('data-idx'));
    if (selectedIdx === idx) {
      selectedIdx = null;
      localStorage.removeItem('selectedIdx');
      Array.from(grid.children).forEach((div, i) => {
        if (div && div.style) div.style.border = '3px solid transparent';
        const btn = div.querySelector('button[data-action="select"]');
        if (btn) btn.textContent = 'Seleccionar';
      });
      players[idx] && players[idx].mute && players[idx].mute();
    } else {
      unmuteSelected(idx);
    }
    return;
  }
  if (target.tagName === 'BUTTON' && target.getAttribute('data-action') === 'remove') {
    const idx = parseInt(target.getAttribute('data-idx'));
    videos.splice(idx, 1);
    localStorage.setItem('videos', JSON.stringify(videos));
    // Si el que se quitó era el seleccionado, limpiar selección
    if (selectedIdx === idx) {
      selectedIdx = null;
      localStorage.removeItem('selectedIdx');
    } else if (selectedIdx > idx) {
      selectedIdx--;
      localStorage.setItem('selectedIdx', selectedIdx);
    }
    render();
    return;
  }
  while (target && target !== grid && !target.id.startsWith('ytplayer-')) {
    target = target.parentElement;
  }
  if (target && target.id && target.id.startsWith('ytplayer-')) {
    const idx = parseInt(target.id.split('-')[1]);
    unmuteSelected(idx);
  }
});

grid.addEventListener('focusin', function(e) {
  let target = e.target;
  while (target && target !== grid && !target.id.startsWith('ytplayer-')) {
    target = target.parentElement;
  }
  if (target && target.id && target.id.startsWith('ytplayer-')) {
    const idx = parseInt(target.id.split('-')[1]);
    unmuteSelected(idx);
  }
});

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.style.background = '#333';
});
dropzone.addEventListener('dragleave', () => {
  dropzone.style.background = '#222';
});
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.style.background = '#222';
  let text = e.dataTransfer.getData('text/plain');
  const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s]*)/i;
  const match = text.match(ytRegex);
  if (match) text = match[1];
  const id = getVideoId(text);
  if (id && !videos.includes(id)) {
    videos.push(id);
    localStorage.setItem('videos', JSON.stringify(videos));
    render();
  } else {
    alert("No encontré un videoId válido en el link: " + text);
  }
});
document.getElementById('ytform').addEventListener('submit', function(e) {
  e.preventDefault();
  let text = document.getElementById('ytinput').value.trim();
  if (!text) return;
  const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s]*)/i;
  const match = text.match(ytRegex);
  if (match) text = match[1];
  const id = getVideoId(text);
  if (id && !videos.includes(id)) {
    videos.push(id);
    localStorage.setItem('videos', JSON.stringify(videos));
    render();
    document.getElementById('ytinput').value = '';
  } else {
    alert("No encontré un videoId válido en el link: " + text);
  }
});

// --- Exportar e Importar videos ---
function addExportImportUI() {
  const controls = document.createElement('div');
  controls.id = 'export-import-controls';
  controls.style.display = 'flex';
  controls.style.justifyContent = 'center';
  controls.style.gap = '10px';
  controls.style.margin = '10px 0';

  // Botón Exportar
  const btnExport = document.createElement('button');
  btnExport.textContent = 'Exportar';
  btnExport.className = 'btn-select';
  btnExport.onclick = () => {
    const text = videos.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      btnExport.textContent = '¡Copiado!';
      setTimeout(() => btnExport.textContent = 'Exportar', 1200);
    });
  };
  controls.appendChild(btnExport);

  // Botón Importar
  const btnImport = document.createElement('button');
  btnImport.textContent = 'Importar';
  btnImport.className = 'btn-select';
  btnImport.onclick = () => {
    const input = prompt('Pega los IDs o URLs de los videos, uno por línea:');
    if (!input) return;
    const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const ids = lines.map(l => getVideoId(l) || l).filter(Boolean);
    if (ids.length) {
      videos = ids.filter((v, i, arr) => arr.indexOf(v) === i); // sin duplicados
      localStorage.setItem('videos', JSON.stringify(videos));
      render();
    } else {
      alert('No se detectaron IDs válidos.');
    }
  };
  controls.appendChild(btnImport);

  dropzone.parentNode.insertBefore(controls, dropzone.nextSibling);
}

// --- Botón para ocultar/mostrar el top (dropzone + controles) ---
function addToggleTopUI() {
  // Crear top-area si no existe
  let topArea = document.getElementById('top-area');
  if (!topArea) {
    topArea = document.createElement('div');
    topArea.id = 'top-area';
    // Mover dropzone y controles dentro de topArea
    const drop = document.getElementById('dropzone');
    const controls = document.getElementById('export-import-controls');
    if (controls) topArea.appendChild(controls);
    if (drop) topArea.appendChild(drop);
    document.body.insertBefore(topArea, document.getElementById('grid'));
  }
  // Crear el botón si no existe
  let btnToggle = document.getElementById('toggle-top-btn');
  if (!btnToggle) {
    btnToggle = document.createElement('button');
    btnToggle.id = 'toggle-top-btn';
    btnToggle.innerHTML = '▲';
    btnToggle.title = 'Ocultar barra superior';
    btnToggle.className = 'btn-toggle-top';
  }
  // Restaurar estado guardado
  const topHidden = localStorage.getItem('topAreaHidden') === 'true';
  if (topHidden) {
    topArea.classList.add('collapsed');
    btnToggle.innerHTML = '▼';
    btnToggle.title = 'Mostrar barra superior';
    btnToggle.classList.add('floating-toggle');
  } else {
    topArea.classList.remove('collapsed');
    btnToggle.innerHTML = '▲';
    btnToggle.title = 'Ocultar barra superior';
    btnToggle.classList.remove('floating-toggle');
  }
  btnToggle.onclick = () => {
    const isCollapsed = topArea.classList.toggle('collapsed');
    localStorage.setItem('topAreaHidden', isCollapsed);
    if (isCollapsed) {
      btnToggle.innerHTML = '▼';
      btnToggle.title = 'Mostrar barra superior';
      btnToggle.classList.add('floating-toggle');
    } else {
      btnToggle.innerHTML = '▲';
      btnToggle.title = 'Ocultar barra superior';
      btnToggle.classList.remove('floating-toggle');
    }
  };
  // Si el top ya está colapsado al cargar, dejar el botón flotante
  if (topArea.classList.contains('collapsed')) {
    btnToggle.classList.add('floating-toggle');
  }
  // Asegurar que el botón esté en el body
  document.body.appendChild(btnToggle);
}

// Llamar a las funciones en orden
addExportImportUI();
addToggleTopUI();

// --- Drag and drop con reordenamiento solo DOM, sin render global ---
let dragSrcIdx = null;
let draggingElem = null;
let placeholder = null;

grid.addEventListener('dragstart', function(e) {
  const div = e.target.closest('.video-container');
  if (!div) return;
  dragSrcIdx = parseInt(div.getAttribute('data-idx'));
  draggingElem = div;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragSrcIdx);
  div.classList.add('dragging');
  // Crear placeholder
  placeholder = document.createElement('div');
  placeholder.className = 'video-placeholder';
  placeholder.style.height = div.offsetHeight + 'px';
  placeholder.style.width = div.offsetWidth + 'px';
  div.parentNode.insertBefore(placeholder, div.nextSibling);
  // Ocultar el original mientras se arrastra
  setTimeout(() => { div.style.display = 'none'; }, 0);
});

grid.addEventListener('dragover', function(e) {
  e.preventDefault();
  const div = e.target.closest('.video-container');
  if (!div || !draggingElem || div === draggingElem) return;
  const rect = div.getBoundingClientRect();
  const offset = e.clientY - rect.top;
  // Mover placeholder visualmente
  if (offset < rect.height / 2) {
    if (div.parentNode && div.previousSibling !== placeholder) {
      div.parentNode.insertBefore(placeholder, div);
    }
  } else {
    if (div.parentNode && div.nextSibling !== placeholder) {
      div.parentNode.insertBefore(placeholder, div.nextSibling);
    }
  }
});

grid.addEventListener('dragend', function(e) {
  if (draggingElem) {
    draggingElem.classList.remove('dragging');
    draggingElem.style.display = '';
  }
  if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  draggingElem = null;
  placeholder = null;
  dragSrcIdx = null;
});

grid.addEventListener('drop', function(e) {
  e.preventDefault();
  if (!draggingElem || !placeholder) return;
  // Insertar el elemento arrastrado en la nueva posición visualmente
  placeholder.parentNode.insertBefore(draggingElem, placeholder);
  draggingElem.style.display = '';
  // Actualizar el array videos según el nuevo orden en el DOM
  const newOrder = Array.from(grid.children).filter(el => el.classList.contains('video-container')).map(el => parseInt(el.getAttribute('data-idx')));
  videos = newOrder.map(i => videos[i]);
  localStorage.setItem('videos', JSON.stringify(videos));
  // Ajustar selección si es necesario
  if (selectedIdx !== null) {
    selectedIdx = newOrder.indexOf(selectedIdx);
    localStorage.setItem('selectedIdx', selectedIdx);
  }
  // Actualizar los data-idx de los nodos
  Array.from(grid.children).forEach((div, idx) => {
    if (div.classList.contains('video-container')) div.setAttribute('data-idx', idx);
  });
  if (draggingElem) draggingElem.classList.remove('dragging');
  if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  draggingElem = null;
  placeholder = null;
  dragSrcIdx = null;
});

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

// Esperar a que la API de YouTube esté lista
window.onYouTubeIframeAPIReady = function() {
  createPlayers();
  // Si hay un seleccionado guardado, esperar a que todos los players estén listos y simular click
  if (selectedIdx !== null && !isNaN(selectedIdx)) {
    // Esperar a que todos los players estén en estado PLAYING o BUFFERING
    let checkReady = setInterval(() => {
      if (players.length === videos.length && players.every(p => p && typeof p.getPlayerState === 'function')) {
        // Simular click en el botón seleccionar del video seleccionado
        const btn = grid.querySelector(`.video-container[data-idx="${selectedIdx}"] .btn-select`);
        if (btn) btn.click();
        clearInterval(checkReady);
      }
    }, 200);
    // Limitar el tiempo de espera a 5 segundos
    setTimeout(() => clearInterval(checkReady), 5000);
  }
};

render();
