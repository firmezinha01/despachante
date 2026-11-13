import { z } from 'zod';
import { isValidCpf, isValidCnpj, isValidPlaca, isValidRenavam } from '../utils/br-validators.js';
import { ServiceTypeEnum } from '../enums/service-type.enum.js';
import { ProcessPriorityEnum } from '../enums/process-status.enum.js';
import { UFEnum, FuelTypeEnum, VehicleCategoryEnum, VehicleTypeEnum } from '../enums/vehicle.enum.js';

export const CustomerPfSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  rg: z.string().optional(),
  cnh: z.string().optional(),
  validadeCnh: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().optional(),
  cep: z.string().min(8, 'CEP inválido'),
  logradouro: z.string().min(2, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  uf: z.nativeEnum(UFEnum),
});

export const CustomerPjSchema = z.object({
  razaoSocial: z.string().min(3, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().refine(isValidCnpj, 'CNPJ inválido'),
  ie: z.string().optional(),
  im: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().optional(),
  responsavelNome: z.string().optional(),
  responsavelCpf: z.string().optional(),
  cep: z.string().min(8, 'CEP inválido'),
  logradouro: z.string().min(2, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  uf: z.nativeEnum(UFEnum),
});

export const VehicleSchema = z.object({
  placa: z.string().refine(isValidPlaca, 'Placa inválida (Mercosul ou padrão antigo)'),
  renavam: z.string().refine(isValidRenavam, 'Renavam inválido'),
  chassi: z.string().min(17, 'Chassi deve conter 17 caracteres').max(17),
  motor: z.string().optional(),
  marca: z.string().min(2, 'Marca é obrigatória'),
  modelo: z.string().min(2, 'Modelo é obrigatório'),
  versao: z.string().optional(),
  cor: z.string().min(2, 'Cor é obrigatória'),
  categoria: z.nativeEnum(VehicleCategoryEnum).default(VehicleCategoryEnum.PARTICULAR),
  tipo: z.nativeEnum(VehicleTypeEnum).default(VehicleTypeEnum.AUTOMOVEL),
  anoFabricacao: z.number().int().min(1900).max(2035),
  anoModelo: z.number().int().min(1900).max(2035),
  combustivel: z.nativeEnum(FuelTypeEnum).default(FuelTypeEnum.FLEX),
  uf: z.nativeEnum(UFEnum),
  municipio: z.string().min(2, 'Município é obrigatório'),
  proprietarioId: z.string().uuid().optional(),
});

export const CreateProcessSchema = z.object({
  tipoServico: z.nativeEnum(ServiceTypeEnum),
  prioridade: z.nativeEnum(ProcessPriorityEnum).default(ProcessPriorityEnum.NORMAL),
  clienteId: z.string().uuid('Cliente obrigatório'),
  veiculoId: z.string().uuid('Veículo obrigatório'),
  responsavelId: z.string().uuid().optional(),
  observacoes: z.string().optional(),
  honorarios: z.number().nonnegative('Honorários devem ser positivos').default(0),
  taxasDetran: z.number().nonnegative('Taxas devem ser positivas').default(0),
});

export const GeneratePixChargeSchema = z.object({
  processoId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
  valor: z.number().positive('Valor deve ser positivo'),
  descricao: z.string().min(3).max(140),
  chavePix: z.string().optional(),
  expiracaoSegundos: z.number().int().min(60).default(3600),
});

export type CustomerPfDto = z.infer<typeof CustomerPfSchema>;
export type CustomerPjDto = z.infer<typeof CustomerPjSchema>;
export type VehicleDto = z.infer<typeof VehicleSchema>;
export type CreateProcessDto = z.infer<typeof CreateProcessSchema>;
export type GeneratePixChargeDto = z.infer<typeof GeneratePixChargeSchema>;
