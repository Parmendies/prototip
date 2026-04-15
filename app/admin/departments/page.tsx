'use client';

import AdminHeader from '../_components/AdminHeader';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Modal } from '@/app/_components/ui/Modal';
import { Input, Textarea } from '@/app/_components/ui/Input';
import { mockDepartments } from '@/app/_lib/mock-data';
import { useState } from 'react';
import { Plus, Users, Tag, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/app/_lib/utils';
import type { Department } from '@/app/_types/hospital';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  function openAdd() {
    setEditTarget(null);
    setTags([]);
    setTagInput('');
    setShowModal(true);
  }

  function openEdit(dep: Department) {
    setEditTarget(dep);
    setTags(dep.tags);
    setTagInput('');
    setShowModal(true);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t));
  }

  function handleDelete(id: string) {
    setDepartments(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdminHeader title="Departmanlar" subtitle="Birimleri ve tıbbi etiketleri yönetin" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Toplam <span className="font-semibold text-[var(--color-text-primary)]">{departments.length}</span> departman
            </p>
          </div>
          <Button id="add-department-btn" onClick={openAdd} icon={<Plus size={14} />}>
            Departman Ekle
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((dep) => (
            <Card key={dep.id} hover className="animate-slide-up group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${dep.color}22`, border: `1px solid ${dep.color}44` }}
                  >
                    {dep.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{dep.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users size={11} className="text-[var(--color-text-muted)]" />
                      <span className="text-[11px] text-[var(--color-text-muted)]">{dep.doctorCount} doktor</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(dep)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    aria-label="Düzenle"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(dep.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-error-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                    aria-label="Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {dep.description && (
                <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed line-clamp-2">
                  {dep.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1">
                {dep.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                    style={{ background: `${dep.color}18`, color: dep.color }}
                  >
                    <Tag size={8} />
                    {tag}
                  </span>
                ))}
                {dep.tags.length > 4 && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">+{dep.tags.length - 4}</span>
                )}
              </div>

              <div className="mt-3 pt-3 divider flex items-center justify-between">
                <Badge status={dep.isActive ? 'active' : 'inactive'} dot size="xs">
                  {dep.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
                <div className="w-6 h-6 rounded-full" style={{ background: dep.color, opacity: 0.8 }} />
              </div>
            </Card>
          ))}

          {/* Add Card */}
          <button
            id="add-department-card"
            onClick={openAdd}
            className="rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] p-6 flex flex-col items-center justify-center gap-2 transition-all duration-200 group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] group-hover:bg-[var(--color-primary)] group-hover:text-[hsl(222,47%,7%)] flex items-center justify-center text-[var(--color-text-muted)] transition-all">
              <Plus size={20} />
            </div>
            <p className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] font-medium transition-colors">
              Yeni Departman
            </p>
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? 'Departman Düzenle' : 'Yeni Departman'}
        subtitle={editTarget ? editTarget.name : 'Yeni bir departman ekleyin'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>İptal</Button>
            <Button onClick={() => setShowModal(false)}>
              {editTarget ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input id="dept-name" label="Departman Adı" placeholder="Örn: Kardiyoloji" defaultValue={editTarget?.name} required />
          <Textarea id="dept-desc" label="Açıklama" placeholder="Departman hakkında kısa bilgi..." defaultValue={editTarget?.description} rows={3} />

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Tıbbi Etiketler</label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="dept-tag-input"
                placeholder="Etiket ekle..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <Button variant="outline" size="sm" onClick={addTag}>Ekle</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[var(--color-primary-muted)] text-[var(--color-primary)] cursor-pointer hover:bg-[var(--color-error-muted)] hover:text-[var(--color-error)] transition-colors"
                    onClick={() => removeTag(t)}
                    title="Kaldırmak için tıkla"
                  >
                    {t} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Renk</label>
            <div className="flex gap-2 mt-1.5">
              {['#ef4444','#8b5cf6','#f59e0b','#10b981','#6366f1','#f97316','#14b8a6','#ec4899'].map((c) => (
                <button
                  key={c}
                  className={cn('w-7 h-7 rounded-xl transition-all hover:scale-110 border-2', editTarget?.color === c ? 'border-white scale-110' : 'border-transparent')}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
