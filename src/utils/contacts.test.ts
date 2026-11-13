import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContactChannel,
  RelationCategory,
  type FamilyMember,
} from '../types/family';
import {
  filterAndSortMembers,
  formatRelativeContactTime,
  movePinnedMember,
  parseImportedContacts,
  recordMemberContact,
  toggleMemberPin,
} from './contacts';

const SAMPLE: FamilyMember[] = [
  {
    id: '1',
    name: 'أمي الحبيبة',
    relationLabel: 'أمي',
    category: RelationCategory.Parents,
    phone: '+9647701112233',
    photoUrl: '',
    isPinned: true,
    createdAt: 100,
    order: 0,
  },
  {
    id: '2',
    name: 'خالد',
    relationLabel: 'أخي',
    category: RelationCategory.Siblings,
    phone: '+9647804445566',
    photoUrl: '',
    isPinned: false,
    createdAt: 200,
    order: 1,
  },
  {
    id: '3',
    name: 'أبي الغالي',
    relationLabel: 'أبي',
    category: RelationCategory.Parents,
    phone: '+9647709998877',
    photoUrl: '',
    isPinned: true,
    createdAt: 300,
    order: 2,
  },
];

test('filterAndSortMembers places pinned members first and filters by query or category', () => {
  const all = filterAndSortMembers(SAMPLE);
  assert.deepEqual(
    all.map((m) => m.id),
    ['1', '3', '2']
  );

  const byArabicDigits = filterAndSortMembers(SAMPLE, { query: '٧٨٠' });
  assert.deepEqual(
    byArabicDigits.map((m) => m.id),
    ['2']
  );

  const parentsOnly = filterAndSortMembers(SAMPLE, {
    category: RelationCategory.Parents,
  });
  assert.deepEqual(
    parentsOnly.map((m) => m.id),
    ['1', '3']
  );

  const pinnedOnly = filterAndSortMembers(SAMPLE, { category: 'pinned' });
  assert.deepEqual(
    pinnedOnly.map((m) => m.id),
    ['1', '3']
  );
});

test('toggleMemberPin and recordMemberContact update state immutably', () => {
  const toggled = toggleMemberPin(SAMPLE, '2');
  assert.equal(toggled.find((m) => m.id === '2')?.isPinned, true);
  assert.equal(SAMPLE.find((m) => m.id === '2')?.isPinned, false);

  const contacted = recordMemberContact(
    SAMPLE,
    '1',
    ContactChannel.WhatsApp,
    123456
  );
  assert.equal(contacted[0].lastChannel, ContactChannel.WhatsApp);
  assert.equal(contacted[0].lastContactedAt, 123456);
});

test('movePinnedMember swaps pinned order cleanly', () => {
  const moved = movePinnedMember(SAMPLE, '3', 'earlier');
  const sorted = filterAndSortMembers(moved, { category: 'pinned' });
  assert.deepEqual(
    sorted.map((m) => m.id),
    ['3', '1']
  );
});

test('formatRelativeContactTime formats Arabic relative durations', () => {
  const now = 1_000_000;
  assert.equal(formatRelativeContactTime(now - 20_000, now), 'الآن');
  assert.equal(formatRelativeContactTime(now - 5 * 60_000, now), 'منذ 5 دقيقة');
  assert.equal(formatRelativeContactTime(now - 3 * 3600_000, now), 'منذ 3 ساعة');
});

test('parseImportedContacts validates JSON structure and sanitizes phone numbers', () => {
  const validJson = JSON.stringify({
    members: [
      {
        name: 'سارة',
        relationLabel: 'أختي',
        category: 'siblings',
        phone: '٠٧٧٠١٢٣٤٥٦٧',
        isPinned: true,
      },
    ],
  });
  const res = parseImportedContacts(validJson);
  assert.equal(res.ok, true);
  assert.equal(res.members?.length, 1);
  assert.equal(res.members?.[0].phone, '+9647701234567');

  const invalidRes = parseImportedContacts('{bad json');
  assert.equal(invalidRes.ok, false);
});
