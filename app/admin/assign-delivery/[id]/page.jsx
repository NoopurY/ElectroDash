'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Truck, MapPin, Phone, CheckCircle, Clock } from 'lucide-react';

export default function AssignDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchDeliveryPartners();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        alert('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Error fetching order details');
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/delivery-partners/available', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryPartners(data.partners || []);
      } else {
        console.error('Failed to fetch delivery partners');
      }
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = async (partnerId, partnerName) => {
    if (!confirm(`Assign this order to ${partnerName}?`)) return;

    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryPartnerId: partnerId,
          deliveryPartnerName: partnerName,
        }),
      });

      if (response.ok) {
        alert('Delivery partner assigned successfully!');
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to assign delivery partner');
      }
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      alert('Error assigning delivery partner');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A8DEE] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Assign Delivery Partner</h1>
              <p className="text-sm text-white/80">Order #{order?.orderId}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-[#5A8DEE]" size={24} />
              Delivery Address
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">{order.userName}</p>
              <p>{order.deliveryAddress.street}</p>
              <p>
                {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                {order.deliveryAddress.zipCode}
              </p>
              {order.deliveryAddress.phone && (
                <p className="flex items-center gap-2 mt-2">
                  <Phone size={16} />
                  {order.deliveryAddress.phone}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-2xl font-bold text-[#5A8DEE]">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Partners List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Truck className="text-[#5A8DEE]" size={24} />
            Available Delivery Partners
          </h2>

          {deliveryPartners.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Truck size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No delivery partners available</p>
              <p className="text-gray-500 text-sm mt-2">
                Please check back later or contact delivery partners directly
              </p>
            </div>
          ) : (
            deliveryPartners.map((partner) => (
              <div
                key={partner._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5A8DEE] to-[#40E0D0] rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-gray-600">{partner.email}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {partner.phone && (
                        <p className="flex items-center gap-2 text-gray-700">
                          <Phone size={16} className="text-[#5A8DEE]" />
                          {partner.phone}
                        </p>
                      )}
                      {partner.vehicleType && (
                        <p className="flex items-center gap-2 text-gray-700">
                          <Truck size={16} className="text-[#5A8DEE]" />
                          {partner.vehicleType}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          size={16}
                          className={
                            partner.isAvailable
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }
                        />
                        <span
                          className={
                            partner.isAvailable
                              ? 'text-green-600 font-semibold'
                              : 'text-gray-500'
                          }
                        >
                          {partner.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignPartner(partner._id, partner.name)}
                    disabled={!partner.isAvailable || assigning}
                    className="px-6 py-3 bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
