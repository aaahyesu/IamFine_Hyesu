const createDataManager = () => {
  let items = [];

  const addItem = (id, value) => {
    if (id && !isNaN(value)) {
      items.push({ id, value });
      return true;
    }
    return false;
  };

  const removeItem = (index) => {
    items.splice(index, 1);
  };

  const addEmptyItem = () => {
    items.push({ id: "", value: 0 });
  };

  const updateItems = (newItems) => {
    items = newItems;
  };

  const getItems = () => items;

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
    removeItem,
    addEmptyItem,
    updateItems,
    getItems,
    validateJsonData,
  };
};

export default createDataManager;
