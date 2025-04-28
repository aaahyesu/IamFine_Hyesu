// 차트 관련 설정
const ctx = document.getElementById("myChart").getContext("2d");
const myChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "데이터 값",
        data: [],
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// 데이터 저장소
const chartData = {
  labels: [],
  values: [],
};

// UI 업데이트 함수들
function updateChart() {
  myChart.data.labels = chartData.labels;
  myChart.data.datasets[0].data = chartData.values;
  myChart.update();
  updateTable();
  updateJsonView();
}

function updateTable() {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  chartData.labels.forEach((label, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="text" class="label-input" value="${
        label || ""
      }" data-index="${index}"></td>
      <td><input type="number" class="value-input" value="${
        chartData.values[index] || 0
      }" data-index="${index}"></td>
      <td>
        <button class="action-btn delete" onclick="removeRow(${index})">삭제</button>
      </td>
    `;
  });
}

function updateJsonView() {
  document.getElementById("json-editor").value = JSON.stringify(
    chartData,
    null,
    2
  );
}

// 데이터 조작 함수들
function addData(id, value) {
  if (id && !isNaN(value)) {
    chartData.labels.push(id);
    chartData.values.push(value);
    updateChart();
    return true;
  }
  return false;
}

function removeRow(index) {
  chartData.labels.splice(index, 1);
  chartData.values.splice(index, 1);
  updateChart();
}

function addNewRow() {
  chartData.labels.push("");
  chartData.values.push(0);
  updateChart();
}

// 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
  // 데이터 추가 이벤트
  document.getElementById("add-data").addEventListener("click", () => {
    const id = document.getElementById("data-id").value;
    const value = parseFloat(document.getElementById("data-value").value);

    if (addData(id, value)) {
      document.getElementById("data-id").value = "";
      document.getElementById("data-value").value = "";
    } else {
      alert("올바른 ID와 숫자 값을 입력해주세요.");
    }
  });

  // 테이블 변경사항 적용
  document.getElementById("apply-changes").addEventListener("click", () => {
    const labels = document.querySelectorAll(".label-input");
    const values = document.querySelectorAll(".value-input");

    // 유효성 검사
    let isValid = true;
    labels.forEach((label, index) => {
      if (!label.value.trim()) {
        alert("ID를 입력해주세요.");
        isValid = false;
        return;
      }
      if (isNaN(parseFloat(values[index].value))) {
        alert("올바른 숫자 값을 입력해주세요.");
        isValid = false;
        return;
      }
    });

    if (isValid) {
      chartData.labels = Array.from(labels).map((input) => input.value.trim());
      chartData.values = Array.from(values).map((input) =>
        parseFloat(input.value)
      );
      updateChart();
    }
  });

  // 새 행 추가
  document.getElementById("add-row").addEventListener("click", addNewRow);

  // JSON 편집
  document.getElementById("json-editor").addEventListener("change", (e) => {
    try {
      const newData = JSON.parse(e.target.value);
      if (
        Array.isArray(newData.labels) &&
        Array.isArray(newData.values) &&
        newData.labels.length === newData.values.length
      ) {
        Object.assign(chartData, newData);
        updateChart();
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      alert("올바른 JSON 형식이 아닙니다.");
      updateJsonView();
    }
  });

  // 탭 전환
  document.querySelectorAll('input[name="tab"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.add("hidden");
      });
      document.getElementById(e.target.value).classList.remove("hidden");
    });
  });

  // 초기 차트 업데이트
  updateChart();
});

// 차트 리사이즈
window.addEventListener("resize", () => {
  myChart.resize();
});
