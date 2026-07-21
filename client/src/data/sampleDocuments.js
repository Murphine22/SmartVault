const sampleDocuments = Array.from({ length: 50 }, (_, index) => ({
  _id: `doc-${index + 1}`,
  title: `${['Quarterly','Operations','Security','Product','Design','Vendor','Marketing','Recruitment','Executive','Sales','Infrastructure','Customer','Budget','Partner','Brand','Release','Compliance','Account','Event','Board'][index % 20]} ${['Report','Plan','Checklist','Roadmap','Guide','Contract','Deck','Pipeline','Summary','Brief','Runbook','Notes','Timeline','Playbook','Review','Training','Launch','Analysis','Archive','Packet'][index % 20]}`,
  category: ['Finance','Operations','Compliance','Planning','Design','Legal','Marketing','HR','Strategy','Sales','Engineering','Support','Business','Executive','Success'][index % 15],
  format: ['pdf','doc','png','ppt','jpg'][index % 5],
  size: 500000 + (index * 87000),
  createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  tags: [
    ['finance','operations','security','product','design','legal','marketing','hr','strategy','sales','engineering','support','business','executive','success'][index % 15],
    ['review','draft','approved','shared','priority','archive','launch','workflow','client','team'][index % 10],
    ['2026','q4','report','ops','growth'][index % 5],
  ].filter(Boolean),
  fileUrl: '#',
}));

export default sampleDocuments;
