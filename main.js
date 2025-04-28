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
  items: [], // [{id: string, value: number}] 배열 형태
};

// UI 업데이트 함수들
function updateChart() {
  myChart.data.labels = chartData.items.map((item) => item.id);
  myChart.data.datasets[0].data = chartData.items.map((item) => item.value);
  myChart.update();
  updateTable();
  updateJsonView();
}

function updateTable() {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  chartData.items.forEach((item, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="text" class="label-input" value="${
        item.id || ""
      }" data-index="${index}"></td>
      <td><input type="number" class="value-input" value="${
        item.value || 0
      }" data-index="${index}"></td>
      <td>
        <button class="action-btn delete" onclick="removeRow(${index})">삭제</button>
      </td>
    `;
  });
}

function updateJsonView() {
  const jsonStr = JSON.stringify(chartData.items, null, 2);
  const editor = document.getElementById("json-editor");
  if (chartData.items.length === 0) {
    editor.value = ""; // 데이터가 없을 때는 빈 값으로
  } else {
    editor.value = jsonStr;
  }
}

// 데이터 조작 함수들
function addData(id, value) {
  if (id && !isNaN(value)) {
    chartData.items.push({ id, value });
    updateChart();
    return true;
  }
  return false;
}

function removeRow(index) {
  chartData.items.splice(index, 1);
  updateChart();
}

function addNewRow() {
  chartData.items.push({ id: "", value: 0 });
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
      chartData.items = Array.from(labels).map((input, index) => ({
        id: input.value.trim(),
        value: parseFloat(values[index].value),
      }));
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
        Array.isArray(newData) &&
        newData.every(
          (item) =>
            typeof item === "object" &&
            "id" in item &&
            "value" in item &&
            typeof item.id === "string" &&
            !isNaN(parseFloat(item.value))
        )
      ) {
        chartData.items = newData;
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
