// 데이터 관리를 위한 전역 변수
let chartData = {
  labels: [],
  values: [],
};

// 임시 데이터 저장소 (표 편집용)
let tempTableData = {
  labels: [],
  values: [],
};

// Chart.js 인스턴스 생성
const ctx = document.getElementById("myChart").getContext("2d");
const myChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: chartData.labels,
    datasets: [
      {
        label: "데이터 값",
        data: chartData.values,
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

// 차트 업데이트 함수
function updateChart() {
  myChart.data.labels = chartData.labels;
  myChart.data.datasets[0].data = chartData.values;
  myChart.update();
  updateTable();
  updateJsonView();
}

// 테이블 업데이트 함수
function updateTable() {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  tempTableData.labels.forEach((label, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="text" class="label-input" value="${
        label || ""
      }" data-index="${index}"></td>
      <td><input type="number" class="value-input" value="${
        tempTableData.values[index] || 0
      }" data-index="${index}"></td>
      <td>
        <button class="action-btn delete" onclick="removeRow(${index})">삭제</button>
      </td>
    `;
  });
}

// JSON 뷰 업데이트 함수
function updateJsonView() {
  const jsonData = {
    labels: chartData.labels,
    values: chartData.values,
  };
  document.getElementById("json-editor").value = JSON.stringify(
    jsonData,
    null,
    2
  );
}

// 새 행 추가 함수
function addNewRow() {
  tempTableData.labels.push("");
  tempTableData.values.push(0);
  updateTable();
}

// 행 삭제 함수
function removeRow(index) {
  tempTableData.labels.splice(index, 1);
  tempTableData.values.splice(index, 1);
  updateTable();
}

// 변경사항 적용 함수
function applyChanges() {
  // 입력값 유효성 검사
  const labels = document.querySelectorAll(".label-input");
  const values = document.querySelectorAll(".value-input");
  let isValid = true;

  labels.forEach((label, index) => {
    if (!label.value.trim()) {
      alert("ID를 입력해주세요.");
      isValid = false;
      return;
    }
    const value = parseFloat(values[index].value);
    if (isNaN(value)) {
      alert("올바른 숫자 값을 입력해주세요.");
      isValid = false;
      return;
    }
  });

  if (!isValid) return;

  // 변경사항 적용
  chartData.labels = Array.from(labels).map((input) => input.value.trim());
  chartData.values = Array.from(values).map((input) => parseFloat(input.value));

  // 표 데이터도 함께 업데이트
  tempTableData = {
    labels: [...chartData.labels],
    values: [...chartData.values],
  };

  updateChart();
}

// 초기화 함수
function initializeEventListeners() {
  // 새 행 추가 버튼 이벤트 리스너
  const addRowBtn = document.getElementById("add-row");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", addNewRow);
  }

  // 변경사항 등록 버튼 이벤트 리스너
  const applyBtn = document.getElementById("apply-changes");
  if (applyBtn) {
    applyBtn.addEventListener("click", applyChanges);
  }

  // 데이터 추가 버튼 이벤트 리스너 (기존 탭)
  const addDataBtn = document.getElementById("add-data");
  if (addDataBtn) {
    addDataBtn.addEventListener("click", () => {
      const id = document.getElementById("data-id").value;
      const value = parseFloat(document.getElementById("data-value").value);

      if (id && !isNaN(value)) {
        chartData.labels.push(id);
        chartData.values.push(value);
        // 표 데이터도 함께 업데이트
        tempTableData.labels.push(id);
        tempTableData.values.push(value);
        updateChart();
        updateTable();

        document.getElementById("data-id").value = "";
        document.getElementById("data-value").value = "";
      } else {
        alert("올바른 ID와 숫자 값을 입력해주세요.");
      }
    });
  }

  // JSON 에디터 이벤트 리스너
  const jsonEditor = document.getElementById("json-editor");
  if (jsonEditor) {
    jsonEditor.addEventListener("change", (e) => {
      try {
        const newData = JSON.parse(e.target.value);
        if (
          Array.isArray(newData.labels) &&
          Array.isArray(newData.values) &&
          newData.labels.length === newData.values.length
        ) {
          chartData = newData;
          // 표 데이터도 함께 업데이트
          tempTableData = {
            labels: [...newData.labels],
            values: [...newData.values],
          };
          updateChart();
          updateTable();
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        alert("올바른 JSON 형식이 아닙니다.");
        updateJsonView();
      }
    });
  }

  // 탭 전환 이벤트 리스너
  document.querySelectorAll('input[name="tab"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const targetId = e.target.value;

      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.add("hidden");
      });

      document.getElementById(targetId).classList.remove("hidden");
    });
  });
}

// 차트 크기 조절 이벤트 리스너
window.addEventListener("resize", () => {
  myChart.resize();
});

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  // 초기 tempTableData 설정
  tempTableData = {
    labels: [...chartData.labels],
    values: [...chartData.values],
  };
  initializeEventListeners();
  updateChart();
  updateTable();
});
