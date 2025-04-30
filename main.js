import createChartManager from "./js/chartManager.js";
import createDataManager from "./js/dataManager.js";

const createApp = () => {
  const chartManager = createChartManager();
  const dataManager = createDataManager();

  const updateUI = () => {
    chartManager.updateChart(dataManager.getItems());
    updateTable();
    updateJsonView();
  };

  const updateTable = () => {
    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";

    dataManager.getItems().forEach((item, index) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td><input type="text" class="label-input" value="${
          item.id || ""
        }" data-index="${index}"></td>
        <td><input type="number" class="value-input" value="${
          item.value || 0
        }" data-index="${index}"></td>
        <td>
          <button class="action-btn delete" onclick="app.removeRow(${index})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
    });
  };

  const updateJsonView = () => {
    const jsonStr = JSON.stringify(dataManager.getItems(), null, 2);
    const editor = document.getElementById("json-editor");
    editor.value = dataManager.getItems().length === 0 ? "" : jsonStr;
  };

  const addData = () => {
    const id = document.getElementById("data-id").value;
    const value = parseFloat(document.getElementById("data-value").value);

    if (dataManager.addItem(id, value, chartManager.getNextColor())) {
      document.getElementById("data-id").value = "";
      document.getElementById("data-value").value = "";
      updateUI();
    } else {
      alert("올바른 ID와 숫자 값을 입력해주세요.");
    }
  };

  const removeRow = (index) => {
    dataManager.removeItem(index);
    updateUI();
  };

  const addNewRow = () => {
    dataManager.addEmptyItem(chartManager.getNextColor());
    updateUI();
  };

  const applyTableChanges = () => {
    const labels = document.querySelectorAll(".label-input");
    const values = document.querySelectorAll(".value-input");

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
      const newItems = Array.from(labels).map((input, index) => ({
        id: input.value.trim(),
        value: parseFloat(values[index].value),
      }));
      dataManager.updateItems(newItems);
      updateUI();
    }
  };

  const handleJsonEdit = (jsonStr) => {
    try {
      const newData = JSON.parse(jsonStr);
      if (dataManager.validateJsonData(newData)) {
        dataManager.updateItems(
          newData.map((item) => ({
            ...item,
            color: chartManager.getNextColor(),
          }))
        );
        updateUI();
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      alert("올바른 JSON 형식이 아닙니다.");
      updateJsonView();
    }
  };

  const initializeEventListeners = () => {
    document.getElementById("add-data").addEventListener("click", addData);
    document
      .getElementById("apply-changes")
      .addEventListener("click", applyTableChanges);
    document.getElementById("add-row").addEventListener("click", addNewRow);
    document
      .getElementById("json-editor")
      .addEventListener("change", (e) => handleJsonEdit(e.target.value));

    document.querySelectorAll('input[name="tab"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        document.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.add("hidden");
        });
        document.getElementById(e.target.value).classList.remove("hidden");
      });
    });

    window.addEventListener("resize", chartManager.resize);
  };

  // 초기화
  initializeEventListeners();
  updateUI();

  return {
    removeRow,
    addData,
    addNewRow,
    applyTableChanges,
    handleJsonEdit,
  };
};

// 전역 변수 -> app 인스턴스 생성 (removeRow 함수 접근)
window.app = createApp();
