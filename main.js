// 데이터 관리를 위한 전역 변수
let chartData = {
  id: [],
  value: [],
};

// 차트 인스턴스 생성
const ctx = document.getElementById("myChart").getContext("2d");
const myChart = new Chart(ctx, {
  type: "bar",
  data: {
    id: chartData.id,
    datasets: [
      {
        label: "데이터 값",
        data: chartData.value,
        backgroundColor: "rgba(168, 255, 169, 0.48)",
        borderColor: "rgb(134, 245, 127)",
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
  myChart.data.id = chartData.id;
  myChart.data.datasets[0].data = chartData.value;
  myChart.update();
  updateTable();
  updateJsonView();
}

// 테이블 업데이트 함수
function updateTable() {
  const table = document.getElementById("data-table");
  table.innerHTML = `
    <tr>
      <th>ID</th>
      <th>값</th>
      <th>편집</th>
    </tr>
  `;

  chartData.id.forEach((label, index) => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${label}</td>
      <td>${chartData.value[index]}</td>
      <td>
        <button onclick="deleteData(${index})">삭제</button>
        <button onclick="editData(${index})">수정</button>
      </td>
    `;
  });
}

// JSON 뷰 업데이트 함수
function updateJsonView() {
  const jsonData = {
    id: chartData.id,
    value: chartData.value,
  };
  document.getElementById("json-editor").value = JSON.stringify(
    jsonData,
    null,
    2
  );
}

// 데이터 추가 기능
document.getElementById("add-data").addEventListener("click", () => {
  const id = document.getElementById("data-id").value;
  const value = parseFloat(document.getElementById("data-value").value);

  if (id && !isNaN(value)) {
    chartData.id.push(id);
    chartData.value.push(value);
    updateChart();

    document.getElementById("data-id").value = "";
    document.getElementById("data-value").value = "";
  } else {
    alert("올바른 ID와 숫자 값을 입력해주세요.");
  }
});

// 데이터 삭제 함수
function deleteData(index) {
  chartData.id.splice(index, 1);
  chartData.value.splice(index, 1);
  updateChart();
}

// 데이터 수정 함수
function editData(index) {
  const newValue = prompt("새로운 값을 입력하세요:", chartData.value[index]);
  if (newValue !== null) {
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      chartData.value[index] = parsedValue;
      updateChart();
    } else {
      alert("올바른 숫자 값을 입력해주세요.");
    }
  }
}

// JSON 에디터 이벤트 리스너
document.getElementById("json-editor").addEventListener("change", (e) => {
  try {
    const newData = JSON.parse(e.target.value);
    if (
      Array.isArray(newData.id) &&
      Array.isArray(newData.value) &&
      newData.id.length === newData.value.length
    ) {
      chartData = newData;
      updateChart();
    } else {
      throw new Error("유효하지 않은 데이터 형식입니다");
    }
  } catch (error) {
    alert("올바른 JSON 형식이 아닙니다.");
    updateJsonView();
  }
});

// 탭 전환 이벤트 리스너
document.querySelectorAll('input[name="tab"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const targetId = e.target.value;

    // 모든 패널 숨기기
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.add("hidden");
    });

    // 선택된 패널 보이기
    document.getElementById(targetId).classList.remove("hidden");
  });
});

// 차트 크기 조절 이벤트 리스너
window.addEventListener("resize", () => {
  myChart.resize();
});

// 초기 차트 업데이트
updateChart();
