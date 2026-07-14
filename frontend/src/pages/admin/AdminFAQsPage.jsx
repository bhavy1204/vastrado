import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Question, Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { siteContentService } from "@/api/index";
import { faqSchema } from "@/lib/validators";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

/**
 * Admin FAQsPage — /admin/faqs
 * NOTE: no admin-specific "list all FAQs" endpoint was listed in your
 * services, so this reuses the public getAllFAQs() for the list and only
 * uses admin endpoints for create/update/delete. Swap in an admin list
 * endpoint if one exists (e.g. to also see unpublished FAQs).
 */
export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFaqs = () => {
    setIsLoading(true);
    siteContentService
      .getAllFAQs()
      .then((res) => setFaqs(res.data?.data))
      .catch((err) => toast.error(err?.response?.data?.message || "Couldn't load FAQs"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleDelete = async (faq) => {
    if (!window.confirm("Delete this FAQ?")) return;
    setDeletingId(faq._id);
    try {
      await siteContentService.deleteFAQ(faq._id);
      toast.success("FAQ deleted");
      fetchFaqs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete this FAQ");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-text">FAQs</h1>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} weight="bold" />} onClick={openCreateModal}>
          Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading FAQs..." />
      ) : faqs.length === 0 ? (
        <EmptyState
          icon={<Question size={26} weight="duotone" />}
          title="No FAQs yet"
          actionLabel="Add FAQ"
          onAction={openCreateModal}
        />
      ) : (
        <div className="rounded-md border border-border bg-surface-raised divide-y divide-border">
          {faqs.map((faq) => (
            <div key={faq._id} className="flex items-start gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">{faq.question}</p>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(faq)}
                  aria-label="Edit"
                  className="text-text-muted hover:text-primary p-1.5"
                >
                  <PencilSimple size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(faq)}
                  disabled={deletingId === faq._id}
                  aria-label="Delete"
                  className="text-text-muted hover:text-error p-1.5 disabled:opacity-50"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FAQFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faq={editingFaq}
        onSaved={() => {
          setIsModalOpen(false);
          fetchFaqs();
        }}
      />
    </div>
  );
}

function FAQFormModal({ isOpen, onClose, faq, onSaved }) {
  const isEditing = !!faq;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: faq || { question: "", answer: "" },
  });

  useEffect(() => {
    reset(faq || { question: "", answer: "" });
  }, [faq, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await siteContentService.updateFAQ(faq._id, data);
        toast.success("FAQ updated");
      } else {
        await siteContentService.createFAQ(data);
        toast.success("FAQ added");
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save this FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit FAQ" : "Add FAQ"} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Question" error={errors.question?.message} {...register("question")} />

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">Answer</label>
          <textarea
            rows={4}
            className="w-full rounded-md border border-border bg-surface-raised text-sm text-text p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            {...register("answer")}
          />
          {errors.answer && <p className="text-xs text-error mt-1">{errors.answer.message}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Save changes" : "Add FAQ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


