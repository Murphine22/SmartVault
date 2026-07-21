const documentController = require('../controllers/documentController');
const documentStore = require('../utils/documentStore');

describe('document controller delete behavior', () => {
  beforeEach(() => {
    documentStore.clearDocuments();
  });

  it('soft-deletes documents by default and keeps them visible in trash', async () => {
    const created = await documentStore.createDocument({
      title: 'Quarterly Report',
      description: 'Forecast',
      owner: 'user-1',
      category: 'Finance',
      tags: ['finance'],
      accessLevel: 'private',
      fileUrl: 'https://example.com/report.pdf',
      publicId: 'report-1',
      format: 'pdf',
      size: 1024,
    });

    const req = {
      params: { id: created._id },
      query: {},
      user: { _id: 'user-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await documentController.deleteDocument(req, res);

    const docs = await documentStore.listDocuments({ owner: 'user-1' });
    expect(docs).toHaveLength(1);
    expect(docs[0].isArchived).toBe(true);
  });

  it('restores archived documents from trash', async () => {
    const created = await documentStore.createDocument({
      title: 'Quarterly Report',
      description: 'Forecast',
      owner: 'user-1',
      category: 'Finance',
      tags: ['finance'],
      accessLevel: 'private',
      fileUrl: 'https://example.com/report.pdf',
      publicId: 'report-1',
      format: 'pdf',
      size: 1024,
      isArchived: true,
    });

    const req = {
      params: { id: created._id },
      user: { _id: 'user-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await documentController.restoreDocument(req, res);

    const docs = await documentStore.listDocuments({ owner: 'user-1' });
    expect(docs).toHaveLength(1);
    expect(docs[0].isArchived).toBe(false);
  });
});
