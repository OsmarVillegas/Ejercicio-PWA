document.addEventListener("DOMContentLoaded", async () => {
    // Mapeo de caracteres a código Morse
    const morseCodeMap = {
      A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
      G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
      M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
      S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
      Y: "-.--", Z: "--..", 1: ".----", 2: "..---", 3: "...--",
      4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..",
      9: "----.", 0: "-----", " ": "/"
    };
  
    // Variables globales
    let db; // Base de datos IndexedDB
    const frases = []; // Array local para sincronizar con IndexedDB
    const formulario = document.getElementById("formulario");
    const fraseInput = document.getElementById("Frase");
    const tablaBody = document.querySelector("table tbody");
  
    // Inicializar IndexedDB
    function initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("FrasesDB", 1);
  
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("frases")) {
            db.createObjectStore("frases", { keyPath: "id", autoIncrement: true });
          }
        };
  
        request.onsuccess = (event) => {
          db = event.target.result;
          resolve();
        };
  
        request.onerror = (event) => {
          console.error("Error al inicializar IndexedDB:", event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    // Guardar frase en IndexedDB
    function guardarEnIndexedDB(frase, codigoMorse) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("frases", "readwrite");
        const store = transaction.objectStore("frases");
  
        const data = { frase, codigoMorse };
        const request = store.add(data);
  
        request.onsuccess = () => resolve(data);
        request.onerror = (event) => reject(event.target.error);
      });
    }
  
    // Eliminar frase de IndexedDB
    function eliminarDeIndexedDB(id) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("frases", "readwrite");
        const store = transaction.objectStore("frases");
  
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    }
  
    // Cargar frases desde IndexedDB
    function cargarDesdeIndexedDB() {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("frases", "readonly");
        const store = transaction.objectStore("frases");
  
        const request = store.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
      });
    }
  
    // Sincronizar array local con IndexedDB
    async function sincronizarFrases() {
      const datos = await cargarDesdeIndexedDB();
      frases.splice(0, frases.length, ...datos); // Sincroniza el array local
      actualizarTabla();
    }
  
    // Actualizar la tabla
    function actualizarTabla() {
      tablaBody.innerHTML = ""; // Limpia la tabla
      frases.forEach((item, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${item.frase}</td>
          <td>${item.codigoMorse}</td>
          <td>
            <button class="btn btn-danger btn-sm" data-id="${item.id}">Eliminar</button>
          </td>
        `;
        tablaBody.appendChild(fila);
      });
  
      // Asignar eventos de eliminación a los botones
      tablaBody.querySelectorAll("button[data-id]").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const id = Number(event.target.getAttribute("data-id"));
          await eliminarDeIndexedDB(id);
          frases.splice(frases.findIndex((item) => item.id === id), 1);
          actualizarTabla();
        });
      });
    }
  
    // Función para convertir texto a código Morse
    function convertirAMorse(texto) {
      return texto
        .toUpperCase()
        .split("")
        .map((char) => morseCodeMap[char] || "?")
        .join(" ");
    }
  
    // Manejar el evento de envío del formulario
    formulario.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const frase = fraseInput.value.trim();
      if (!frase) {
        alert("Por favor, introduce una frase.");
        return;
      }
  
      const codigoMorse = convertirAMorse(frase);
  
      // Guardar en IndexedDB y sincronizar
      const data = await guardarEnIndexedDB(frase, codigoMorse);
      frases.push(data);
      actualizarTabla();
  
      fraseInput.value = ""; // Limpiar el formulario
    });
  
    // Manejar Cache Storage
    // async function configurarCacheStorage() {
    //   const cache = await caches.open("PWA-Cache");
    //   cache.addAll([
    //     "/index.html",
    //     "/css/stylecrud.css",
    //     "/js/funcionalidadFormulario.js",
    //     "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    //     "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js",
    //     "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"
    //   ]);
    //   console.log("Recursos cacheados correctamente.");
    // }
  
    // Inicializar la aplicación
    await initIndexedDB();
    await sincronizarFrases();
    // await configurarCacheStorage();
  });
  