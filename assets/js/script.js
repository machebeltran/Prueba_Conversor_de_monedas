document.getElementById("buscar").addEventListener("click", async () => {
    const monto = document.getElementById("monto").value;
    const moneda = document.getElementById("moneda").value;

    if (!monto || monto <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    try {
        const response = await fetch("https://mindicador.cl/api");
        if (!response.ok) throw new Error("Error al obtener los datos de la API");
        
        const data = await response.json();
        let tasaCambio;

        switch (moneda) {
            case "dolar":
                tasaCambio = data.dolar.valor;
                break;
            case "euro":
                tasaCambio = data.euro.valor;
                break;
            case "uf":
                tasaCambio = data.uf.valor;
                break;
            default:
                throw new Error("Moneda no válida seleccionada");
        }

        // Realizar la conversión
        const resultado = (monto / tasaCambio).toFixed(2);
        document.getElementById("resultado").innerText = 
            `El resultado es: ${resultado} ${moneda.toUpperCase()}`;

        // Obtener datos históricos
        const respuestaHistorica = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!respuestaHistorica.ok) throw new Error("Error al obtener datos históricos");

        const datosHistoricos = await respuestaHistorica.json();
        const ultimos10Dias = datosHistoricos.serie.slice(0, 10);

        // Configurar datos para el gráfico
        const etiquetas = ultimos10Dias.map(item => new Date(item.fecha).toLocaleDateString());
        const valores = ultimos10Dias.map(item => item.valor);

        // Mostrar el contenedor del gráfico
        document.getElementById("contenedor-grafico").style.display = "block";

        renderizarGrafico(etiquetas, valores, moneda.toUpperCase());
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al realizar la conversión o al cargar el gráfico.");
    }
});

// Función para renderizar el gráfico con Chart.js
function renderizarGrafico(etiquetas, valores, moneda) {
    const ctx = document.getElementById("grafico").getContext("2d");
    if (window.miGrafico) {
        window.miGrafico.destroy(); // Destruir el gráfico existente si ya hay uno
    }
    window.miGrafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: etiquetas.reverse(),
            datasets: [{
                label: `Historial últimos 10 días (${moneda})`,
                data: valores.reverse(),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
