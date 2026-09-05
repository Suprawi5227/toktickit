import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTicketSchema } from "../schemas/ticket.schema.js";
import { getRelatedSystems, createTicket, uploadAttachment } from "../api.js";
export function CreateTicketForm({ requesterId, categories, onSuccess }) {
    const [relatedSystems, setRelatedSystems] = useState([]);
    const [globalError, setGlobalError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
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
            }
            catch (err) {
                setGlobalError("Failed to load related systems. " + err.message);
            }
        }
        loadRelatedSystems();
    }, []);
    const onSubmit = async (data) => {
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
        }
        catch (err) {
            setGlobalError(err.message || "Failed to submit ticket.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "card shadow-sm p-4 mt-4", children: [_jsx("h3", { className: "mb-4", children: "Create New Ticket" }), globalError && _jsx("div", { className: "alert alert-danger", children: globalError }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Summary ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { type: "text", className: `form-control ${errors.summary ? "is-invalid" : ""}`, ...register("summary"), placeholder: "Enter a brief summary" }), errors.summary && _jsx("div", { className: "invalid-feedback", children: errors.summary.message })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Description ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("textarea", { className: `form-control ${errors.description ? "is-invalid" : ""}`, rows: 4, ...register("description"), placeholder: "Describe the issue in detail" }), errors.description && _jsx("div", { className: "invalid-feedback", children: errors.description.message })] }), _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-4 mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Category ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: `form-select ${errors.categoryId ? "is-invalid" : ""}`, ...register("categoryId"), children: [_jsx("option", { value: "", children: "-- Select Category --" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] }), errors.categoryId && _jsx("div", { className: "invalid-feedback", children: errors.categoryId.message })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Related System ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: `form-select ${errors.relatedSystemId ? "is-invalid" : ""}`, ...register("relatedSystemId"), children: [_jsx("option", { value: "", children: "-- Select System --" }), relatedSystems.map((sys) => (_jsx("option", { value: sys.id, children: sys.name }, sys.id)))] }), errors.relatedSystemId && _jsx("div", { className: "invalid-feedback", children: errors.relatedSystemId.message })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("label", { className: "form-label fw-bold", children: "Priority" }), _jsxs("select", { className: `form-select ${errors.requestedPriority ? "is-invalid" : ""}`, ...register("requestedPriority"), children: [_jsx("option", { value: "LOW", children: "Low" }), _jsx("option", { value: "MEDIUM", children: "Medium" }), _jsx("option", { value: "HIGH", children: "High" }), _jsx("option", { value: "CRITICAL", children: "Critical" })] }), errors.requestedPriority && _jsx("div", { className: "invalid-feedback", children: errors.requestedPriority.message })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "form-label fw-bold", children: "Attachments (Max 5 files, 5MB each)" }), _jsx("input", { type: "file", multiple: true, className: `form-control ${errors.attachments ? "is-invalid" : ""}`, ...register("attachments"), accept: ".jpg,.jpeg,.png,.webp,.pdf" }), _jsx("div", { className: "form-text", children: "Allowed types: JPG, PNG, WEBP, PDF." }), errors.attachments && _jsx("div", { className: "invalid-feedback", children: errors.attachments.message })] }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isSubmitting, children: isSubmitting ? "Submitting..." : "Submit Ticket" })] })] }));
}
