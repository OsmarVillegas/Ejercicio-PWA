document.addEventListener("DOMContentLoaded", async () => {
    // Variables globales
    let db; // Base de datos IndexedDB
    const tablaBody = document.getElementById("tabla-body");
  
    // Inicializar IndexedDB
    function initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("FrasesDB", 1);
  
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
  
    // Activar y desactivar el flash
    async function toggleFlash(estado) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
  
        if (capabilities.torch) {
          track.applyConstraints({ advanced: [{ torch: estado }] });
          return track; // Devuelve el track para detenerlo posteriormente
        } else {
          console.warn("El dispositivo no admite el control del flash.");
        }
      } catch (error) {
        console.error("Error al controlar el flash:", error);
      }
    }
  
    // Reproducir patrón binario en el flash
    async function reproducirBinario(binario) {
      let track;
      for (const bit of binario) {
        if (bit === "1") {
          track = await toggleFlash(true);
        } else {
          await toggleFlash(false);
        }
        await new Promise((resolve) => setTimeout(resolve, 300)); // Espera 300 ms entre cambios
      }
      if (track) track.stop(); // Detiene el video al finalizar
    }
  
    // Convertir código Morse a binario
    function morseABinario(morse) {
      return morse
        .split("") // Divide los caracteres
        .map((char) => {
          if (char === ".") return "10"; // Punto: Encendido corto
          if (char === "-") return "1110"; // Raya: Encendido largo
          if (char === "/") return "0"; // Espacio: Apagado
          return "0"; // Separador
        })
        .join("0"); // Espaciado entre señales
    }
  
    // Actualizar la tabla
    function actualizarTabla(frases) {
      tablaBody.innerHTML = ""; // Limpia la tabla
      frases.forEach((item, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${item.frase}</td>
          <td>${item.codigoMorse}</td>
          <td>
            <button class="btn btn-primary btn-sm" data-morse="${item.codigoMorse}">Reproducir</button>
          </td>
        `;
        tablaBody.appendChild(fila);
      });
  
      // Asignar eventos a los botones de reproducir
      tablaBody.querySelectorAll("button[data-morse]").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const morse = event.target.getAttribute("data-morse");
          const binario = morseABinario(morse);
          console.log(`Reproduciendo binario: ${binario}`);
          await reproducirBinario(binario);
        });
      });
    }
  
    // Inicializar la aplicación
    await initIndexedDB();
    const frases = await cargarDesdeIndexedDB();
    actualizarTabla(frases);
  });
  