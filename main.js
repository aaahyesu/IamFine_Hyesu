import createChartManager from "./js/chartManager.js";
import createDataManager from "./js/dataManager.js";

const createApp = () => {
  const chartManager = createChartManager();
  const dataManager = createDataManager();

  // updateTable 바깥에 선언
  let updateDeleteBtnState = () => {};

  const updateUI = () => {
    chartManager.updateChart(dataManager.getItems());
    updateTable();
    updateJsonView();
  };

  const updateTable = () => {
    const data = dataManager.getItems();
    const table = document.getElementById("data-table");
    const emptyMsg = document.getElementById("empty-table-message");
    const deleteBtn = document.getElementById("delete-btn");
    const applyBtn = document.getElementById("apply-changes");

    if (data.length === 0) {
      table.style.display = "none";
      deleteBtn.style.display = "none";
      applyBtn.style.display = "none";
      emptyMsg.style.display = "flex";
    } else {
      table.style.display = "";
      deleteBtn.style.display = "";
      applyBtn.style.display = "";
      emptyMsg.style.display = "none";
      const tbody = document.querySelector("#data-table tbody");
      tbody.innerHTML = "";

      data.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td><input type="checkbox" class="row-checkbox" data-index="${index}" /></td>
          <td><input type="text" value="${item.id}" /></td>
          <td><input type="number" value="${item.value}" /></td>
        `;
      });

      // 삭제 버튼 활성화/비활성화
      const checkboxes = document.querySelectorAll(".row-checkbox");
      // 여기서 함수 내용을 할당
      updateDeleteBtnState = () => {
        const checked = Array.from(checkboxes).some((cb) => cb.checked);
        if (checked) {
          deleteBtn.classList.add("active");
        } else {
          deleteBtn.classList.remove("active");
        }
      };
      checkboxes.forEach((cb) =>
        cb.addEventListener("change", updateDeleteBtnState)
      );
      updateDeleteBtnState();

      // 변경 버튼 활성화/비활성화
      const idInputs = tbody.querySelectorAll("td:nth-child(2) input");
      const valueInputs = tbody.querySelectorAll("td:nth-child(3) input");
      let original = data.map((item) => ({ ...item }));

      function updateApplyBtnState() {
        let changed = false;
        idInputs.forEach((input, i) => {
          if (input.value !== original[i].id) changed = true;
        });
        valueInputs.forEach((input, i) => {
          if (parseFloat(input.value) !== original[i].value) changed = true;
        });
        if (changed) {
          applyBtn.classList.add("active");
        } else {
          applyBtn.classList.remove("active");
        }
      }
      idInputs.forEach((input) =>
        input.addEventListener("input", updateApplyBtnState)
      );
      valueInputs.forEach((input) =>
        input.addEventListener("input", updateApplyBtnState)
      );
      updateApplyBtnState();
    }
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
      const id = cells[1].getElementsByTagName("input")[0].value.trim();
      const value = parseFloat(cells[2].getElementsByTagName("input")[0].value);

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

  const removeSelectedRows = () => {
    const checkboxes = document.querySelectorAll(".row-checkbox:checked");
    if (checkboxes.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    const indices = Array.from(checkboxes).map((checkbox) =>
      parseInt(checkbox.dataset.index)
    );

    // 인덱스를 내림차순으로 정렬하여 뒤에서부터 삭제
    indices
      .sort((a, b) => b - a)
      .forEach((index) => {
        dataManager.deleteItem(index);
      });

    updateUI();
  };

  const handleSelectAll = (event) => {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = event.target.checked;
    });
    updateDeleteBtnState();
  };

  const applyTableChanges = () => {
    const table = document.getElementById("data-table");
    const rows = table.getElementsByTagName("tr");
    const newItems = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      const id = cells[1].getElementsByTagName("input")[0].value.trim();
      const value = parseFloat(cells[2].getElementsByTagName("input")[0].value);

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

    document.getElementById("apply-changes").classList.remove("active");
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
    document
      .getElementById("apply-changes")
      .addEventListener("click", applyTableChanges);
    document.getElementById("apply-json").addEventListener("click", () => {
      const jsonStr = document.getElementById("json-editor").value;
      handleJsonEdit(jsonStr);
    });
    document
      .getElementById("select-all")
      .addEventListener("change", handleSelectAll);
    document
      .getElementById("delete-btn")
      .addEventListener("click", removeSelectedRows);

    document.querySelectorAll('input[name="tab"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        document.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.add("hidden");
        });
        document.getElementById(e.target.value).classList.remove("hidden");
        showWideBtn(e.target.value);
      });
    });

    window.addEventListener("resize", chartManager.resize);

    // ID 입력 필드에 실시간 유효성 검사 추가
    document.getElementById("data-id").addEventListener("input", (e) => {
      validateId(e.target.value.trim());
    });

    const addBtn = document.getElementById("add-data");
    const idInput = document.getElementById("data-id");
    const valueInput = document.getElementById("data-value");

    function checkAddBtnActive() {
      if (idInput.value.trim() !== "" && valueInput.value.trim() !== "") {
        addBtn.classList.add("active");
      } else {
        addBtn.classList.remove("active");
      }
    }

    idInput.addEventListener("input", checkAddBtnActive);
    valueInput.addEventListener("input", checkAddBtnActive);

    // 추가 후에는 버튼 비활성화
    addBtn.addEventListener("click", () => {
      addBtn.classList.remove("active");
    });
  };

  function showWideBtn(tab) {
    document.getElementById("apply-changes").style.display =
      tab === "tab-table" ? "block" : "none";
    document.getElementById("apply-json").style.display =
      tab === "tab-chart" ? "block" : "none";
  }

  // 초기 진입 시
  showWideBtn(document.querySelector('input[name="tab"]:checked').value);

  // 초기화
  initializeEventListeners();
  updateUI();

  return {
    removeSelectedRows,
    handleAddData,
    applyTableChanges,
    handleJsonEdit,
  };
};

// 전역 변수 -> app 인스턴스 생성 (removeRow 함수 접근)
window.app = createApp();
