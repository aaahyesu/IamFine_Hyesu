const createDataManager = () => {
  let items = [];

  const isDuplicateId = (id, excludeIndex = -1) => {
    return items.some(
      (item, index) => index !== excludeIndex && item.id === id
    );
  };

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

  const deleteItem = (index) => {
    if (index < 0 || index >= items.length) {
      throw new Error("유효하지 않은 인덱스입니다.");
    }
    items.splice(index, 1);
  };

  const getItems = () => [...items];

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
