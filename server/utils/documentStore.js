const documents = [];

const normalizeId = (value) => value?.toString?.() ?? String(value);

const createDocument = async (doc) => {
  const record = {
    _id: `${Date.now()}-${documents.length + 1}`,
    ...doc,
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false,
  };
  documents.push(record);
  return record;
};

const listDocuments = async ({ owner } = {}) => {
  return documents.filter((doc) => !owner || normalizeId(doc.owner) === normalizeId(owner));
};

const updateDocument = async (id, updates) => {
  const index = documents.findIndex((doc) => doc._id === id);
  if (index === -1) return null;
  documents[index] = { ...documents[index], ...updates, updatedAt: new Date() };
  return documents[index];
};

const deleteDocument = async (id) => {
  const index = documents.findIndex((doc) => doc._id === id);
  if (index === -1) return false;
  documents.splice(index, 1);
  return true;
};

const clearDocuments = () => {
  documents.length = 0;
};

module.exports = { createDocument, listDocuments, updateDocument, deleteDocument, clearDocuments };
