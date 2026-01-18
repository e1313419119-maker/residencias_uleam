// Utilidad para obtener todas las solicitudes de la clave correcta
function getSolicitudes() {
    try { 
        return JSON.parse(localStorage.getItem('solicitudesResidencia')) || []; 
    } catch { 
        return []; 
    }
}

function generarReporte() {
    const contenedor = document.getElementById("resumen");
    contenedor.innerHTML = "";
    
    // Usamos la utilidad para obtener todas las solicitudes
    const solicitudes = getSolicitudes();

    if (!solicitudes.length) {
        contenedor.innerHTML = "<p>No existen solicitudes registradas.</p>";
        return;
    }

    const total = solicitudes.length;
    // Contamos los estados filtrando el array
    const pendientes = solicitudes.filter(s => s.estado === "Pendiente").length;
    const aprobadas = solicitudes.filter(s => s.estado === "Aprobada").length;
    const rechazadas = solicitudes.filter(s => s.estado === "Rechazada").length;

    contenedor.innerHTML = `
        <div class="card-reporte total">Total de solicitudes: ${total}</div>
        <div class="card-reporte pendiente">Pendientes: ${pendientes}</div>
        <div class="card-reporte aprobada">Aprobadas: ${aprobadas}</div>
        <div class="card-reporte rechazada">Rechazadas: ${rechazadas}</div>
    `;
}

function volverPanel() {
    window.location.href = "admin.html";
}

// Inicialización: Generar el reporte al cargar la página
window.onload = function() {
    generarReporte();
};