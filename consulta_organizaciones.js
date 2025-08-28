const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://ozwsmzemlfznaxanlldg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3NtemVtbGZ6bmF4YW5sbGRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDY1OTcyMiwiZXhwIjoyMDYwMjM1NzIyfQ.N8J1CD3OBPHmsqcLVSJjw-OtElOeC_SESs6o-Gn424o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarOrganizacionesTools() {
  try {
    const { data, error } = await supabase
      .from('organization')
      .select(`
        name,
        tools!inner(id)
      `);

    if (error) {
      console.error('Error en la consulta:', error);
      return;
    }

    // Procesar los datos para contar las herramientas por organización
    const resultado = {};
    
    data.forEach(org => {
      if (!resultado[org.name]) {
        resultado[org.name] = 0;
      }
      resultado[org.name] += org.tools.length;
    });

    // También obtener organizaciones sin herramientas
    const { data: allOrgs, error: allOrgsError } = await supabase
      .from('organization')
      .select('name');

    if (allOrgsError) {
      console.error('Error obteniendo todas las organizaciones:', allOrgsError);
      return;
    }

    // Asegurar que todas las organizaciones estén incluidas
    allOrgs.forEach(org => {
      if (!resultado[org.name]) {
        resultado[org.name] = 0;
      }
    });

    // Convertir a array y ordenar
    const resultadoOrdenado = Object.entries(resultado)
      .map(([nombre, cantidad]) => ({ organizacion: nombre, cantidad_tools: cantidad }))
      .sort((a, b) => b.cantidad_tools - a.cantidad_tools || a.organizacion.localeCompare(b.organizacion));

    console.log('\n=== RESULTADOS: ORGANIZACIONES Y CANTIDAD DE HERRAMIENTAS ===\n');
    console.table(resultadoOrdenado);
    
    console.log('\nResumen:');
    console.log(`Total de organizaciones: ${resultadoOrdenado.length}`);
    console.log(`Total de herramientas: ${resultadoOrdenado.reduce((sum, org) => sum + org.cantidad_tools, 0)}`);
    
  } catch (error) {
    console.error('Error ejecutando la consulta:', error);
  }
}

consultarOrganizacionesTools();