import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const limpiar = (v) => String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

const dataURLImagen = (archivo) => new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
});

async function cargarFotografia(datos) {
    if (datos.foto_nueva) return dataURLImagen(datos.foto_nueva);
    if (!datos.foto_url) return null;
    try {
        const respuesta = await fetch(datos.foto_url);
        if (!respuesta.ok) return null;
        return await dataURLImagen(await respuesta.blob());
    } catch {
        // Si Cloudinary impide CORS, el PDF se genera sin la foto.
        return null;
    }
}

export async function generarPDFDirectores(datos) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const ancho = doc.internal.pageSize.getWidth();
    const margen = 15;
    const lista = (v) => Array.isArray(v) ? v.filter(Boolean) : [];

    doc.setTextColor(105, 28, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('INFORMACIÓN DIRECTIVA HOSPITALARIA', ancho / 2, 20, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('IMSS-BIENESTAR · CIUDAD DE MÉXICO', ancho / 2, 26, { align: 'center' });

    let filaInicial = 34;
    const imagen = await cargarFotografia(datos);
    if (imagen) {
        try {
            const formato = imagen.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            // Se respeta la proporción y se reserva espacio para la fotografía.
            doc.addImage(imagen, formato, ancho - 45, 32, 29, 36, undefined, 'FAST');
            filaInicial = 72;
        } catch (err) {
            console.warn('La imagen no se pudo insertar en el PDF:', err);
            filaInicial = 34;
        }
    }

    autoTable(doc, {
        startY: filaInicial,
        margin: { left: margen, right: margen, top: 20, bottom: 18 },
        theme: 'grid',
        head: [['DATOS GENERALES', 'INFORMACIÓN']],
        body: [
            ['CLUES', datos.clues || ''],
            ['Hospital', datos.nombre_hospital || ''],
            ['Director(a)', datos.nombre_director || ''],
            ['Cargo', datos.cargo || ''],
            ['Correo institucional', datos.correo_institucional || ''],
            ['Teléfono', datos.telefono || 'N/A'],
            ['Extensión', datos.extension || 'N/A']
        ],
        headStyles: { fillColor: [16, 49, 43] },
        bodyStyles: { fontSize: 9, overflow: 'linebreak' },
        columnStyles: { 0: { cellWidth: 48 } }
    });

    const secciones = [
        ['ACCIONES RELEVANTES', lista(datos.acciones_relevantes)],
        ['DATOS RELEVANTES', datos.datos_relevantes ? [datos.datos_relevantes] : []],
        ['COMPROMISOS Y PROYECTOS', lista(datos.compromisos_proyectos)]
    ];
    for (const [titulo, items] of secciones) {
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 7,
            margin: { left: margen, right: margen, top: 20, bottom: 18 },
            theme: 'grid',
            head: [[titulo]],
            body: items.length ? items.map((item, i) => [
                titulo === 'DATOS RELEVANTES' ? String(item) : `${i + 1}. ${item}`
            ]) : [['Sin información registrada']],
            headStyles: { fillColor: [105, 28, 50] },
            bodyStyles: { fontSize: 9, overflow: 'linebreak' }
        });
    }

    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setTextColor(110, 110, 110);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${total}`, ancho - 15, 269, { align: 'right' });
    }
    const nombreArchivo = `${limpiar(datos.clues)}_${limpiar(datos.nombre_hospital)}.pdf`;
    return { archivo: doc.output('blob'), nombreArchivo };
}
