const { createDocument, listDocuments, updateDocument, deleteDocument } = require('../utils/documentStore');

describe('document store fallback', () => {
  beforeEach(() => {
    require('../utils/documentStore').clearDocuments();
  });

  it('creates, lists, updates, and deletes documents in memory', async () => {
    const created = await createDocument({
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

    expect(created.title).toBe('Quarterly Report');

    const docs = await listDocuments({ owner: 'user-1' });
    expect(docs).toHaveLength(1);

    const updated = await updateDocument(created._id, { title: 'Updated Report' });
    expect(updated.title).toBe('Updated Report');

    const deleted = await deleteDocument(created._id);
    expect(deleted).toBe(true);
    expect(await listDocuments({ owner: 'user-1' })).toHaveLength(0);
  });

  it('matches document owners even when values are represented differently', async () => {
    const ownerId = { toString: () => 'owner-123' };

    await createDocument({
      title: 'Quarterly Forecast',
      owner: ownerId,
      fileUrl: 'https://example.com/forecast.pdf',
      publicId: 'forecast-1',
      format: 'pdf',
      size: 512,
    });

    const docs = await listDocuments({ owner: 'owner-123' });
    expect(docs).toHaveLength(1);
    expect(docs[0].title).toBe('Quarterly Forecast');
  });
});
