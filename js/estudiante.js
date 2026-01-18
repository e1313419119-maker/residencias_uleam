(function(){
  // Elementos del formulario y errores
  const form = document.getElementById('formSolicitud');
  const nombre = document.getElementById('nombre');
  const cedula = document.getElementById('cedula');
  const carrera = document.getElementById('carrera');
  const motivo = document.getElementById('motivo');

  const errNombre = document.getElementById('errNombre');
  const errCedula = document.getElementById('errCedula');
  const errCarrera = document.getElementById('errCarrera');
  const errMotivo = document.getElementById('errMotivo');

  const estadoCard = document.getElementById('estadoCard');

  // =================================================================
  // 💥 NUEVA LÓGICA DE PERSISTENCIA (FIREBASE) 💥
  // =================================================================

  // Nota: Estas funciones ahora son ASÍNCRONAS (devuelven Promesas)

  // Función para obtener la ÚLTIMA solicitud del estudiante
  async function getUltimaSolicitud(cedulaEstudiante) {
      try {
          const snapshot = await db.collection('solicitudes')
              .where('cedula', '==', cedulaEstudiante)
              .orderBy('fecha', 'desc')
              .limit(1)
              .get();
          
          if (snapshot.empty) {
              return null; // No hay solicitudes
          }
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() }; // Retorna la data y el ID de Firestore
      } catch (error) {
          console.error("Error al obtener solicitud de Firebase:", error);
          return null;
      }
  }

  // Función para guardar una nueva solicitud
  async function guardarSolicitud(data) {
      try {
          // Utiliza 'add' para crear un nuevo documento con un ID automático
          const docRef = await db.collection('solicitudes').add(data);
          return docRef.id;
      } catch (error) {
          console.error("Error al guardar solicitud en Firebase:", error);
          alert("Error al enviar la solicitud. Intenta de nuevo.");
          return null;
      }
  }

  // =================================================================
  // LÓGICA DE UI
  // =================================================================

  async function pintarEstado(){
      // Asume que la cédula del estudiante está guardada en LocalStorage al loguearse
      const cedulaEstudiante = localStorage.getItem('sesionCedula') || '0'; 

      const ultima = await getUltimaSolicitud(cedulaEstudiante); 
      
      if(!ultima){ 
          estadoCard.innerHTML = '<p>No tienes solicitudes aún. ¡Envía una!</p>'; 
          return; 
      }
      
      estadoCard.innerHTML = `
          <p><strong>Nombre:</strong> ${ultima.nombre}</p>
          <p><strong>Carrera:</strong> ${ultima.carrera}</p>
          <p><strong>Estado:</strong> <span class="etiqueta-estado ${ultima.estado.toLowerCase()}">${ultima.estado}</span></p>
          <p><strong>Fecha:</strong> ${new Date(ultima.fecha).toLocaleDateString()}</p>
          <p><strong>Motivo:</strong> ${ultima.motivo.substring(0, 50)}...</p>
      `;
  }
  
  function setError(input, errNode, msg){
    input.classList.add('is-invalid');
    errNode.textContent = msg;
  }
  function clearError(input, errNode){
    input.classList.remove('is-invalid');
    errNode.classList.remove('is-invalid'); 
    errNode.textContent = '';
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    let ok = true;

    // ... (Mantener la validación del formulario) ...

    if(!nombre.value.trim()){ setError(nombre, errNombre,'El nombre es obligatorio.'); ok=false; }
    else if(nombre.value.trim().length < 3){ setError(nombre, errNombre,'Mínimo 3 caracteres.'); ok=false; }
    else { clearError(nombre, errNombre); }

    const ced = cedula.value.trim();
    if(!ced){ setError(cedula, errCedula,'La cédula es obligatoria.'); ok=false; }
    else if(!/^\d{10}$/.test(ced)){ setError(cedula, errCedula,'Debe tener 10 dígitos.'); ok=false; }
    else { clearError(cedula, errCedula); }

    if(!carrera.value.trim()){ setError(carrera, errCarrera,'La carrera es obligatoria.'); ok=false; }
    else { clearError(carrera, errCarrera); }

    if(!motivo.value.trim()){ setError(motivo, errMotivo,'El motivo es obligatorio.'); ok=false; }
    else if(motivo.value.trim().length < 10){ setError(motivo, errMotivo,'Mínimo 10 caracteres.'); ok=false; }
    else { clearError(motivo, errMotivo); }

    if(!ok) return;

    // --- Lógica de guardado en Firebase ---
    
    // Crear el objeto de la solicitud
    const nuevaSolicitud = {
        nombre: nombre.value.trim(),
        cedula: ced,
        carrera: carrera.value.trim(),
        motivo: motivo.value.trim(),
        estado: 'Pendiente', // Estado inicial
        fecha: Date.now() // Timestamp
    };

    // La función guardarSolicitud es ASÍNCRONA, usamos await
    const newId = await guardarSolicitud(nuevaSolicitud);
    
    if(newId){
        alert('✅ Solicitud enviada con éxito. ID: ' + newId);
        form.reset();
        pintarEstado(); // Actualiza el estado de la UI
    }
  });

  // Inicialización: Llama a pintarEstado al cargar la página
  window.addEventListener('load', ()=>{
      // NOTA: Para que esto funcione, ¡DEBEMOS GUARDAR LA CÉDULA AL HACER LOGIN!
      pintarEstado(); 
  });
})();