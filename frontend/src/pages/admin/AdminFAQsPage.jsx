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
    <div className="flex flex-col gap-6 p-5 sm:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Frequently Asked Questions
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage the questions shown to customers on your marketplace.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={18} weight="bold" />}
          onClick={openCreateModal}
        >
          Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading FAQs..." />
      ) : faqs.length === 0 ? (
        <EmptyState
          icon={<Question size={30} weight="duotone" />}
          title="No FAQs added yet"
          actionLabel="Add FAQ"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-5">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className="rounded-xl border border-border bg-surface-raised p-6 transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Question size={20} weight="fill" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-text leading-snug">
                        {faq.question}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-text-secondary whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end lg:self-start">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<PencilSimple size={16} />}
                    onClick={() => openEditModal(faq)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash size={16} />}
                    isLoading={deletingId === faq._id}
                    onClick={() => handleDelete(faq)}
                  >
                    Delete
                  </Button>
                </div>
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


