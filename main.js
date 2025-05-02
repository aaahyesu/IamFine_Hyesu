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
        <td><input type="text" value="${item.id}" /></td>
        <td><input type="number" value="${item.value}" /></td>
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

  const validateId = (id) => {
    const idInput = document.getElementById("data-id");
    const errorMessage = idInput.nextElementSibling;

    if (!id) {
      idInput.classList.add("error");
      errorMessage.textContent = "ID를 입력해주세요.";
      return false;
    }

    if (dataManager.isDuplicateId(id)) {
      idInput.classList.add("error");
      errorMessage.textContent = "이미 존재하는 ID입니다.";
      return false;
    }

    idInput.classList.remove("error");
    errorMessage.textContent = "";
    return true;
  };

  const handleAddData = () => {
    const idInput = document.getElementById("data-id");
    const valueInput = document.getElementById("data-value");
    const id = idInput.value.trim();
    const value = parseFloat(valueInput.value);

    if (!validateId(id)) {
      return;
    }

    try {
      dataManager.addItem(id, value);
      updateUI();
      idInput.value = "";
      valueInput.value = "";
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTable = () => {
    const table = document.getElementById("data-table");
    const rows = table.getElementsByTagName("tr");
    const newItems = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      const id = cells[0].getElementsByTagName("input")[0].value.trim();
      const value = parseFloat(cells[1].getElementsByTagName("input")[0].value);

      if (id && !isNaN(value)) {
        newItems.push({ id, value });
      }
    }

    try {
      dataManager.setItems(newItems);
      updateUI();
    } catch (error) {
      alert(error.message);
    }
  };

  const removeRow = (index) => {
    try {
      dataManager.deleteItem(index);
      updateUI();
    } catch (error) {
      console.error(error);
    }
  };

  const addNewRow = () => {
    try {
      // 기존 ID 중에서 가장 큰 숫자를 찾아서 +1
      const existingIds = dataManager.getItems().map((item) => {
        const match = item.id.match(/^(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });

      const maxId = Math.max(0, ...existingIds);
      const newId = (maxId + 1).toString();

      dataManager.addItem(newId, 0);
      updateUI();
    } catch (error) {
      console.error(error);
    }
  };

  const applyTableChanges = () => {
    const table = document.getElementById("data-table");
    const rows = table.getElementsByTagName("tr");
    const newItems = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      const id = cells[0].getElementsByTagName("input")[0].value.trim();
      const value = parseFloat(cells[1].getElementsByTagName("input")[0].value);

      if (id && !isNaN(value)) {
        newItems.push({ id, value });
      }
    }

    try {
      dataManager.setItems(newItems);
      updateUI();
    } catch (error) {
      console.error(error);
    }
  };

  const handleJsonEdit = (jsonStr) => {
    try {
      const newData = JSON.parse(jsonStr);

      if (dataManager.validateJsonData(newData)) {
        // 중복 ID 검사
        const ids = new Set();
        const duplicateIds = new Set();
        newData.forEach((item) => {
          if (ids.has(item.id)) {
            duplicateIds.add(item.id);
          }
          ids.add(item.id);
        });

        if (duplicateIds.size > 0) {
          const jsonEditor = document.getElementById("json-editor");
          jsonEditor.classList.add("error");

          let errorDiv = document.getElementById("json-error-message");
          if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.id = "json-error-message";
            errorDiv.className = "error-message";
            jsonEditor.parentNode.insertBefore(
              errorDiv,
              jsonEditor.nextSibling
            );
          }

          errorDiv.textContent =
            "중복된 ID가 있습니다: " + Array.from(duplicateIds).join(", ");
          errorDiv.style.display = "block";
          errorDiv.style.position = "relative";
          errorDiv.style.marginTop = "8px";
          errorDiv.style.color = "red";
          return;
        }

        // 성공 시 에러 스타일과 메시지 제거
        const jsonEditor = document.getElementById("json-editor");
        jsonEditor.classList.remove("error");
        const errorDiv = document.getElementById("json-error-message");
        if (errorDiv) {
          errorDiv.style.display = "none";
        }

        dataManager.setItems(newData);
        updateUI();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initializeEventListeners = () => {
    document
      .getElementById("add-data")
      .addEventListener("click", handleAddData);
    document.getElementById("add-row").addEventListener("click", addNewRow);
    document
      .getElementById("apply-changes")
      .addEventListener("click", applyTableChanges);
    document.getElementById("apply-json").addEventListener("click", () => {
      const jsonStr = document.getElementById("json-editor").value;
      handleJsonEdit(jsonStr);
    });

    document.querySelectorAll('input[name="tab"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        document.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.add("hidden");
        });
        document.getElementById(e.target.value).classList.remove("hidden");
      });
    });

    window.addEventListener("resize", chartManager.resize);

    // ID 입력 필드에 실시간 유효성 검사 추가
    document.getElementById("data-id").addEventListener("input", (e) => {
      validateId(e.target.value.trim());
    });
  };

  // 초기화
  initializeEventListeners();
  updateUI();

  return {
    removeRow,
    handleAddData,
    addNewRow,
    applyTableChanges,
    handleJsonEdit,
  };
};

// 전역 변수 -> app 인스턴스 생성 (removeRow 함수 접근)
window.app = createApp();
