"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, ChevronDown, Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import { FormField, FormResponse, formsService } from "@/services/forms.service";
import { leadsService } from "@/services/leads.service";

const DEFAULT_SERVICES = [
  "Desarrollo Web",
  "Aplicaciones Móviles",
  "Marketing Digital",
  "Cursos y Capacitaciones",
  "Consultoría IT",
  "Gestión de Redes Sociales",
  "Otro",
];

const fallbackFields: FormField[] = [
  { id: "nombre", name: "nombre", label: "Nombre completo", type: "text", required: true, order: 1 },
  { id: "email", name: "email", label: "Correo electrónico", type: "email", required: true, order: 2 },
  { id: "telefono", name: "telefono", label: "Teléfono", type: "phone", required: false, order: 3 },
  { id: "servicio", name: "servicio", label: "Servicio de interés", type: "select", required: true, options: DEFAULT_SERVICES, order: 4 },
  { id: "mensaje", name: "mensaje", label: "Cuéntanos sobre tu proyecto", type: "textarea", required: false, order: 5 },
];

type FormValues = Record<string, string | boolean | string[]>;

const getInitialValues = (fields: FormField[]) =>
  fields.reduce<FormValues>((acc, field) => {
    acc[field.id] = field.type === "checkbox" ? false : "";
    return acc;
  }, {});

const fieldIcon = (field: FormField) => {
  const key = `${field.type} ${field.name} ${field.label}`.toLowerCase();
  if (key.includes("email") || key.includes("correo")) return Mail;
  if (key.includes("phone") || key.includes("telefono")) return Phone;
  if (key.includes("mensaje") || field.type === "textarea") return MessageSquare;
  return User;
};

export function ContactSection() {
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | "default">("default");
  const [values, setValues] = useState<FormValues>(getInitialValues(fallbackFields));
  const [loadingForms, setLoadingForms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForms = async () => {
      try {
        const response = await formsService.getActiveForms(1, 50);
        setForms(response.data);

        if (response.data.length > 0) {
          setSelectedFormId(response.data[0].id);
          setValues(getInitialValues(response.data[0].campos));
        }
      } catch (err) {
        console.error("Error loading active contact forms:", err);
      } finally {
        setLoadingForms(false);
      }
    };

    loadForms();
  }, []);

  const selectedForm = useMemo(
    () => forms.find((form) => form.id === selectedFormId),
    [forms, selectedFormId]
  );

  const fields = useMemo(
    () => [...(selectedForm?.campos || fallbackFields)].sort((a, b) => a.order - b.order),
    [selectedForm]
  );

  const handleSelectForm = (formId: string) => {
    const nextId = Number(formId);
    const nextForm = forms.find((form) => form.id === nextId);
    if (!nextForm) return;
    setSelectedFormId(nextId);
    setValues(getInitialValues(nextForm.campos));
    setSent(false);
    setError(null);
  };

  const setFieldValue = (field: FormField, value: string | boolean | string[]) => {
    setValues((prev) => ({ ...prev, [field.id]: value }));
    setError(null);
  };

  const getValue = (field: FormField) => values[field.id] ?? "";

  const validate = () => {
    const missing = fields.find((field) => {
      const value = getValue(field);
      if (!field.required) return false;
      if (Array.isArray(value)) return value.length === 0;
      return value === "" || value === false || value === undefined || value === null;
    });

    if (missing) {
      setError(`Completa el campo obligatorio: ${missing.label}`);
      return false;
    }

    return true;
  };

  const submitFallbackLead = async () => {
    await leadsService.createPublicLead({
      nombre: String(values.nombre || ""),
      email: String(values.email || ""),
      telefono: values.telefono ? String(values.telefono) : undefined,
      empresa: values.servicio ? String(values.servicio) : undefined,
      notas: `Origen: Página de contacto\nMensaje: ${values.mensaje || "Sin mensaje adicional"}`,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      if (selectedForm) {
        const emailField = fields.find((field) => field.type === "email");
        await formsService.submitForm({
          idFormulario: selectedForm.id,
          respuestas: values,
          email: emailField ? String(values[emailField.id] || "") : undefined,
        });
      } else {
        await submitFallbackLead();
      }

      setSent(true);
    } catch (err: unknown) {
      const submitError = err as { message?: string };
      setError(submitError.message || "Hubo un error al enviar el formulario. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setError(null);
    setValues(getInitialValues(fields));
  };

  const renderField = (field: FormField) => {
    const Icon = fieldIcon(field);
    const value = getValue(field);
    const baseClass =
      "w-full rounded-lg border border-gray-200 text-sm outline-none transition-all focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/10";

    if (field.type === "textarea") {
      return (
        <textarea
          value={String(value)}
          onChange={(event) => setFieldValue(field, event.target.value)}
          rows={4}
          placeholder={field.placeholder || "Escribe tu respuesta..."}
          className={`${baseClass} resize-none px-4 py-3`}
        />
      );
    }

    if (field.type === "select") {
      return (
        <div className="relative">
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={String(value)}
            onChange={(event) => setFieldValue(field, event.target.value)}
            className={`${baseClass} appearance-none bg-white px-4 py-3`}
          >
            <option value="">Seleccionar...</option>
            {(field.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => setFieldValue(field, event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span>{field.placeholder || field.label}</span>
        </label>
      );
    }

    return (
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={field.type === "phone" ? "tel" : field.type}
          value={String(value)}
          onChange={(event) => setFieldValue(field, event.target.value)}
          placeholder={field.placeholder || field.label}
          className={`${baseClass} px-4 py-3 pl-10`}
        />
      </div>
    );
  };

  return (
    <section id="contacto" className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl bg-[#01103B] p-8 text-white">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-[#FFB072]">
              Contacto comercial
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
              Agenda una consulta y recibe una propuesta clara.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Cuéntanos que necesitas. Registraremos tu solicitud en el CRM y un asesor de ventas dará seguimiento.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { title: "Respuesta rápida", desc: "Te contactamos con los datos necesarios para avanzar." },
                { title: "Diagnóstico inicial", desc: "Identificamos el servicio correcto para tu objetivo." },
                { title: "Seguimiento ordenado", desc: "Tu solicitud queda registrada para no perder oportunidades." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#34A853] text-white">
                    <CheckCircle size={15} />
                  </div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-white/65">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/75">
              <p>Piura, Peru</p>
              <p className="mt-2">+51 960 183 250</p>
              <p className="mt-2">info@digitalesedupro.com</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            {sent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#34A853]/10">
                  <CheckCircle className="h-10 w-10 text-[#34A853]" />
                </div>
                <h3 className="text-2xl font-bold text-[#01103B]">Formulario enviado</h3>
                <p className="mt-2 max-w-md text-gray-500">Tu información fue registrada. Un asesor te contactará pronto.</p>
                <button
                  onClick={resetForm}
                  className="mt-6 rounded-lg bg-[#FF7101] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e86600]"
                >
                  Enviar otra respuesta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#01103B]">{selectedForm?.nombre || "Solicita tu consulta gratuita"}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedForm?.descripción || "Completa tus datos y te responderemos pronto."}
                    </p>
                  </div>

                  {forms.length > 1 && (
                    <select
                      value={selectedFormId}
                      onChange={(event) => handleSelectForm(event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#FF7101]"
                    >
                      {forms.map((form) => (
                        <option key={form.id} value={form.id}>
                          {form.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {loadingForms && <p className="text-sm text-gray-400">Cargando formulario...</p>}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting || loadingForms}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF7101] px-5 py-3.5 font-bold text-white transition-colors hover:bg-[#e86600] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send size={17} />
                      Enviar solicitud
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
