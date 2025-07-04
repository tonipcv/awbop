'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftIcon,
  PencilIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ShoppingBagIcon,
  LinkIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import CheckinQuestionsManager from '@/components/protocol/checkin-questions-manager';
import CheckinResponsesDashboard from '@/components/checkin/checkin-responses-dashboard';
import { ConsultationDatePicker } from '@/components/ConsultationDatePicker';

interface ProtocolTask {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface ProtocolDay {
  id: string;
  dayNumber: number;
  tasks: ProtocolTask[];
  sessions?: ProtocolSession[];
}

interface ProtocolSession {
  id: string;
  title: string;
  tasks?: ProtocolTask[];
}

interface Assignment {
  id: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  imageUrl?: string;
  originalPrice?: number;
  discountPrice?: number;
  purchaseUrl?: string;
}

interface ProtocolProduct {
  id: string;
  productId: string;
  order: number;
  isRequired: boolean;
  notes?: string;
  product: Product;
}

interface Protocol {
  id: string;
  name: string;
  duration: number;
  description?: string;
  isTemplate: boolean;
  createdAt: Date;
  consultation_date?: string | null;
  days: ProtocolDay[];
  assignments: Assignment[];
  products?: ProtocolProduct[];
  doctor?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'checkin-questions' | 'checkin-responses'>('overview');

  useEffect(() => {
    if (params.id) {
      loadProtocol(params.id as string);
    }
  }, [params.id]);

  const loadProtocol = async (protocolId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/protocols/${protocolId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Carregar produtos do protocolo
        const productsResponse = await fetch(`/api/protocols/${protocolId}/products`);
        let protocolProducts = [];
        if (productsResponse.ok) {
          protocolProducts = await productsResponse.json();
        }
        
        setProtocol({
          ...data,
          products: protocolProducts
        });
      } else {
        router.push('/doctor/protocols');
      }
    } catch (error) {
      console.error('Error loading protocol:', error);
      router.push('/doctor/protocols');
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveAssignments = () => {
    return protocol?.assignments.filter(a => a.isActive) || [];
  };

  const getPatientInitials = (name?: string) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleConsultationDateChange = async (date: Date | null) => {
    if (!protocol) return;

    try {
      const response = await fetch(`/api/protocols/${protocol.id}/consultation-date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationDate: date })
      });

      if (response.ok) {
        const updatedProtocol = await response.json();
        setProtocol(prev => prev ? {
          ...prev,
          consultation_date: updatedProtocol.consultation_date
        } : null);
      } else {
        console.error('Failed to update consultation date');
      }
    } catch (error) {
      console.error('Error updating consultation date:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="lg:ml-64">
          <div className="container mx-auto p-6 lg:p-8 pt-[88px] lg:pt-8 pb-24 lg:pb-8 space-y-8">
            
            {/* Header Skeleton */}
            <div className="flex items-center gap-6">
              <div className="h-10 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1 space-y-8">
                
                {/* Stats Card Skeleton */}
                <div className="bg-white border-gray-200 shadow-lg rounded-2xl p-6">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6"></div>
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-11 w-11 bg-gray-200 rounded-xl animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Products Card Skeleton */}
                <div className="bg-white border-gray-200 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patients Card Skeleton */}
                <div className="bg-white border-gray-200 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Protocol Days Skeleton */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {[1, 2, 3].map((day) => (
                    <div key={day} className="bg-white border-gray-200 shadow-lg rounded-2xl p-6">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-6"></div>
                      <div className="space-y-4">
                        {[1, 2].map((task) => (
                          <div key={task} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-3"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="min-h-screen bg-white">
        <div className="lg:ml-64">
          <div className="container mx-auto p-6 lg:p-8 pt-[88px] lg:pt-8 pb-24 lg:pb-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Protocol not found</h2>
                <p className="text-gray-600 mb-6">The protocol you're looking for doesn't exist or you don't have permission to access it.</p>
                <Link href="/doctor/protocols">Back to protocols</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeAssignments = getActiveAssignments();

  return (
    <div className="min-h-screen bg-white">
      <div className="lg:ml-64">
        <div className="container mx-auto p-6 lg:p-8 pt-[88px] lg:pt-8 pb-24 lg:pb-8 space-y-8">
        
          {/* Header */}
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" asChild className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl h-10 px-3">
              <Link href="/doctor/protocols">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {protocol.name}
                </h1>
                {protocol.isTemplate && (
                  <Badge className="bg-[#5154e7] text-white border-[#5154e7] font-semibold">
                    Template
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 font-medium">
                {protocol.description || 'No description'}
              </p>
            </div>
            <Button asChild className="bg-[#5154e7] hover:bg-[#4145d1] text-white rounded-xl h-12 px-6 font-semibold">
              <Link href={`/doctor/protocols/${protocol.id}/edit`}>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === 'overview'
                    ? "border-[#5154e7] text-[#5154e7]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Visão Geral
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('checkin-questions')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === 'checkin-questions'
                    ? "border-[#5154e7] text-[#5154e7]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <Cog6ToothIcon className="w-4 h-4" />
                  Perguntas Check-in
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('checkin-responses')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === 'checkin-responses'
                    ? "border-[#5154e7] text-[#5154e7]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4" />
                  Respostas Check-in
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Protocol Info */}
              <div className="lg:col-span-1 space-y-8">
                
                {/* Stats */}
                <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-gray-900">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-teal-100 rounded-xl">
                        <CalendarDaysIcon className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Duration</p>
                        <p className="text-lg font-bold text-gray-900">{protocol.duration} days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <UsersIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Active Patients</p>
                        <p className="text-lg font-bold text-gray-900">{activeAssignments.length}</p>
                      </div>
                    </div>
                    
                    <ConsultationDatePicker
                      consultationDate={protocol.consultation_date ? new Date(protocol.consultation_date) : null}
                      onDateChange={handleConsultationDateChange}
                    />
                  </CardContent>
                </Card>

                {/* Protocol Products */}
                <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <ShoppingBagIcon className="h-5 w-5" />
                        Recommended Products
                      </CardTitle>
                      {protocol.products && protocol.products.length > 0 && (
                        <Badge className="bg-[#5154e7] text-white border-[#5154e7] font-semibold">
                          {protocol.products.length}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!protocol.products || protocol.products.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                          No products configured
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {protocol.products
                          .sort((a, b) => a.order - b.order)
                          .map((protocolProduct) => (
                            <div key={protocolProduct.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-start gap-4">
                                {/* Product Image */}
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {protocolProduct.product.imageUrl ? (
                                    <img 
                                      src={protocolProduct.product.imageUrl} 
                                      alt={protocolProduct.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 truncate">
                                        {protocolProduct.product.name}
                                      </h4>
                                      {protocolProduct.product.brand && (
                                        <p className="text-sm text-[#5154e7] font-semibold">{protocolProduct.product.brand}</p>
                                      )}
                                    </div>
                                    
                                    {/* Price and Required Badge */}
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                      {(protocolProduct.product.originalPrice || protocolProduct.product.discountPrice) && (
                                        <div className="text-right">
                                          {protocolProduct.product.discountPrice && protocolProduct.product.originalPrice ? (
                                            <>
                                              <div className="text-sm font-bold text-[#5154e7]">
                                                {formatPrice(protocolProduct.product.discountPrice)}
                                              </div>
                                              <div className="text-sm text-gray-400 line-through">
                                                {formatPrice(protocolProduct.product.originalPrice)}
                                              </div>
                                            </>
                                          ) : (
                                            <div className="text-sm font-bold text-gray-900">
                                              {formatPrice(protocolProduct.product.originalPrice || protocolProduct.product.discountPrice)}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {protocolProduct.isRequired && (
                                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 font-semibold">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Notes */}
                                  {protocolProduct.notes && (
                                    <p className="text-sm text-gray-600 mt-3 font-medium">{protocolProduct.notes}</p>
                                  )}

                                  {/* Purchase Link */}
                                  {protocolProduct.product.purchaseUrl && (
                                    <div className="mt-3">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-8 text-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-semibold"
                                        asChild
                                      >
                                        <a 
                                          href={protocolProduct.product.purchaseUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                        >
                                          <LinkIcon className="h-4 w-4 mr-2" />
                                          Buy
                                        </a>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assigned Patients */}
                <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">Active Patients</CardTitle>
                      <Button size="sm" variant="outline" asChild className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl h-10 px-4 font-semibold">
                        <Link href={`/doctor/protocols/${protocol.id}/assign`}>
                          <UserPlusIcon className="h-4 w-4 mr-2" />
                          Assign
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeAssignments.length === 0 ? (
                      <div className="text-center py-8">
                        <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                          No active patients
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeAssignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="h-10 w-10 rounded-full bg-[#5154e7] flex items-center justify-center text-sm font-bold text-white">
                              {getPatientInitials(assignment.user.name)}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900">{assignment.user.name || 'No name'}</p>
                              <p className="text-sm text-gray-600 font-medium">
                                Started on {format(new Date(assignment.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Protocol Days */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {protocol.days.length === 0 ? (
                    <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
                      <CardContent className="p-8">
                        <div className="text-center">
                          <CalendarDaysIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                          <h3 className="text-xl font-bold text-gray-900 mb-3">This protocol doesn't have any configured days or tasks yet.</h3>
                          <Button asChild className="bg-[#5154e7] hover:bg-[#4145d1] text-white rounded-xl h-12 px-6 font-semibold">
                            <Link href={`/doctor/protocols/${protocol.id}/edit`}>
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit Protocol
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    protocol.days
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((day) => (
                        <Card key={day.id} className="bg-white border-gray-200 shadow-lg rounded-2xl">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-[#5154e7]">
                              Day {day.dayNumber}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {(!day.tasks || day.tasks.length === 0) && (!day.sessions || day.sessions.length === 0) ? (
                              <p className="text-gray-600 font-medium text-center py-8">
                                No tasks configured for this day
                              </p>
                            ) : (
                              <div className="space-y-4">
                                {/* Render direct day tasks */}
                                {day.tasks && day.tasks.length > 0 && (
                                  <div className="space-y-4">
                                    <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Day Tasks</h5>
                                    {day.tasks
                                      .sort((a, b) => a.order - b.order)
                                      .map((task) => (
                                        <div key={task.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                          <h4 className="font-bold text-gray-900 mb-2">{task.title}</h4>
                                          {task.description && (
                                            <p className="text-gray-600 font-medium">{task.description}</p>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                )}
                                
                                {/* Render sessions and their tasks */}
                                {day.sessions && day.sessions.length > 0 && (
                                  <div className="space-y-6">
                                    {day.sessions.map((session) => (
                                      <div key={session.id} className="space-y-3">
                                        <h5 className="text-sm font-semibold text-[#5154e7] uppercase tracking-wider">
                                          {session.title}
                                        </h5>
                                        {session.tasks && session.tasks.length > 0 ? (
                                          <div className="space-y-3">
                                            {session.tasks
                                              .sort((a, b) => a.order - b.order)
                                              .map((task) => (
                                                <div key={task.id} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                  <h4 className="font-bold text-gray-900 mb-2">{task.title}</h4>
                                                  {task.description && (
                                                    <p className="text-gray-600 font-medium">{task.description}</p>
                                                  )}
                                                </div>
                                              ))}
                                          </div>
                                        ) : (
                                          <p className="text-gray-500 text-sm italic">No tasks in this session</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Check-in Questions Tab */}
          {activeTab === 'checkin-questions' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <CheckinQuestionsManager protocolId={protocol.id} />
            </div>
          )}

          {/* Check-in Responses Tab */}
          {activeTab === 'checkin-responses' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <CheckinResponsesDashboard 
                protocolId={protocol.id} 
                protocolName={protocol.name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 