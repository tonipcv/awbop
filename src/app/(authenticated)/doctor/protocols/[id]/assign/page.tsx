'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface Protocol {
  id: string;
  name: string;
  duration: number;
  description?: string;
  isTemplate: boolean;
  days: Array<{
    id: string;
    dayNumber: number;
    tasks: Array<{
      id: string;
      title: string;
    }>;
  }>;
}

interface Patient {
  id: string;
  name?: string;
  email?: string;
  assignedProtocols: Array<{
    id: string;
    protocolId: string;
    isActive: boolean;
    protocol: {
      id: string;
      name: string;
      duration: number;
    };
  }>;
}

// Component for patient card
const PatientCard = ({ 
  patient, 
  protocol,
  onAssign, 
  isAssigning, 
  startDate,
  onStartDateChange,
  hasActiveProtocol
}: {
  patient: Patient;
  protocol: Protocol;
  onAssign: (patientId: string) => void;
  isAssigning: boolean;
  startDate: string;
  onStartDateChange: (date: string) => void;
  hasActiveProtocol: boolean;
}) => {
  const getPatientInitials = (name?: string) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const endDate = addDays(new Date(startDate), protocol.duration - 1);
  const activeProtocol = patient.assignedProtocols.find(ap => ap.protocolId === protocol.id && ap.isActive);

  return (
    <Card className={cn(
      "bg-white border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200",
      activeProtocol && "border-green-500/30 bg-green-50/50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-[#5154e7]/10 flex items-center justify-center text-sm font-bold text-[#5154e7] flex-shrink-0">
              {getPatientInitials(patient.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 truncate">
                {patient.name || 'Sem nome'}
              </h4>
              <p className="text-sm text-gray-600 truncate font-medium">{patient.email}</p>
              {activeProtocol && (
                <div className="flex items-center gap-2 mt-2">
                  <CheckIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-semibold">Já atribuído</span>
                </div>
              )}
              {hasActiveProtocol && !activeProtocol && (
                <div className="flex items-center gap-2 mt-2">
                  <DocumentTextIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-500 font-medium">
                    {patient.assignedProtocols.filter(ap => ap.isActive).length} protocolo(s) ativo(s)
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            {!activeProtocol && (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="text-sm bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:border-[#5154e7] focus:ring-1 focus:ring-[#5154e7] w-32 font-medium"
                />
                
                <Button
                  onClick={() => onAssign(patient.id)}
                  disabled={isAssigning}
                  size="sm"
                  className="bg-[#5154e7] hover:bg-[#4145d1] text-white font-semibold px-4 rounded-xl shadow-md"
                >
                  {isAssigning ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Atribuindo...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Atribuir</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
        
        {!activeProtocol && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                <span className="font-medium">{protocol.duration} dias</span>
              </span>
              <span className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="font-medium">Até {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AssignProtocolToPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [assignStartDate, setAssignStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (params.id) {
      loadData(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadData = async (protocolId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [protocolResponse, patientsResponse] = await Promise.all([
        fetch(`/api/protocols/${protocolId}`),
        fetch('/api/patients')
      ]);

      if (!protocolResponse.ok) {
        if (protocolResponse.status === 404) {
          setError('Protocolo não encontrado ou você não tem permissão para acessá-lo');
        } else if (protocolResponse.status === 401) {
          setError('Sessão expirada. Faça login novamente');
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        } else {
          setError('Erro ao carregar dados do protocolo');
        }
        return;
      }

      const protocolData = await protocolResponse.json();
      setProtocol(protocolData);

      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } else {
        setError('Erro ao carregar lista de pacientes');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erro de conexão. Verifique sua internet e tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  const assignProtocol = async (patientId: string) => {
    try {
      setIsAssigning(patientId);
      setError(null);
      
      const response = await fetch('/api/protocols/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: params.id,
          patientId,
          startDate: new Date(assignStartDate).toISOString()
        })
      });

      if (response.ok) {
        setSuccessMessage('Protocolo atribuído com sucesso!');
        await loadData(params.id as string);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao atribuir protocolo');
      }
    } catch (error) {
      console.error('Error assigning protocol:', error);
      setError('Erro de conexão. Tente novamente');
    } finally {
      setIsAssigning(null);
    }
  };

  // Processar dados
  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availablePatients = filteredPatients.filter(patient => 
    !patient.assignedProtocols.some(ap => ap.protocolId === protocol?.id && ap.isActive)
  );

  const assignedPatients = filteredPatients.filter(patient => 
    patient.assignedProtocols.some(ap => ap.protocolId === protocol?.id && ap.isActive)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 text-[#5154e7] animate-spin mx-auto mb-4" />
          <span className="text-sm text-gray-600 font-medium">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error && !protocol) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2 text-gray-900">{error}</h2>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => loadData(params.id as string)} className="bg-[#5154e7] hover:bg-[#4145d1] text-white rounded-xl shadow-md font-semibold">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl shadow-md font-semibold">
              <Link href="/doctor/protocols">Voltar aos Protocolos</Link>
            </Button>
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
            <div className="flex items-center gap-6">
              <Button variant="outline" size="sm" asChild className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl px-4 shadow-md font-semibold">
                <Link href={`/doctor/protocols/${protocol?.id}`}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Atribuir Protocolo
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span className="font-medium">{protocol?.name}</span>
                  </span>
                  <span>•</span>
                  <span className="font-medium">{assignedPatients.length} atribuídos</span>
                  <span>•</span>
                  <span className="font-medium">{availablePatients.length} disponíveis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Messages */}
            {error && (
              <Card className="bg-red-50 border-red-200 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <XMarkIcon className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">{error}</span>
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-700 h-8 w-8 p-0">
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {successMessage && (
              <Card className="bg-green-50 border-green-200 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">{successMessage}</span>
                    <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-700 h-8 w-8 p-0">
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Protocol Info */}
            {protocol && (
              <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#5154e7]/10 rounded-xl">
                      <DocumentTextIcon className="h-6 w-6 text-[#5154e7]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{protocol.name}</h3>
                        {protocol.isTemplate && (
                          <Badge className="bg-[#5154e7] text-white border-[#5154e7] font-semibold">
                            Template
                          </Badge>
                        )}
                      </div>
                      {protocol.description && (
                        <p className="text-sm text-gray-600 mb-4 font-medium">{protocol.description}</p>
                      )}
                      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span className="font-medium">{protocol.duration} dias</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span className="font-medium">{protocol.days.reduce((acc, day) => acc + day.tasks.length, 0)} tarefas</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4" />
                          <span className="font-medium">{assignedPatients.length} paciente(s) ativo(s)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search */}
            <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white border-gray-300 focus:border-[#5154e7] focus:ring-[#5154e7] text-gray-900 placeholder:text-gray-500 text-base rounded-xl font-medium"
                  />
                  {searchTerm && (
                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Available Patients */}
              <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
                <CardHeader className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <PlusIcon className="h-5 w-5 text-[#5154e7]" />
                      Pacientes Disponíveis
                      <Badge className="bg-[#5154e7]/10 text-[#5154e7] border-[#5154e7]/20 px-3 py-1 rounded-full text-sm font-semibold">
                        {availablePatients.length}
                      </Badge>
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-medium">Pacientes que podem receber este protocolo</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {availablePatients.length === 0 ? (
                    <div className="text-center py-12">
                      <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2 text-gray-900">
                        {searchTerm 
                          ? `Nenhum paciente encontrado para "${searchTerm}"` 
                          : patients.length === 0
                            ? 'Nenhum paciente cadastrado ainda'
                            : 'Todos os pacientes já possuem este protocolo'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 font-medium">
                        {patients.length === 0 
                          ? 'Cadastre seu primeiro paciente para começar'
                          : searchTerm 
                            ? 'Tente ajustar o termo de busca'
                            : 'Todos os pacientes já têm este protocolo atribuído'}
                      </p>
                      {patients.length === 0 ? (
                        <Button asChild className="bg-[#5154e7] hover:bg-[#4145d1] text-white rounded-xl shadow-md font-semibold" size="sm">
                          <Link href="/doctor/patients">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Cadastrar Pacientes
                          </Link>
                        </Button>
                      ) : searchTerm ? (
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl shadow-md font-semibold">
                          Limpar busca
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    availablePatients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        protocol={protocol!}
                        onAssign={assignProtocol}
                        isAssigning={isAssigning === patient.id}
                        startDate={assignStartDate}
                        onStartDateChange={setAssignStartDate}
                        hasActiveProtocol={patient.assignedProtocols.some(ap => ap.isActive)}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Patients with Assigned Protocol */}
              <Card className="bg-white border-gray-200 shadow-lg rounded-2xl">
                <CardHeader className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <CheckIcon className="h-5 w-5 text-green-600" />
                      Protocolo Atribuído
                      <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                        {assignedPatients.length}
                      </Badge>
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-medium">Pacientes que já possuem este protocolo ativo</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {assignedPatients.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2 text-gray-900">Nenhum paciente com este protocolo ainda</h3>
                      <p className="text-sm text-gray-500 font-medium">Atribua este protocolo aos seus pacientes para começar</p>
                    </div>
                  ) : (
                    assignedPatients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        protocol={protocol!}
                        onAssign={assignProtocol}
                        isAssigning={false}
                        startDate={assignStartDate}
                        onStartDateChange={setAssignStartDate}
                        hasActiveProtocol={patient.assignedProtocols.some(ap => ap.isActive)}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 