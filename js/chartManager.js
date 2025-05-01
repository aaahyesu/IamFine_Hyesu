// 다크모드용 보라색 계열
const PURPLE_SHADES = [
  "#B388FF", // 밝은 보라
  "#7C4DFF", // 선명한 보라
  "#651FFF", // 딥 보라
  "#6200EA", // 진한 보라
  "#9575CD", // 부드러운 보라
  "#5E35B1", // 중간 보라
  "#4527A0", // 깊은 보라
  "#8559DA", // 라벤더
];

const createChartManager = () => {
  let currentColorIndex = 0;
  const ctx = document.getElementById("myChart").getContext("2d");

  // 배경 초기화
  ctx.canvas.style.backgroundColor = "#0f0c17";

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "데이터 값",
          data: [],
          backgroundColor: [],
          borderWidth: 1,
          borderColor: "#1a1625",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            color: "#E0E0E0",
            usePointStyle: false,
            boxWidth: 15,
            boxHeight: 15,
            padding: 15,
            font: {
              size: 14,
              weight: "500",
            },
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => ({
                  text: label,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                  fontColor: "#E0E0E0",
                }));
              }
              return [];
            },
          },
        },
        tooltip: {
          backgroundColor: "#1a1625",
          titleColor: "#E0E0E0",
          bodyColor: "#E0E0E0",
          titleFont: {
            size: 14,
            weight: "600",
          },
          bodyFont: {
            size: 14,
          },
          padding: 12,
          displayColors: true,
          borderColor: "transparent",
          borderWidth: 0,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          border: {
            color: "#1a1625",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
            drawBorder: true,
          },
          ticks: {
            color: "#E0E0E0",
            font: {
              size: 13,
              weight: "500",
            },
            padding: 8,
          },
        },
        x: {
          border: {
            color: "#1a1625",
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#E0E0E0",
            font: {
              size: 16,
              weight: "500",
            },
            padding: 8,
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeInOutQuart",
      },
    },
  });

  // 빈 상태일 때 표시할 기본 데이터
  const showEmptyState = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(179, 136, 255, 0.08)");
    gradient.addColorStop(1, "rgba(179, 136, 255, 0)");

    chart.data = {
      labels: ["데이터를 추가해주세요"],
      datasets: [
        {
          label: "입력 값",
          data: [100],
          backgroundColor: gradient,
          borderWidth: 0,
        },
      ],
    };
    chart.options.plugins.legend.display = false;
    chart.update();
  };

  const getNextColor = () => {
    const color = PURPLE_SHADES[currentColorIndex];
    currentColorIndex = (currentColorIndex + 1) % PURPLE_SHADES.length;
    return color;
  };

  const updateChart = (items) => {
    if (!items || items.length === 0) {
      showEmptyState();
      return;
    }

    chart.options.plugins.legend.display = true;
    chart.data.labels = items.map((item) => item.id);
    chart.data.datasets[0].data = items.map((item) => item.value);
    chart.data.datasets[0].backgroundColor = items.map(
      (item) => item.color || getNextColor()
    );
    chart.update();
  };

  // 초기 빈 상태 표시
  showEmptyState();

  const resize = () => {
    chart.resize();
  };

  return {
    getNextColor,
    updateChart,
    resize,
  };
};

export default createChartManager;
