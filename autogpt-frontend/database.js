document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/getData')
        .then(response => response.json())
        .then(data => {
            const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
            data.forEach(item => {
                const row = dataTable.insertRow();
                row.innerHTML = `
                    <td>${item.model || 'N/A'}</td>
                    <td>${item.year || 'N/A'}</td>
                    <td>${item.transmission || 'N/A'}</td>
                    <td>${item.obdCode || 'N/A'}</td>
                    <td>${item.obdDescription || 'N/A'}</td>
                    <td><button class="view-button" data-id="${item._id}">Ver</button></td>
                `;

                // Añadir evento para el botón de ver
                row.querySelector('.view-button').addEventListener('click', () => {
                    showModal(item);
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Función para mostrar el modal con los detalles del registro
    const showModal = (item) => {
        const modal = document.getElementById('dataModal');
        const detailsDiv = document.getElementById('dataDetails');
        detailsDiv.innerHTML = `
            <h3>Detalles del Registro</h3>
            <p><strong>Modelo del Auto:</strong> ${item.model || 'N/A'}</p>
            <p><strong>Año:</strong> ${item.year || 'N/A'}</p>
            <p><strong>Transmisión:</strong> ${item.transmission || 'N/A'}</p>
            <p><strong>Código OBD:</strong> ${item.obdCode || 'N/A'}</p>
            <p><strong>Descripción OBD:</strong> ${item.obdDescription || 'N/A'}</p>
            <p><strong>Detecciones:</strong> ${JSON.stringify(item.detectedParts) || 'N/A'}</p>
            <p><strong>Imagen:</strong></p>
            <img src="${item.image}" alt="Imagen del Auto" style="max-width: 100%;">
        `;
        modal.classList.remove('hidden');
        modal.style.display = 'block';

        // Añadir evento para el botón de generar reporte
        document.getElementById('generateReportButton').addEventListener('click', () => {
            generateReport(item);
        });

        // Cerrar el modal
        modal.querySelector('.close-button').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Cerrar el modal si se hace clic fuera del contenido del modal
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    };

    // Función para generar el reporte
    const generateReport = (item) => {
        document.getElementById('reportSection').classList.add('hidden');
        document.getElementById('reportContent').innerText = "Generando reporte..."; // Mensaje de generación de reporte
        axios.post('http://localhost:3000/generateReport', item)
            .then(response => {
                const report = response.data.report;
                document.getElementById('reportContent').innerText = report;
                document.getElementById('reportSection').classList.remove('hidden');

                // Añadir evento para el botón de descargar PDF
                document.getElementById('downloadPdfButton').addEventListener('click', () => {
                    downloadPdf(report);
                });
            })
            .catch(error => {
                console.error('Error al generar el reporte:', error);
                document.getElementById('reportContent').innerText = "Error al generar el reporte.";
            });
    };

    // Función para descargar el reporte como PDF
    const downloadPdf = (report) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Reporte Generado", 10, 10);
        doc.text(report, 10, 20);
        doc.save("reporte.pdf");
    };
});
