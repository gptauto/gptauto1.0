document.getElementById('detectForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('detectImageInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, seleccione una imagen.');
        return;
    }

    const imageBase64 = await loadImageBase64(file);

    // Mostrar la barra de carga
    document.getElementById('loadingBar').classList.remove('hidden');

    axios({
        method: "POST",
        url: "https://detect.roboflow.com/car-underhood-jijo/4",
        params: {
            api_key: "akko7k0G0um4BmzZFuNA"
        },
        data: imageBase64.split(',')[1], // Enviar solo la parte base64
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(function(response) {
        const detections = response.data.predictions;
        displayDetections(file, detections, imageBase64);

        // Ocultar la barra de carga
        document.getElementById('loadingBar').classList.add('hidden');

        // Guardar la información completa al detectar partes
        document.getElementById('carInfoForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const model = document.getElementById('model').value;
            const year = document.getElementById('year').value;
            const transmission = document.getElementById('transmission').value;
            const obdCode = document.getElementById('obdCode').value;
            const obdDescription = document.getElementById('obdDescription').value;

            // Guardar toda la información
            fetch('http://localhost:3000/saveData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    detectedParts: detections, 
                    model, 
                    year, 
                    transmission, 
                    obdCode, 
                    obdDescription,
                    image: imageBase64 // Añadir la imagen en base64
                })
            })
            .then(response => response.json())
            .then(data => {
                // Mostrar mensaje de guardado exitoso
                document.getElementById('saveMessage').classList.remove('hidden');
                setTimeout(() => {
                    document.getElementById('saveMessage').classList.add('hidden');
                }, 3000); // Ocultar mensaje después de 3 segundos
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });

    })
    .catch(function(error) {
        document.getElementById('loadingBar').classList.add('hidden');
        document.getElementById('detectResponse').innerText = error.message;
    });
});

const loadImageBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

const displayDetections = (file, detections, imageBase64) => {
    const canvas = document.getElementById('detectionCanvas');
    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        detections.forEach(detection => {
            context.beginPath();
            context.rect(detection.x - detection.width / 2, detection.y - detection.height / 2, detection.width, detection.height);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.fillStyle = 'red';
            context.stroke();
            context.fillText(detection.class, detection.x - detection.width / 2, detection.y - detection.height / 2 - 10);
        });
    };
}
