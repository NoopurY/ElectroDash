"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Bike, MapPin, Phone, Truck } from "lucide-react";
import { Alert, AppHeader, EmptyState, Page, PageLoader, PageTitle, Spinner, formatINR } from "@/components/ui";

export default function AssignDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Define and call async fetchers inside effect to avoid missing dependency lint warnings
    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch order details
        const orderRes = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (orderRes.ok) {
          const data = await orderRes.json();
          setOrder(data.order);
        }

        // Fetch delivery partners
        const partnersRes = await fetch("/api/delivery-partners/available", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (partnersRes.ok) {
          const pData = await partnersRes.json();
          setDeliveryPartners(pData.partners || []);
        }
      } catch (err) {
        console.error("Error loading assign-delivery data", err);
        setError("Could not load this order. Please go back and try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId]);

  const handleAssignPartner = async (partnerId, partnerName) => {
    setError("");
    setAssigningId(partnerId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryPartnerId: partnerId,
          deliveryPartnerName: partnerName,
        }),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
        return;
      }
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Could not assign this delivery partner.");
    } catch (err) {
      console.error("Error assigning delivery partner:", err);
      setError("Network error while assigning. Please try again.");
    }
    setAssigningId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="admin" />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="admin" />
      <Page className="max-w-4xl">
        <PageTitle
          back="/admin/dashboard"
          title="Assign a delivery partner"
          subtitle={order ? <span className="font-mono">Order #{order.orderId}</span> : undefined}
        />

        {error && (
          <div className="mb-5">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
          {/* Partners */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
              Available now
              <span className="badge bg-green-50 text-green-700">{deliveryPartners.length}</span>
            </h2>

            {deliveryPartners.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No delivery partners are online"
                text="Partners appear here when they go online. Check back in a few minutes."
                action={
                  <button onClick={() => window.location.reload()} className="btn btn-secondary">
                    Check again
                  </button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {deliveryPartners.map((partner) => {
                  const name = partner.name || partner.email || "Partner";
                  const busy = assigningId === partner._id;
                  return (
                    <li key={partner._id} className="card flex flex-wrap items-center gap-4 p-4 sm:p-5">
                      <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white">
                        {name.charAt(0).toUpperCase()}
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{name}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                          {partner.vehicleType && (
                            <span className="inline-flex items-center gap-1.5 capitalize">
                              <Bike size={14} /> {partner.vehicleType}
                            </span>
                          )}
                          {partner.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone size={14} /> {partner.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignPartner(partner._id, name)}
                        disabled={!partner.isAvailable || !!assigningId}
                        className="btn btn-primary w-full sm:w-auto"
                      >
                        {busy ? (
                          <>
                            <Spinner size={15} /> Assigning…
                          </>
                        ) : (
                          <>
                            <Truck size={16} /> Assign
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Order summary */}
          {order && (
            <aside className="card p-5 lg:sticky lg:top-24">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin size={16} className="text-muted" /> Deliver to
              </h3>
              <div className="mt-3 space-y-0.5 text-sm text-ink-soft">
                <p className="font-semibold text-ink">{order.userName}</p>
                <p>{order.deliveryAddress?.street}</p>
                <p>
                  {order.deliveryAddress?.city} {order.deliveryAddress?.zipCode}
                </p>
                {order.deliveryAddress?.phone && (
                  <p className="flex items-center gap-1.5 pt-2 text-muted">
                    <Phone size={14} /> {order.deliveryAddress.phone}
                  </p>
                )}
              </div>
              <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                {(order.items || []).map((item, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="truncate text-ink-soft">
                      {item.quantity}× {item.name}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">Order total</span>
                <span className="text-lg font-bold text-ink">{formatINR(order.totalAmount)}</span>
              </div>
            </aside>
          )}
        </div>
      </Page>
    </div>
  );
}
