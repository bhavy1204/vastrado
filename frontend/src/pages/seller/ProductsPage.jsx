import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  PencilSimple,
  Trash,
  Package,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { productService } from "@/api/index";
import { createProductSchema } from "@/lib/validators";
import { PRODUCT_TYPES, GENDERS } from "@/lib/constant";
import {
  formatPrice,
  formatProductType,
  capitalize,
  validateImageFile,
} from "@/lib/formatters";
import usePagination from "@/hooks/usePagination";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

export default function SellerProductsPage() {
  const {
    page,
    limit,
    params,
    totalPages,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
    resetPage,
  } = usePagination();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    productService
      .getMyProducts(params)
      .then((res) => {
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.pagination.totalPages);
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.message || "Couldn't load your products",
        ),
      )
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    console.log(product);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (product) => {
    try {
      await productService.toggleStatus(product._id);
      toast.success(
        product.isActive ? "Product hidden" : "Product is now live",
      );
      fetchProducts();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't update product status",
      );
    }
  };

  const handleDelete = async (product) => {
    if (
      !window.confirm(`Delete "${product.productName}"? This can't be undone.`)
    )
      return;
    try {
      await productService.delete(product._id);
      toast.success("Product deleted");
      resetPage();
      fetchProducts();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't delete this product",
      );
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-text">Your products</h1>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} weight="bold" />}
          onClick={openCreateModal}
        >
          Add product
        </Button>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading your products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package size={26} weight="duotone" />}
          title="No products yet"
          description="Add your first product to start appearing in customer searches."
          actionLabel="Add product"
          onAction={openCreateModal}
        />
      ) : (
        <div className="rounded-md border border-border bg-surface-raised overflow-hidden">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-3 p-3 border-b border-border last:border-b-0"
            >
              <div className="h-14 w-14 rounded-md overflow-hidden bg-surface shrink-0">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.productName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {product.productName}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {formatPrice(
                    product.discountedPrice > 0
                      ? product.discountedPrice
                      : product.price,
                  )}
                  {product.discountedPrice > 0 && (
                    <span className="line-through ml-1.5">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleStatus(product)}
                className={[
                  "text-xs font-medium rounded-full px-2.5 py-1 border shrink-0",
                  product.isActive
                    ? "bg-success-bg text-success border-success-border"
                    : "bg-surface text-text-muted border-border",
                ].join(" ")}
              >
                {product.isActive ? "Live" : "Hidden"}
              </button>

              <button
                type="button"
                onClick={() => openEditModal(product)}
                aria-label="Edit"
                className="text-text-muted hover:text-primary p-1.5 shrink-0"
              >
                <PencilSimple size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(product)}
                aria-label="Delete"
                className="text-text-muted hover:text-error p-1.5 shrink-0"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onNext={nextPage}
        onPrev={prevPage}
        onGoTo={goToPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSaved={() => {
          setIsModalOpen(false);
          resetPage();
          fetchProducts();
        }}
      />
    </div>
  );
}

function ProductFormModal({ isOpen, onClose, product, onSaved }) {
  const isEditing = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [images, setImages] = useState([]);

  const defaultFormValues = {
    productName: "",
    price: "",
    discountedPrice: "",
    productType: "",
    gender: "",
    color: "",
    brand: "",
    productDescription: "",
    variants: [{ size: "", quantity: 0 }],
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: product || defaultFormValues,
  });

  useEffect(() => {
    reset(product || defaultFormValues);
    setImageFiles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, reset]);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setImages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  function SortableImage({ image, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: image.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group aspect-square overflow-hidden rounded-lg border border-border"
      >
        <img
          src={image.preview}
          alt=""
          className="w-full h-full object-cover"
        />

        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
        >
          ×
        </button>

        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        />
      </div>
    );
  }

  const onSubmit = async (data) => {
    // New products need images; edits (via update, which takes JSON per
    // your service definition) don't touch images here.
    if (!isEditing && imageFiles.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await productService.update(product._id, data);
        toast.success("Product updated");
      } else {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null) return;

          if (key === "variants") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });

        images.forEach((image) => {
          formData.append("images", image.file);
        });

        await productService.create(formData);
        toast.success("Product added");
      }

      onSaved();
    } catch (err) {
      console.log(err);
      console.log(err.response);
      toast.error(err?.response?.data?.message || "Couldn't save this product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit product" : "Add product"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Product name"
          error={errors.productName?.message}
          {...register("productName")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (₹)"
            type="number"
            error={errors.price?.message}
            {...register("price")}
          />
          <Input
            label="Discounted price (₹)"
            type="number"
            error={errors.discountedPrice?.message}
            {...register("discountedPrice")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            error={errors.productType?.message}
            {...register("productType")}
            options={PRODUCT_TYPES.map((t) => ({
              value: t,
              label: formatProductType(t),
            }))}
          />
          <Select
            label="Gender"
            error={errors.gender?.message}
            {...register("gender")}
            options={GENDERS.map((g) => ({ value: g, label: capitalize(g) }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Color"
            error={errors.color?.message}
            {...register("color")}
          />
          <Input
            label="Brand"
            error={errors.brand?.message}
            {...register("brand")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Size"
            error={errors.variants?.[0]?.size?.message}
            {...register("variants.0.size")}
          />
          <Input
            label="Quantity"
            type="number"
            error={errors.variants?.[0]?.quantity?.message}
            {...register("variants.0.quantity")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-border bg-surface-raised text-sm text-text p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            {...register("productDescription")}
          />
          {errors.productDescription && (
            <p className="text-xs text-error mt-1">
              {errors.productDescription.message}
            </p>
          )}
        </div>

        <label className="flex flex-col gap-1.5 cursor-pointer">
          <span className="text-sm font-medium text-text">Product images</span>

          <div className="h-11 rounded-md border border-dashed border-border-strong bg-surface flex items-center gap-2 px-3 text-text-muted hover:border-primary hover:text-primary transition-colors">
            <ImageIcon size={16} />
            <span className="text-xs truncate">
              {images.length > 0
                ? `${images.length} image(s) selected`
                : "Choose images"}
            </span>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {images.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {images.map((image) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Save changes" : "Add product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Select({ label, error, options, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text">{label}</label>
      <select
        {...props}
        className="h-11 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
