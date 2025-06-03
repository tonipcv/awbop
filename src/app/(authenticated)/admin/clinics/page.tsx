'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  FileText, 
  BookOpen, 
  Crown, 
  Plus, 
  ArrowLeft,
  Loader2,
  Calendar,
  Mail,
  User
} from 'lucide-react';
import Link from 'next/link';
import { 
  BuildingOfficeIcon,
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  PencilIcon,
  EyeIcon,
  MapPinIcon,
  EnvelopeIcon,
  PlusIcon,
  UsersIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface ClinicSubscription {
  id: string;
  status: string;
  maxDoctors: number;
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

interface Clinic {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    isActive: boolean;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  subscription?: ClinicSubscription;
}

export default function ClinicsPage() {
  const { data: session } = useSession();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/clinics');
        
        if (response.ok) {
          const data = await response.json();
          setClinics(data.clinics || []);
        }
      } catch (error) {
        console.error('Error loading clinics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadClinics();
    }
  }, [session]);

  // Statistics calculations
  const activeCount = clinics.filter(c => c.isActive).length;
  const inactiveCount = clinics.filter(c => !c.isActive).length;
  const withSubscriptionCount = clinics.filter(c => c.subscription).length;
  const trialCount = clinics.filter(c => c.subscription?.status === 'TRIAL').length;
  const totalMembers = clinics.reduce((sum, c) => sum + c.members.filter(m => m.isActive).length, 0);

  const getSubscriptionStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'TRIAL': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusText = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'TRIAL': return 'Trial';
      case 'EXPIRED': return 'Expired';
      case 'SUSPENDED': return 'Suspended';
      case 'CANCELLED': return 'Cancelled';
      default: return 'No Subscription';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="lg:ml-64">
          <div className="p-4 pt-[88px] lg:pl-6 lg:pr-4 lg:pt-6 lg:pb-4 pb-24">
            
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
                <div className="h-5 bg-gray-100 rounded-lg w-80 animate-pulse"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-100 rounded-xl w-40 animate-pulse"></div>
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl animate-pulse">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-7 bg-gray-100 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clinics List Skeleton */}
            <div className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <div className="p-6 pb-4">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="p-6 pt-0 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded w-40 animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-100 rounded-xl w-16 animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-100 rounded-xl w-20 animate-pulse"></div>
                          <div className="h-8 bg-gray-200 rounded-xl w-24 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="lg:ml-64">
        <div className="p-4 pt-[88px] lg:pl-6 lg:pr-4 lg:pt-6 lg:pb-4 pb-24">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                Manage Clinics
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all registered clinics
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                asChild
                className="bg-turquoise hover:bg-turquoise/90 text-black font-semibold shadow-lg shadow-turquoise/25 hover:shadow-turquoise/40 hover:scale-105 transition-all duration-200"
              >
                <Link href="/admin/clinics/new">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Clinic
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
              >
                <Link href="/admin">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Total</p>
                    <p className="text-2xl font-light text-gray-900">{clinics.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Active</p>
                    <p className="text-2xl font-light text-green-600">{activeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">With Subscription</p>
                    <p className="text-2xl font-light text-purple-600">{withSubscriptionCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Trial</p>
                    <p className="text-2xl font-light text-yellow-600">{trialCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-turquoise rounded-xl">
                    <UsersIcon className="h-6 w-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Total Members</p>
                    <p className="text-2xl font-light text-gray-900">{totalMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clinics List */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                All Clinics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {clinics.length > 0 ? (
                  clinics.map((clinic) => (
                    <div key={clinic.id} className={`p-4 rounded-xl border transition-colors ${
                      clinic.isActive 
                        ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-turquoise rounded-xl flex items-center justify-center">
                            <BuildingOfficeIcon className="h-6 w-6 text-black" />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                              {clinic.name}
                              {!clinic.isActive && (
                                <Badge className="bg-red-100 text-red-800 border-0 text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Owner: {clinic.owner.name} ({clinic.owner.email})
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              {clinic.members.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <UsersIcon className="h-3 w-3" />
                                  {clinic.members.filter(m => m.isActive).length} members
                                </span>
                              )}
                              {clinic.city && clinic.state && (
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {clinic.city}, {clinic.state}
                                </span>
                              )}
                              {clinic.email && (
                                <span className="flex items-center gap-1">
                                  <EnvelopeIcon className="h-3 w-3" />
                                  {clinic.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Subscription Status */}
                          <div className="text-right">
                            <Badge className={`${getSubscriptionStatusColor(clinic.subscription?.status)} border-0`}>
                              {getSubscriptionStatusText(clinic.subscription?.status)}
                            </Badge>
                            
                            {clinic.subscription && (
                              <p className="text-xs text-gray-500 mt-1">
                                {clinic.subscription.plan.name} - R$ {clinic.subscription.plan.price}/month
                              </p>
                            )}
                            
                            {clinic.subscription?.maxDoctors && (
                              <p className="text-xs text-gray-500">
                                Max: {clinic.subscription.maxDoctors} doctors
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link href={`/admin/clinics/${clinic.id}/edit`}>
                              <Button 
                                size="sm"
                                className="bg-turquoise hover:bg-turquoise/90 text-black font-semibold"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/admin/clinics/${clinic.id}`}>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {clinic.description && (
                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">{clinic.description}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No clinics found.</p>
                    <p className="text-gray-500 text-sm mt-2">Clinics will appear here once they are registered.</p>
                    <Button asChild className="mt-4 bg-turquoise hover:bg-turquoise/90 text-black font-semibold">
                      <Link href="/admin/clinics/new">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create First Clinic
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 