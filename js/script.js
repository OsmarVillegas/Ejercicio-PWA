const PUBLIC_VAPID_KEY =
  "BBxLyh0vFImcZG65K6F4wZv17fbd501Jm1gxxuQLOJCsk6Pq3xJP_wmV9_vgqTcVk-l1-wadN3spEApWaWgASYE";

// Convierte la clave pública en Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const subscription = async () => {
  try {
    // Asegúrate de registrar el Service Worker antes de continuar
    const register = await navigator.serviceWorker.register(
      "/service-worker.js",
      { scope: "/Ejercicio PWA/" }
    );
    console.log("Service Worker registrado con éxito:", register.scope);

    // Espera a que el Service Worker esté listo
    const serviceWorker = await navigator.serviceWorker.ready;

    // Genera la suscripción al Push Manager
    const subscription = await serviceWorker.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    // Envía la suscripción al backend
    await fetch("https://backend-pwa-3o91.onrender.com/subscription", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Suscripción exitosa:", subscription);
  } catch (error) {
    console.error("Error durante la suscripción:", error);
  }
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // Limpia los Service Workers existentes si es necesario
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log("Service Worker desregistrado:", registration);
      }

      // Realiza la suscripción después de limpiar
      await subscription();
    } catch (error) {
      console.error("Error al gestionar los Service Workers:", error);
    }
  });
} else {
  console.log("El navegador no soporta Service Workers.");
}

