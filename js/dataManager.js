// 데이터 관리자 객체를 생성하는 함수
const createDataManager = () => {
  let items = [];

  // ID 중복 여부를 검사하는 함수
  const isDuplicateId = (id, excludeIndex = -1) => {
    return items.some(
      (item, index) => index !== excludeIndex && item.id === id
    );
  };

  // 새로운 데이터 항목을 추가하는 함수
  const addItem = (id, value) => {
    if (value === undefined || value === null) {
      throw new Error("값은 필수입니다.");
    }

    // 빈 ID는 허용하되, 중복 ID는 체크
    if (id && isDuplicateId(id)) {
      throw new Error("이미 존재하는 ID입니다.");
    }

    const newItem = { id, value };
    items.push(newItem);
    return newItem;
  };

  // 기존 데이터 항목을 업데이트하는 함수
  const updateItem = (index, id, value) => {
    if (index < 0 || index >= items.length) {
      throw new Error("유효하지 않은 인덱스입니다.");
    }

    if (!id || !value) {
      throw new Error("ID와 값은 필수입니다.");
    }

    if (isDuplicateId(id, index)) {
      throw new Error("이미 존재하는 ID입니다.");
    }

    items[index] = { id, value };
    return items[index];
  };

  // 데이터 항목을 삭제하는 함수
  const deleteItem = (index) => {
    if (index < 0 || index >= items.length) {
      throw new Error("유효하지 않은 인덱스입니다.");
    }
    items.splice(index, 1);
  };

  // 모든 데이터 항목을 반환하는 함수
  const getItems = () => [...items];

  // 데이터 항목을 일괄 설정하는 함수
  const setItems = (newItems) => {
    // 중복 ID 검사
    const ids = new Set();
    for (const item of newItems) {
      if (ids.has(item.id)) {
        throw new Error(`중복된 ID가 있습니다: ${item.id}`);
      }
      ids.add(item.id);
    }
    items = [...newItems];
  };

  // JSON 데이터의 유효성을 검사하는 함수
  const validateJsonData = (data) => {
    return (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === "object" &&
          "id" in item &&
          "value" in item &&
          typeof item.id === "string" &&
          !isNaN(parseFloat(item.value))
      )
    );
  };

  return {
    addItem,
    updateItem,
    deleteItem,
    getItems,
    setItems,
    validateJsonData,
    isDuplicateId,
  };
};

export default createDataManager;
