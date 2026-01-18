(function () {
    // ====================================================================
    // 1. SELECTORES DEL DOM
    // ====================================================================
    const lista = document.getElementById('listaSolicitudes');
    const buscador = document.getElementById('buscadorAprobados');
    const listaAprobados = document.getElementById('listaAprobados');

    // Botones de Exportación / Reportes
    const btnReporteGeneral = document.getElementById('btnReporteGeneral');
    const btnReporteAprobados = document.getElementById('btnReporteAprobados');
    const btnExportJson = document.getElementById('btnExportJson');
    const btnExportXml = document.getElementById('btnExportXml');

    // Gestión de Almacenamiento e Importación
    const btnAnalizarStorage = document.getElementById('btnAnalizarStorage');
    const btnLimpiarTodo = document.getElementById('btnLimpiarTodo');
    const infoSoporte = document.getElementById('infoSoporte');
    const inputImportar = document.getElementById('inputImportar');

    // Logout
    const modalLogout = document.getElementById('modalLogout');
    const btnLogout = document.getElementById('btnLogout');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    // ====================================================================
    // 2. UTILIDADES DE DATOS
    // ====================================================================
    const getSolicitudes = () => JSON.parse(localStorage.getItem('solicitudesResidencia')) || [];
    const setSolicitudes = (datos) => localStorage.setItem('solicitudesResidencia', JSON.stringify(datos));

    function descargarArchivo(contenido, nombre, tipo) {
        const blob = new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ====================================================================
    // 3. LÓGICA DE DIAGNÓSTICO Y ALMACENAMIENTO
    // ====================================================================
    function ejecutarDiagnostico() {
        const datosRaw = localStorage.getItem('solicitudesResidencia') || "[]";
        const solicitudes = JSON.parse(datosRaw);
        
        // Cálculos
        const total = solicitudes.length;
        const pesoBytes = new Blob([datosRaw]).size;
        const pesoKB = (pesoBytes / 1024).toFixed(2);
        const fechaActual = new Date().toLocaleString();

        // Actualizar Interfaz con las clases de estilos.css
        if (infoSoporte) {
            infoSoporte.innerHTML = `
                <div class="stat-diag">
                    <p><strong>📅 Último Análisis</strong> ${fechaActual}</p>
                    <p><strong>📊 Registros Activos</strong> ${total} solicitudes</p>
                    <p><strong>💾 Peso en Memoria</strong> ${pesoKB} KB</p>
                </div>
            `;
        }

        // Guardar log interno
        const logs = JSON.parse(localStorage.getItem('logs_admin')) || [];
        logs.unshift({ fecha: fechaActual, registros: total, peso: pesoKB + " KB" });
        if(logs.length > 5) logs.pop();
        localStorage.setItem('logs_admin', JSON.stringify(logs));
    }

    function importarBackup(e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function(event) {
            try {
                const datosImportados = JSON.parse(event.target.result);
                
                // Validación básica
                if (Array.isArray(datosImportados)) {
                    if (confirm(`⚠️ Se han encontrado ${datosImportados.length} registros.\nEsto reemplazará todos los datos actuales. ¿Deseas continuar?`)) {
                        setSolicitudes(datosImportados);
                        alert("✅ Importación exitosa.");
                        location.reload(); // Recargar para actualizar todo
                    }
                } else {
                    alert("❌ El archivo no tiene un formato de base de datos válido.");
                }
            } catch (err) {
                alert("❌ Error al procesar el archivo JSON.");
            }
        };
        lector.readAsText(archivo);
    }

    // ====================================================================
    // 4. FUNCIONES DE RENDERIZADO (TABLAS Y SIDEBAR)
    // ====================================================================
    function renderTabla() {
        const solicitudes = getSolicitudes().sort((a, b) => b.fecha - a.fecha);
        if (!lista) return;

        if (solicitudes.length === 0) {
            lista.innerHTML = `<p style="text-align:center; padding:20px;">No hay solicitudes pendientes.</p>`;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Cédula</th>
                        <th>Carrera</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
        `;

        solicitudes.forEach(s => {
            html += `
                <tr>
                    <td><strong>${s.nombre}</strong></td>
                    <td>${s.cedula}</td>
                    <td>${s.carrera}</td>
                    <td><span class="etiqueta-estado ${s.estado.toLowerCase()}">${s.estado}</span></td>
                    <td>
                        <div class="acciones-left">
                            <button class="btn-primary" onclick="cambiarEstado(${s.id}, 'Aprobada')" title="Aprobar">✔</button>
                            <button class="btn-secondary" style="background:#e74c3c" onclick="cambiarEstado(${s.id}, 'Rechazada')" title="Rechazar">✖</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        lista.innerHTML = html;
    }

    function renderSidebar(filtro = '') {
        const aprobados = getSolicitudes().filter(s => 
            s.estado === 'Aprobada' && 
            (s.nombre.toLowerCase().includes(filtro.toLowerCase()) || s.cedula.includes(filtro))
        );

        if (!listaAprobados) return;

        listaAprobados.innerHTML = aprobados.map(s => `
            <div class="item-mini">
                <div>
                    <h4>${s.nombre}</h4>
                    <p>${s.carrera}</p>
                </div>
                <button class="btn-primary" onclick="alert('Generando PDF individual para ${s.cedula}...')">📄</button>
            </div>
        `).join('') || '<p style="font-size:12px; opacity:0.6;">No hay coincidencias.</p>';
    }

    function actualizarContadores() {
        const datos = getSolicitudes();
        document.getElementById('totalCount').textContent = datos.length;
        document.getElementById('pendCount').textContent = datos.filter(x => x.estado === 'Pendiente').length;
        document.getElementById('aprobCount').textContent = datos.filter(x => x.estado === 'Aprobada').length;
        document.getElementById('rechCount').textContent = datos.filter(x => x.estado === 'Rechazada').length;
    }

    // Global para los botones de la tabla
    window.cambiarEstado = (id, nuevoEstado) => {
        const datos = getSolicitudes();
        const index = datos.findIndex(x => x.id === id);
        if (index !== -1) {
            datos[index].estado = nuevoEstado;
            setSolicitudes(datos);
            init();
        }
    };

    // ====================================================================
    // 5. EVENT LISTENERS
    // ====================================================================
    
    // Diagnóstico e Importación
    btnAnalizarStorage?.addEventListener('click', ejecutarDiagnostico);
    inputImportar?.addEventListener('change', importarBackup);
    
    btnLimpiarTodo?.addEventListener('click', () => {
        if (confirm("⚠️ ¿ESTÁS SEGURO? Se borrarán todas las solicitudes y no se puede deshacer.")) {
            localStorage.removeItem('solicitudesResidencia');
            location.reload();
        }
    });

    // Exportaciones
    btnExportJson?.addEventListener('click', () => {
        const data = JSON.stringify(getSolicitudes(), null, 2);
        descargarArchivo(data, `backup_residencias_${Date.now()}.json`, 'application/json');
    });

    // Buscador Sidebar
    buscador?.addEventListener('input', (e) => renderSidebar(e.target.value));

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Logout
    btnLogout?.addEventListener('click', () => modalLogout.classList.add('active'));
    cancelLogout?.addEventListener('click', () => modalLogout.classList.remove('active'));
    confirmLogout?.addEventListener('click', () => {
        localStorage.removeItem('sesionRol');
        location.href = 'index.html';
    });

    // ====================================================================
    // 6. INICIALIZACIÓN
    // ====================================================================
    function init() {
        renderTabla();
        renderSidebar();
        actualizarContadores();
    }

    window.onload = init;

})();