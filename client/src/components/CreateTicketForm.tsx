import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTicketSchema, CreateTicketInput } from "../schemas/ticket.schema.js";
import { Category, RelatedSystem, getRelatedSystems, createTicket, uploadAttachment } from "../api.js";

interface CreateTicketFormProps {
  requesterId: number;
  categories: Category[];
  onSuccess?: (ticketNumber: string) => void;
}

export function CreateTicketForm({ requesterId, categories, onSuccess }: CreateTicketFormProps) {
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(CreateTicketSchema),
    defaultValues: {
      requestedPriority: "MEDIUM",
    }
  });

  useEffect(() => {
    async function loadRelatedSystems() {
      try {
        const systems = await getRelatedSystems();
        setRelatedSystems(systems);
      } catch (err: any) {
        setGlobalError("Failed to load related systems. " + err.message);
      }
    }
    loadRelatedSystems();
  }, []);

  const onSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      // 1. Create Ticket
      const payload = {
        summary: data.summary,
        description: data.description,
        categoryId: data.categoryId,
        relatedSystemId: data.relatedSystemId,
        requestedPriority: data.requestedPriority,
        requesterId: requesterId,
      };

      const newTicket = await createTicket(payload);

      // 2. Upload Attachments (if any)
      if (data.attachments && data.attachments.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          await uploadAttachment(newTicket.id, data.attachments[i]);
        }
      }

      reset(); // Clear the form
      if (onSuccess) {
        onSuccess(newTicket.ticketNumber);
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm p-4 mt-4">
      <h3 className="mb-4">Create New Ticket</h3>
      
      {globalError && <div className="alert alert-danger">{globalError}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Summary */}
        <div className="mb-3">
          <label className="form-label fw-bold">Summary <span className="text-danger">*</span></label>
          <input
            type="text"
            className={`form-control ${errors.summary ? "is-invalid" : ""}`}
            {...register("summary")}
            placeholder="Enter a brief summary"
          />
          {errors.summary && <div className="invalid-feedback">{errors.summary.message as string}</div>}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-bold">Description <span className="text-danger">*</span></label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            rows={4}
            {...register("description")}
            placeholder="Describe the issue in detail"
          ></textarea>
          {errors.description && <div className="invalid-feedback">{errors.description.message as string}</div>}
        </div>

        <div className="row">
          {/* Category */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Category <span className="text-danger">*</span></label>
            <select className={`form-select ${errors.categoryId ? "is-invalid" : ""}`} {...register("categoryId")}>
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <div className="invalid-feedback">{errors.categoryId.message as string}</div>}
          </div>

          {/* Related System */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Related System <span className="text-danger">*</span></label>
            <select className={`form-select ${errors.relatedSystemId ? "is-invalid" : ""}`} {...register("relatedSystemId")}>
              <option value="">-- Select System --</option>
              {relatedSystems.map((sys) => (
                <option key={sys.id} value={sys.id}>{sys.name}</option>
              ))}
            </select>
            {errors.relatedSystemId && <div className="invalid-feedback">{errors.relatedSystemId.message as string}</div>}
          </div>

          {/* Priority */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Priority</label>
            <select className={`form-select ${errors.requestedPriority ? "is-invalid" : ""}`} {...register("requestedPriority")}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            {errors.requestedPriority && <div className="invalid-feedback">{errors.requestedPriority.message as string}</div>}
          </div>
        </div>

        {/* Attachments */}
        <div className="mb-4">
          <label className="form-label fw-bold">Attachments (Max 5 files, 5MB each)</label>
          <input
            type="file"
            multiple
            className={`form-control ${errors.attachments ? "is-invalid" : ""}`}
            {...register("attachments")}
            accept=".jpg,.jpeg,.png,.webp,.pdf"
          />
          <div className="form-text">Allowed types: JPG, PNG, WEBP, PDF.</div>
          {errors.attachments && <div className="invalid-feedback">{errors.attachments.message as string}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}
